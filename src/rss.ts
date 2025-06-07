import { XMLParser } from 'fast-xml-parser';

export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetcFeed(feedURL: string): Promise<RSSFeed> {
    const parser = new XMLParser();
    const response = await fetch(feedURL, {
        headers: {
            'User-Agent': 'gator',
        },
    });
    const text = await response.text();
    const feed = parser.parse(text);
    const channel = feed.rss.channel;
    if (!channel) {
        throw new Error('Channel not found');
    }
    const title = channel.title;
    const link = channel.link;
    const description = channel.description;
    const items = channel.item;
    if (!Array.isArray(items)) {
        throw new Error('Items not found');
    }
    const result: RSSFeed = {
        channel: {
            title,
            link,
            description,
            item: items.map((item) => ({
                title: item.title,
                link: item.link,
                description: item.description,
                pubDate: item.pubDate,
            })),
        },
    };
    return result;
}
