## Transducer pattern can improve `map` and `filter`

### Improved handling of async functions

Suppose yo have some db connection that fetches user data asynchronously 
by returning a Promise.

```javascript
const array_of_ids, db_connection

const result = array_of_ids.map(
  id => db_connection.getUser(id)
)
```

the result will be an array of Promises, so you'll need to continue similar to

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
tr_async(
  array_of_ids,

  map(id => db_connection.getUser(id)),
  filter(reject_unneeded_users),
  map(construct_final_user_object)
)
.then(finally_do_something)
```

