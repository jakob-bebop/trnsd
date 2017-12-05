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

### Transducers for performance and flexibility
Both _map_ and _filter_ create a new array to store their results.
Using _transducers_, the creation of intermediate arrays
can be avoided, offering improved performance. 
Example from [transducers.js](http://jlongster.com/Transducers.js--A-JavaScript-Library-for-Transformation-of-Data). Note that here, `map` and `filter` aren't
methods on the input array, but rather functions imported from _transducers.js_

```javascript
into([],
   compose(
     map(x => x * 2),
     filter(x => x > 5)
   ),
   some_data
);
// -> [ 6, 8 ]
```

### _trnsd_: Transducers for async

Suppose yo have some db connection that fetches user data asynchronously 
by returning a Promise (think mongodb), and another function that checks if a file exists, also returning a Promise.

With _trnsd_ you can do this:

```javascript
const { tr_async, map, filter } = require('./trnsd.js')

tr_async(
  some_data,
  map(id => db_connection.getUser(id)),
  filter(user => file_exists(user.image))
)
.then(
  users_with_image => {
    // display images or whatever
  }
)
```
---------------------

the result will be an array of Promises, so you will continue similar to

```javascript
Promise.all(result).then(
  user_data => user_data.filter(reject_unneeded_users) 
)
.then(
  user_data => user_data.map(construct_final_user_object)
)
.then(finally_do_something)
```

Using a simple transduce pattern we can write this instead:

```javascript
const { map, filter, tr_async } = require('trnsd')

tr_async(
  array_of_ids,

  map(id => db_connection.getUser(id)),
  filter(reject_unneeded_users),
  map(construct_final_user_object)
)
.then(finally_do_something)
```

### Why is this cool?

1. it's easy to read and to reason about. This may me a matter of preference, but being 
   used to the `.map( ... ).filter( ... )` style, it's just much easier to parse than
   nested `for` and `if` blocks
2. you don't have to keep track of which of your map operations are async, and manually 
   add `Promise.all` around the results of those. The `tr_async` function handles both 
   async and "normal" functions in both `map` and `filter`
3. more code can run in parallel, compared to using `Promise.all`, which would indeed 
   waiting for _all_ the Promises to resolve before proceeding to the the next map/filter 
   stage. 
4. no intermediate lists are created, which means it will run faster in some cases

### [How does it work](async)
