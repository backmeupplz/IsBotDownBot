import { sendStartToBot } from '@/helpers/bot'
import { v4 as uuid } from 'uuid'

const promisesMap: {
  [promiseId: string]: {
    res: (alive: boolean) => void
    createdAt: number
    username: string
  }
} = {}

const interval = 5000
setInterval(() => {
  const now = Date.now()
  const promisesToRemove = []
  for (const promiseId in promisesMap) {
    const promise = promisesMap[promiseId]
    if (now - promise.createdAt > interval) {
      promisesToRemove.push(promiseId)
    }
  }
  for (const promiseId of promisesToRemove) {
    promisesMap[promiseId].res(false)
    delete promisesMap[promiseId]
  }
}, interval)

export function checkBot(username: string) {
  return new Promise<boolean>((res) => {
    const promiseId = uuid()
    promisesMap[promiseId] = {
      res,
      createdAt: Date.now(),
      username,
    }
    return sendStartToBot(username)
  })
}

export function verifyBotIsAlive(username: string) {
  for (const promiseId in promisesMap) {
    const promise = promisesMap[promiseId]
    if (promise.username === username) {
      promise.res(true)
      delete promisesMap[promiseId]
    }
  }
}
