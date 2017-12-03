const { tr_async, tr_par, map, filter } = require('../trnsd')
const { wait } = require('./wait')

const numbers = [
 100,
 200
, 300
]

tr_par(
  numbers,
//  map(x => x+1-1),
  map(x => {
    return wait(x).then(
      () => {
        if (x === 200) throw new Error('Yikes! '+x)
        return x
      }
    )
  }),
  filter(x => x === 100),
  map(x => {
    throw new Error('Whoops '+x)
  })
)
.then(console.log)
.catch(e => console.log("MAIN", e))
