const map = f => r => (a, x) => r(a, f(x))
//, filter = f => r => (a, x) //=> f(x)? r(a, x): a

, filter = f => r => (a, x)=> {
     const b = f(x);
    if (b instanceof Promise)
      return b.then(b => b? r(a, x): a);
    else
      return b? r(a, x): a;
  }

, compose = (...fs) => fs.reverse().reduce((c, f) => f(c))
, trnsd = (xs, a, r, ...fs) => xs.reduce(compose(...fs, r), a)

, r_array = (a, x) => {a.push(x); return a}
, tr_array = (xs, ...fs) => trnsd(xs, [], r_array, ...fs)

, resolve = x => (x instanceof Promise? x: Promise.resolve(x))
, r_async = r => (pa, px) => resolve(pa).then(a => resolve(px).then(x => r(a, x)))
, interleave = (xs, y) => xs.slice(1).reduce((xyxs, x) => xyxs.concat(y, x), [xs[0]])
, catching = (reducer, acc, x) => {

acc.catch(e => console.log("WITCHES", e))

return reducer(acc, x).catch(
e => {
  console.log("dammit", e);
  //if (!error) {
    //error = true;
    throw e
  //}
}
)

}

, trnsd_async = (xs, a, r, ...fs) => {
  const reducer = compose(...interleave([...fs, r], r_async))
  let acc = a, error = false, c = 1, ps = []
  for (let x of xs) {
    // console.log(c++)
    try {
    acc = reducer(acc, x)//.catch(e => console.log("in", c, e)))
    ps.push(acc)//.catch(e => console.log("in", c, e)))
  } catch (e) {
    return Promise.all([Promise.reject(e), ...ps])
  }
 //new Promise((resolve, reject) => reducer(a, x).then(b =>
//resolve(b)).catch(reject))
  }
//return reducer(a, xs[1])
    return Promise.all(ps).then(values => values[values.length-1])
}
//trnsd(xs, a, r_async(r), ...interleave(fs, r_async))
, tr_async = (xs, ...fs) => trnsd_async(xs, [], r_array, ...fs)

module.exports = {
  map, filter, trnsd, tr_array, trnsd_async, tr_async,r_async,r_array
}
