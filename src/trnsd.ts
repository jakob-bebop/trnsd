import compose from './compose'
//
// interface PromiseConstructor {
//   all<T>(values: PromiseLike<T>[]): Promise<[T]>;
// }

declare var console;

export type NowOrLater<X> = X | Promise<X>
export type Reducer<A, X> = (a: A, x: X) => NowOrLater<A>
export type Transform<X, Y> = (x: X) => Y
export type Predicate<X> = (x: X) => boolean | Promise<boolean>

export type Transducer<A, X, Y> =
  (r: Reducer<NowOrLater<A>, NowOrLater<Y>>) => Reducer<A, X>

export function map<A, X, Y>(f: Transform<X, Y>): Transducer<A, X, Y> {
  return (r: Reducer<A, Y>) => (a: A, x: X) => r(a, f(x))
}

export function filter<A, X>(f: Predicate<X>): Transducer<A, X, X> {
  return (r: Reducer<A, X>) => (a: A, x: X) => {
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

export function tr_async<X, Y>(
  xs: X[], f1: Transducer<any, X, Y>
): Promise<Y[]>;
export function tr_async<X, X1, Y>(
  xs: X[],
  f1: Transducer<any, X, X1>,
  f2: Transducer<any, X1, Y>
): Promise<Y[]>;
export function tr_async<X, X1, X2, Y>(
  xs: X[],
  f1: Transducer<any, X, X1>,
  f2: Transducer<any, X1, X2>,
  f3: Transducer<any, X2, Y>
): Promise<Y[]>;
export function tr_async<X, X1, X2, X3, Y>(
  xs: X[],
  f1: Transducer<any, X, X1>,
  f2: Transducer<any, X1, X2>,
  f3: Transducer<any, X2, X3>,
  f4: Transducer<any, X3, Y>
): Promise<Y[]>;
export function tr_async<X, A1, A2, A3, A4, Y>(
  xs: X[],
  f1: Transducer<any, X, A1>,
  f2: Transducer<any, A1, A2>,
  f3: Transducer<any, A2, A3>,
  f4: Transducer<any, A3, A4>,
  f5: Transducer<any, A4, Y>
): Promise<Y[]>;
export function tr_async(xs: any[], ...fs: any[]) {
  return trnsd_async(xs, [], r_array, ...fs)
}

const trnsd_par = (xs, a, r, ...fs) => {
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

// module.exports = {
//   map, filter,
//   trnsd, tr_array, r_array,
//   trnsd_async, tr_async, tx_async,
//   trnsd_par, tr_par
// }
