# fantasy-dict

A dictionary implementing the [fantasy-land](https://github.com/fantasyland/fantasy-land) Monoid, Functor, Foldable and Traversable specifications.

Use this when a plain old javascript object as a map won't do, because you want to combine it with some fantasy-land compatible library like Ramda.

## API
Apart from the fantasy-land required methods, the following methods are supported:

##### `Dict :: { k: * } -> Dict *`
Create a dictionary from a plain javascript object.

##### `Dict.singleton :: String -> x -> Dict x`
Create a dictionary with a single key,value pair.

##### `Dict.prototype.insert :: Dict * ~> String -> x -> Dict *`
Returns a new dictionary equal to the previous dictionary with the passed in key,value pair inserted.

##### `Dict.prototype.delete :: Dict * ~> String -> Dict *`
Returns a new dictionary equal to the previous dictionary with the passed in key removed.

##### `Dict.prototype.reduceWithKey :: Dict * ~> (a -> String -> b -> a) -> a -> a`
Like the normal reduce, with the difference that the reducer function is also passed the key of each dictionary entry.

##### `Dict.prototype.mapWithKey :: Dict a ~> (String -> a -> b) -> Dict b`
Like the normal reduce, with the difference that the reducer function is also passed the key of each dictionary entry.

##### `Dict.prototype.lookup :: Dict * ~> String -> *`
Returns the value in the dictionary for the given key. Returns `undefined` if the passed in key is not in the dictionary.

##### `Dict.prototype.keys :: Dict * ~> [ String ]`
Returns an array containing the dictionary's keys.

##### `Dict.prototype.values :: Dict * ~> [ * ]`
Returns an array containing the dictionary's values.

##### `Dict.prototype.toObject :: Dict * ~> { k: * }`
Returns the plain old javascript object equivalent of a dictionary.
