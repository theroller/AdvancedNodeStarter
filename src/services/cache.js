const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const { exec } = mongoose.Query.prototype;

mongoose.Query.prototype.cache = function cache(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function newExec(...args) {
  if (!this.useCache) {
    return exec.apply(this, args);
  }

  const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name });
  console.log(key);

  const cache = await client.hget(this.hashKey, key);

  if (cache) {
    const doc = JSON.parse(cache);
    return Array.isArray(doc)
      ? doc.map((x) => new this.model(x))
      : new this.model(doc);
  }

  const result = await exec.apply(this, args);
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
};
