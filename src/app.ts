import 'reflect-metadata'
// Setup @/ aliases for modules
import 'module-alias/register'
// Config dotenv
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import { handleDelete, handleDeleteAction } from '@/handlers/delete'
import { localeActions } from '@/handlers/language'
import { run } from '@grammyjs/runner'
import { sendLanguage, setLanguage } from '@/handlers/language'
import { startTelegramClient } from '@/helpers/telegramClient'
import attachChat from '@/middlewares/attachChat'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleSubscribeAction from '@/handlers/handleSubscribeAction'
import handleText from '@/handlers/handleText'
import i18n from '@/helpers/i18n'
import ignoreOldMessageUpdates from '@/middlewares/ignoreOldMessageUpdates'
import sendHelp from '@/handlers/sendHelp'
import sequentialize from '@/middlewares/sequentialize'
import startChecking from '@/helpers/checker'
import startMongo from '@/helpers/startMongo'

async function runApp() {
  console.log('Starting app...')
  // Mongo
  await startMongo()
  console.log('Mongo connected')
  // Telegram client
  await startTelegramClient()
  // Checker
  startChecking()
  console.log('Checker started')
  // Middlewares
  bot.use((ctx, next) => {
    console.log(ctx.update)
    return next()
  })
  bot.use(sequentialize)
  bot.use(ignoreOldMessageUpdates)
  bot.use(attachChat)
  bot.use(i18n.middleware())
  bot.use(configureI18n)
  // Commands
  bot.command(['help', 'start'], sendHelp)
  bot.command('language', sendLanguage)
  bot.command('delete', handleDelete)
  // Text
  bot.on('msg:text', handleText)
  // Actions
  bot.callbackQuery(localeActions, setLanguage)
  bot.callbackQuery(/(s|u)~.+/g, handleSubscribeAction)
  bot.callbackQuery(/d~.+/g, handleDeleteAction)
  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  run(bot)
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}

void runApp()
