module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      url: [
        'http://localhost/index.html',
      ],
      numberOfRuns: 5,
      settings: {
        emulatedUserAgent: false,
        chromeFlags: '--force-prefers-color-scheme-dark',
      },
    },
  },
};
