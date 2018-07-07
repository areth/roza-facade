const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { redisUtils, delay } = require('roza-lib');
// const async = require('async');
const recordsServiceFactory = require('../lib/recordsService');
const config = require('config');

const { expect } = chai;
// const should = chai.should();
chai.should();

chai.use(sinonChai);

const redisClient = redisUtils
  .createClient(config.get('db.port'), config.get('db.host'), 'test');
const recordsService = recordsServiceFactory(redisClient);

// listen for messages
const subStub = sinon.stub();
const redisClientSub = redisUtils
  .createClient(config.get('db.port'), config.get('db.host'), 'test');
redisClientSub.on('pmessage', subStub);
// redisClientSub.on('pmessage', (pattern, ch, msg) => {
//   console.log(`sub stub ${ch} msg ${msg}`);
//   subStub(pattern, ch, msg);
// });
redisClientSub.psubscribe('*');

const record = {
  text: 'aww, that was a pleasant day!',
};
const recordId = recordsService.newId();
const newRecord = {
  text: 'aww, what a pleasant day!',
};

const subscriberDelay = 500;

describe('records service', () => {
  describe('add new record', () => {
    it('it should add record to db and post message', () =>
      recordsService.add(newRecord)
        .then((id) => {
          id.should.be.a('string');
          return id;
        })
        // delay before checking subscribed stub
        .then(delay(subscriberDelay))
        // check subscribed stub
        .then((id) => {
          subStub.should.have.been.calledWith('*', redisUtils.channelNewRecord, id);
          return id;
        })
        // check saved record
        .then(id => recordsService.get(id))
        .then((res) => {
          expect(res).to.deep.equal(newRecord);
        }));
  });

  describe('delete record', () => {
    before(() =>
      redisClient.setAsync(redisUtils.recordKey(recordId), JSON.stringify(record)));

    it('it should move record to deleted, post message', () =>
      recordsService.delete(recordId)
        .then((id) => {
          id.should.be.a('string');
          id.should.equal(recordId);
          return id;
        })
        // delay before checking subscribed stub
        .then(delay(subscriberDelay))
        // check subscribed stub
        .then((id) => {
          subStub.should.have.been.calledWith('*', redisUtils.channelDeletedRecord, id);
          return id;
        })
        // check record has been deleted
        .then(id => recordsService.get(id))
        .then((res) => {
          expect(res).to.be.null;
        })
        // check record backup
        .then(() => redisClient.getAsync(redisUtils.deletedRecordKey(recordId)))
        .then((res) => {
          expect(res).to.be.equal(JSON.stringify(record));
        }));
  });

  describe('undo delete record', () => {
    before(() =>
      redisClient.setAsync(redisUtils.deletedRecordKey(recordId), JSON.stringify(record)));

    it('it should restore record from deleted, post message', () =>
      recordsService.deleteUndo(recordId)
        .then((rec) => {
          expect(rec).to.deep.equal(record);
        })
        // delay before checking subscribed stub
        .then(delay(subscriberDelay))
        // check subscribed stub
        .then(() => {
          subStub.should.have.been.calledWith('*', redisUtils.channelUndoDeletedRecord, recordId);
        })
        // check record has been restored
        .then(id => recordsService.get(recordId))
        .then((res) => {
          expect(res).to.deep.equal(record);
        }));
  });

  describe('get record', () => {
    before(() =>
      redisClient.setAsync(redisUtils.recordKey(recordId), JSON.stringify(record)));

    it('it should return record by id', () =>
      recordsService.get(recordId)
        .then((rec) => {
          expect(rec).to.deep.equal(record);
        }));
  });
});
