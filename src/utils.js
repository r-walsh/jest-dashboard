const { inspect } = require('util');

const buildErrorText = (filePath, loc, failureMessage) =>
  `${filePath}\n${loc.line}:${loc.column}\n${failureMessage}`;

const buildTitleText = (title, ancestorName) =>
  ancestorName ? `${ancestorName} ${title}` : title;

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

const parseTestResults = testResults =>
  testResults.reduce(
    (acc, result) =>
      result.failureMessages.length > 0
        ? Object.assign({}, acc, {
            failing: [...acc.failing, result.fullName],
            errors: [
              ...acc.errors,
              ...result.failureMessages.map(message => ({
                message,
                title: buildTitleText(
                  result.title,
                  result.ancestorTitles[result.ancestorTitles.length - 1],
                ),
              })),
            ],
          })
        : Object.assign({}, acc, {
            passing: [
              ...acc.passing,
              buildTitleText(
                result.title,
                result.ancestorTitles[result.ancestorTitles.length - 1],
              ),
            ],
          }),
    { errors: [], failing: [], passing: [] },
  );

module.exports = { buildErrorText, centerText, colorizeLog, parseTestResults };
