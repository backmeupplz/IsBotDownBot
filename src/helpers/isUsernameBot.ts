import { findBotByUsername } from '@/models/Bot'
import { getEntityByUsername } from '@/helpers/telegramClient'

const usernameCache = {} as {
  [username: string]: {
    isBot: boolean
    createdAt: number
    telegramId: number
  }
}

const cacheLifeLimit = 60 * 1000 // 60 seconds

export default async function isUsernameBot(username: string): Promise<{
  isBot: boolean
  telegramId?: number
}> {
  const bot = await findBotByUsername(username)
  if (bot) {
    return { isBot: true, telegramId: bot.telegramId }
  }
  if (
    usernameCache[username] &&
    Date.now() - usernameCache[username].createdAt < cacheLifeLimit
  ) {
    return {
      isBot: usernameCache[username].isBot,
      telegramId: usernameCache[username].telegramId,
    }
  }
  const entity = await getEntityByUsername(username)
  const isBot = 'bot' in entity && entity.bot
  usernameCache[username] = {
    isBot,
    createdAt: Date.now(),
    telegramId: Number(entity.id),
  }
  return { isBot, telegramId: Number(entity.id) }
}
