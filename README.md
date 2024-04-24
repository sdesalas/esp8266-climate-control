# ESP8266 Climate Control circuit (Fan + Thermostat)

This is a climate control circuit to use external temperature to regulate indoor temperature.

<img src="diagram.explanation.png" width="500"/>

# Components

- 1x ESP8266 Nodemcu (V3)
- 2x DS18B20 waterproof temperature sensors
- 1x 25W 100mm inline "duct" fan mounted on external air conduit
- 1x 5V relay for 220V AC

## 1x ESP8266 Nodemcu (V3)

The great thing about the [ESP8266](https://en.wikipedia.org/wiki/ESP8266) microcontroller is the in-built WiFi. A fully-featured board such as the [NodeMCU V3](https://www.theengineeringprojects.com/2018/10/introduction-to-nodemcu-v3.html) will sell for aprox 3EUR/4USD on Aliexpress, and it contains a 160MHz microcontroller with 64KB RAM and a 4MB flash drive.

WiFi support (AP and STA modes) will allow you to have an admin interface controllable from your phone, as well as send periodic telemetry updates via internet to track indoor/outdoor temperatures. You can also use [ESP32](https://en.wikipedia.org/wiki/ESP32) also but I prefer the older chip for greater library compatibility.

<img src="espnodemcu.pinout.jpg" width="400"/>
<img src="esp8266.tempsensor.jpg" width="400"/>

## 2x DS18B20 waterproof temperature sensors

These temperature sensors are great to work with. You can buy them in 1-5m length.

<img src="tempsensor.png" width="400"/>

## 1x 25W 100mm inline "duct" fan

You can buy these off amazon for around 35 EUR / 40 USD.

<img src="fan.jpg" width="400"/>

## 1x 5V relay for 220V AC

A relay module allows you to switch a 220V AC appliance such as a duct fan.

You can use a 5V or 3V module depending on preference. The circuit will support both.

<img src="relaymodule.jpg" width="400"/>

# Hookup (Multi Sensor)

Using the "OneWire" protocol its possible to hook up multiple sensors on the same signal line, with a pull-up resistor at 5K (or 10K) ohm.

<img src="multi-sensor.png" width="500"/>


