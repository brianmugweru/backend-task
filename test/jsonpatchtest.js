const expect = require('chai').expect;
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
let token;

describe('thumbnail', () => {
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

  it('should json patch a request', (done) => {
    const req_object = {
      object: {
        baz: 'qux',
        foo: 'bar',
      },
      patch: [
        { op: 'replace', path: '/baz', value: 'boo' },
        { op: 'add', path: '/hello', value: ['world'] },
        { op: 'remove', path: '/foo' },
      ],
    };
    chai
      .request(app)
      .post('/json-patch')
      .send(req_object)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.have.own.property('baz');
        expect(res.body).to.have.own.property('hello');
        expect(res.body.baz).to.equal('boo');
        expect(res.body.hello).to.be.an('array');
        expect(res.body.hello).to.contain('world');
        expect(res.body).not.have.property('bar');
        done();
      });
  });

  it('should not json_patch if token is missing', (done) => {
    const req_object = {};
    chai
      .request(app)
      .post('/json-patch')
      .send(req_object)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should not json_patch if token is false', (done) => {
    const req_object = {};
    chai
      .request(app)
      .post('/json-patch')
      .send(req_object)
      .set('Authorization', 'Bearer false-token-representation')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should validate requests', (done) => {
    const req_object = {};
    chai
      .request(app)
      .post('/json-patch')
      .send(req_object)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(422);
        expect(res.body.errors).to.be.an('array');
        done();
      });
  });
});
