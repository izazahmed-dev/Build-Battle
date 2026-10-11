import {sqliteTable, integer, text} from 'drizzle-orm/sqlite-core';
export const workspaceHead=sqliteTable('workspace_head',{id:text('id').primaryKey(),revision:integer('revision').notNull(),objectKey:text('object_key').notNull(),updatedAt:text('updated_at').notNull()});
