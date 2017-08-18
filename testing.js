const reporter = require('./');

module.exports = class Reporter {
  constructor(globalConfig) {
    reporter.onJestStart(globalConfig);
    this.watching = globalConfig.watch;
  }

  onTestResult(_test, testResult) {
    reporter.onTestResult(_test, testResult);
  }

  onRunStart(results) {
    reporter.onRunStart(results);
  }

  onRunComplete(contexts, results) {
    reporter.onRunComplete(contexts, results);
  }
};

