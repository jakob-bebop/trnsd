---
title: Async
layout: default
permalink: /async
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
const array_reduce = (a, x) => {
  a.push(x)
  return a
}
```

and we can define `map_double` as a transducer:
```es6
const tx_map_double = r => (a, x) => r(a, double(x))
```

and then `tx_map_double(array_reduce)` will do just what `map_double` did above:

```es6
numbers.reduce(map_double(array_reduce), [])
```

Notice how the empy array passed as the last argument to `reduce` is linked with the 
`array_reduce` function.

## Transducer constructor

Looking at the definition of `tx_map_double` above, it's nearby to generalize it
as a _transducer constructor_:

```es6
const map = f => r => (a, x) => r(a, f(x))

numbers.reduce(map(double)(array_reduce), [])
```


## Promise!
What about mapping a function that makes some external call returns a Promise?

```es6
const get_user = x => fetch(`https://some.api/user/${x}`)
```

`map_get_user` would have to handle the promise:

```es6
const tx_map_get_user = r => (a, x) => {
  return get_user(x).then(
    user => r(a, user)
  )
}
```

the only catch is that now the whole thing returns a _Promise_ of the
accumulator, rather than the accumulator itself. And since `reduce` passes
the return value of the function as the first argument to the function
next time it calls it, we have to be able to treat `a` as _either_ a promise 
_or_ a value. One way to do this is to wrap `a` in a Promise if it isn't
already:

```es6
const wrap a => a instanceof Promise? a: Promise.resolve(a)
const tx_map_get_user = r => (a, x) => {
  return wrap(a).then(
    real a => get_user(x).then(
      user => r(a, user)
    )
  )
}
```

Now `reduce` returns the last return value from the function, so 
in this case it'll return a promise:

```es6
numbers.reduce(
  tx_map_get_user(array_reducer),
  []
).then(
  array_of_users => do_something_with(array_of_users)
)
```

The only thing missing now is to generalize the Promise handling into 
a transducer:

```
const tx_promise = r => (a, x) => {
  return wrap(a).then(
    real_a => wrap(x).then(
      real_x => r(real_a, real_x)
    )
  )
}
```

The magic happens now: We can use our map constructor from before with the async
mapping:

```es6
const map_user = map(x => get_user(x))

numpers.reduce(map_user(tx_promise(reduce_array)), [])
.then(
  array_of_users => do_something_with(array_of_users)
) 
```
