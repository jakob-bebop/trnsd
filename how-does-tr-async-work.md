---
title: Async
navigation_weight: 2
permalink: /async-trnsd
---

## _map_ vs _reduce_

A transducer is a function that takes a single argument. Both the argument and 
the returned value are _reducer functions_. This means that they are functions
suited for pasśing to `reduce`.

```es6
const double = x => x*2

const map_double = ( a, x ) => {
  a.push(double(x))
  return a
}
```

`map_double` is a reducer function which applies `double` and appends the result into the 
array `a`. Using it to _reduce_ an array of numbers

```es6
const numbers = [1, 2, 3, 4]
numbers.reduce(double, [])
```

is exacly the same as doing `numbers.map(double)`.

## The transducer trick
Apart from calling `double`, all that `map_double` does is to add something to the
array. This can be factored out:

```es6
const array_reduce = (a,x) => {
  a.push(f(x))
  return a
}
```

and we can define `map` as
```es6
const map = f => r => (a, x) => r(a, f(x))
```

and then `map(double)(array_reduce)` will do just what `map_f` did above.

`map(double)` is a transducer: We pass the array reducer into it, and then its 
ready to 'reduce' into an array:

```es6
numbers.reduce(map(double)(array_reduce), [])
```

Notice how the empy array passed as the last argument to `reduce` is linked with the 
`array_reduce` function.

## Promise?
What about mapping a function that makes some external call returns a Promise?

```es6
const get_user = x => fetch(`https://some.api/user/x`)
```
