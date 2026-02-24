# Gator - RSS Feed Aggregator

Gator is a CLI tool that lets you aggregate and follow RSS feeds from the terminal.

## Prerequisites

- Node.js
- PostgreSQL

## Setup

1. Clone the repository:
```bash
   git clone https://github.com/Khaled-Masri0/BlogAggregator
   cd BlogAggregator
```

2. Install dependencies:
```bash
   npm install
```

3. Create a config file at `~/.gatorconfig.json`:
```json
   {
     "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable",
     "current_user_name": ""
   }
```

4. Run database migrations:
```bash
   npx drizzle-kit migrate
```

## Commands

- `npm run start register <username>` - Create a new user and log in
- `npm run start login <username>` - Log in as an existing user
- `npm run start users` - List all users
- `npm run start addfeed <name> <url>` - Add and follow an RSS feed
- `npm run start feeds` - List all feeds
- `npm run start follow <url>` - Follow a feed
- `npm run start unfollow <url>` - Unfollow a feed
- `npm run start following` - List feeds you follow
- `npm run start agg <time>` - Start aggregating feeds (e.g. `1m`, `30s`)
- `npm run start reset` - Reset the database
