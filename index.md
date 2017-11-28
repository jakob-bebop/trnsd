## Transducer pattern can improve `map` and `filter`

### Improved handling of async functions

Suppose yo have some db connection that fetches stuff asynchronously by returning a Promise.

```javascript
const array_of_ids, db_connection

const result = array_of_ids.map(
  id => db_connection.getUser(id)
)
```

the result will be an array of Promises, so you'll need to continue similar to

```
Promise.all(result).then(
  user_data => user_array.map(construct_user_object)
)
```

