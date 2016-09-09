// Generate a consistent UUID for our GarageDoorOpener that will remain the same even when
// restarting our server.
var garageUUID = 3cb095d2-efe6-42cc-adc8-00768865f6e7;

// This is the Accessory that we'll return to HAP-NodeJS that represents our Garage opener.
var garage = exports.accessory = new Accessory('Big Garage Door', garageUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
garage.username = "C1:5D:3F:EE:5E:FA";
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
      console.log("Query: Is Garage Open? Yes.");
      callback(err, Characteristic.CurrentDoorState.OPEN);
    }
    else {
      console.log("Query: Is Garage Open? No.");
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });
