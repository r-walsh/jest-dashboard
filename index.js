const blessed = require('blessed');
const {
  centerText,
  colorizeLog,
  buildErrorText,
  parseTestResults,
} = require('./src/utils');
const { buildBox, scroll } = require('./src/boxes');

class JestDashboard {
  onJestStart(globalConfig) {
    this.watching = globalConfig.watch;
    this.runTime = 0;
    this.passingTests = [];
    this.failingTests = [];
    this.errors = [];
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

    this.screen.key(['a', 'p', 't', 'w', 'enter'], () =>
      this.watching && process.stdin.resume(),
    );

    this.screen.render();
  }

  handleJestLog(text) {
    this.logElement.log(text);
  }

  onTestResult(_test, testResult) {
    if (testResult.testExecError) {
      return this.handleExecError(testResult);
    }

    testResult.console && this.buildLog(testResult.console);
    this.buildResults(testResult.testResults);

    this.testTimeBox.setContent(
      centerText(this.runTime > 0 ? `${this.runTime}s` : '<1s'),
    );

    this.screen.render();
  }

  handleExecError({ failureMessage, testExecError: { loc }, testFilePath }) {
    this.errors = [
      ...this.errors,
      buildErrorText(testFilePath, loc, failureMessage),
    ];
    this.errorBox.setContent(this.errors.join('\n'));
    this.screen.render();
  }

  buildLog(log) {
    log.forEach(({ message, origin, type }) =>
      this.logElement.log(colorizeLog(`${origin}:\n\t${message}\n\n`, type)),
    );
  }

  buildResults(testResults) {
    const { errors, failing, passing } = parseTestResults(testResults);

    this.passingTests = [...this.passingTests, ...passing];
    this.failingTests = [...this.failingTests, ...failing];

    this.passingBox.setContent(this.passingTests.join('\n'));
    this.passedBox.setContent(centerText(this.passingTests.length.toString()));
    this.failingBox.setContent(this.failingTests.join('\n'));
    this.failedBox.setContent(centerText(this.failingTests.length.toString()));

    this.buildTestErrors(errors);
  }

  buildTestErrors(errors) {
    this.errors = [...this.errors, ...errors];
    this.errorBox.setContent(
      this.errors
        .map(({ title, message }) => `${title}\n${message}`)
        .join('\n'),
    );
  }

  onRunStart(results) {
    this.statusBox.setContent(centerText('Running'));
    this.runTime = '<1s';
    this.testTimeBox.setContent(centerText(this.runTime));
    this.interval = setInterval(() => {
      this.runTime = this.runTime + 1;
      this.testTimeBox.setContent(centerText(`${this.runTime}s`));
      this.screen.render();
    }, 1000);

    if (this.watching) {
      this.logElement.log(
        `
${results.numTotalTestSuites === 0
          ? `No tests found related to files changed since last commit.
Press \`a\` to run all tests, or run Jest with \`--watchAll\`.\n`
          : ''}
Watch Usage
 › Press a to run all tests.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.`.trim(),
      );
    }
  }

  onRunComplete(contexts, results) {
    clearInterval(this.interval);
    this.interval = null;
    this.runTime = 0;
    this.statusBox.setContent(centerText('Complete'));
    this.screen.render();
  }

  layoutPassingTests() {
    this.passingBox = buildBox(
      {
        label: 'Passing',
        left: '0%',
        top: '0%',
        height: '100%',
        width: '25%',
      },
      true,
    );
    this.screen.append(this.passingBox);
  }

  layoutFailingTests() {
    this.failingBox = buildBox(
      {
        label: 'Failing',
        left: '25%',
        top: '0%',
        height: '100%',
        width: '25%',
      },
      true,
    );
    this.screen.append(this.failingBox);
  }

  layoutErrorLog() {
    this.errorBox = buildBox(
      {
        label: 'Errors',
        left: '50%',
        top: '40%',
        height: '61.5%',
      },
      true,
    );
    this.screen.append(this.errorBox);
  }

  layoutTotalTestTime() {
    this.testTimeBox = buildBox({
      label: 'Total Test Time',
      left: '50%',
      top: '0%',
      height: '11%',
      scrollable: false,
      width: '12.5%',
      tags: true,
    });
    this.testTimeBox.setContent(centerText('<1s'));
    this.screen.append(this.testTimeBox);
  }

  layoutStatus() {
    this.statusBox = buildBox({
      label: 'Status',
      left: '62.5%',
      top: '0%',
      height: '11%',
      scrollable: false,
      width: '12.5%',
      tags: true,
    });
    this.screen.append(this.statusBox);
  }

  layoutPassed() {
    this.passedBox = buildBox({
      label: 'Passed',
      left: '75%',
      top: '0%',
      height: '11%',
      scrollable: false,
      width: '12.5%',
      tags: true,
    });
    this.passedBox.setContent(centerText('0'));
    this.screen.append(this.passedBox);
  }

  layoutFailed() {
    this.failedBox = buildBox({
      label: 'Failed',
      left: '87.5%',
      top: '0%',
      height: '11%',
      scrollable: false,
      width: '12.5%',
      tags: true,
    });
    this.failedBox.setContent(centerText('0'));
    this.screen.append(this.failedBox);
  }

  layoutLog() {
    this.logBox = buildBox({
      label: 'Log',
      left: '50%',
      top: '11%',
      height: '30%',
    });

    this.logElement = scroll({ parent: this.logBox });

    this.screen.append(this.logBox);
  }
};

module.exports = new JestDashboard();
