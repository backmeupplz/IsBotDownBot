import { toggleSubscription } from '@/models/Chat'
import Context from '@/models/Context'

export default async function handleSubscribeAction(ctx: Context) {
  await ctx.answerCallbackQuery()
  const parts = ctx.callbackQuery.data.split('~')
  const subscribe = parts[0] === 's'
  const username = parts[1]
  await toggleSubscription(ctx.dbchat._id as string, username, subscribe)
  return ctx.editMessageText(
    ctx.i18n.t(subscribe ? 'subscribed' : 'unsubscribed', { username })
  )
}
