"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var TestUtils_1 = require("../utils/TestUtils");
var CallConfig_1 = require("./CallConfig");
var _ = require("lodash");
var request = require("request");
var BeachDayReporter_2 = require("../reporter/BeachDayReporter");
var RequestRunner = (function () {
    function RequestRunner() {
    }
    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    RequestRunner.run = function (call, env) {
        if (call.endPoint == null) {
            TestUtils_1.TestUtils.throwImplementationError("endPoint is a required field for your CallConfig: " + JSON.stringify(call, null, 4));
            env.done();
            return;
        }
        if (call.baseURL == null) {
            TestUtils_1.TestUtils.throwImplementationError("baseURL is a required field for your CallConfig: " + JSON.stringify(call, null, 4));
            env.done();
            return;
        }
        // Fetch the current spec ID from the reporter so we can
        // ensure the test is still running when we complete the request call
        var currSpecId = BeachDayReporter_2.getCurrentSpecId();
        call = RequestRunner.globalDefaults.extend(call);
        // Run the before calls for any last transformations
        call.beforeProxy(env);
        // Default header to use json
        var headers = {
            "Content-Type": "application/json"
        };
        if (call.headers) {
            for (var propName in call.headers) {
                if (!headers.hasOwnProperty(propName.toLowerCase())) {
                    headers[propName] = call.headers[propName];
                }
            }
        }
        var requestPassed = true;
        var sendBody;
        if (call.method != "GET") {
            var data = call.getDataImpl(env);
            if (data) {
                requestPassed = call.checkSchemaImpl(env, data, true, null);
                sendBody = JSON.stringify(data);
            }
        }
        if (!requestPassed) {
            // Just complete the request if there are any errors
            env.done();
        }
        else {
            // Create the options from the options in the config then the derived data
            var options = _.extend({}, call.requestOptions, {
                uri: call.fullURL,
                method: call.method.toUpperCase(),
                headers: headers,
                json: false,
                body: sendBody,
                timeout: call.timeout
            });
            //console.log("running request() with:");
            //console.log(options);
            request(options, function (error, response, body) {
                // Ensure the same tests is still running
                if (currSpecId != BeachDayReporter_2.getCurrentSpecId()) {
                    TestUtils_1.TestUtils.throwImplementationError("HTTP callback was executed after the test had been completed. Please check your timeouts to make sure the test is not timing out before the HTTP request.");
                    return;
                }
                if (error) {
                    // Log out the request and response
                    //console.log("request() timeout with:");
                    //console.log(options);
                    RequestRunner.logRequestResponse(error, response, body, options);
                    TestUtils_1.TestUtils.throwExpectError("Expected HTTP call to be successful");
                }
                else {
                    // Assert the status
                    expect(response.statusCode).statusCodeToBe(call.status);
                    // Try convert the json response
                    if (body && typeof body == "string") {
                        try {
                            body = JSON.parse(body);
                        }
                        catch (e) {
                            TestUtils_1.TestUtils.throwExpectError("Expected JSON parsing from the server to pass");
                            BeachDayReporter_1.console.log("JSON Parsing Error: ");
                            BeachDayReporter_1.console.log(e.message);
                            BeachDayReporter_1.console.log("Original data from server:");
                            BeachDayReporter_1.console.log(body);
                        }
                    }
                    // Set the body on the environment
                    env.currentBody = body;
                    // Run obfuscation
                    call.obfuscateFuncImpl(env, body, response);
                    // Log out the request and response
                    RequestRunner.logRequestResponse(error, response, body, options);
                    // Check schemas if setup
                    call.checkSchemaImpl(env, body, false, response);
                    // Run assertions
                    call.assertFuncImpl(env, body, response);
                }
                // Lastly call done()
                env.done();
            });
        }
    };
    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    RequestRunner.logRequestResponse = function (error, res, body, options) {
        if (res) {
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + res.request.uri.href);
            BeachDayReporter_1.console.log("Method: " + res.request.method);
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(res.request.headers, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + res.request.body);
            BeachDayReporter_1.console.log("");
            BeachDayReporter_1.console.log("<strong>RESPONSE</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("Status Code: " + res.statusCode);
            BeachDayReporter_1.console.log("Response Headers:\n" + JSON.stringify(res.headers, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + JSON.stringify(body, null, 4));
            BeachDayReporter_1.console.log("");
        }
        else {
            BeachDayReporter_1.console.log("<strong>Request library error:</strong>");
            BeachDayReporter_1.console.log(JSON.stringify(error, null, 4));
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + options.uri);
            BeachDayReporter_1.console.log("Method: " + options.method);
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(options.headers, null, 4));
            if (options.body) {
                var body = options.body;
                for (var propName in options.headers) {
                    if (propName.toLowerCase() == "content-type" && options.headers[propName].toLowerCase().indexOf("application/json") != -1) {
                        body = JSON.stringify(JSON.parse(body), null, 4);
                        break;
                    }
                }
                BeachDayReporter_1.console.log("Body:\n" + body);
            }
            BeachDayReporter_1.console.log("Timeout: " + options.timeout);
            BeachDayReporter_1.console.log("");
        }
    };
    RequestRunner.globalDefaults = new CallConfig_1.CallConfig();
    return RequestRunner;
}());
exports.RequestRunner = RequestRunner;