const blessed = require('blessed');

module.exports = class JestDashboard {
  constructor() {
    this.color = '#a23c4f';
    this.runTime = 0;
    this.passingTests = [];
    this.failingTests = [];
    this.errors = [];
    this.log = [];
    this.interval = null;

    this.screen = blessed.screen({
      title: 'jest-dashboard',
      smartCSR: true,
      dockBorders: false,
      fullUnicode: true,
      autoPadding: true,
    });

    this.layoutPassingTests();
    this.layoutFailingTests();
    this.layoutErrorLog();
    this.layoutTotalTestTime();
    this.layoutStatus();
    this.layoutPassed();
    this.layoutFailed();
    this.layoutLog();

    this.screen.key(['escape', 'q', 'C-c'], () => {
      process.exit(0);
    });

    this.screen.render();
  }

  onTestResult(test, testResult) {
    if (testResult.testExecError) {
      return this.handleExecError(testResult);
    }

    this.buildLog(testResult.console);
    this.buildResults(testResult.testResults);

    this.testTimeBox.setContent(this.centerText(this.runTime > 0 ? `${this.runTime}s` : '<1s'));

    this.screen.render();
  }

  handleExecError({ failureMessage, testExecError: { loc }, testFilePath }) {
    this.errors = [
      ...this.errors,
      this.buildErrorText(testFilePath, loc, failureMessage),
    ];
    this.errorBox.setContent(this.errors.join('\n'));
    this.screen.render();
  }

  buildLog(log) {
    this.log = [
      ...this.log,
      ...log.map(({ message, origin }) => `${origin}:\n\t${message}`),
    ];

    this.logBox.setContent(this.log.join('\n'));
  }

  buildResults(testResults) {
    const { errors, failing, passing } = testResults.reduce(
      (acc, result) =>
        result.failureMessages.length > 0
          ? Object.assign({}, acc, {
              failing: [...acc.failing, result.fullName],
              errors: [
                ...acc.errors,
                ...result.failureMessages.map(message => ({
                  message,
                  fullName: result.fullName,
                })),
              ],
            })
          : Object.assign({}, acc, {
              passing: [...acc.passing, result.fullName],
            }),
      { errors: [], failing: [], passing: [] },
    );

    this.passingTests = [...this.passingTests, ...passing];
    this.failingTests = [...this.failingTests, ...failing];

    this.passingBox.setContent(this.passingTests.join('\n'));
    this.passedBox.setContent(this.centerText(this.passingTests.length.toString()));
    this.failingBox.setContent(this.failingTests.join('\n'));
    this.failedBox.setContent(this.centerText(this.failingTests.length.toString()));

    this.buildTestErrors(errors);
  }

  buildTestErrors(errors) {
    this.errors = [...this.errors, ...errors];
    this.errorBox.setContent(
      this.errors
        .map(({ fullName, message }) => `${fullName}\n${message}`)
        .join('\n'),
    );
  }

  onRunStart(results, options) {
    this.statusBox.setContent(this.centerText('Running'));
    this.interval = setInterval(() => {
      this.runTime = this.runTime + 1;
      this.testTimeBox.setContent(this.centerText(this.runTime > 0 ? `${this.runTime}s` : '<1s'));
      this.screen.render();
    }, 1000);
  }

  onRunComplete(contexts, results) {
    clearInterval(this.interval);
    this.interval = null;
    this.runTime = 0;
    this.statusBox.setContent(this.centerText('Complete'));
    this.screen.render();
  }

  buildErrorText(filePath, loc, failureMessage) {
    return `${filePath}\n${loc.line}:${loc.column}\n${failureMessage}`;
  }

  centerText(text) {
    return `{center}${text}{/center}`;
  }

  layoutPassingTests() {
    this.passingBox = blessed.box({
      label: 'Passing',
      padding: 1,
      left: '0%',
      top: '0%',
      height: '100%',
      width: '25%',
      border: { type: 'line' },
      style: { border: { fg: this.color } },
    });
    this.screen.append(this.passingBox);
  }

  layoutFailingTests() {
    this.failingBox = blessed.box({
      label: 'Failing',
      padding: 1,
      left: '25%',
      top: '0%',
      height: '100%',
      width: '25%',
      border: { type: 'line' },
      style: { border: { fg: this.color } },
    });
    this.screen.append(this.failingBox);
  }

  layoutErrorLog() {
    this.errorBox = blessed.box({
      label: 'Errors',
      padding: 1,
      left: '50%',
      top: '36%',
      height: '66%',
      border: { type: 'line' },
      style: { border: { fg: this.color } },
    });
    this.screen.append(this.errorBox);
  }

  layoutTotalTestTime() {
    this.testTimeBox = blessed.box({
      label: 'Total Test Time',
      padding: 1,
      left: '50%',
      top: '0%',
      height: '10%',
      width: '12.5%',
      border: { type: 'line' },
      style: { border: { fg: this.color } },
      tags: true,
    });
    this.screen.append(this.testTimeBox);
  }

  layoutStatus() {
    this.statusBox = blessed.box({
      label: 'Status',
      padding: 1,
      left: '62.5%',
      top: '0%',
      height: '10%',
      width: '12.5%',
      border: { type: 'line' },
      style: { fg: -1, border: { fg: this.color } },
      tags: true,
    });
    this.screen.append(this.statusBox);
  }

  layoutPassed() {
    this.passedBox = blessed.box({
      label: 'Passed',
      padding: 1,
      left: '75%',
      top: '0%',
      height: '10%',
      width: '12.5%',
      border: { type: 'line' },
      style: { border: { fg: this.color } },
      tags: true,
    });
    this.screen.append(this.passedBox);
  }

  layoutFailed() {
    this.failedBox = blessed.box({
      label: 'Failed',
      padding: 1,
      left: '87.5%',
      top: '0%',
      height: '10%',
      width: '12.5%',
      border: { type: 'line' },
      style: { border: { fg: this.color } },
      tags: true,
    });
    this.screen.append(this.failedBox);
  }

  layoutLog() {
    this.logBox = blessed.box({
      label: 'Log',
      padding: 1,
      left: '50%',
      top: '10%',
      height: '26%',
      border: { type: 'line' },
      style: { border: { fg: this.color } },
    });

    this.screen.append(this.logBox);
  }
};
