const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const app = require('../app');

let token;

describe('Create thumbnail testing', () => {
  beforeEach((done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'secret' })
      .end((err, res) => {
        token = res.body.token;
        done();
      }, token);
  });

  it.only('create thumbnail and download resulting thumbnail', function (done) {
    this.timeout(15000);
    chai
      .request(app)
      .post('/thumbnail-create')
      .send({ public_url: 'http://placekitten.com/g/200/200' })
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).to.not.be.null;
        expect(res.buffered).to.be.true;
        done();
      });
  });

  it('should not create thumbnail if user token is missing', (done) => {
    chai
      .request(app)
      .post('/thumbnail-create')
      .send({ public_url: 'http://placekitten.com/g/200/200' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should not create thumbnail if token is false', (done) => {
    chai
      .request(app)
      .post('/thumbnail-create')
      .send({ public_url: 'http://placekitten.com/g/200/200' })
      .set('Authorization', 'Bearer false-token-representation')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it('should not create thumbnail if public url is not valid', function (done) {
    this.timeout(5000);
    chai
      .request(app)
      .post('/thumbnail-create')
      .send({ public_url: 'invalid-url' })
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(422);
        expect(res.text).to.equal('Invalid Url');
        done();
      });
  });

  it('should not create thumbnail if public url is not an image', function (done) {
    this.timeout(5000);
    chai
      .request(app)
      .post('/thumbnail-create')
      .send({ public_url: 'http://google.com' })
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(415);
        expect(res.text).to.equal('Url not supported');
        done();
      });
  });
});
