import 'reflect-metadata'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as bodyParser from 'koa-bodyparser'
import * as cors from '@koa/cors'
import { bootstrapControllers } from 'amala'

const rest = new Koa()
async function startRest() {
  try {
    const router = new Router()
    await bootstrapControllers({
      app: rest,
      router,
      basePath: '/',
      controllers: [__dirname + '/controllers/*'],
      disableVersioning: true,
    })
    rest.use(cors({ origin: '*' }))
    rest.use(bodyParser())
    rest.use(router.routes())
    rest.use(router.allowedMethods())
    const port = process.env.PORT || 1337
    rest.listen(port, () => {
      console.log(`Rest server listening on port ${port}`)
    })
  } catch (err) {
    console.log('Koa app starting error: ', err)
  }
}

export default startRest
