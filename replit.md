# NeverDie Quest Bot

A Discord bot for automated quest management on a Discord server. Built with Node.js, discord.js 14, and SQLite (better-sqlite3).

## Stack

- **Runtime:** Node.js 20
- **Bot framework:** discord.js 14
- **Database:** SQLite via better-sqlite3
- **Entry point:** `bot/src/index.js`

## Project structure

```
bot/
  src/
    commands/         # Slash command handlers
    config.js         # Env var config
    db.js             # SQLite schema + connection
    storage.js        # Data access layer
    discord-runner.js # Quest automation engine
    worker.js         # Background jobs (deadline checks, daily summaries)
    permissions.js    # 3-tier permission system (Owner / Admin / Manager)
    index.js          # Entry point
    register-commands.js
  data/               # SQLite DB file (auto-generated at runtime)
  .env.example        # Environment variable template
  package.json
```

## Required environment variables (to run)

| Variable | Description |
|---|---|
| `DISCORD_BOT_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Application ID |
| `DISCORD_GUILD_ID` | Target Discord server ID |
| `OWNER_ID` | Discord user ID of the bot owner |
| `TIMEZONE` | Timezone (default: `Asia/Bangkok`) |
| `LOG_CHANNEL_ID` | Channel ID for notifications (optional) |
| `MANAGER_ROLE_ID` | Role ID for Manager-level permissions (optional) |
| `DATABASE_PATH` | SQLite file path (default: `./data/quests.db`) |

## How to run (when ready)

```bash
cd bot
npm install
cp .env.example .env
# Fill in .env values
npm run register   # Register slash commands (first time or after command changes)
npm start
```

## User preferences

- Imported for browsing/studying only — no run workflow configured yet.
