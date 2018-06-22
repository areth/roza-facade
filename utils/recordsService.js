const uuidv1 = require('uuid/v1');
const redisUtils = require('../utils/redisUtils');

module.exports = (client) => {
  const recordsService = {};
  const redisClient = client || redisUtils.createClient('Redis service');

  recordsService.newId = () => uuidv1();

  recordsService.add = (record) => {
    // todo return Promise that resolves to new new record Id
    const id = recordsService.newId();
    return redisClient.setAsync(redisUtils.recordKey(id), record.text)
      .then(() => redisClient.publishAsync(redisUtils.channelNewRecord, id))
      .then(() => id);
  };

  return recordsService;
};
