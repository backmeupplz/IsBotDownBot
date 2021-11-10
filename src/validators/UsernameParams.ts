import { IsString } from 'amala'

export default class UsernameParams {
  @IsString()
  username: string
}
