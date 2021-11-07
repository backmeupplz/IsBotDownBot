import { Bot, deleteBot, getBots } from '@/models/Bot'
import {
  Chat,
  findChatsSubscribedToBot,
  removeBotFromSubscriptions,
} from '@/models/Chat'
import { DocumentType } from '@typegoose/typegoose'
import { checkBot as checkBotBase } from '@/helpers/checkBot'
import bot, { isUsernameBot } from '@/helpers/bot'
import i18n from '@/helpers/i18n'

const checkingInterval = 60
const checkStep = 100

export default function startChecking() {
  void check()
  setInterval(() => void check(), checkingInterval * 1000)
}

async function checkBot(bot: DocumentType<Bot>) {
  try {
    const isBot = await isUsernameBot(bot.username)
    if (!isBot) {
      return botVanished(bot)
    }
  } catch {
    return botVanished(bot)
  }
  const isAlive = await checkBotBase(bot.username)
  await updateBotAndNotifySubscribersIfNeeded(bot, isAlive)
}

export async function updateBotAndNotifySubscribersIfNeeded(
  bot: DocumentType<Bot>,
  isAlive: boolean
) {
  bot.lastChecked = new Date()
  if (isAlive && bot.isDown) {
    bot.isDown = false
    bot.downSince = undefined
    await bot.save()
    const chats = await findChatsSubscribedToBot(bot.username)
    await sendOut(chats, 'up', { username: bot.username })
  } else if (!isAlive && !bot.isDown) {
    bot.isDown = true
    bot.downSince = new Date()
    await bot.save()
    const chats = await findChatsSubscribedToBot(bot.username)
    await sendOut(chats, 'down', { username: bot.username })
  } else {
    await bot.save()
  }
}

async function botVanished(bot: DocumentType<Bot>) {
  const chats = await findChatsSubscribedToBot(bot.username)
  await removeBotFromSubscriptions(bot.username)
  await deleteBot(bot._id as string)
  await sendOut(chats, 'vanished', { username: bot.username })
}

let checking = false
async function check() {
  if (checking) {
    return
  }
  checking = true
  try {
    console.log('Checking bots...')
    const bots = await getBots()
    console.log(`Found ${bots.length} bots`)
    while (bots.length) {
      const botsToCheck = bots.splice(0, checkStep)
      await Promise.all(botsToCheck.map((bot) => checkBot(bot)))
    }
    console.log('Finished checking bots')
  } catch (error) {
    console.error(error)
  } finally {
    checking = false
  }
}

const sendOutStep = 30
async function sendOut(
  chats: DocumentType<Chat>[],
  localizationKey: string,
  localizationObject?: Record<string, unknown>
) {
  while (chats.length) {
    const chatsToSend = chats.splice(0, sendOutStep)
    await Promise.all(
      chatsToSend.map(async (chat) => {
        try {
          await bot.api.sendMessage(
            chat.id as number,
            i18n.t(chat.language, localizationKey, localizationObject)
          )
        } catch (error) {
          console.error(error)
        }
      })
    )
    await delay(1)
  }
}

function delay(s: number) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}
