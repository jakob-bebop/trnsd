const map = f => r => (a, x) => r(a, f(x))
, filter = f => r => (a, x) => {
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
, trnsd_async = (xs, a, r, ...fs) => trnsd(xs, a, r_async(r), ...interleave(fs, r_async))
, tr_async = (xs, ...fs) => trnsd_async(xs, [], r_array, ...fs)

module.exports = {
  map, filter, trnsd, tr_array, trnsd_async, tr_async
}
