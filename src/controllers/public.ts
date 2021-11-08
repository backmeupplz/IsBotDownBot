import { Controller, Ctx, Get } from 'amala'

@Controller('/')
export default class PublicController {
  @Get('/')
  public(@Ctx() ctx) {
    ctx.redirect('https://github.com/backmeupplz/IsBotDownBot')
    return 'redirecting...'
  }
}
