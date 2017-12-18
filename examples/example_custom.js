const { trnsd, trnsd_async, map, filter } = require('trnsd')
const { wait } = require('./wait')
, numbers = [1, 2, 4, 5, 6, 7, 8, 9, 10]

// Run the numbers through some maps and filters.
// Store the results in a Set. Any type of collection can
// be used by providing an empty collection
// and a "reduce" type function that receives the collection
// and a value, and returns the collection with the new value
// added
const result = trnsd(numbers,
  new Set(),
  (a, x) => {a.add(x); return a},
  map(x => x * 50),
  map(x => x + 1),
  filter(x => x < 400),
  map(x => x % 300)
)

console.log(result) // Set { 51, 101, 201, 251, 1 }

// Another, asynchronous, example:
trnsd_async(numbers,
  'Random numbers:',
  (a, x) => a + ' ' + x,
  map(x => wait(x*100)
    .then(() => Math.floor(Math.random()*10))
  )
)
.then(console.log) // Random numbers: 7 7 2 5 1 5 2 9 5
