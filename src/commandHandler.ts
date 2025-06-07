import { readConfig, setUser } from './config.js';
import {
    createFeedFollow,
    getFeedFollowsForUser,
} from './lib/queries/feedFollows.js';
import {
    createFeed,
    getFeedByURL,
    getFeeds,
    printFeed,
} from './lib/queries/feeds.js';
import {
    createUser,
    getUserByName,
    getUsers,
    resetUsersTable,
} from './lib/queries/users.js';
import { fetcFeed } from './rss.js';

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;
export type CommandRegistry = Record<string, CommandHandler>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No username provided');
    }
    const userName = args[0];
    const user = await getUserByName(userName);
    if (!user) {
        throw new Error('User not found');
    }
    await setUser(userName);
    console.log(`Logged in as ${userName}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No username provided');
    }
    const userName = args[0];
    try {
        await createUser(userName);
    } catch (error) {
        throw new Error('User already exists');
    }
    await setUser(userName);
    console.log(`Registered user ${userName} and logged in`);
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    await resetUsersTable();
    console.log('Users table reset');
}

export async function handlerUsers(cmdName: string, ...args: string[]) {
    const users = await getUsers();
    const currentUser = (await readConfig()).currentUserName;
    users.forEach((user) => {
        if (user.name === currentUser) {
            console.log(`* ${user.name} (current)`);
        } else {
            console.log(`* ${user.name}`);
        }
    });
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No feed URL provided');
    }
    const feedURL = args[0];
    const feed = await fetcFeed(feedURL);
    console.log(feed.channel);
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No feed name and URL provided');
    } else if (args.length === 1) {
        throw new Error('No URL provided');
    }
    const feedName = args[0];
    const feedURL = args[1];
    const config = await readConfig();
    if (!config.currentUserName) {
        throw new Error('No user logged in');
    }
    const user = await getUserByName(config.currentUserName);
    if (!user) {
        throw new Error('User is not registered');
    }
    const feed = await createFeed(feedName, feedURL);
    await createFeedFollow(feed.id, user.id);
    console.log(`${user.name} - Followed ${feedName} - ${feedURL}`);
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
    await getFeeds();
}

export async function handlerFollow(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No URL provided');
    }
    const config = await readConfig();
    if (!config.currentUserName) {
        throw new Error('No user logged in');
    }
    const user = await getUserByName(config.currentUserName);
    if (!user) {
        throw new Error('No user logged in');
    }
    const feedURL = args[0];
    const feed = await getFeedByURL(feedURL);
    if (!feed) {
        throw new Error('Feed not found');
    }
    const feedId = feed.id;
    const feedFollow = await createFeedFollow(feedId, user.id);
    console.log(feedFollow);
}

export async function handlerFollowing(cmdName: string, ...args: string[]) {
    const config = await readConfig();
    if (!config.currentUserName) {
        throw new Error('No user logged in');
    }
    const user = await getUserByName(config.currentUserName);
    if (!user) {
        throw new Error('No user logged in');
    }
    const feedFollows = await getFeedFollowsForUser(user.id);
    feedFollows.forEach((feedFollow) => {
        console.log(
            `${feedFollow.users.name} - ${feedFollow.feeds.name} - ${feedFollow.feeds.url}`,
        );
    });
}

export async function registerCommand(
    registry: CommandRegistry,
    cmdName: string,
    handler: CommandHandler,
): Promise<void> {
    registry[cmdName] = handler;
}

export async function runCommand(
    registry: CommandRegistry,
    cmdName: string,
    ...args: string[]
): Promise<void> {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Command ${cmdName} not found`);
    }
    await handler(cmdName, ...args);
}
