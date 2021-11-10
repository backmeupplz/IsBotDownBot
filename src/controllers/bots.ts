import { Bot, findBotByUsername, getBots } from '@/models/Bot'
import {
  Controller,
  Ctx,
  Get,
  IsInt,
  Max,
  Min,
  Params,
  Query,
  Type,
} from 'amala'
import { DocumentType } from '@typegoose/typegoose'
import { notFound } from '@hapi/boom'
import { pick } from 'lodash'
import UsernameParams from '@/validators/UsernameParams'

class ListQuery {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number
  @Type(() => Number)
  @IsInt()
  @Max(100)
  limit: number
}

function stripBot(bot: DocumentType<Bot>) {
  return pick(bot, ['username', 'isDown', 'downSince', 'telegramId'])
}

@Controller('/bots')
export default class BotsController {
  @Get('/')
  async bots(@Query() { skip, limit }: ListQuery) {
    const bots = await getBots().skip(skip).limit(limit)
    return bots.map(stripBot)
  }

  @Get('/:username')
  async username(@Ctx() ctx, @Params() { username }: UsernameParams) {
    const bot = await findBotByUsername(
      username.replace(/^@/, '').toLowerCase().trim()
    )
    if (!bot) {
      return ctx.throw(notFound())
    }
    return stripBot(bot)
  }
}
