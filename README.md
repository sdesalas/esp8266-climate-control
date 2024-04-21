# ESP8266 Climate Control circuit (Fan + Thermostat)

This is a climate control circuit to use external temperature to modulate indoor temperature.

<img src="diagram.explanation.png" width="500"/>

# Components

- 1x ESP8266 Nodemcu (V3)
- 2x DS18B20 waterproof temperature sensors
- 1x 25W 100mm inline "duct" fan mounted on external air conduit
- 1x 220V relay/octocoupler for 5V circuits

## 1x ESP8266 Nodemcu (V3)

<img src="espnodemcu.pinout.jpg" width="400"/>
<img src="esp8266.tempsensor.jpg" width="400"/>

## 2x DS18B20 waterproof temperature sensors

<img src="tempsensor.png" width="400"/>

## 1x 25W 100mm inline "duct" fan

<img src="fan.jpg" width="400"/>

## 1x 220V relay/octocoupler for 5V circuits

<img src="relaymodule.jpg" width="400"/>

# Hookup (Multi Sensor)

Using the "OneWire" protocol its possible to hook up multiple sensors on the same signal line, with a pull-up resistor at 5K (or 10K) ohm.

<img src="multi-sensor.png" width="500"/>


