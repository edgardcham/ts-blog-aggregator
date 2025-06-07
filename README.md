# TS Blog Aggregator

This project is an RSS feed aggregator built in TypeScript. It's calle Gator.

Gator is a CLI tool that allows user tos:

- Add RSS feeds from across the internet to be collected
- Store the collected posts in a PostgreSQL database
- Follow and unfollow RSS feeds that other users have added
- View Summaries of the aggregates posts in the terminal, with a link to the full post

## Goals

- Integrate a TS application with PostgreSQL Database.
- Use SQL to query and migrate a database (using `drizzle`)
- Long-running service to continuously fetch new posts from RSS feeds and stores them in the Database.

Note: add documentation about drizzle-kit, schema, drizzle.config.ts, etc
