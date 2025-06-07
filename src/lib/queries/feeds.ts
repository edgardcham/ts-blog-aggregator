import { db } from '../index.js';
import { type User, type Feed, feeds } from '../schema.js';
import { eq } from 'drizzle-orm';
import { getUserByName } from './users.js';
import { readConfig } from '../../config.js';

export async function createFeed(name: string, url: string) {
    // get current logged in user from config and then DB
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
