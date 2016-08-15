const daggy = require('daggy')
const Dict = daggy.tagged('data')
const Option = require('fantasy-options')
const Either = require('fantasy-eithers')
const Identity = require('fantasy-identities')

module.exports = Dict

// Helper functions (shamelessly ripoff from https://github.com/component/clone)
// slight modification to have clones share their prototype
// [TODO] submit a Pull Request to original project and use it as an external dependency for object cloning ?
function type (val) {
  switch (toString.call(val)) {
    case '[object Date]': return 'date'
    case '[object RegExp]': return 'regexp'
    case '[object Arguments]': return 'arguments'
    case '[object Array]': return 'array'
    case '[object Error]': return 'error'
  }
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
//  if (val !== val) return 'nan'
  if (val && val.nodeType === 1) return 'element'

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val
}

function clone (obj) {
  switch (type(obj)) {
    case 'object':

      // preserve prototype of cloned object
      copy = Object.create(Object.getPrototypeOf(obj))

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          copy[key] = clone(obj[key])
        }
      }
      return copy

    case 'array':
      var copy = new Array(obj.length)
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i])
      }
      return copy

    case 'date':
      return new Date(obj.getTime())

    default: // string, number, boolean, …
      return obj
  }
}

// Fantasy Land has no interface to test if an object is a fantasy-land value
//   - isADT should provide compatibility with most used Fantasy-land compatible libs (folktale, Sanctuary, Ramda-fantasy, etc.)
//   - current implementation tests Maybe and Either Monads and should be conservatively extended to to other usefull monads
const isADT = (obj) =>
       obj.isJust ||
       obj.isNothing ||
       obj.isLeft ||
       obj.isRight ||
       obj instanceof Option ||
       obj instanceof Either ||
       obj instanceof Identity ||
       (obj.isJust && (typeof obj.isJust === 'function') && obj.isJust()) ||
       (obj.isNothing && (typeof obj.isNothing === 'function') && obj.isNothing()) ||
       (obj.isRight && (typeof obj.isRight === 'function') && obj.isRight()) ||
       (obj.isLeft && (typeof obj.isLeft === 'function') && obj.isLeft())

// --- Fantasy-Land methods

// Setoid

Dict.prototype.equals = function equals (dict2) {
  const dict = this
  return dict.keys().every(key => {
    const value = dict.lookup(key)
    const value2 = dict2.lookup(key)
    return value === value2 ||
           ((value2 != null && value.equals && (typeof value.equals === 'function')) ? value.equals(value2) : false)
  })
}

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
      data_[key] = value instanceof Dict ? value.map(f) : f(value)
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
    (dict_, key, value) => {
      return value instanceof Dict ? value.reduce(f, dict_) : f(dict_, value)
    },
    x
  )
}

// Traversable
Dict.prototype.sequence = function sequence (of) {
  const dict = this
  return dict.reduceWithKey(
    (wrappedDict, key, wrappedValue) => {
      const value =
       wrappedValue instanceof Dict ? wrappedValue.sequence(of)
      : wrappedValue.ap ? wrappedValue
      : of(wrappedValue)

      return wrappedDict.map(dict_ => value => dict_.insert(key, value)).ap(value)
    },
    of(Dict.empty())
  )
}

// --- Custom methods

// Creation
Dict.singleton = function singleton (key, value) {
  return Dict({ [key]: value })
}

Dict.of = function of (obj) {
  return Dict(obj).map((value) => value instanceof Object && !isADT(value) ? Dict.of(value) : value)
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
  const reduced = clone(x)
  return dict.keys().reduce(
    (x_, key) => {
      const value = dict.lookup(key)
      return f(x_, key, value)
    },
    reduced
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
  return this.reduce((xs, x) => xs.concat([x]), [])
}

Dict.prototype.toObject = function toObject () {
  const dict = this
  return dict.reduceWithKey(
    (wrappedObject, key, value) => {
      wrappedObject[key] = value instanceof Dict ? value.toObject() : value
      return wrappedObject
    },
    {}
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
  return dict.toObject()
}

Dict.prototype.inspect = Dict.prototype.toString
