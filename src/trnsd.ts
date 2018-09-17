import compose from "./compose";

declare var console;

export type Eventually<X> = X | Promise<X>;
export type Transform<X, Y> = (x: X) => Eventually<Y>;
export type Predicate<X> = (x: X) => Eventually<boolean>;
export type Reducer<A, X> = (a: A, x: X) => Eventually<A>;
export type AsyncReducer<A, X> = (a: A, x: Eventually<X>) => Eventually<A>;
export type Transducer<A, X, Y> = (r: AsyncReducer<A, Y>) => Reducer<A, X>;

export function map<A, X, Y>(f: Transform<X, Y>): Transducer<A, X, Y> {
  return r => (a: A, x: X) => r(a, f(x));
}

export function filter<A, X>(f: Predicate<X>): Transducer<A, X, X> {
  return (r: Reducer<A, X>) => (a: A, x: X) => {
    const b = f(x);
    if (isPromise(b)) return b.then(b => (b ? r(a, x) : a));
    else return b ? r(a, x) : a;
  };
}

export function flatten<A, X>(): Transducer<A, X[], X> {
  return (r: AsyncReducer<A, X>) => {
    return (a: A, xs: X[]) => {
      let nextA = Promise.resolve(a);
      for (let x of xs) nextA = nextA.then(a => r(a, x));
      return nextA;
    };
  };
}

export function trnsd(xs, a, r, ...fs) {
  return xs.reduce(
    compose(
      ...fs,
      r
    ),
    a
  );
}

function r_array(a, x) {
  a.push(x);
  return a;
}
export function tr_array(xs, ...fs) {
  return trnsd(xs, [], r_array, ...fs);
}

function tx_intermediate(r) {
  return (pa, px) => Promise.resolve(px).then(x => r(pa, x));
}
function tx_async(r) {
  return (pa, px) =>
    Promise.resolve(pa).then(a => Promise.resolve(px).then(x => r(a, x)));
}

function interleave(xs, y) {
  return xs.slice(1).reduce((xyxs, x) => xyxs.concat(y, x), [xs[0]]);
}

export function asyn(a = [], r = r_array) {
  return {
    input: xs => ({ pipe: (...fs) => trnsd_async(xs, a, r, ...fs) })
  } as AsyncRunner;
}

export function trnsd_async(xs, a, r, ...fs) {
  return trnsd(xs, a, tx_async(r), tx_async, ...interleave(fs, tx_async));
}

export function tr_async<X, Y>(
  xs: X[],
  f1: Transducer<any, X, Y>
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
  return trnsd_async(xs, [], r_array, ...fs);
}

export function trnsd_par(xs, a, r, ...fs) {
  return trnsd_var_par(xs, null, a, r, ...fs);
}

const defaultErrorHandler = e => {};

export interface ParOptions {
  maxParallel?: number;
  lateErrorHandler?: Function;
  startEfterError?: boolean;
}

export function trnsd_var_par(xs, opts, a, r, ...fs) {
  return new Promise((resolve, reject) => {
    const options = opts || {},
      catcher = options.lateErrorHandler || defaultErrorHandler;
    let acc = a,
      too_late = false,
      npar = options.maxParallel || xs.length;
    const reducer = compose(
        ...interleave(fs, tx_intermediate),
        tx_async,
        r
      ),
      errorHandler = e => {
        if (too_late) catcher(e);
        else {
          too_late = true;
          reject(e);
        }
      },
      thunks: Function[] = [],
      respawn = a => {
        const f = thunks.shift();
        if (f && (!too_late || options.startEfterError)) {
          f();
        }
        return a;
      },
      spawn = (acc, x) => {
        if (npar-- > 0) {
          return reducer(acc, x).then(respawn);
        } else {
          return new Promise((resolve, reject) =>
            thunks.push(() =>
              reducer(acc, x)
                .then(respawn)
                .then(resolve)
                .catch(reject)
            )
          );
        }
      };

    try {
      for (let x of xs) {
        acc = spawn(acc, x).catch(errorHandler);
      }
      acc.then(resolve);
    } catch (e) {
      errorHandler(e);
    }
  });
}

/**
 * @param xs array ov values to pipe throug
 * @param options control the parrallel execution. Valid keys are
 *   maxParallel?: number. the default is xs.length, meaning that all the pipes
 *     are started right away.
 *   lateErrorHandler?: callback to receive any errors that happen _after_ an
 *     error has occured in one of the other pipes. The default is to ignore
 *     these "lare errors"
 *   startEfterError?: boolean; set this to true if you have set maxParallel, and
 *     want to keep sending x values down the pipe after an error has been detected
 * @param f1 fn the pipe operator(s)
 * @param f2 fn the pipe operator(s)
 * @param f3 fn the pipe operator(s)
 * @param f4 fn the pipe operator(s)
 * @returns ys the result piping all the x-values through
 */
export function tr_par<X, Y>(xs: X[], f: Transducer<any, X, Y>): Promise<Y[]>;
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

export function tr_par(xs, ...fs) {
  // return trnsd_var_par(xs, options, [], r_array, ...fs);
  return par()
    .input(xs)
    .pipe(...fs);
}

export function par(options: ParOptions = {}, a = [], r = r_array) {
  return {
    input: xs => ({
      pipe: (...fs) => trnsd_var_par(xs, options, a, r, ...fs)
    })
  } as AsyncRunner;
}

function isPromise<T>(p: any): p is Promise<T> {
  return p && isFunction(p.then);
}

function isFunction(obj: any) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

export interface AsyncRunner {
  input<T>(xs: T[]): AsyncSource<T>;
}

export interface AsyncSource<X> {
  pipe<Y>(f: Transducer<any, X, Y>): Promise<Y[]>;
  pipe<X1, Y>(
    f1: Transducer<any, X, X1>,
    f2: Transducer<any, X1, Y>
  ): Promise<Y[]>;
  pipe<X1, X2, Y>(
    f1: Transducer<any, X, X1>,
    f2: Transducer<any, X1, X2>,
    f3: Transducer<any, X2, Y>
  ): Promise<Y[]>;
  pipe<X1, X2, X3, Y>(
    f1: Transducer<any, X, X1>,
    f2: Transducer<any, X1, X2>,
    f3: Transducer<any, X2, X3>,
    f4: Transducer<any, X3, Y>
  ): Promise<Y[]>;
  pipe<A1, A2, A3, A4, Y>(
    f1: Transducer<any, X, A1>,
    f2: Transducer<any, A1, A2>,
    f3: Transducer<any, A2, A3>,
    f4: Transducer<any, A3, A4>,
    f5: Transducer<any, A4, Y>
  ): Promise<Y[]>;
  pipe<A1, A2, A3, A4, A5, Y>(
    f1: Transducer<any, X, A1>,
    f2: Transducer<any, A1, A2>,
    f3: Transducer<any, A2, A3>,
    f4: Transducer<any, A3, A4>,
    f5: Transducer<any, A4, A5>,
    f6: Transducer<any, A5, Y>
  ): Promise<Y[]>;
  pipe<A1, A2, A3, A4, A5, A6, Y>(
    f1: Transducer<any, X, A1>,
    f2: Transducer<any, A1, A2>,
    f3: Transducer<any, A2, A3>,
    f4: Transducer<any, A3, A4>,
    f5: Transducer<any, A4, A5>,
    f6: Transducer<any, A5, A6>,
    f7: Transducer<any, A6, Y>
  ): Promise<Y[]>;
  pipe(...fs: Transducer<any, any, any>[]): Promise<any[]>;
}
