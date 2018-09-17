import { tr_par, par, map, filter, flatten } from "../src/trnsd";
import { getUser } from "./fake-user-service";

declare var console, process;

const numbers = [1, 2, 3, 4, 5, 6];

async function example() {
  await tr_par(
    numbers,
    filter(x => x % 2 === 1),
    map(x => [String(x), String(x * x), String(x * x * x)]),
    r => (a, xs) => {
      let nextA = a;
      for (let x of xs) nextA = r(nextA, x);
      return nextA;
    },
    map((x: string) => x.length),
    map(getUser)
  ).then(x => {
    console.log(x);
  });

  // The second example is nonsensical, but it demonstrates
  // that typing works with the 'extended' interface
  const ys = await par({ maxParallel: 3 })
    .input(numbers)
    .pipe(
      map(x => x + 1),
      filter(x => x !== 5),
      map(x => {
        const a = new Array<number>(x);
        return a.fill(x);
      }),
      flatten(),
      map(x => String(x))
    );
  console.log(ys.join());
}

example();
