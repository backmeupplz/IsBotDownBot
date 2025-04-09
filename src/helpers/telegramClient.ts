import { NewMessage, NewMessageEvent } from 'telegram/events'
import { StringSession } from 'telegram/sessions'
import { TelegramClient } from 'telegram'
import { verifyBotIsAlive } from '@/helpers/checkBot'
import input from 'input'

const storeSession = new StringSession(process.env.SESSION)

async function eventHandler(event: NewMessageEvent) {
  if (event.isPrivate) {
    const sender = await event.message.getSender()
    // Check if there is a sender
    if (!sender) {
      return
    }
    // Check if not self
    if ('self' in sender && sender.self) {
      return
    }
    // Check if a bot
    if (!('bot' in sender) || !sender.bot) {
      return
    }
    if (sender && 'id' in sender && sender.id) {
      verifyBotIsAlive(Number(sender.id))
    }
  }
}

let client: TelegramClient
export async function startTelegramClient() {
  client = new TelegramClient(
    storeSession,
    +process.env.TELEGRAM_API_ID,
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  )
  await client.start({
    phoneNumber: async () => await input.text('Phone ?'),
    password: async () => await input.text('Password ?'),
    phoneCode: async () => await input.text('Code ?'),
    onError: (err) => console.log(err),
  })
  client.addEventHandler(eventHandler, new NewMessage({}))
  console.log(client.session.save())
}

export function sendStartToBot(id: number) {
  if (!client.connected) {
    throw new Error('client not connected')
  }
  return client.sendMessage(id, { message: '/start' })
}

export function sendStartToBotByUsername(username: string) {
  if (!client.connected) {
    throw new Error('client not connected')
  }
  return client.sendMessage(username, { message: '/start' })
}

export function getEntityByUsername(username: string) {
  if (!client.connected) {
    throw new Error('client not connected')
  }
  return client.getEntity(username)
}
