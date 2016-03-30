import {BeachDayReporter} from "../reporter/BeachDayReporter";
var Jasmine             = require("jasmine");
var SpecReporter        = require("jasmine-spec-reporter");

export function getBasicConfig(configFile:string = "spec/jasmine.json", timeout:number = 10100, autoExecute:boolean = true){

    var jasmineInst = new Jasmine();
    global["jasmine"].DEFAULT_TIMEOUT_INTERVAL = timeout;

    console.log("Setting up new default JASMINE Suite :)");
    console.log("----------------------------------------------------");


    // Disable default reporter
    jasmineInst.configureDefaultReporter({print: function(){}});

    // Add a basic reporter for the console :)
    jasmineInst.addReporter(new SpecReporter({
        displayStacktrace: "all"
    }));

    // Add our custom HTML reporter
    jasmineInst.addReporter(new BeachDayReporter({
        includeAllConsoleLogs: false
    }));

    jasmineInst.loadConfigFile(configFile);

    // Run this config in a setTimeout so it happens after the implementer
    // has added any necessary changes
    if (autoExecute !== false){
        setTimeout(function(){
            jasmineInst.execute()
        }, 10);
    }

    return jasmineInst;
};