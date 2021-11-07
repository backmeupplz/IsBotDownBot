const botsBeingChecked = new Map<number, boolean>()

export function isBotBeingChecked(id: number) {
  return !!botsBeingChecked.get(id)
}

export function markBotAsBeingChecked(id: number) {
  botsBeingChecked.set(id, true)
}

export function markBotAsNotBeingChecked(id: number) {
  botsBeingChecked.delete(id)
}
