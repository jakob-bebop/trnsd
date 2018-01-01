declare var setTimeout


const wait = (ms) => new Promise(
  (resolve) => setTimeout(resolve, ms)
)

export interface User {
  id: number
  name: string
}

export function getUser(x: number) {
  return wait(40).then(() => ({
    id: x,
    name: `User #${x}`
  } as User))
}
