import { db } from '../index.js';
import { feedFollows, feeds, users } from '../schema.js';
import { getFeedById } from './feeds.js';
import { getUserById } from './users.js';
import { eq } from 'drizzle-orm';

export async function createFeedFollow(feedId: string, userId: string) {
    const [result] = await db
        .insert(feedFollows)
        .values({ feed_id: feedId, user_id: userId })
        .returning();

    // I need to return all the fields from the feed follow as well as the names of the linked user and feed
    const feed = await getFeedById(feedId);
    const user = await getUserById(userId);
    return { ...result, user: user.name, feed: feed.name };
}

export async function getFeedFollowsForUser(userId: string) {
    const resultsWithNames = await db
        .select()
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
        .innerJoin(users, eq(feedFollows.user_id, users.id))
        .where(eq(feedFollows.user_id, userId));
    return resultsWithNames;
}
