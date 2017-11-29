const { tr_async, map, filter } = require('../trnsd')
const { wait } = require('./wait')

const numbers = [100, 200, 300]

tr_async(
  numbers,
  map(x => {
    return wait(x).then(
      () => {
        if (x === 200) throw new Error('Yikes!')
        return x
      }
    )
  }),
  filter(x => x === 100),
  map(x => {
    throw new Error('Whoops')
  })
)
.then(console.log)
.catch(console.log)

 
