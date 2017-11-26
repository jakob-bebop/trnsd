const { tr_async, map, filter } = require('../trnsd')
const { wait } = require('./wait')
, numbers = [1, 2, 4, 5, 6, 7, 8, 9, 10]

// Run the numbers through some maps and filters.
// Sync and async functions can be mixed as in this example
// i.e. the functions passed to `map` and `filter` may return
// a value or a promise of a value; tr_async always returns
// a promise.
tr_async(numbers,
  map(x => x * 50),
  map(x => Promise.resolve(x + 1)),
  filter(x => wait(400).then(() => x < 400)),
  filter(x => Math.floor(x/100) % 2 === 0)
)
.then(console.log)

