import { Controller, Get, Params } from 'amala'
import { SHA1 } from 'crypto-js'
import { badRequest } from '@hapi/boom'
import UsernameParams from '@/validators/UsernameParams'
import axios from 'axios'

@Controller('/audience')
export default class AudienceController {
  @Get('/:username')
  async username(@Params() { username }: UsernameParams) {
    const sanitizedUsername = username.replace(/^@/, '').toLowerCase().trim()
    if (!sanitizedUsername) {
      throw badRequest()
    }
    const result: {
      trueWebResult?: unknown
      botsBaseResult?: unknown
    } = {}
    try {
      const { data } = await axios.get(
        `https://checker.trueweb.app/api/profile/${username}`
      )
      result.trueWebResult = data
    } catch {
      // Do nothing
    }
    try {
      const { data } = await axios.get(
        `https://chkr.botsbase.ru/api/v1/bot/${username}`
      )
      result.botsBaseResult = data
    } catch {
      // Do nothing
    }
    return result
  }
}
