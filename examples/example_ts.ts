import { tr_async, tr_par, map, filter } from '../src/trnsd'
import { getUser } from './fake-user-service'

declare var console, process

const numbers = [1, 2, 3, 4, 5, 6]

const tr =
  (
    process && process.argv && process.argv.includes
    && process.argv.includes('par')
  )
  ? tr_par
  : tr_async

tr(numbers,
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
