---
title: About
navigation_weight: 1
---

### Transducer pattern can improve handling of async functions _map_ and _filter_!

Suppose yo have some db connection that fetches user data asynchronously 
by returning a Promise.

```javascript
const array_of_ids, db_connection

const result = array_of_ids.map(
  id => db_connection.getUser(id)
)
```

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
