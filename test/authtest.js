const expect = require('chai').expect;
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
let token;

describe('Authentication', () => {
  it('should get user token on user login', (done) => {
    chai
      .request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'secret' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.own.property('token');
        token = res.body.token;
        done();
      }, token);
  });
});
