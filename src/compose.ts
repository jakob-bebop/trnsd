
export function compose<A, B, C>(
  f1: (a: A) => B,
  f2: (b: B) => C
): (a: A) => C;
export function compose<A, B, C, D>(
  f1: (a: A) => B,
  f2: (b: B) => C,
  f3: (c: C) => D
): (a: A) => D;
export function compose<A, B, C, D, E>(
  f1: (a: A) => B,
Ff2: (b: B) => C,
  f3: (c: C) => D,
  f4: (d: D) => E
): (a: A) => E;
export function compose<A, B, C, D, E, F>(
  f1: (a: A) => B,
  f2: (b: B) => C,
  f3: (c: C) => D,
  f4: (d: D) => E,
  f5: (e: E) => F
): (a: A) => F;
export function compose<A, B, C, D, E, F, G>(
  f1: (a: A) => B,
  f2: (b: B) => C,
  f3: (c: C) => D,
  f4: (d: D) => E,
  f5: (e: E) => F,
  f6: (f: F) => G,
): (a: A) => G;

export default function compose(...fs: any[]){
  return fs.reverse().reduce((c, f) => f(c))
}
