import { InlineKeyboard } from 'grammy'
import { checkBot } from '@/helpers/checkBot'
import { findOrCreateBot } from '@/models/Bot'
import { isUsernameBot } from '@/helpers/bot'
import { updateBotAndNotifySubscribersIfNeeded } from '@/helpers/checker'
import Context from '@/models/Context'

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
    const isBot = await isUsernameBot(username)
    if (!isBot) {
      return replyWithError(ctx)
    }
  } catch {
    return replyWithError(ctx)
  }
  const isBotAlive = await checkBot(username)
  const bot = await findOrCreateBot(username, !isBotAlive)
  await updateBotAndNotifySubscribersIfNeeded(bot, isBotAlive)
  const keyboard = new InlineKeyboard()
  const isSubscribed = ctx.dbchat.subscriptions.includes(username)
  keyboard.text(
    ctx.i18n.t(isSubscribed ? 'unsubscribe' : 'subscribe'),
    `${isSubscribed ? 'u' : 's'}~${username}`
  )
  return ctx.reply(ctx.i18n.t(isBotAlive ? 'up' : 'down', { username }), {
    reply_markup: keyboard,
  })
}
