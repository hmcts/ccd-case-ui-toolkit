
const co = require('co');
const express = require('express');
const app = express()
const request = require('supertest');
const fs = require('fs');
const jsonString = fs.readFileSync('stubs/routes.json');
const routingInfo = JSON.parse(jsonString);
const { expect } = require('test/utill/chai');
const a11y = require('test/utill/a11y');

let agent = request.agent(app);

// Ignored Errors
const excludedErrors = [
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.F92,ARIA4',
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail',
  'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2', //testing ignore
  'WCAG2AA.Principle4.Guideline4_1.4_1_1.F77',
  'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
  'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Fieldset.Name',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H71.NoLegend',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H42.2'

];

const filteredErrors = r => {
  return !excludedErrors.includes(r.code);
};

// Ignored Warnings
const excludedWarnings = [
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs',
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Abs',
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.BgImage',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1_A.G141',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H85.2',//ref
  'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Select.Value',
  'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.Placeholder',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H39.3.NoCaption'
];
const filteredWarnings = r => {
  return !excludedWarnings.includes(r.code);
};

const pa11yWarnings = [];
const ignorePa11yWarnings = r => {
  return !pa11yWarnings.includes(r.code);
};

const pa11yErrors = [];
const ignorePa11yErrors = r => {
  return !pa11yErrors.includes(r.code);
}
for (let index in routingInfo.routes) {

  (function (step) {

    let results;

    describe(`GET Requests - Verify accessibility for the page ${step.component}`, () => {

      before((done) => {
        co(function* generator() {
         
           results = yield a11y(agent.get(step.url).url);

        }).then(done, done);
      });

      after(() => {
      });

      it('should not generate any errors', () => {

        const errors = results
          .filter((res) => res.type === 'error')
          .filter(filteredErrors)
          .filter(ignorePa11yErrors);

          // .filter((err) =>
          //   !ignorePa11yErrors.includes(err.code)
          // );
        expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));
      });

      it('should not generate any warnings', () => {

        const warnings = results
          .filter((res) => res.type === 'warning')
          .filter((res) => res.type === 'warning')
          .filter(filteredWarnings)
          .filter(ignorePa11yWarnings);
        expect(warnings.length).to.equal(0, JSON.stringify(warnings, null, 2));
      });

    });
  })(routingInfo.routes[index]);

}
