import { checkBotAndDoSendout } from '@/helpers/checkBot'
import { findOrCreateBot } from '@/models/Bot'
import Context from '@/models/Context'
import isUsernameBot from '@/helpers/isUsernameBot'

function replyWithError(ctx: Context) {
  return ctx.reply(ctx.i18n.t('no_username'), {
    reply_to_message_id: ctx.msg.message_id,
  })
}

export default async function handleText(ctx: Context) {
  const match = /@?([A-Za-z0-9_]+bot)/gi.exec(ctx.msg.text)
  if (!match || !match[1]) {
    return replyWithError(ctx)
  }
  const username = match[1]
  await ctx.replyWithChatAction('typing')
  try {
    const { isBot, telegramId } = await isUsernameBot(username)
    if (!isBot) {
      return replyWithError(ctx)
    }
    const bot = await findOrCreateBot(username, telegramId)
    return checkBotAndDoSendout(bot, ctx.dbchat)
  } catch (error) {
    console.error(error)
    return replyWithError(ctx)
  }
}
