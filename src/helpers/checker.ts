import { checkBotAndDoSendout } from '@/helpers/checkBot'
import { getBots } from '@/models/Bot'
import delay from '@/helpers/delay'

const initialCheckTimeout = 5
const checkingInterval = 10 * 60 // once every 10 minutes
const checkStep = 10

export default function startChecking() {
  setTimeout(() => void check(), initialCheckTimeout * 1000)
  setInterval(() => void check(), checkingInterval * 1000)
}

let checking = false
async function check() {
  if (checking) {
    return
  }
  checking = true
  try {
    console.log('Checking bots...')
    const bots = await getBots()
    console.log(`Found ${bots.length} bots`)
    while (bots.length) {
      const botsToCheck = bots.splice(0, checkStep)
      await Promise.all(botsToCheck.map((bot) => checkBotAndDoSendout(bot)))
      await delay(2)
    }
    console.log('Finished checking bots')
  } catch (error) {
    console.error(error)
  } finally {
    checking = false
  }
}
