const chai = require('chai');
const expect = chai.expect;
const chaiPromised = require('chai-as-promised');

chai.use(chaiPromised);

module.exports = {
  expect,
};
