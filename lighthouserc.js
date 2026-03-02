module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      url: [
        'http://localhost/index.html',
      ],
      numberOfRuns: 5,
    },
  },
};
