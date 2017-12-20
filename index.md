---
title: About
layout: default
---

## Improved handling of async functions in _map_ and _filter_

Processing data can sometimes be done using `map` and `filter` functions
with a plain javascrip array:

```javascript
some_data.map(
  x => create_some_object(x)
).filter(
  obj => check_something(obj)
)
```

***However*** if `create_some_object` and/or `check_something` return a Promise, the above will
**not** work. 

This is what *trnsd* handles. 
The following will work whether both functions,
one of them, or none, are async:

```javascript
import { tr_async, map, filter } from 'trnsd'

tr_async(
  some_data,
  map(
    x => create_some_object(x)
  ),
  filter(
    obj => check_something(obj)
  )
)
.then(
  results => look_at(results)
)
```

## Sequential execution
In the above example, everything will happen sequentially. 
This means that processing of `some_data[1]` is not started
until processing of `some_data[0]` is finished, and any resulting promises have
resolved.

In a little more detail, `create_some_object(some_data[1])` is called after the 
promise returned by `create_some_object(some_data[0]).then(obj => check_something(obj))`
has resolved.

## Parallel execution
A different strategy would be to kick off `create_some_object(some_data[0])`, 
`create_some_object(some_data[1])` etc. right away. 

This is implemented in 
`tr_par`. The interface is the same as with `tr_async`:

```javascript
import { tr_par, map, filter } from 'trnsd'

tr_par(
  some_data,
  map(
    x => create_some_object(x)
  ),
  filter(
    obj => check_something(obj)
  )
)
.then(
  results => look_at(results)
)
```

Presumably, this means great performance if `create_some_object` and 
`check_something` involve API calls or similar IO-bound operations.

## Error handling
Both `tr_async` and `tr_par` return a Promise, and errors are handled in a 
familiar way with `.catch`

With `tr_par`, the rejection will be caused by the first error that occurs, and
_subsequent errors will be ignored_. This is similar to `Promise.all`, but could
potentially be tricky.

## Why is this cool?

**Readability.** Code written with `map` and `filter` is easy to read and to reason about. 
This may me a matter of preference, but when you get used to this style, it's just 
much easier to parse than nested `for` and `if` blocks

* you don't have to keep track of which of your map operations are async, and manually 
  add `Promise.all` around the results of those. The `tr_async` function handles both 
  async and "normal" functions in both `map` and `filter`

**Performance**
* no intermediate lists are created, which means it will run faster in some cases
* more code can run in parallel, compared to using `Promise.all`, which would indeed 
  waiting for _all_ the Promises to resolve before proceeding to the the next map/filter 
  stage. 

## How does it work
_trnsd_ is an application of the transducer pattern, with a bit of extra Promise handling.
The only most nearly complicated thing is the error handling in the parallel execution case.

The code is on [github](https://github.com/jakob-bebop/trnsd), and I try to explain the 
idea [here](async) (sorry it's not comletely finished)

