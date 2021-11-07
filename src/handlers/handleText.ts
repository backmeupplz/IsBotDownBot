import { checkBot } from '@/helpers/checkBot'
import { isUsernameBot } from '@/helpers/bot'
import Context from '@/models/Context'

export default async function handleText(ctx: Context) {
  const match = /@?([A-Za-z0-9_]+bot)/gi.exec(ctx.msg.text)
  if (!match || !match[1]) {
    return ctx.reply(ctx.i18n.t('no_username'), {
      reply_to_message_id: ctx.msg.message_id,
    })
  }
  const username = match[1]
  await ctx.replyWithChatAction('typing')
  try {
    const isBot = await isUsernameBot(username)
    if (!isBot) {
      return ctx.reply(ctx.i18n.t('no_username'), {
        reply_to_message_id: ctx.msg.message_id,
      })
    }
  } catch {
    return ctx.reply(ctx.i18n.t('no_username'), {
      reply_to_message_id: ctx.msg.message_id,
    })
  }
  const isBotAlive = await checkBot(username)
  return ctx.reply(ctx.i18n.t(isBotAlive ? 'up' : 'down', { username }))
}
