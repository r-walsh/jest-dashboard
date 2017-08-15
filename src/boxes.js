const blessed = require('blessed');

const DEFAULT_OPTIONS = {
  border: { type: 'line' },
  scrollable: true,
  style: { border: { fg: '#a23c4f' } },
  padding: 1,
};

const DEFAULT_SCROLL_OPTIONS = {
  scrollable: true,
  input: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    inverse: true,
  },
  keys: true,
  vi: true,
  mouse: true,
};

const buildBox = (options, scrollable = false) =>
  blessed.box(
    Object.assign(
      {},
      DEFAULT_OPTIONS,
      scrollable ? DEFAULT_SCROLL_OPTIONS : {},
      options,
    ),
  );

const scroll = options =>
  blessed.log(Object.assign({}, DEFAULT_SCROLL_OPTIONS, options));

module.exports = { buildBox, scroll };
