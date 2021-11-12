import { Bot, deleteBot } from '@/models/Bot'
import {
  Chat,
  findChatsSubscribedToBot,
  removeAllSubscriptionsToBot,
} from '@/models/Chat'
import { DocumentType } from '@typegoose/typegoose'
import { InlineKeyboard } from 'grammy'
import { getEntityByUsername, sendStartToBot } from '@/helpers/telegramClient'
import {
  isBotBeingChecked,
  markBotAsBeingChecked,
  markBotAsNotBeingChecked,
} from '@/helpers/botsBeingChecked'
import { v4 as uuid } from 'uuid'
import i18n from '@/helpers/i18n'
import mainBot from '@/helpers/bot'
import sendout from '@/helpers/sendout'

const promisesMap: {
  [promiseId: string]: {
    res: (alive: boolean) => void
    createdAt: number
    telegramId: number
  }
} = {}

const intervalInSeconds = 10
setInterval(() => {
  const now = Date.now()
  const promisesToRemove = []
  for (const promiseId in promisesMap) {
    const promise = promisesMap[promiseId]
    if (now - promise.createdAt > intervalInSeconds * 1000) {
      promisesToRemove.push(promiseId)
    }
  }
  for (const promiseId of promisesToRemove) {
    try {
      promisesMap[promiseId].res(false)
    } catch {
      // Do nothing
    }
    delete promisesMap[promiseId]
  }
}, intervalInSeconds * 1000)

export async function checkBotAndDoSendout(
  bot: DocumentType<Bot>,
  requester?: DocumentType<Chat>
) {
  // Obtain lock
  if (isBotBeingChecked(bot.telegramId)) {
    return Promise.resolve()
  }
  markBotAsBeingChecked(bot.telegramId)
  // Check bot
  try {
    // Try to fix fetching id by username
    if (!bot.fetchedIdByUsername) {
      console.log(
        `Fixing not being able to use entity for the bot ${bot.username}, ${bot.telegramId}`
      )
      await getEntityByUsername(bot.username)
      bot.fetchedIdByUsername = true
      await bot.save()
    }
    // Check if bot is alive
    const isBotAlive = await checkBotInternal(bot.telegramId)
    // Set last checked
    bot.lastChecked = new Date()
    if (isBotAlive && bot.isDown) {
      // Set up status
      bot.isDown = false
      bot.downSince = undefined
      await bot.save()
      // Send status to requester
      await sendStatusToRequester(bot, requester)
      // Send status to other subscribers
      const chats = await findChatsSubscribedToBot(bot)
      await sendout(
        chats,
        'up',
        {
          username: bot.username,
        },
        [requester]
      )
    } else if (!isBotAlive && !bot.isDown) {
      // Set down status
      bot.isDown = true
      bot.downSince = new Date()
      await bot.save()
      // Send status to requester
      await sendStatusToRequester(bot, requester)
      // Send status to other subscribers
      const chats = await findChatsSubscribedToBot(bot)
      await sendout(
        chats,
        'down',
        {
          username: bot.username,
        },
        [requester]
      )
    } else {
      // Save last checked
      await bot.save()
      // Send status to requester even if it didn't change
      await sendStatusToRequester(bot, requester)
    }
  } catch (error) {
    if (error.message.includes('INPUT_USER_DEACTIVATED')) {
      const chats = await findChatsSubscribedToBot(bot)
      await sendout(requester ? [...chats, requester] : chats, 'vanished', {
        username: bot.username,
      })
      await removeAllSubscriptionsToBot(bot)
      await deleteBot(bot)
    } else if (requester) {
      try {
        await mainBot.api.sendMessage(
          requester.telegramId,
          i18n.t(requester.language, 'error', { username: bot.username })
        )
      } catch (sendMainBotError) {
        console.log(sendMainBotError.message)
      }
    }
    console.error(error.message)
  } finally {
    // Release lock
    markBotAsNotBeingChecked(bot.telegramId)
  }
}

async function sendStatusToRequester(
  bot: DocumentType<Bot>,
  requester?: DocumentType<Chat>
) {
  if (!requester) {
    return
  }
  const keyboard = new InlineKeyboard()
  const isSubscribed = requester.subscriptions.includes(bot.username)
  keyboard.text(
    i18n.t(requester.language, isSubscribed ? 'unsubscribe' : 'subscribe'),
    `${isSubscribed ? 'u' : 's'}~${bot.username}`
  )
  try {
    await mainBot.api.sendMessage(
      requester.telegramId,
      i18n.t(requester.language, bot.isDown ? 'down' : 'up', {
        username: bot.username,
      }),
      {
        reply_markup: keyboard,
      }
    )
  } catch (error) {
    console.error(error)
  }
}

function checkBotInternal(telegramId: number) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<boolean>(async (res, rej) => {
    const promiseId = uuid()
    promisesMap[promiseId] = {
      res,
      createdAt: Date.now(),
      telegramId,
    }
    try {
      await sendStartToBot(telegramId)
    } catch (error) {
      delete promisesMap[promiseId]
      rej(error)
    }
  })
}

export function verifyBotIsAlive(telegramId: number) {
  for (const promiseId in promisesMap) {
    const promise = promisesMap[promiseId]
    if (promise.telegramId === telegramId) {
      promise.res(true)
      delete promisesMap[promiseId]
    }
  }
}
