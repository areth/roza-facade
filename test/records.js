let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('records', () => {
    beforeEach((done) => { //Before each test we empty the database
        // Book.remove({}, (err) => { 
        //    done();         
        // });     
        done();
    });
/*
  * Test the /GET route
  */
  describe('/GET add record', () => {
      it('it should add record', (done) => {
        chai.request(app)
            .get('/records/add')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                // res.body.should.have.property('name');
                res.body.should.have.property('id');
                res.body.id.should.be.a('string');
                // res.body.id.should.be.a('number');
                // res.body.name.should.equal('Spork');
                // res.body.id.should.equal(3); 
              done();
            });
      });
  });

});