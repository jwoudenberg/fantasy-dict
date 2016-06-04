const daggy = require('daggy')
const Dict = daggy.tagged('data')
module.exports = Dict

// --- Fantasy-Land methods

// Monoid
Dict.empty = () => Dict({})

Dict.prototype.concat = function concat (dict2) {
  const dict1 = this
  return Dict(Object.assign(
    {},
    dict1.data,
    dict2.data
  ))
}

// Functor
Dict.prototype.map = function map (f) {
  const dict = this
  const data = dict.reduceWithKey(
    (data_, key, value) => {
      data_[key] = f(value)
      return data_
    },
    {}
  )
  return Dict(data)
}

// Foldable
Dict.prototype.reduce = function reduce (f, x) {
  const dict = this
  return dict.reduceWithKey(
    (dict_, key, value) => f(dict_, value),
    x
  )
}

// Traversable
Dict.prototype.sequence = function sequence (of) {
  const dict = this
  return dict.reduceWithKey(
    (wrappedDict, key, wrappedValue) =>
      wrappedDict.map(dict_ => value => dict_.insert(key, value)).ap(wrappedValue),
    of(Dict.empty())
  )
}

// --- Custom methods

// Creation
Dict.singleton = function singleton (key, value) {
  return Dict({ [key]: value })
}

// Modification
Dict.prototype.insert = function insert (key, value) {
  const dict = this
  return dict.concat(
    Dict.singleton(key, value)
  )
}

Dict.prototype.delete = function delete_ (key) {
  const dict = this
  const data = dict.reduceWithKey(
    (data_, key_, value) => {
      if (key !== key_) {
        data_[key_] = value
      }
      return data_
    },
    {}
  )
  return Dict(data)
}

// Retrieval
Dict.prototype.reduceWithKey = function reduceWithKey (f, x) {
  const dict = this
  return dict.keys().reduce(
    (x_, key) => f(x_, key, dict.lookup(key)),
    x
  )
}

Dict.prototype.mapWithKey = function mapWithKey (f) {
  const dict = this
  const data = dict.reduceWithKey(
    (data_, key, value) => {
      data_[key] = f(key, value)
      return data_
    },
    {}
  )
  return Dict(data)
}

Dict.prototype.lookup = function lookup (key) {
  const dict = this
  return dict.data[key]
}

Dict.prototype.keys = function keys () {
  const dict = this
  return Object.keys(dict.data)
}

Dict.prototype.values = function values () {
  const dict = this
  return dict.reduce(
    (xs, x) => {
      xs.push(x)
      return xs
    },
    []
  )
}

Dict.prototype.toObject = function toObject () {
  const dict = this
  return Object.assign(
    {},
    dict.data
  )
}

// Printing
Dict.prototype.toString = function toString () {
  const dict = this
  const pairStrings = dict.reduceWithKey(
    (pairStrings_, key, value) => {
      pairStrings_.push(`${key}: ${value.toString ? value.toString() : value}`)
      return pairStrings_
    },
    []
  )
  return 'Dict { ' + pairStrings.join(', ') + ' }'
}

Dict.prototype.toJSON = function toJSON () {
  const dict = this
  return dict.data
}

Dict.prototype.inspect = Dict.prototype.toString
