# trnsd
naivistic but async-enabled transducer (micro-)library

The transducer approach can be used to improve the 'ordinary' array map an filter
operations that we know and love.

 1. by not having to create a new collection for each map/filter operation
    (this can improve efficiency with large collections, and is the motivating 
    example in various blog posts, as well as [1])
 2. making it more convenient to use async functions in map and filter. This means that you
    don't need to wrap your map result in `Promise.all`. The goal in this case is to improve 
    readability rather than speed (The approach taken here is to _wait for every promise_, so 
    items will be processed sequentially, rather than in parallel as `Promise.all` does)
 
## Transducer constructors
 
There are two constructors `map` and `filter` nothing special here

## Easy interface
 
```javascript
 const { tr_array, map, filter } = require('../trnsd')
, numbers = [1, 2, 4, 5, 6, 7, 8, 9, 10]

const result = tr_array(
  numbers,
  map(x => x * 50),
  map(x => x + 1),
  filter(x => x < 400),
  filter(x => Math.floor(x/100) % 2 === 0)
)

// [ 51, 201, 251 ]
```

## Async interface

```javascript
const { tr_async, map, filter } = require('../trnsd')
const { wait } = require('./wait')
, numbers = [1, 2, 4, 5, 6, 7, 8, 9, 10]

tr_async(
  numbers,
  map(x => x * 50),
  map(x => Promise.resolve(x + 1)),
  filter(x => wait(400).then(() => x < 400)),
  filter(x => Math.floor(x/100) % 2 === 0)
)
.then(console.log) // [ 51, 201, 251 ]
```

**Note that**
* Functions passed to `map` and `filter` may return a value or a Promise... But:
* _if_ Promises are involved, use `tr_async` or `trnsd_async`
* `tr_async` always returns a Promise
* `tr_array` dies in flames if a Promise is encountered. (`UnhandledPromiseRejectionWarning`.) 

## `trnsd` and `trnsd_async` interface
these are proper "transduce" type functions, see `examples/example_custom.js`

## References
[1] Egghead transducer tutorial (https://egghead.io/courses/quickly-transform-data-with-transducers)
