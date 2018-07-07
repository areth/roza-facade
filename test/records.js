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

const record = {
  text: 'aww, that was a pleasant day!',
};

const newId = uuidv1();
const addStub = sinon.stub(app.get('recordsService'), 'add').resolves(newId);
const deleteStub = sinon.stub(app.get('recordsService'), 'delete').resolves(newId);
const deleteUndoStub = sinon.stub(app.get('recordsService'), 'deleteUndo').resolves(record);
const getStub = sinon.stub(app.get('recordsService'), 'get').resolves(record);

describe('facade records rig', () => {
  describe('new record arrived', () => {
    it('it should call recordsService.add', () =>
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
        }));
  });

  describe('delete record', () => {
    it('it should call recordsService.delete', () =>
      chai
        .request(app)
        .post(`/records/delete/${newId}`)
        .then((res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.id.should.be.a('string');
          res.body.id.should.equal(newId);
          deleteStub.should.have.been.calledWith(newId);
        }));
  });

  describe('undo delete record', () => {
    it('it should call recordsService.deleteUndo', () =>
      chai
        .request(app)
        .post(`/records/delete-undo/${newId}`)
        .then((res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.deep.equal(record);
          deleteUndoStub.should.have.been.calledWith(newId);
        }));
  });

  describe('get record', () => {
    it('it should call recordsService.get', () =>
      chai
        .request(app)
        .get(`/records/get/${newId}`)
        .then((res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.deep.equal(record);
          getStub.should.have.been.calledWith(newId);
        }));
  });
});
