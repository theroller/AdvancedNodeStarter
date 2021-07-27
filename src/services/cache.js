const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const { exec } = mongoose.Query.prototype;

mongoose.Query.prototype.exec = function newExec(...args) {
  const key = ({ ...this.getQuery(), collection: this.mongooseCollection.name });
  console.log(key);

  return exec.apply(this, args);
};
