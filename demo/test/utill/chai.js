const chai = require('chai');
const expect = chai.expect;
// const sinon = require('sinon');
// const sinonChai = require('sinon-chai');

const chaiPromised = require('chai-as-promised');

// chai.use(sinonChai);
chai.use(chaiPromised);

module.exports = {
  expect,
};
