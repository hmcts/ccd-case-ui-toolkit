const pa11y = require('pa11y');

module.exports = (testPage, method = 'GET') => {
  const [host] = /(^http.+:\d+\/)/.exec(testPage);
  const indexUrl = `${host}index`;

  const pa11yRun = pa11y({

    hideElements: '.govuk-box-highlight, #logo, #footer, link[rel=mask-icon], .skipAccessTest',

    beforeScript(page, options, next) {

      if (method === 'POST') {

        page.open(testPage, 'POST', '', () => next());

      } else {

        page.open(testPage, () => next());
      }
    }
  });

  return new Promise((resolve, reject) => {
    pa11yRun.run(indexUrl, (err, results) => {

      if (err) {

        reject(err);
      } else {

        resolve(results);
      }
    });
  });
};