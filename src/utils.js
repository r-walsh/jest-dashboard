const { inspect } = require('util');

const buildErrorText = (filePath, loc, failureMessage) =>
  `${filePath}\n${loc.line}:${loc.column}\n${failureMessage}`;

const buildTitleText = (title, ancestorName, withBullets) =>
  ancestorName
    ? `${withBullets ? '\u2022 ' : ''}${ancestorName} ${title}`
    : `\u2022 ${title}`;

const centerText = text => `{center}${text}{/center}`;

const colorize = (color, text) => {
  const codes = inspect.colors[color];
  return `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m`;
};

const colorizeLog = (message, type) => {
  switch (type) {
    case 'error':
      return colorize('red', message);
    case 'warn':
      return colorize('yellow', message);
    default:
      return message;
  }
};

const hookStdout = callback => {
  const oldWrite = process.stdout.write;

  process.stdout.write = (write => (...args) => {
    write.apply(process.stdout, args);
    callback(...args);
  })(process.stdout.write);

  return () => (process.stdout.write = oldWrite);
};

const parseTestResults = testResults =>
  testResults.reduce(
    (acc, result) => {
      const lastTitle = result.ancestorTitles[result.ancestorTitles.length - 1];
      const titleText = buildTitleText(result.title, lastTitle);
      return result.failureMessages.length > 0
        ? Object.assign({}, acc, {
            failing: [...acc.failing, titleText],
            errors: [
              ...acc.errors,
              ...result.failureMessages.map(message => ({
                message,
                title: titleText,
              })),
            ],
          })
        : Object.assign({}, acc, {
            passing: [...acc.passing, titleText],
          });
    },
    { errors: [], failing: [], passing: [] },
  );

module.exports = { buildErrorText, centerText, colorizeLog, hookStdout, parseTestResults };
