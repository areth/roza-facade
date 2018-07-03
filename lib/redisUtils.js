const redis = require('redis');
const config = require('config');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const redisUtils = {
  channelNewRecord: 'new_record',
};

redisUtils.recordKey = id => `rec:${id}`;

redisUtils.createClient = (name) => {
  const client = redis.createClient(config.get('db.port'), config.get('db.host'));
  client.on('error', (err) => {
    console.log(`Redis ${name} error ${err}`);
  });
  client.on('end', () => {
    console.log(`Redis ${name} is ended`);
  });
  return client;
};

module.exports = redisUtils;
