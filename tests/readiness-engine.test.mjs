import test from 'node:test';
import assert from 'node:assert/strict';
import source from '../web/data.json' with {type: 'json'};
import snapshot from '../web/demo-snapshot.json' with {type: 'json'};
import {csv, dateTrend, parseCSV, prepare, prepareImport} from '../web/engine.mjs';
import {validateState} from '../server/workspace.mjs';

const sourceRows = prepare(source);
const emptyState = () => ({imported: [], enriched: [], saved: {}});
const dated = (review, occurred_at) => ({review, occurred_at});

test('date trend accepts real leap days and excludes impossible, malformed and missing dates', () => {
  const rows = [
    dated('Leap day', '2024-02-29'), dated('Normal day', '2026-10-11'),
    ...['2026-02-29', '2026-02-30', '2026-04-31', '2026-13-01',
      '2026-00-01', '2026-10-00', '2026-1-01', '2026-10-11T00:00:00Z',
      '', null, undefined, 1791676800000].map(date => dated('Invalid or absent', date)),
  ];
  assert.deepEqual(dateTrend(rows), {
    dated: 2, undated: 12, unique: false,
    days: [{date: '2024-02-29', count: 1}, {date: '2026-10-11', count: 1}],
  });
  assert.deepEqual(dateTrend([]), {dated: 0, undated: 0, days: [], unique: false});
});

test('date trend deduplicates normalized texts per day, never across different days', () => {
  const rows = [dated('Delayed delivery', '2026-10-11'), dated(' DELAYED   delivery ', '2026-10-11'),
    dated('Helpful support', '2026-10-11'), dated('Delayed delivery', '2026-10-12'),
    dated('delayed delivery', '2026-10-12'), dated('No date', null)];
  assert.deepEqual(dateTrend(rows).days, [{date: '2026-10-11', count: 3}, {date: '2026-10-12', count: 2}]);
  assert.deepEqual(dateTrend(rows, true), {dated: 5, undated: 1, unique: true,
    days: [{date: '2026-10-11', count: 2}, {date: '2026-10-12', count: 1}]});
});

test('date trend sorts chronologically and retains latest 14 observed days, not input order', () => {
  const dates = Array.from({length: 20}, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
  const rows = dates.toReversed().map(date => dated('Recurring text', date));
  rows.push(dated('Second text on latest day', dates.at(-1)), dated('Undated', null));
  const result = dateTrend(rows);
  assert.equal(result.dated, 21);
  assert.equal(result.undated, 1);
  assert.deepEqual(result.days, dates.slice(-14).map(date => ({date, count: date === dates.at(-1) ? 2 : 1})));
  assert.deepEqual(dateTrend(rows, true, 2).days, [
    {date: '2026-10-19', count: 1}, {date: '2026-10-20', count: 2},
  ]);
  assert.deepEqual(dateTrend(rows, false, 0).days, [{date: '2026-10-20', count: 2}]);
});

test('competition source has no dates: no synthetic historical trend is produced', () => {
  assert.deepEqual(dateTrend(sourceRows), {dated: 0, undated: source.length, days: [], unique: false});
  assert.deepEqual(dateTrend(sourceRows, true), {dated: 0, undated: source.length, days: [], unique: true});
});

test('CSV export neutralizes all formula prefixes even after whitespace without losing quoting', () => {
  for (const whitespace of ['', ' ', '   ', '\t', '\r\n', '\u00a0']) {
    for (const prefix of ['=', '+', '-', '@']) {
      const review = `${whitespace}${prefix}HYPERLINK("https://example.invalid","quoted, value")`;
      const exported = csv([['review', 'category'], [review, 'Product Feedback']]);
      assert.equal(parseCSV(exported)[0].review, `${whitespace}'${review.slice(whitespace.length)}`);
      assert.equal(parseCSV(exported)[0].category, 'Product Feedback');
    }
  }
  for (const review of ['Ordinary text', 'A = B', "'Already escaped", 'A "quote", and\na newline']) {
    assert.equal(parseCSV(csv([['review'], [review]]))[0].review, review);
  }
});

test('prepareImport strips spoofed identity and provenance while preserving legitimate content', () => {
  const records = [{id: sourceRows[0].id, review: '  Delivery was delayed.  ', category: 'Operational Issues',
    occurred_at: '2026-10-11', source: 'Competition dataset', method: 'Adaption',
    sentiment: 'Positive', evidence: 'fabricated', provider_run_id: 'spoofed', dataset_id: 'spoofed'}];
  const original = structuredClone(records);
  assert.deepEqual(prepareImport(records, 'Judge CSV', 'IMP-regression'), [{
    id: 'IMP-regression-00001', review: 'Delivery was delayed.', category: 'Operational Issues',
    occurred_at: '2026-10-11', source: 'Judge CSV', sentiment: 'Negative', method: 'Rule-based preview',
  }]);
  assert.deepEqual(records, original, 'import preparation must not mutate input');
});

test('separate imports generate distinct namespaces, including repeated identical records', () => {
  const records = [{id: 'FB-00001', review: sourceRows[0].review}, {id: 'FB-00001', review: sourceRows[0].review}];
  const first = prepareImport(records);
  const second = prepareImport(records);
  const ids = [...first, ...second].map(row => row.id);
  assert.equal(new Set(ids).size, 4);
  for (const id of ids) assert.match(id, /^IMP-[0-9a-f-]+-0000[12]$/);
  assert.notEqual(first[0].id.slice(0, -6), second[0].id.slice(0, -6));
  assert.deepEqual(validateState({...emptyState(), imported: [...first, ...second]}).imported.map(row => row.id), ids);
});

test('workspace rejects imported IDs colliding with first or last original source row', () => {
  for (const row of [sourceRows[0], sourceRows.at(-1)]) {
    assert.throws(() => validateState({...emptyState(), imported: [{...row, review: 'Replacement forged source'}]}), /Invalid imported feedback/);
  }
});

test('workspace rejects unknown, duplicate and fabricated annotations for source and import', () => {
  const imported = prepareImport([{review: 'A unique imported review.'}], 'Regression CSV', 'IMP-annotation');
  for (const row of [sourceRows[0], imported[0]]) {
    const annotation = {id: row.id, sentiment: 'Positive', evidence: row.review, method: 'Human-reviewed annotation'};
    const state = {...emptyState(), imported};
    assert.throws(() => validateState({...state, enriched: [{...annotation, id: 'UNKNOWN-annotation'}]}), /unique known source/);
    assert.throws(() => validateState({...state, enriched: [annotation, {...annotation}]}), /unique known source/);
    assert.throws(() => validateState({...state, enriched: [{...annotation, evidence: 'This supporting quote was fabricated.'}]}), /exact supporting quote/);
    assert.throws(() => validateState({...state, enriched: [{...annotation, evidence: '  '}]}), /Invalid analysis annotation/);
    assert.equal(validateState({...state, enriched: [annotation]}).enriched[0].evidence, row.review);
  }
});

test('workspace accepts the real frozen Adaption snapshot with original-source evidence and lineage', () => {
  const result = validateState(structuredClone(snapshot.workspace));
  assert.deepEqual(result.imported, snapshot.workspace.imported);
  assert.deepEqual(result.enriched, snapshot.workspace.enriched);
  assert.deepEqual(result.saved, Object.fromEntries(Object.entries(snapshot.workspace.saved)
    .map(([id, issue]) => [id, {...issue, updated_at: issue.updated_at || null}])));
  assert.equal(result.enriched.length, sourceRows.length);
  const byId = new Map(sourceRows.map(row => [row.id, row]));
  for (const annotation of result.enriched) {
    assert.ok(byId.get(annotation.id).review.includes(annotation.evidence), annotation.id);
    assert.equal(annotation.provider_run_id, snapshot.payload.run.provider_run_id);
    assert.equal(annotation.dataset_id, snapshot.payload.run.dataset_id);
  }
});
