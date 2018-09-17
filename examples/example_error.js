const { tr_async, tr_par, par, map, filter } = require('./trnsd_import')
const { wait } = require('./wait')

async function example() {
  let numbers = [100, 200, 300]

  await tr_par(
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
  
  /*
   * Output:

    MAIN Error: Whoops 100
      at x (/home/jakob/trnsd/examples/example_error.js:20:13)
      at /home/jakob/trnsd/lib/src/trnsd.js:5:64
      at /home/jakob/trnsd/lib/src/trnsd.js:55:86
   * Note that the promise never resolves, so the first console.log is never executed
   */
  
  const custom_handler = e => console.log("An exception occurred after the parrallel chain had already been canceled because of an exception --- here it is anyway:", e.message) 
  
  numbers = [1, 2, 4, 5, 6, 7, 8, 9, 10]
  try {
    y = await par(
      {maxParallel: 3, lateErrorHandler: custom_handler}, 
      [], (a, x) => {a.push(x); return a}
    )
    .input(numbers)
    .pipe(
      map(x => {
        console.log(`Processing ${x}`)
        return wait(1000).then(() => x * 100)
      }),
      
      filter(x => {
        console.log(`Filtering ${x}`)
        if (x == 600) throw new Error("bloop for 600")
        if (x == 700) throw new Error("blerp for 700")
        return x < 500
      })
    )
    console.log("End result:", y)
  } catch(e) {
    console.log("Got error in a civilised manner:", e.message)  
  }
  
  /*
   * Output:
   
    Processing 1
    Processing 2
    Processing 4
    Filtering 100
    Filtering 200
    Filtering 400
    Processing 5
    Processing 6
    Processing 7
    Filtering 500
    Filtering 600
    Filtering 700
    Processing 8
    An exception occurred after the parrallel chain had already been canceled because of an exception --- here it is anyway: blerp for 700
    Got error in a civilised manner: bloop for 600
    Filtering 800
    
   * Note that the second exception arrives at the custom error handler _before_
   * the first exception can reach the catch clause. I assume this is caused by the 
   * way errors are handle in nodejs's event loop.
   *
   * Also note that x = 8 had started processing before the error occured, therefore
   * "Filtering 800" appears in the output. On the other hand, processing x = 9 and 
   * x = 10 never start because of the error state.
   */
}

example()
