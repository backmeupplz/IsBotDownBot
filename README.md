# [@IsBotDownBot](https://t.me/IsBotDownBot) code

Code of the bot that tracks the up and down status of other bots.

# Installation and local launch

1. Clone this repo: `git clone https://github.com/backmeupplz/IsBotDownBot`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests. Thanks!

# Environment variables

- `TOKEN` — Telegram bot token
- `MONGO` — URL of the mongo database
- `TELEGRAM_API_ID` — see [the docs](https://painor.gitbook.io/gramjs/getting-started/authorization)
- `TELEGRAM_API_HASH` — see [the docs](https://painor.gitbook.io/gramjs/getting-started/authorization)

Also, please, consider looking at `.env.sample`.

# CI/CD

`main` branch get automatically deployed to [@IsBotDownBot](https://t.me/IsBotDownBot) via [ci-ninja](https://github.com/backmeupplz/ci-ninja).

# License

MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!
