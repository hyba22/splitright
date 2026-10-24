let counter = 0

/** Short unique id for people and bills. */
export const newId = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`
