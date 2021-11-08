import { Bot, findBotByUsername, getBots } from '@/models/Bot'
import {
  Controller,
  Ctx,
  Get,
  IsNumber,
  IsString,
  Max,
  Params,
  Query,
} from 'amala'
import { DocumentType } from '@typegoose/typegoose'
import { notFound } from '@hapi/boom'
import { pick } from 'lodash'

class UsernameParams {
  @IsString()
  username: string
}

class ListQuery {
  @IsNumber()
  skip: number
  @IsNumber()
  @Max(100)
  limit: number
}

function stripBot(bot: DocumentType<Bot>) {
  return pick(bot, ['username', 'isDown', 'downSince', 'telegramId'])
}

@Controller('/bots')
export default class BotsController {
  @Get('/')
  async bots(@Query({ required: true }) { skip, limit }: ListQuery) {
    const bots = await getBots().skip(skip).limit(limit)
    return bots.map(stripBot)
  }

  @Get('/:username')
  async username(
    @Ctx() ctx,
    @Params({ required: true }) { username }: UsernameParams
  ) {
    const bot = await findBotByUsername(
      username.replace(/^@/, '').toLowerCase().trim()
    )
    if (!bot) {
      return ctx.throw(notFound())
    }
    return stripBot(bot)
  }
}
