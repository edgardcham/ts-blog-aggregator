import { pgTable, timestamp, uuid, text, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text('name').notNull().unique(),
});

export const feeds = pgTable('feeds', {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text('name').notNull(),
    url: text('url').notNull(),
    user_id: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
});

export const feedFollows = pgTable(
    'feed_follows',
    {
        id: uuid('id').primaryKey().defaultRandom().notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
        feed_id: uuid('feed_id')
            .references(() => feeds.id, { onDelete: 'cascade' })
            .notNull(),
        user_id: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
    },
    (table) => [unique('user_feed_unique').on(table.user_id, table.feed_id)],
);

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
