# [@IsBotDownBot](https://t.me/IsBotDownBot) code

Code of the bot that tracks the up and down status of other bots.

## Installation and local launch

1. Clone this repo: `git clone https://github.com/backmeupplz/IsBotDownBot`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests. Thanks!

## Environment variables

- `TOKEN` — Telegram bot token
- `MONGO` — URL of the mongo database
- `TELEGRAM_API_ID` — see [the docs](https://painor.gitbook.io/gramjs/getting-started/authorization)
- `TELEGRAM_API_HASH` — see [the docs](https://painor.gitbook.io/gramjs/getting-started/authorization)
- `PORT` — port to run the backend on (defaults to `1337`)

Also, please, consider looking at `.env.sample`.

## API

You can also access API at https://backend.isbotdown.com. Available routes are:

#### GET `/bots?skip={skip}&limit={limit}`

Returns a paginated list of bots with their statuses.

#### GET `/bots/{bot_username}`

Returs the status of the bot with the given username. You can pass usernames with or without the `@` prefix.

#### GET `/audience/{bot_username}`

Returns audience info from [@TrueCheckerBot](https://t.me/TrueCheckerBot) and [@botspulsebot](https://t.me/botspulsebot).

## CI/CD

`main` branch get automatically deployed to [@IsBotDownBot](https://t.me/IsBotDownBot) via [ci-ninja](https://github.com/backmeupplz/ci-ninja).

## License

MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!
