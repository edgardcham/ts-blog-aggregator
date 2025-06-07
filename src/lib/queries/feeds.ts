import { db } from '../index.js';
import { type User, type Feed, feeds, users } from '../schema.js';
import { eq } from 'drizzle-orm';
import { getUserByName } from './users.js';
import { readConfig } from '../../config.js';

export async function createFeed(name: string, url: string) {
    const config = await readConfig();
    if (!config.currentUserName) {
        throw new Error('No user logged in');
    }
    const user = await getUserByName(config.currentUserName);
    if (!user) {
        throw new Error('No user logged in');
    }
    const existingFeed = await getFeedByName(name);
    if (existingFeed) {
        throw new Error('Feed already exists');
    }
    const [result] = await db
        .insert(feeds)
        .values({ name, url, user_id: user.id })
        .returning();
    printFeed(result, user);
    return result;
}

export async function getFeedByName(name: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.name, name));
    return result;
}

export async function printFeed(feed: Feed, user: User) {
    console.log(`${user.name} - ${feed.name} - ${feed.url}`);
}

export async function getFeeds() {
    const results = await db
        .select()
        .from(feeds)
        .innerJoin(users, eq(feeds.user_id, users.id));
    results.forEach((result) => {
        console.log(
            `${result.users.name} - ${result.feeds.name} - ${result.feeds.url}`,
        );
    });
    return results;
}

export async function getFeedById(id: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.id, id));
    return result;
}

export async function getFeedByURL(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}
