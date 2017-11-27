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
.then(console.log) // [ 51, 201, 251 ]


tr_async(
  
  numbers,
         
  map(x => {
    console.log(`Processing ${x}`)
    return wait(1000).then(() => x * 100)
  }),
  
  filter(x => {
    console.log(`Filtering ${x}`)
    return x < 500}
  )
  
)
.then(console.log)
/*
  Processing 1
  Processing 2
  Processing 4
  Processing 5
  Processing 6
  Processing 7
  Processing 8
  Processing 9
  Processing 10
  Filtering 100
  Filtering 200
  Filtering 400
  Filtering 500
  Filtering 600
  Filtering 700
  Filtering 800
  Filtering 900
  Filtering 1000
  [ 100, 200, 400 ]
*/

