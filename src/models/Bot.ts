import * as findorcreate from 'mongoose-findorcreate'
import {
  DocumentType,
  getModelForClass,
  plugin,
  prop,
} from '@typegoose/typegoose'
import { FindOrCreate } from '@typegoose/typegoose/lib/defaultClasses'

@plugin(findorcreate)
export class Bot extends FindOrCreate {
  @prop({ required: true, index: true, unique: true })
  username: string
  @prop({ required: true, index: true, unique: true })
  telegramId: number
  @prop({ required: true, default: false })
  isDown: boolean
  @prop()
  downSince?: Date
  @prop({ required: true, default: new Date() })
  lastChecked: Date
  @prop({ required: true, default: true })
  fetchedIdByUsername: boolean
}

const BotModel = getModelForClass(Bot, {
  schemaOptions: { timestamps: true },
})

export async function findOrCreateBot(username: string, telegramId: number) {
  let doc: DocumentType<Bot>
  try {
    const result = await BotModel.findOrCreate({ username }, { telegramId })
    doc = result.doc
  } catch (error) {
    console.error(
      "Couldn't do findOrCreate:",
      error instanceof Error ? error.message : error
    )
    await BotModel.findOneAndDelete({ telegramId })
    const result = await BotModel.findOrCreate({ username }, { telegramId })
    doc = result.doc
  }
  return doc
}

export function getBots() {
  return BotModel.find({})
}

export function deleteBot(bot: DocumentType<Bot>) {
  return BotModel.findByIdAndDelete(bot._id)
}

export function findBotByUsername(username: string) {
  return BotModel.findOne({ username })
}
