const { tr_array, map, filter } = require('trnsd')
, numbers = [1, 2, 4, 5, 6, 7, 8, 9, 10]

// Run the numbers through some maps and filters.
const result = tr_array(numbers,
  map(x => x * 50),
  map(x => x + 1),
  filter(x => x < 400),
  filter(x => Math.floor(x/100) % 2 === 0)
)

console.log(result) // [ 51, 201, 251 ]
