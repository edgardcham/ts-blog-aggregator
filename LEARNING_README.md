# TypeScript Blog Aggregator - Learning Journey

This document serves as an educational walkthrough of everything we built in this TypeScript RSS feed aggregator project called "Gator". It's designed to help you remember what we implemented and why.

## Project Overview

We built a CLI-based RSS feed aggregator that allows users to:

- Register and log in
- Add RSS feeds
- Follow/unfollow feeds
- View their followed feeds
- Aggregate RSS content

## Technology Stack

- **TypeScript**: For type safety and better development experience
- **Node.js**: Runtime environment
- **Drizzle ORM**: Modern TypeScript ORM for database operations
- **PostgreSQL**: Database for storing users, feeds, and relationships
- **tsx**: TypeScript execution engine for development

## Package.json Scripts

```json
{
  "scripts": {
    "start": "tsx ./src/index.ts",
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate"
  }
}
```

- `npm run start <command>`: Runs the CLI with specified command
- `npm run generate`: Generates database migrations from schema changes
- `npm run migrate`: Applies migrations to the database

## Project Structure

```bash
src/
├── index.ts                 # Main entry point and command registry
├── commandHandler.ts        # Command handlers and middleware
├── config.ts               # Configuration file management
├── rss.ts                  # RSS feed parsing logic
└── lib/
    ├── index.ts            # Database connection setup
    ├── schema.ts           # Database schema definitions
    ├── db/                 # Migration files
    └── queries/
        ├── users.ts        # User-related database queries
        ├── feeds.ts        # Feed-related database queries
        └── feedFollows.ts  # Feed follow relationship queries
```

## Key Learning Concepts

### 1. Command Pattern Implementation

We implemented a command registry pattern for handling CLI commands:

```typescript
export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;

export type CommandRegistry = Record<string, CommandHandler>;
```

**What we learned:**

- How to create a flexible command system
- Dynamic command registration and execution
- Type-safe command handling

### 2. Middleware Pattern for Authentication

We created a middleware system to handle user authentication:

```typescript
type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(
    handler: UserCommandHandler,
): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const config = await readConfig();
        if (!config.currentUserName) {
            throw new Error('No user logged in');
        }
        const user = await getUserByName(config.currentUserName);
        if (!user) {
            throw new Error('User not found');
        }
        return handler(cmdName, user, ...args);
    };
}
```

**What we learned:**

- Higher-order functions in TypeScript
- Middleware pattern for cross-cutting concerns
- Function composition and wrapping
- How to eliminate duplicate authentication code

### 3. Database Schema Design with Drizzle ORM

#### Schema Definition

```typescript
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
    (table) => [
        unique('user_feed_unique').on(table.user_id, table.feed_id),
    ],
);
```

**What we learned:**

- Database schema design with relationships
- Foreign key constraints and cascade deletes
- Composite unique constraints to prevent duplicate follows
- UUID primary keys vs auto-incrementing integers
- Timestamp fields with automatic updates

### 4. Type Safety and Error Handling

We implemented proper error handling throughout the application:

```typescript
try {
    await runCommand(registry, cmdName, ...cmdArgs);
    process.exit(0);
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('An unknown error occurred');
    }
    process.exit(1);
}
```

**What we learned:**

- Proper error handling in async/await code
- Type guards for error instances
- Process exit codes (0 for success, 1 for failure)
- When and how to throw vs catch errors

### 5. Configuration Management

We created a robust configuration system:

```typescript
type Config = {
    dbUrl: string;
    currentUserName: string | null;
};

export async function readConfig(): Promise<Config> {
    // Read from ~/.gatorconfig.json
}

export async function setUser(userName: string): Promise<void> {
    // Update current user in config
}
```

**What we learned:**

- File-based configuration management
- JSON parsing and validation
- Home directory file access
- Persistent user session state

### 6. Database Query Patterns

We implemented several query patterns:

#### Simple CRUD Operations

```typescript
export async function createUser(name: string) {
    const existingUser = await getUserByName(name);
    if (existingUser) {
        throw new Error('User already exists');
    }
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}
```

#### Join Queries

```typescript
export async function getFeedFollowsForUser(userId: string) {
    const resultsWithNames = await db
        .select()
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
        .innerJoin(users, eq(feedFollows.user_id, users.id))
        .where(eq(feedFollows.user_id, userId));
    return resultsWithNames;
}
```

#### Complex Delete Operations

```typescript
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
```

**What we learned:**

- SQL query building with type safety
- Join operations across multiple tables
- Complex WHERE clauses with AND conditions
- Returning data from INSERT operations

## Available Commands

- `npm run start register <username>` - Register a new user
- `npm run start login <username>` - Log in as existing user
- `npm run start users` - List all users (shows current user with *)
- `npm run start addfeed "<name>" "<url>"` - Add and follow a new RSS feed
- `npm run start follow "<url>"` - Follow an existing feed
- `npm run start following` - List feeds you're following
- `npm run start unfollow "<url>"` - Unfollow a feed
- `npm run start reset` - Reset all users (development only)
- `npm run start agg <url>` - Fetch and display RSS feed content

## Key TypeScript Concepts Demonstrated

1. **Generic Types**: Used in database query results
2. **Union Types**: Error handling with `Error | unknown`
3. **Function Types**: Command handlers and middleware
4. **Type Inference**: Drizzle ORM's `$inferSelect`
5. **Optional Properties**: Config with nullable `currentUserName`
6. **Rest Parameters**: Variable arguments in command handlers

## Development Workflow

1. **Schema Changes**: Modify `src/lib/schema.ts`
2. **Generate Migration**: Run `npm run generate`
3. **Apply Migration**: Run `npm run migrate`
4. **Test Commands**: Run `npm run start <command>`

This project demonstrates a complete TypeScript application with database integration, proper error handling, and a clean architecture using modern patterns and tools.
