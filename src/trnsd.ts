import compose from './compose'

declare var console;

export type Eventually<X> = X | Promise<X>
export type Transform<X, Y> = (x: X) => Eventually<Y>
export type Predicate<X> = (x: X) => Eventually<boolean>
export type Reducer<A, X> = (a: A, x: X) => Eventually<A>
export type AsyncReducer<A, X> = (a: A, x: Eventually<X>) => Eventually<A>
export type Transducer<A, X, Y> = (r: AsyncReducer<A, Y>) => Reducer<A, X>

export function map<A, X, Y>(f: Transform<X, Y>): Transducer<A, X, Y> {
  return r => (a: A, x: X) => r(a, f(x))
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

export function flatten<A, X>(): Transducer<A, X[], X> {
  return (r: AsyncReducer<A, X>) => {
    return (a: A, xs: X[]) => {
      let nextA = Promise.resolve(a)
      for (let x of xs) nextA = nextA.then(a => r(a, x))
      return nextA;
    }
  } 
}


export function trnsd(xs, a, r, ...fs) {
  return xs.reduce(compose(...fs, r), a)
}

function r_array(a, x) {
  a.push(x)
  return a
}
export function tr_array(xs, ...fs) {
  return trnsd(xs, [], r_array, ...fs)
}


function tx_intermediate(r){
 return (pa, px) => Promise.resolve(px).then(x => r(pa, x))
}
function tx_async(r){
  return (pa, px) => Promise.resolve(pa).then(
    a => Promise.resolve(px).then(x => r(a, x))
  )
}

function interleave(xs, y){
  return xs.slice(1).reduce(
    (xyxs, x) => xyxs.concat(y, x), [xs[0]]
  )
}

export function trnsd_async(xs, a, r, ...fs) {
  return trnsd(
    xs, a, tx_async(r), tx_async, ...interleave(fs, tx_async)
  )
}

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


export function trnsd_par(xs, a, r, ...fs) {
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

export function tr_par<X, Y>(
  xs: X[], f1: Transducer<any, X, Y>
): Promise<Y[]>;
export function tr_par<X, X1, Y>(
  xs: X[],
  f1: Transducer<any, X, X1>,
  f2: Transducer<any, X1, Y>
): Promise<Y[]>;
export function tr_par<X, X1, X2, Y>(
  xs: X[],
  f1: Transducer<any, X, X1>,
  f2: Transducer<any, X1, X2>,
  f3: Transducer<any, X2, Y>
): Promise<Y[]>;
export function tr_par<X, X1, X2, X3, Y>(
  xs: X[],
  f1: Transducer<any, X, X1>,
  f2: Transducer<any, X1, X2>,
  f3: Transducer<any, X2, X3>,
  f4: Transducer<any, X3, Y>
): Promise<Y[]>;
export function tr_par<X, A1, A2, A3, A4, Y>(
  xs: X[],
  f1: Transducer<any, X, A1>,
  f2: Transducer<any, A1, A2>,
  f3: Transducer<any, A2, A3>,
  f4: Transducer<any, A3, A4>,
  f5: Transducer<any, A4, Y>
): Promise<Y[]>;
export function tr_par(xs, ...fs){
  return trnsd_par(xs, [], r_array, ...fs)
}

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
