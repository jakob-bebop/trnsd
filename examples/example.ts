import {tr_async, map, filter} from '../src/trnsd'
declare var console

const a = [1, 2, 3, 4, 5, 6]


tr_async(a,
  filter(x => x % 2 === 1),
  map(x => [String(x), String(x * x), String(x*x*x)]),
  r => (a, xs) => {
    let nextA = a
    for (let x of xs) nextA = r(nextA, x)
    return nextA;
  },
  map((x: string) => x.length)
)
.then(
  x => {
    console.log(x)
  }
)
