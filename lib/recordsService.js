const uuidv1 = require('uuid/v1');
const config = require('config');
const { redisUtils } = require('roza-lib');

module.exports = (client) => {
  const recordsService = {};
  const redisClient = client ||
    redisUtils.createClient(config.get('db.port'), config.get('db.host'), 'Records service');
  const undoTimeout = 10; // 10 sec

  recordsService.newId = () => uuidv1();

  recordsService.add = (record) => {
    // todo return Promise that resolves to new new record Id
    const recordStr = JSON.stringify(record);
    const id = recordsService.newId();
    return redisClient
      // set record
      .setAsync(redisUtils.recordKey(id), recordStr)
      // emit message
      .then(() => redisClient.publishAsync(redisUtils.channelNewRecord, id))
      // return record id
      .then(() => id);
  };

  recordsService.get = id =>
    redisClient
      // get actual record
      .getAsync(redisUtils.recordKey(id))
      // parse to json
      .then(JSON.parse);

  recordsService.delete = id =>
    redisClient
      // get actual record
      .getAsync(redisUtils.recordKey(id))
      // move to temp for undo
      .then(record => redisClient
        .setAsync(redisUtils.deletedRecordKey(id), record, 'EX', undoTimeout))
      // del record
      .then(() => redisClient.delAsync(redisUtils.recordKey(id)))
      // emit message
      .then(() => redisClient.publishAsync(redisUtils.channelDeletedRecord, id))
      // return record id
      .then(() => id);

  recordsService.deleteUndo = (id) => {
    let deletedRecord = {};
    return redisClient
      // get temp record
      .getAsync(redisUtils.deletedRecordKey(id))
      // move to persistent
      .then((record) => {
        deletedRecord = JSON.parse(record);
        return redisClient.setAsync(redisUtils.recordKey(id), record);
      })
      // do not del temp record, it will expire soon
      // emit message
      .then(() => redisClient.publishAsync(redisUtils.channelUndoDeletedRecord, id))
      // return the whole record
      .then(() => deletedRecord);
  };

  return recordsService;
};
