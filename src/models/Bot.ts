import * as findorcreate from 'mongoose-findorcreate'
import { FindOrCreate } from '@typegoose/typegoose/lib/defaultClasses'
import { getModelForClass, plugin, prop } from '@typegoose/typegoose'

@plugin(findorcreate)
export class Bot extends FindOrCreate {
  @prop({ required: true, index: true, unique: true })
  id: number
  @prop({ required: true, index: true, unique: true })
  handle: string
  @prop({ required: true, default: false })
  isDown: boolean
  @prop()
  downSince?: Date
}

const BotModel = getModelForClass(Bot, {
  schemaOptions: { timestamps: true },
})

export function findOrCreateBot(id: number, handle: string) {
  return BotModel.findOrCreate({ id, handle })
}
