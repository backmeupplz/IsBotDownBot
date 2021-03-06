import { Chat } from '@/models/Chat'
import { DocumentType } from '@typegoose/typegoose'
import bot from '@/helpers/bot'
import delay from '@/helpers/delay'
import i18n from '@/helpers/i18n'

const sendOutStep = 30
export default async function sendout(
  chats: DocumentType<Chat>[],
  localizationKey: string,
  localizationObject?: Record<string, unknown>,
  chatsToExclude: DocumentType<Chat>[] = []
) {
  const chatsToExcludeIds = chatsToExclude
    .filter((v) => !!v)
    .map((chat) => chat.telegramId)
  const sentChatsMap = new Map<number, boolean>()
  while (chats.length) {
    const chatsToSend = chats.splice(0, sendOutStep)
    await Promise.all(
      chatsToSend.map(async (chat) => {
        try {
          if (chatsToExcludeIds.includes(chat.telegramId)) {
            return Promise.resolve()
          }
          if (sentChatsMap.has(chat.telegramId)) {
            return Promise.resolve()
          }
          sentChatsMap.set(chat.telegramId, true)
          await bot.api.sendMessage(
            chat.telegramId as number,
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
