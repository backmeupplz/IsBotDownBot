import Context from '@/models/Context'

export default function handleText(ctx: Context) {
  const match = /@?([A-Za-z0-9_]+bot)/gi.exec(ctx.msg.text)
  if (!match || !match[1]) {
    return ctx.reply(ctx.i18n.t('no_username'))
  }
  const username = match[1]
  console.log(username)
  return ctx.reply(username)
}
