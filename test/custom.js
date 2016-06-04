import test from 'ava'
import Dict from '../'

test('constructor', (t) => {
  const object = { a: 'A', b: 'B' }
  const dict = Dict(object)
  t.deepEqual(
    dict.toObject(),
    object
  )
})

test('singleton', (t) => {
  const dict = Dict.singleton('x', 'X')
  t.deepEqual(
    dict.toObject(),
    { x: 'X' }
  )
})

test('insert', (t) => {
  const beforeInsert = Dict({ a: 'A' })
  const afterInsert = beforeInsert.insert('b', 'B')
  t.deepEqual(
    beforeInsert.toObject(),
    { a: 'A' }
  )
  t.deepEqual(
    afterInsert.toObject(),
    { a: 'A', b: 'B' }
  )
})

test('delete', (t) => {
  const beforeDelete = Dict({ a: 'A', b: 'B' })
  const afterDelete = beforeDelete.delete('b')
  t.deepEqual(
    beforeDelete.toObject(),
    { a: 'A', b: 'B' }
  )
  t.deepEqual(
    afterDelete.toObject(),
    { a: 'A' }
  )
})

test('reduceWithKey', (t) => {
  const dict = Dict({ a: 'A', b: 'B' })
  const acc = dict.reduceWithKey(
    (acc_, key, value) => acc_ + key + value,
    ''
  )
  t.is(
    acc,
    'aAbB'
  )
})

test('mapWithKey', (t) => {
  const dict = Dict({ a: 'A', b: 'B' })
  const mappedDict = dict.mapWithKey(
    (key, value) => key + value
  )
  t.deepEqual(
    mappedDict.toObject(),
    { a: 'aA', b: 'bB' }
  )
})

test('lookup', (t) => {
  const dict = Dict({ a: 'A', b: 'B' })
  t.deepEqual(
    dict.lookup('a'),
    'A'
  )
})

test('keys', (t) => {
  const dict = Dict({ a: 'A', b: 'B' })
  t.deepEqual(
    dict.keys(),
    ['a', 'b']
  )
})

test('values', (t) => {
  const dict = Dict({ a: 'A', b: 'B' })
  t.deepEqual(
    dict.values(),
    ['A', 'B']
  )
})

test('toString', (t) => {
  const dict = Dict({ a: 'A', b: 'B' })
  t.is(
    dict.toString(),
    'Dict { a: A, b: B }'
  )
})

test('toJSON', (t) => {
  const object = { a: 'A', b: 'B' }
  const dict = Dict(object)
  t.is(
    JSON.stringify(dict),
    JSON.stringify(object)
  )
})
