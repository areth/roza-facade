const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { redisUtils } = require('roza-lib');
// const async = require('async');
const recordsServiceFactory = require('../lib/recordsService');
const config = require('config');

// const { expect } = chai;
// const should = chai.should();
chai.should();

const newRecord = {
  text: 'aww, what a pleasant day!',
};

chai.use(sinonChai);

const redisClient = redisUtils
  .createClient(config.get('db.port'), config.get('db.host'), 'test');
const setAsyncStub = sinon.stub(redisClient, 'setAsync').resolves('OK');
const publishAsyncStub = sinon.stub(redisClient, 'publishAsync').resolves(1);
const recordsService = recordsServiceFactory(redisClient);

describe('records service', () => {
  // before((done) => {
  //   app.get('db').flushdb(done);
  // });

  // beforeEach((done) => {
  //   // Before each test we empty the database
  //   Book.remove({}, (err) => {
  //      done();
  //   });
  // });
  /*
  * Test the /GET route
  */
  describe('add new record', () => {
    it('it should add record to db and post message', (done) => {
      // async.series([
      //   (cb) => {
      //     chai.request(app)
      //     .post('/records/add')
      //     .send(newRecord)
      //     .end((err, res) => { res.should.have.status(200); cb(); });
      //   },
      //   (cb) => {
      //     chai.request(app)
      //     .post('/records/add')
      //     .send(newRecord)
      //     .end((err, res) => { res.should.have.status(200); cb(); });
      //   },
      //   ], done);
      recordsService.add(newRecord)
        .then((res) => {
          res.should.be.a('string');
          // res.body.id.should.be.a('number');
          // res.body.name.should.equal('Spork');
          // res.body.id.should.equal(3);
          // setAsyncStub.should.have.been.calledOnce;
          setAsyncStub.should.have.been.calledWith(sinon.match.string, newRecord.text);
          // publishAsyncStub.should.have.been.calledOnce;
          publishAsyncStub.should.have.been
            .calledWith(redisUtils.channelNewRecord, sinon.match.string);
          // addStub.should.have.been.calledWith(newRecord);
        })
        // .then(() => app.get('db').getAsync('record_text'))
        // .then((res) => {
        //   expect(res).to.equal(newRecord.text);
        // })
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
