'use strict';


var e2eBaseUrl = 'http://localhost:9000/demo/';

var exportsConfig = {

    // The location of the selenium standalone server .jar file.
    seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.40.0.jar',
    // find its own unused port.
    seleniumPort: null,
    chromeDriver: './node_modules/protractor/selenium/chromedriver.exe',
    seleniumArgs: [],

    allScriptsTimeout: 11000,

    specs: [
        'test/e2e/specs/*_spec.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: e2eBaseUrl,

    rootElement: 'body',

    params: {
        baseUrl: e2eBaseUrl
    },

    jasmineNodeOpts: {
        // onComplete will be called just before the driver quits.
        onComplete: null,
        // If true, display spec names.
        isVerbose: false,
        // If true, print colors to the terminal.
        showColors: true,
        // If true, include stack traces in failures.
        includeStackTrace: true,
        // Default time to wait in ms before a test fails.
        defaultTimeoutInterval: 30000
    }
};

exports.config = exportsConfig;
