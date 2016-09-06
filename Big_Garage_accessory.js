// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '192.168.1.190',
  clientId: 'DomPi_Big_garage'
};
var client = mqtt.connect(options);
client.subscribe('BigGarage');
console.log("Big Garage Connected to MQTT broker");
client.publish('BigGarage', 'Connected');

// HomeKit types required
var types = require("./types.js");
var exports = module.exports = {};

var execute = function(accessory,characteristic,value) {
  console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + "."); 
};

exports.accessory = {
  displayName: "Big Garage Door Opener",
  username: "3C:5A:3D:EE:5E:FA",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Big Garage Door Opener",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Name of the accessory",
      designedMaxLength: 255    
    },{
      cType: types.MANUFACTURER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Oltica",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Manufacturer",
      designedMaxLength: 255    
    },{
      cType: types.MODEL_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Rev-1",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Model",
      designedMaxLength: 255    
    },{
      cType: types.SERIAL_NUMBER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "A1S2NASF88EW",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "SN",
      designedMaxLength: 255    
    },{
      cType: types.IDENTIFY_CTYPE, 
      onUpdate: null,
      perms: ["pw"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Identify Accessory",
      designedMaxLength: 1    
    }]
  },{
    sType: types.GARAGE_DOOR_OPENER_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Garage Door Opener Control",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Name of service",
      designedMaxLength: 255   
    },{
      cType: types.CURRENT_DOOR_STATE_CTYPE,
      onUpdate: function(value) { 
        console.log("Change:",value); 
        execute("Garage Door - current door state", "Current State", value); 
        client.publish('BigGarage', 'current Toggle');
      },
      onRead: function(callback) {
        console.log("Read:");
        execute("Garage Door - current door state", "Current State", null);
        callback(undefined); // only testing, we have no physical device to read from
        client.publish('BigGarage', 'current State?');
      },
      perms: ["pr","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "BlaBla",
      designedMinValue: 0,
      designedMaxValue: 4,
      designedMinStep: 1,
      designedMaxLength: 1    
    },{
      cType: types.TARGET_DOORSTATE_CTYPE,
      onUpdate: function(value) { 
        console.log("Change:",value); 
        execute("Garage Door - target door state", "Current State", value); 
        client.publish('BigGarage', 'target Toggle');
      },
      onRead: function(callback) {
        console.log("Read:");
        execute("Garage Door - target door state", "Current State", null);
        callback(undefined); // only testing, we have no physical device to read from
        client.publish('BigGarage', 'target State?');
      },
      perms: ["pr","pw","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "BlaBla",
      designedMinValue: 0,
      designedMaxValue: 1,
      designedMinStep: 1,
      designedMaxLength: 1    
    },{
      cType: types.OBSTRUCTION_DETECTED_CTYPE,
      onUpdate: function(value) { 
        console.log("Change:",value); 
        execute("Garage Door - obstruction detected", "Current State", value); 
        client.publish('BigGarage', 'obstruction Toggle');
      },
      onRead: function(callback) {
        console.log("Read:");
        execute("Garage Door - obstruction detected", "Current State", null);
        callback(undefined); // only testing, we have no physical device to read from
        client.publish('BigGarage', 'Obstruction State?');
      },
      perms: ["pr","ev"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "BlaBla"
    }]
  }]
}
