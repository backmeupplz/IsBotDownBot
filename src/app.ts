import 'reflect-metadata'
// Setup @/ aliases for modules
import 'module-alias/register'
// Config dotenv
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import { RunnerHandle, run } from '@grammyjs/runner'
import { handleDelete, handleDeleteAction } from '@/handlers/delete'
import { localeActions } from '@/handlers/language'
import { sendLanguage, setLanguage } from '@/handlers/language'
import {
  startTelegramClient,
  stopTelegramClient,
} from '@/helpers/telegramClient'
import attachChat from '@/middlewares/attachChat'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleSubscribeAction from '@/handlers/handleSubscribeAction'
import handleText from '@/handlers/handleText'
import i18n from '@/helpers/i18n'
import ignoreOldMessageUpdates from '@/middlewares/ignoreOldMessageUpdates'
import pollWithHandover from '@/helpers/handover'
import sendHelp from '@/handlers/sendHelp'
import sequentialize from '@/middlewares/sequentialize'
import startChecking, { stopChecking } from '@/helpers/checker'
import startMongo from '@/helpers/startMongo'
import startRest from '@/rest'

async function runApp() {
  console.log('Starting app...')
  // Mongo
  await startMongo()
  console.log('Mongo connected')
  // Rest server
  await startRest()
  // The newest update fetched and the handlers still running, for handing polling over on deploys
  let lastUpdate = 0
  let handling = 0
  bot.use((ctx, next) => {
    lastUpdate = Math.max(lastUpdate, ctx.update.update_id)
    handling++
    return next().finally(() => handling--)
  })
  // Middlewares
  bot.use(sequentialize)
  bot.use(ignoreOldMessageUpdates)
  bot.use(attachChat)
  bot.use(i18n.middleware())
  bot.use(configureI18n)
  // Commands
  bot.command(['help', 'start'], sendHelp)
  bot.command('language', sendLanguage)
  bot.command('delete', handleDelete)
  // Actions
  bot.callbackQuery(/(s|u)~.+/, handleSubscribeAction)
  bot.callbackQuery(/d~.+/, handleDeleteAction)
  bot.callbackQuery(localeActions, setLanguage)
  // Text
  bot.on('msg:text', handleText)
  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  // The user session, the checker and polling run only on the container holding the polling lock
  let runner: RunnerHandle
  const waitForHandlers = async () => {
    while (handling) await new Promise((resolve) => setTimeout(resolve, 100))
  }
  await pollWithHandover(
    async () => {
      // Telegram client
      await startTelegramClient()
      // Checker
      startChecking()
      console.log('Checker started')
      // Start bot
      runner = run(bot)
      console.info(`Bot ${bot.botInfo.username} is up and running`)
    },
    async () => {
      await runner?.stop()
      // The runner does not confirm on stop: a zero-timeout getUpdates confirms
      // every update fetched, so the next poller does not get them again
      if (lastUpdate) {
        await bot.api.getUpdates({
          offset: lastUpdate + 1,
          limit: 1,
          timeout: 0,
        })
      }
      stopChecking()
      // Handlers may still need the user session, but it has to be closed before
      // the next container opens it
      await Promise.race([
        waitForHandlers(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ])
      await stopTelegramClient()
    },
    waitForHandlers
  )
}

void runApp()
