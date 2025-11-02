module.exports = {
  ci: {
    collect: {
      url: ['https://navendu.me/'],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        // Disable all assertions - we just want to collect scores
      },
    },
  },
};
