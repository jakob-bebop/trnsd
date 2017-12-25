import compose from './compose'

type Reducer<C, B> = (c: C, b: B) => C
type Transform<A, B> = (a: A) => B
type Predicate<A> = (a: A) => boolean | Promise<boolean>

export function map<A, B, C>(f: Transform<A, B>){
  return (r: Reducer<C, B>) => (a: C, x: A) => r(a, f(x))
}

export function filter<C, A>(f: Predicate<A>){
  return (r: Reducer<C, A>) => (a: C, x: A) => {
    const b = f(x);
    if (isPromise(b))
      return b.then(b => b? r(a, x): a);
    else
      return b? r(a, x): a;
  }
}
const trnsd = (xs, a, r, ...fs) => xs.reduce(compose(...fs, r), a)

, r_array = (a, x) => {a.push(x); return a}
, tr_array = (xs, ...fs) => trnsd(xs, [], r_array, ...fs)


, tx_intermediate = r => (pa, px) => Promise.resolve(px).then(x => r(pa, x))
, tx_async = r => (pa, px) => Promise.resolve(pa).then(
    a => Promise.resolve(px).then(x => r(a, x))
  )

, interleave = (xs, y) => xs.slice(1).reduce(
    (xyxs, x) => xyxs.concat(y, x), [xs[0]]
  )

, trnsd_async = (xs, a, r, ...fs) => trnsd(
    xs, a, tx_async(r), tx_async, ...interleave(fs, tx_async)
  )
, tr_async = (xs, ...fs) => trnsd_async(xs, [], r_array, ...fs)

, trnsd_par = (xs, a, r, ...fs) => {
    return new Promise(
      (resolve, reject) => {
        let acc = a, too_late = false
        const reducer = compose(...interleave(fs, tx_intermediate), tx_async, r)
        , errorHandler = e => {
          if (too_late) console.log("Swallowed: ", e.message)
          else {
            too_late = true;
            reject(e)
          }
        }

        try {
          for (let x of xs) {
            acc = reducer(acc, x).catch(errorHandler)
          }
          acc.then(resolve)
        } catch (e) {
          errorHandler(e)
        }
      }
    )
  }
, tr_par = (xs, ...fs) => trnsd_par(xs, [], r_array, ...fs)

function isPromise<T>(p: any): p is Promise<T> {
  return p && isFunction(p)
}

function isFunction(obj: any) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

module.exports = {
  map, filter,
  trnsd, tr_array, r_array,
  trnsd_async, tr_async, tx_async,
  trnsd_par, tr_par
}
