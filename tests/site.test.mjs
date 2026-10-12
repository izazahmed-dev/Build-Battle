import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderSite,robotsResponse,sitemapResponse} from '../server/site.mjs';
import {pages,siteOrigin,thankYouContent} from '../web/site-config.mjs';
const template=await readFile(new URL('../web/index.html',import.meta.url),'utf8');
const req=path=>new Request('https://site.test'+path);
test('all real page URLs have distinct server-rendered titles and descriptions',async()=>{
 const titles=new Set,descriptions=new Set;
 for(const [key,page] of Object.entries(pages)){
  if(key==='notfound')continue;
  const response=renderSite(template,req(page.path),{PUBLIC_DEMO:'true',DB:{}}),html=await response.text();
  assert.equal(response.status,200,page.path);
  assert.ok(html.includes(`<title>${page.title}</title>`),page.path);
  assert.ok(html.includes(`name="description" content="${page.description}"`),page.path);
  assert.ok(html.includes(`rel="canonical" href="${siteOrigin}${page.path}"`),page.path);
  assert.ok(html.includes(`property="og:image" content="${siteOrigin}/assets/og-image.png"`));
  assert.ok(html.includes('property="og:image:alt"'));assert.ok(!html.includes('__SITE_'));
  assert.ok(!titles.has(page.title));assert.ok(!descriptions.has(page.description));titles.add(page.title);descriptions.add(page.description);
 }
});
test('unknown routes return a branded 404 and do not reflect injected route markup',async()=>{
 const response=renderSite(template,req('/definitely-not-real?fake=1'),{PUBLIC_DEMO:'true'}),html=await response.text();
 assert.equal(response.status,404);assert.match(html,/404 \/ Wrong turn/);assert.match(html,/Back to overview/);assert.match(html,/noindex,follow/);
 const escaped=await renderSite(template,req('/%22%3E%3Cscript%3Ebad%3C/script%3E'),{}).text();assert.ok(!escaped.includes('<script>bad'));
});
test('private workspaces are excluded from indexing; sitemap contains only public indexable pages',async()=>{
 const privateHtml=await renderSite(template,req('/'),{}).text();assert.match(privateHtml,/name="robots" content="noindex,follow"/);
 assert.equal(await robotsResponse({}).text(),'User-agent: *\nDisallow: /\n');
 const robots=await robotsResponse({PUBLIC_DEMO:'true'}).text();assert.match(robots,/Disallow: \/api\//);assert.match(robots,/Sitemap: https:\/\//);
 const sitemap=await sitemapResponse({PUBLIC_DEMO:'true'}).text();
 for(const page of Object.values(pages))if(page.indexable)assert.ok(sitemap.includes(`<loc>${siteOrigin}${page.path}</loc>`));
 for(const path of ['/feedback','/studio','/thank-you','/api'])assert.ok(!sitemap.includes(siteOrigin+path));
 assert.ok(!(await sitemapResponse({}).text()).includes('<url>'));
});
test('legal notices and loading fallback remain meaningful with JavaScript disabled',async()=>{
 const privacy=await renderSite(template,req('/privacy'),{}).text();assert.match(privacy,/Browser storage/);assert.match(privacy,/30-day/);assert.match(privacy,/not published/);assert.match(privacy,/name="insightflow-analytics" content="false"/);
 const terms=await renderSite(template,req('/terms'),{}).text();assert.match(terms,/AI and decision limitations/);
 const home=await renderSite(template,req('/'),{}).text();assert.match(home,/Explore the feedback/);assert.match(home,/role="status"/);assert.match(home,/<noscript>/);
});
test('thank-you page never claims an unsent message or unconfirmed server save',()=>{
 assert.match(thankYouContent(null),/No submission to confirm/);
 const publicReceipt=thankYouContent({kind:'feedback',id:'NEW-test',demo:true});assert.match(publicReceipt,/changes stay in this browser/);
 const privateReceipt=thankYouContent({kind:'feedback',id:'NEW-test',demo:false});assert.match(privateReceipt,/does not claim the server has saved it/);
 assert.ok(!thankYouContent({kind:'feedback',id:'<img src=x>',demo:true}).includes('<img src=x>'));
});
