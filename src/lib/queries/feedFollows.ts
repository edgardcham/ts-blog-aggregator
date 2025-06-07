import { db } from '../index.js';
import { feedFollows, feeds, users } from '../schema.js';
import { getFeedById, getFeedByURL } from './feeds.js';
import { getUserById, getUserByName } from './users.js';
import { and, eq } from 'drizzle-orm';

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

export async function deleteFeedFollow(userName: string, feedURL: string) {
    const user = await getUserByName(userName);
    if (!user) {
        throw new Error('User not found');
    }
    const feed = await getFeedByURL(feedURL);
    if (!feed) {
        throw new Error('Feed not found');
    }
    await db
        .delete(feedFollows)
        .where(
            and(
                eq(feedFollows.user_id, user.id),
                eq(feedFollows.feed_id, feed.id),
            ),
        );
}
