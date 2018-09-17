const { tr_par, par, map, filter } = require('./trnsd_import')
const { wait } = require('./wait')
, numbers = [1, 2, 4, 5, 6, 7, 8, 9, 10]

async function example() {
//   await tr_par(
//     
//     numbers,
//           
//     map(x => {
//       console.log(`Processing ${x}`)
//       return wait(1000).then(() => x * 100)
//     }),
//     
//     filter(x => {
//       console.log(`Filtering ${x}`)
//       return x < 500}
//     )
//     
//   )
//   .then(console.log)
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
  
  y = await par({maxParallel: 3})
    .input(numbers)
    .pipe(
      map(x => {
        console.log(`Processing ${x}`)
        return wait( x===1 ? 100 : 1000 ).then(() => x * 100)
      }),
      
      filter(x => {
        console.log(`Filtering ${x}`)
        return x < 500
      })
    ).catch(e => console.log("Error:", e.message))
  console.log("End result:", y)
  
  /*
    Processing 1
    Processing 2
    Processing 4
    Filtering 100
    Processing 5
    Filtering 200
    Filtering 400
    Processing 6
    Processing 7
    Filtering 500
    Processing 8
    Filtering 600
    Filtering 700
    Processing 9
    Processing 10
    Filtering 800
    Filtering 900
    Filtering 1000
    End result: [ 100, 200, 400 ]
  */
}

example()
