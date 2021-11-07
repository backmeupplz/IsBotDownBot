import * as findorcreate from 'mongoose-findorcreate'
import { FindOrCreate } from '@typegoose/typegoose/lib/defaultClasses'
import { getModelForClass, plugin, prop } from '@typegoose/typegoose'

@plugin(findorcreate)
export class Chat extends FindOrCreate {
  @prop({ required: true, index: true, unique: true })
  id: number

  @prop({ required: true, default: 'en' })
  language: string

  @prop({ required: true, default: [], type: String })
  subscriptions: string[]
}

const ChatModel = getModelForClass(Chat, {
  schemaOptions: { timestamps: true },
})

export function findOrCreateChat(id: number) {
  return ChatModel.findOrCreate({ id })
}
