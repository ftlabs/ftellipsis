
/**
 * Module Dependencies
 */

var fs = require('fs');
var config = module.exports;

config["My tests"] = {
    env: "browser",        // or "node"
    rootPath: "../",
    autoRun: false,
    sources: [
      "node_modules/superagent/superagent.js",
      "test/helpers.js",
      "lib/*.js"      // Glob patterns supported
    ],
    tests: [
      "test/*-test.js"
    ],
    resources: [
      {
        path: 'test.html',
        content: fs.readFileSync('test/test.html')
      },
      {
        path: 'test/style.css',
        file: 'test/style.css'
      }
    ]
};