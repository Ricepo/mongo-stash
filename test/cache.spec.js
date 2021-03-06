/**
 * test/cache.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const LruCache     = require('lru-cache');
const ObjectID     = require('bson-objectid');
const Stash        = dofile('index');


/*!
 * Setup testing infrastructure
 */
before(async function() {
  LruCache.prototype._get = LruCache.prototype.get;
  LruCache.prototype._set = LruCache.prototype.set;
  LruCache.prototype._del = LruCache.prototype.del;
  LruCache.prototype._reset = LruCache.prototype.reset;
});

after(async function() {
  LruCache.prototype.get = LruCache.prototype._get;
  LruCache.prototype.set = LruCache.prototype._set;
  LruCache.prototype.del = LruCache.prototype._del;
  LruCache.prototype.reset = LruCache.prototype._reset;
});

beforeEach(async function() {
  this.stash = new Stash(null);
  this.cache = this.stash.cache;
  LruCache.prototype.get = Sinon.spy(LruCache.prototype._get);
  LruCache.prototype.set = Sinon.spy(LruCache.prototype._set);
  LruCache.prototype.del = Sinon.spy(LruCache.prototype._del);
  LruCache.prototype.reset = Sinon.spy(LruCache.prototype._reset);
});


/*!
 * Test cases start here
 */
it('should wrap the LruCache.get', async function() {
  const id = ObjectID();

  this.cache.get(id);
  expect(LruCache.prototype.get)
    .to.be.calledOnce.and
    .to.be.calledWith(id.toString());
});

it('should wrap the LruCache.set', async function() {

  const value = { _id: ObjectID() };

  this.cache.set(value);
  expect(LruCache.prototype.set)
    .to.be.calledOnce.and
    .to.be.calledWith(value._id.toString(), value);

  const actual = this.cache.get(value._id);
  expect(actual).to.deep.equal(value);

});

it('should wrap the LruCache.del', async function() {

  const value = { _id: ObjectID() };

  this.cache.set(value);

  const actual = this.cache.get(value._id);
  expect(actual).to.deep.equal(value);

  this.cache.del(value._id);
  expect(LruCache.prototype.del)
    .to.be.calledOnce.and
    .to.be.calledWith(value._id.toString());

  const another = this.cache.get(value._id);
  expect(another).not.to.exist;

});

it('should wrap the LruCache.reset', async function() {

  const value = { _id: ObjectID() };

  this.cache.set(value);

  const actual = this.cache.get(value._id);
  expect(actual).to.deep.equal(value);

  this.cache.reset();
  expect(LruCache.prototype.reset)
    .to.be.calledOnce;

  const another = this.cache.get(value._id);
  expect(another).not.to.exist;

});

it('should not call set if value is null or has no ID', async function() {
  const value = { };

  this.cache.set(value);

  expect(LruCache.prototype.set)
    .to.have.callCount(0);
});
