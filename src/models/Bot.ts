import * as findorcreate from 'mongoose-findorcreate'
import { FindOrCreate } from '@typegoose/typegoose/lib/defaultClasses'
import { getModelForClass, plugin, prop } from '@typegoose/typegoose'

@plugin(findorcreate)
export class Bot extends FindOrCreate {
  @prop({ required: true, index: true, unique: true })
  username: string
  @prop({ required: true, default: false })
  isDown: boolean
  @prop()
  downSince?: Date
  @prop({ required: true, default: new Date() })
  lastChecked: Date
}

const BotModel = getModelForClass(Bot, {
  schemaOptions: { timestamps: true },
})

export async function findOrCreateBot(username: string, isDown?: boolean) {
  const { doc } = await BotModel.findOrCreate({ username })
  if (isDown !== undefined) {
    doc.isDown = isDown
    doc.downSince = isDown ? new Date() : undefined
    await doc.save()
  }
  return doc
}

export function getBots() {
  return BotModel.find({})
}

export function deleteBot(_id: string) {
  return BotModel.findByIdAndDelete(_id)
}
