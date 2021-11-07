import { Bot } from 'grammy'
import { NewMessage, NewMessageEvent } from 'telegram/events'
import { StoreSession } from 'telegram/sessions'
import { TelegramClient } from 'telegram'
import { verifyBotIsAlive } from '@/helpers/checkBot'
import Context from '@/models/Context'
import input from 'input'

const bot = new Bot<Context>(process.env.TOKEN)

export default bot

const storeSession = new StoreSession('telegram_session')

async function eventPrint(event: NewMessageEvent) {
  if (event.isPrivate) {
    const sender = await event.message.getSender()
    if ('self' in sender && sender.self) {
      return
    }
    if ('username' in sender && sender.username) {
      verifyBotIsAlive(sender.username)
    }
  }
}

let client: TelegramClient

void (async () => {
  client = new TelegramClient(
    storeSession,
    +process.env.TELEGRAM_API_ID,
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  )
  await client.start({
    phoneNumber: async () => await input.text('number ?'),
    password: async () => await input.text('password?'),
    phoneCode: async () => await input.text('Code ?'),
    onError: (err) => console.log(err),
  })
  client.addEventHandler(eventPrint, new NewMessage({}))
})()

export function sendStartToBot(username: string) {
  if (!client.connected) {
    throw new Error('client not connected')
  }
  return client.sendMessage(username, { message: '/start' })
}

export async function isUsernameBot(username: string) {
  const entity = await client.getEntity(username)
  return 'bot' in entity && entity.bot
}
