import * as findorcreate from 'mongoose-findorcreate'
import { Bot } from '@/models/Bot'
import {
  DocumentType,
  getModelForClass,
  plugin,
  prop,
} from '@typegoose/typegoose'
import { FindOrCreate } from '@typegoose/typegoose/lib/defaultClasses'

@plugin(findorcreate)
export class Chat extends FindOrCreate {
  @prop({ required: true, index: true, unique: true })
  telegramId: number
  @prop({ required: true, default: 'en' })
  language: string
  @prop({ required: true, default: [], type: String, index: true })
  subscriptions: string[]
}

const ChatModel = getModelForClass(Chat, {
  schemaOptions: { timestamps: true },
})

export function findOrCreateChat(telegramId: number) {
  return ChatModel.findOrCreate({ telegramId })
}

export function toggleSubscription(
  chat: DocumentType<Chat>,
  username: string,
  subscribe: boolean
) {
  return ChatModel.updateOne(
    { _id: chat._id },
    { [subscribe ? '$push' : '$pull']: { subscriptions: username } }
  )
}

export function findChatsSubscribedToBot(bot: DocumentType<Bot>) {
  return ChatModel.find({ subscriptions: bot.username })
}

export function removeAllSubscriptionsToBot(bot: DocumentType<Bot>) {
  return ChatModel.updateMany(
    { subscriptions: bot.username },
    {
      $pull: { subscriptions: bot.username },
    }
  )
}
