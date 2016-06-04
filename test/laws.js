import test from 'ava'
import Dict from '../'
import Id from 'fantasy-identities'
import Either from 'fantasy-eithers'

// Helper for easily creating test dictionaries.
const create = (...args) => args.reduce((dict, x) => dict.insert(x, x), Dict.empty())

test('semigroup associativity', (t) => {
  const a = create('a')
  const b = create('b')
  const c = create('c')
  const x = a.concat(b).concat(c)
  const y = a.concat(b.concat(c))
  t.deepEqual(x, y)
})

test('monoid right identity', (t) => {
  const m = create('m')
  const x = m.concat(Dict.empty())
  t.deepEqual(x, m)
})

test('monoid left identity', (t) => {
  const m = create('m')
  const x = Dict.empty().concat(m)
  t.deepEqual(x, m)
})

test('functor identity', (t) => {
  const u = create('u')
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

test('foldable associativity', (t) => {
  const u = Dict({ a: 'a', b: 'b', c: 'c' })
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

test('traversable identity', (t) => {
  const F = Id
  const u = create('a', 'b', 'c').map(F.of)
  const x = u.map(F.of).sequence(F.of)
  const y = F.of(u)
  t.deepEqual(x, y)
})

// The way this law is currently formulated in the fantasy-land spec,
// it expects the Traversable to also be an Apply, which is neither required nor the case here.
// Hence this test is skipped for now.
test.skip('traversable composition', (t) => {
  const f = Id
  const g = Either
  const u = create('a', 'b', 'c').map(g.of).map(f.of)
  const x = u.map(Compose.of).sequence(Compose.of)
  const y = Compose.of(u.sequence(f.of).map(x => x.sequence(g.of)))
  t.deepEqual(x, y)
})

function Compose (c) {
  this.c = c
}

Compose.of = function (c) {
  return new Compose(c)
}

Compose.prototype.ap = function (x) {
  return Compose.of(this.c.map(u => y => u.ap(y)).ap(x.c))
}

Compose.prototype.map = function (f) {
  return Compose.of(this.c.map(y => y.map(f)))
}
