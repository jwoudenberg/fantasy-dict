import test from 'ava'
import Dict from '../'
import Id from 'fantasy-identities'
import Either from 'fantasy-eithers'
import Option from 'fantasy-options'
import {constant} from 'fantasy-combinators'

// helper functions for debugging purpose
// compare and print Options, Eithers and Identities
Option.prototype.toString = function toString () {
  return this.fold(
    x => 'Some {' + this.x + '}',
    constant('Nothing')
  )
}

Option.prototype.equals = function toString (o) {
  return this.fold(
    (x) => o.fold(
      (y) => !(x.equals && (typeof x.equals === 'function')) ? x === y : x.equals(y),
      constant(false)
    ),
    constant(o.fold(
      constant(false),
      constant(true)
    ))
  )
}

Either.prototype.toString = function toString () {
  return this.fold(
    (l) => 'Left {' + l + '}',
    (r) => 'Right {' + r + '}'
  )
}

Either.prototype.equals = function toString (either2) {
  const either1 = this
  return either1.fold(
    (l1) => either2.fold(
      (l2) => !(l1.equals && (typeof l1.equals === 'function')) ? l1 === l2 : l1.equals(l2),
      constant(false)
    ),
    (r1) => either2.fold(
      constant(false),
      (r2) => !(r1.equals && (typeof r1.equals === 'function')) ? r1 === r2 : r1.equals(r2)
    )
  )
}

Id.prototype.toString = function toString () {
  return 'Id {' + this.x + '}'
}

Id.prototype.equals = function equals (i) {
  return !(i.x == null) && !(this.x.equals && (typeof this.x.equals === 'function')) ? this.x === i.x : this.x.equals(i.x)
}

// Helper for easily creating test dictionaries.
const create = (...args) => args.reduce((dict, x) => x instanceof Array ? dict.insert('D' + x[0], create(...x)) : dict.insert(x, x), Dict.empty())

test('setoid reflexivity', (t) => {
  const a = create('a')
  t.true(a.equals(a))
})

test('setoid reflexivity: deep', (t) => {
  const a = create('a', ['b'])
  t.true(a.equals(a))
})

test('setoid reflexivity', (t) => {
  const a1 = create('a')
  const a2 = create('a')
  const b = create('b')
  t.true(a1.equals(a2) === a2.equals(a1)) &&
  t.true(a1.equals(b) === b.equals(a1))
})

test('setoid reflexivity: deep', (t) => {
  const a1 = create('a', ['b'])
  const a2 = create('a', ['b'])
  const b = create('a', ['c'])
  t.true(a1.equals(a2) === a2.equals(a1)) &&
  t.true(a1.equals(b) === b.equals(a1))
})

// not really testable
test.skip('setoid transitivity', (t) => {
})

// not really testable
test.skip('setoid transitivity: deep', (t) => {
})

test('semigroup associativity', (t) => {
  const a = create('a')
  const b = create('b')
  const c = create('c')
  const x = a.concat(b).concat(c)
  const y = a.concat(b.concat(c))
  t.deepEqual(x, y)
})

test('semigroup associativity: deep', (t) => {
  const a = create('a', ['b'])
  const b = create('c', ['d'])
  const c = create('e', ['f'])
  const x = a.concat(b).concat(c)
  const y = a.concat(b.concat(c))
  t.deepEqual(x, y)
})

test('monoid right identity', (t) => {
  const m = create('m')
  const x = m.concat(Dict.empty())
  t.deepEqual(x, m)
})

test('monoid right identity: deep', (t) => {
  const m = create('m', ['n'])
  const x = m.concat(Dict.empty())
  t.deepEqual(x, m)
})

test('monoid left identity', (t) => {
  const m = create('m', ['n'])
  const x = Dict.empty().concat(m)
  t.deepEqual(x, m)
})

test('functor identity', (t) => {
  const u = create('u')
  const x = u.map(a => a)
  t.deepEqual(x, u)
})

test('functor identity: deep', (t) => {
  const u = create('u', ['v'])
  const x = u.map(a => a)
  t.deepEqual(x, u)
})

test('functor composition', (t) => {
  const u = create('u')
  const f = x => '<' + x + '>'
  const g = x => '[' + x + ']'
  const x = u.map(x => f(g(x)))
  const y = u.map(g).map(f)
  t.deepEqual(x, y)
})

test('functor composition: deep', (t) => {
  const u = create('u', ['v'])
  const f = x => '<' + x + '>'
  const g = x => '[' + x + ']'
  const x = u.map(x => f(g(x)))
  const y = u.map(g).map(f)
  t.deepEqual(x, y)
})

test('foldable associativity', (t) => {
  const u = Dict({ a: 'a', b: 'b', c: 'c' })
  const f = (x, y) => x + y
  const x = u.reduce(f, '')
  const y = u.values().reduce(f, '')
  t.is(x, y)
})

test('foldable associativity: deep', (t) => {
  const u = create('a', ['b1', 'b2'], 'c')
  const f = (x, y) => x + y
  const x = u.reduce(f, '')
  const y = u.values().reduce(f, '')
  t.is(x, y)
})

test('traversable naturality', (t) => {
  const f = Id
  const g = Either
  const u = create('a', 'b', 'c').map(f.of)
  // Natural transformation from an Identity to an Either
  const t_ = i => Either.of(i.x)
  const x = t_(u.sequence(f.of))
  const y = u.map(t_).sequence(g.of)
  t.deepEqual(x, y)
})

test('traversable naturality: deep', (t) => {
  const f = Id
  const g = Either
  const u = create('a', 'b', ['c']).map(f.of)
  // Natural transformation from an Identity to an Either
  const t_ = i => Either.of(i.x)
  const x = t_(u.sequence(f.of))
  const y = u.map(t_).sequence(g.of)
  t.deepEqual(x, y)
})

test('traversable identity', (t) => {
  const F = Id
  const u = create('a', 'b', 'c').map(F.of)
  const x = u.map(F.of).sequence(F.of)
  const y = F.of(u)
  t.deepEqual(x, y)
})

test('traversable identity: deep', (t) => {
  const F = Id
  const u = create('a', 'b', ['c']).map(F.of)
  const x = u.map(F.of).sequence(F.of)
  const y = F.of(u)
  t.deepEqual(x, y)
})

const F = Id
const G = Either

function Compose (c) {
  this.c = c
}

Compose.of = function (x) {
  return new Compose(F.of(G.of(x)))
}

Compose.prototype.ap = function (x) {
  return new Compose(this.c.map(u => y => u.ap(y)).ap(x.c))
}

Compose.prototype.map = function (f) {
  return new Compose(this.c.map(y => y.map(f)))
}

Compose.prototype.toString = function toString () {
  return 'Compose { ' + this.c + ' }'
}

Compose.prototype.equals = function equals (x) {
  return !(x.c == null) && !(this.c.equals && (typeof this.c.equals === 'function')) ? this.c === x.c : this.c.equals(x.c)
}

test('object lifting: deep', (t) => {
  const u = Dict.of({a: 'a', b: {c: 'c'}})
  const v = Dict({a: 'a', b: Dict({c: 'c'})})
  t.deepEqual(u, v)
})

test('traversable composition', (t) => {
  const u = create('a', 'b', 'c').map(G.of).map(F.of)
  const x = u.map(x => new Compose(x)).sequence(Compose.of)
  const y = new Compose(u.sequence(F.of).map(x => x.sequence(G.of)))
  t.deepEqual(x, y)
})

test('traversable composition: deep', (t) => {
  const u = create('a', ['b']).map(G.of).map(F.of)
  const x = u.map(x => new Compose(x)).sequence(Compose.of)
  const y = new Compose(u.sequence(F.of).map(x => x.sequence(G.of)))
  t.deepEqual(x, y)
})
