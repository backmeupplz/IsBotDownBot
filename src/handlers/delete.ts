import { InlineKeyboard } from 'grammy'
import { toggleSubscription } from '@/models/Chat'
import Context from '@/models/Context'

export function handleDelete(ctx: Context) {
  const keyboard = new InlineKeyboard()
  if (!ctx.dbchat.subscriptions.length) {
    return ctx.reply(ctx.i18n.t('delete_no_bots'))
  }
  for (const subscription of ctx.dbchat.subscriptions) {
    keyboard.text(`@${subscription}`, `d~${subscription}`).row()
  }
  return ctx.reply(ctx.i18n.t('delete'), {
    reply_markup: keyboard,
  })
}

export async function handleDeleteAction(ctx: Context) {
  await ctx.answerCallbackQuery()
  const parts = ctx.callbackQuery.data.split('~')
  const username = parts[1]
  await toggleSubscription(ctx.dbchat, username, false)
  ctx.dbchat.subscriptions = ctx.dbchat.subscriptions.filter(
    (subscription) => subscription !== username
  )
  const keyboard = new InlineKeyboard()
  if (!ctx.dbchat.subscriptions.length) {
    return ctx.editMessageText(ctx.i18n.t('delete_no_bots'))
  }
  for (const subscription of ctx.dbchat.subscriptions) {
    keyboard.text(`@${subscription}`, `d~${subscription}`).row()
  }
  return ctx.editMessageText(ctx.i18n.t('delete'), {
    reply_markup: keyboard,
  })
}
