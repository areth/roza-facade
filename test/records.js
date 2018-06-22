const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const app = require('../app');
const uuidv1 = require('uuid/v1');

// const { expect } = chai;
// const should = chai.should();
chai.should();


const newRecord = {
  text: 'aww, what a pleasant day!',
};

chai.use(chaiHttp);
chai.use(sinonChai);

const newId = uuidv1();
const addStub = sinon.stub(app.get('recordsService'), 'add').resolves(newId);

describe('facade records rig', () => {
  describe('new record arrived', () => {
    it('it should call recordsService.add', (done) => {
      chai
        .request(app)
        .post('/records/add')
        .send(newRecord)
        .then((res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.id.should.be.a('string');
          res.body.id.should.equal(newId);
          addStub.should.have.been.calledWith(newRecord);
        })
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
