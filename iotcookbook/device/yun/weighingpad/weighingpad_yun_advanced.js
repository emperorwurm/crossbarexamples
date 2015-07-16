
//
// Copyright (C) Tavendo GmbH. Licensed under the MIT license.
//
// This program bridges Arduino Yun to WAMP / Crossbar.io over Firmata (https://github.com/firmata/protocol).
// and sends accelerometer data from a Tinkerkit accelerometer module 
//
// Firmata is a MIDI-based protocol for communication between MCUs and host CPUs over serial connections.
//
// Firmata implementations used in the bridge:
//
//   - Linux-side: https://github.com/shokai/node-arduino-firmata
//   - Arduino-side: https://github.com/firmata/arduino/blob/master/examples/StandardFirmataYun/StandardFirmataYun.ino
//

// configuration:
var router = 'ws://192.168.1.136:8080/ws';
var realm = 'iot_cookbook';
var device_id = '123456';
var device_port = '/dev/ttyATH0';
//var debug = true;
var debug = false;

console.log("Arduino Yun Weighing Pad starting ...");

var autobahn = require('autobahn');
var firmata = require('arduino-firmata');

var arduino = new firmata();

arduino.on('connect', function () {

    console.log("Arduino connected (over " + arduino.serialport_name + ", board version " + arduino.boardVersion + ")");

    var connection = new autobahn.Connection({url: router, realm: realm});

    connection.onopen = function (session) {

        console.log("Router connected. Session ID:", session.id);

        var monitored_pins = {};

        function set_mode (args) {
            var pin = args[0];
            var mode = args[1];

            if (debug) {
                console.log("set_mode", pin, mode);
            }

            if (mode == "in") {

                arduino.pinMode(pin, firmata.INPUT);
                monitored_pins[pin] = false;

            } else if (mode == "watch") {

                arduino.pinMode(pin, firmata.INPUT);
                monitored_pins[pin] = true;

            } else if (mode == "out") {

                arduino.pinMode(pin, firmata.OUTPUT);
                monitored_pins[pin] = false;

            } else {
                console.log("illegal pin mode", mode);
                throw "illegal pin mode: " + mode;
            }
        }

        function analog_read (args) {
            var pin = args[0];

            if (debug) {
                console.log("analog_read", pin);
            }

            var value;
            try {
                value = arduino.analogRead(pin);
            } catch (e) {
                console.log(e);
                throw e;
            }

            return value;
        }


        /*********************************
        *   Weighing Pad Control Code   *
        *********************************/

        // local configuration


        // process config
        function processConfig (config) {
            

        }

        // update config
        function updateConfig (changeSet) {
            // check whether we have an instance name change and unregister procedures in this case
            if (changeSet.instance && changeSet.instance != config.instance) {

                session.unregister("io.crossbar.examples.yun.weighingpad." + instanceName + ".get_config").then(session.log, session.log);

                session.unregister("io.crossbar.examples.yun.weighingpad." + instanceName + ".update_config").then(session.log, session.log);

                config.instance = changeSet.instance;
            }

            // apply the pad updates to the config
            // iterate over any pads
                // if no change of type, just update current config with any updated values
                // if change of type, remove the inapplicable properties, update common values, add new properties
            changeSet.pads.forEach(function (padConfig) {
                // do we have any config for this pad?
                
                // is there a change of type?
                // apply config for the type
            });

            // process updated config
            processConfig(config);
        }

        // set up continous sampling


        // set up events


        // register procedures
        function registerProcedures (instanceName) {

            session.register("io.crossbar.examples.yun.weighingpad." + instanceName + ".get_config", function() {
                return config;
            }).then(session.log, session.log);

            session.register("io.crossbar.examples.yun.weighingpad." + instanceName + ".update_config", updateConfig).then(session.log, session.log);
        }



    };

    connection.onclose = function (reason, details) {
        console.log("no connection", reason, details);
    }

    console.log("Connecting to router ...");

    connection.open();
});

// connect to Arduino over serial speaking Firmata
arduino.connect(device_port);
