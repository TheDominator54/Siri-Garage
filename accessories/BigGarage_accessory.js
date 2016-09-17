// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '192.168.1.190',
  clientId: 'DomPi_BigGarage'
};
var client = mqtt.connect(options);
console.log("Big Garage Connected to MQTT broker");

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var garageUUID = uuid.generate('hap-nodejs:accessories:BigGarage');
// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var garage = exports.accessory = new Accessory('Big Garage Door', garageUUID);

//Fake Hardware
client.on('connect', () => {  
  client.subscribe('outTopic1')
})

client.on('message', (topic, message) => {  
  switch (topic) {
    case 'outTopic1':
      console.log('Message recieved %s', message)
      return handlemessage(message)
  }
  console.log('No handler for topic %s', topic)
})

function handlemessage (message) {  
  if (message == '0') {
    console.log("State set to open");
    GARAGE_DOOR.opened = true;
  }
  else if (message == '1') {
    console.log("State set to closed");
    GARAGE_DOOR.opened = false;
  }
}

var GARAGE_DOOR = {
  opened: false,
  open: function() { 
    console.log("Opening the Big Garage!");
    client.publish('inTopic1', '0');
  },
  close: function() { 
    console.log("Closing the Big Garage!");
    client.publish('inTopic1', '1');
  },
  identify: function() {
    console.log("Identify the Big Garage");
    // nothing to do.
  }
};
console.log("Garage door set as %s",GARAGE_DOOR.opened);


// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
var i;
var user = "";
for (var i = 0; i < 12; i++) {
    user += Math.trunc(Math.random() * (10));
}

garage.username = user;
garage.pincode = "031-45-154";

// set some basic properties
garage
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "White")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "TW000165");

// listen for the "identify" event for this Accessory
garage.on('identify', function(paired, callback) {
  GARAGE_DOOR.identify();
  callback(); // success
});

// Add the actual Garage Opener Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
garage
  .addService(Service.GarageDoorOpener, "Garage Door") 
  .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) // force initial state to CLOSED
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {

    if (value == Characteristic.TargetDoorState.CLOSED) {
      GARAGE_DOOR.close();
      callback();

      // now we want to set our garage "actual state" to be CLOSED so it shows as Closed in iOS apps
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    }
    else if (value == Characteristic.TargetDoorState.OPEN) {
      GARAGE_DOOR.open();
      callback();

      // now we want to set our garage "actual state" to be OPEN so it shows as Open in iOS apps
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
    }
  });

// We want to intercept requests for our current state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
garage
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {

    // this event is emitted when you ask Siri directly whether your gate is locked or not. you might query
    // the gate hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems

    if (GARAGE_DOOR.opened) {
      console.log("Query: Is Big Garage Open? Yes.");
      callback(err, Characteristic.CurrentDoorState.OPEN);
    }
    else {
      console.log("Query: Is Big Garage Open? No.");
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });
