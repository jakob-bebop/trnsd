import { tr_async, map, filter } from '../src/trnsd'

declare var console, setTimeout

const numbers = [1, 2, 3, 4, 5, 6]

const wait = (ms) => new Promise(
  (resolve) => setTimeout(resolve, ms)
)

interface User {
  id: number
  name: string
}

function getUser(x: number) {
  return wait(40).then(() => ({
    id: x,
    name: `User #${x}`
  } as User))
}

tr_async(numbers,
  filter(x => x % 2 === 1),
  map(x => [String(x), String(x * x), String(x * x * x)]),
  r => (a, xs) => {
    let nextA = a
    for (let x of xs) nextA = r(nextA, x)
    return nextA;
  },
  map((x: string) => x.length),
  map(getUser)
)
.then(
  x => {
    console.log(x)
  }
)
