# Takahoot controller

The Takahoot controller is a standard unit which can connect up to 4 triggers with 6-pin JST 2.54mm cables.  
It is supposed to be connected to a computer via its USB cable.

#### UPLOADING OF THE CONTROLLER
~~First you will need to install the [WebUsb](https://github.com/webusb/arduino) library into your [ArduinoIDE](https://www.arduino.cc/en/main/software)~~
The controller is using now WebSerial instead of WebUSB.
Make sure the dependency is available inside your Arduino IDE (default path `/usr/share/arduino/hardware/arduino/avr/cores/arduino/USBCore.h`).


You are normally ready to upload the code into your controller if you still get an error watch the troobleshoot below.

Troubleshoot : 
- On some version of linux you will have to temporarily disable the ModemManager to let arduino do his job.
Just run ```$ systemctl stop ModemManager.service``` to stop it.
You can check the status of the modem by ```$ systemctl status ModemManager.service```
Don't worry the Modem will come back when you restart your computer.

- Do not use the new version of Arduino IDE. Use version 1.8.


## Serial protocol

### Inbound commands

#### IN_COMPUTER_CONNECTED (1-byte)
When the computer program connects to the controller, it should send a `IN_COMPUTER_CONNECTED` command.

| Byte 1  |
| ------------- |
| CMD  |
| 0x30  |


#### IN_COMPUTER_START_CALIBRATION (2-bytes)
Anytime we want to force the calibration of a bumper, this message can be sent.  
`BUMPER_ID` can be anything from `0x00` to `0x03` (there are 4 bumpers maximum per controller).

| Byte 1  | Byte 2 |
| ------------- | ------------- |
| CMD  | BUMPER_ID  |
| 0x31  | 0x00  |


#### IN_COMPUTER_CHANGE_TOLERANCE (3-bytes)
Each bumper has a default tolerance of `2`. Sometimes, this tolerance might not be perfect.
One can adjust the tolerance of each bumper by sending this command.

`BUMPER_ID` can be anything from `0x00` to `0x03` (there are 4 bumpers maximum per controller).  
`TOLERANCE` can be anything from `0x01` to `0xFF`.  

| Byte 1  | Byte 2 | Byte 3 |
| ------------- | ------------- | ------------- |
| CMD  | BUMPER_ID  | TOLERANCE  |
| 0x32  | 0x00  | 0x0F |


#### IN_COMPUTER_ENABLE_BUMPER (2-bytes)
Send this command to enable any bumper. **Enable** means the bumper will record hits.

`BUMPER_ID` can be anything from `0x00` to `0x03` (there are 4 bumpers maximum per controller).

| Byte 1  | Byte 2 |
| ------------- | ------------- |
| CMD  | BUMPER_ID  |
| 0x33  | 0x00  |


#### IN_COMPUTER_ENABLE_BUMPERS (1-byte)
Send this command to enable all bumpers at the same time. **Enable** means the bumper will record hits.

| Byte 1  |
| -------------  |
| CMD   |
| 0x34  |


#### IN_COMPUTER_DISABLE_BUMPER (2-bytes)
Send this command to disable any bumper. **Disable** means the bumper wont record any hit.

`BUMPER_ID` can be anything from `0x00` to `0x03` (there are 4 bumpers maximum per controller).

| Byte 1  | Byte 2 |
| ------------- | ------------- |
| CMD  | BUMPER_ID  |
| 0x35  | 0x00  |


#### IN_COMPUTER_DISABLE_BUMPER_AND_BLINK (2-bytes)
Send this command to disable any bumper and blink yellow. **Disable** means the bumper wont record any hit. This is useful to recognize which controller is which for instance.

`BUMPER_ID` can be anything from `0x00` to `0x03` (there are 4 bumpers maximum per controller).

| Byte 1  | Byte 2 |
| ------------- | ------------- |
| CMD  | BUMPER_ID  |
| 0x36  | 0x00  |


#### IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK (1-byte)
Send this command to disable all the bumpers of the controller and blink yellow. **Disable** means the bumper wont record any hit. This is useful to recognize which controller is which for instance.

| Byte 1  |
| ------------- |
| CMD  |
| 0x37  |


#### IN_COMPUTER_GET_STATE (1-byte)
Ask the controller to send its global state. This will result in an outbound `OUT_COMPUTER_CONTROLLER_STATE` message.

| Byte 1  |
| ------------- |
| CMD  |
| 0x38  |


#### IN_COMPUTER_RESET (1-byte)
Send this command to reset **both** each bumper **and** the **controller** itself.

| Byte 1  |
| ------------- |
| CMD  |
| 0x3F  |

### Outbound structures


`BUMPER_X_STATE` is the state of bumper X. It consists of a sequence of 3 bytes (example for bumper 0).

| Byte 1  | Byte 2 | Byte 3 |
| ------------- | ------------- | ------------- |
| BUMPER_ID  | STATE  | TOLERANCE  |
| 0x00  | 0b 0000 HEKC  | 0x0F |

**HEKC** are the 4 lower bits of the STATE byte :
 * **H** for Hit: set if bumper is hit
 * **E** for Enabled: set if bumper is enabled (accepts hits)
 * **K** for K(C)alibrating: set if bumper is currently being calibrated
 * **C** for Connected: set if bumper is connected to the controller

Examples:

 * `0x010302` : bumper 01 - connected and calibrating - tolerance 2
 * `0x030000` : bumper 03 - not connected
 * `0x000508` : bumper 00 - connected and enabled - tolerance 8
 * `0x000908` : bumper 00 - connected and hit - tolerance 8

### Outbound messages

#### OUT_COMPUTER_CONNECTED (15-bytes)
When the controller has successfully initialized itself, as a response to the `IN_COMPUTER_CONNECTED` command, it sends this command and the initial state of the bumper.


| Byte 1  | Byte 2-4  | Byte 5-7  | Byte 8-10  | Byte 11-13  |  Byte 14-15 |
| ------------- | ------------- | ------------- | ------------- | ------------- | -------------  |
| CMD  | BUMPER_0_STATE  | BUMPER_1_STATE  | BUMPER_2_STATE  | BUMPER_3_STATE  | END_MSG  |
| 0x80  | 0x000302  | 0x010302  | 0x020302  | 0x030302  | 0x0D0A  |

#### OUT_COMPUTER_CALIBRATION_STARTED (3-bytes)
When the controller has initialized a manual calibration (requested by the inbound command `IN_COMPUTER_START_CALIBRATION`). It is a response to that command.

| Byte 1  | Byte 2-3 |
| ------------- | ------------- |
| CMD  | END_MSG  |
| 0x81  | 0x0D0A  |

#### OUT_COMPUTER_CALIBRATION_FINISHED (15-bytes)
When all bumpers are done with calibration (whether manual or auto).

| Byte 1  | Byte 2-4  | Byte 5-7  | Byte 8-10  | Byte 11-13  |  Byte 14-15 |
| ------------- | ------------- | ------------- | ------------- | ------------- | -------------  |
| CMD  | BUMPER_0_STATE  | BUMPER_1_STATE  | BUMPER_2_STATE  | BUMPER_3_STATE  | END_MSG  |
| 0x82  | 0x000302  | 0x010302  | 0x020302  | 0x030302  | 0x0D0A  |

#### OUT_COMPUTER_BUMPER_HIT (15-bytes)
When a bumper has been hit.

| Byte 1  | Byte 2-4  | Byte 5-7  | Byte 8-10  | Byte 11-13  |  Byte 14-15 |
| ------------- | ------------- | ------------- | ------------- | ------------- | -------------  |
| CMD  | BUMPER_0_STATE  | BUMPER_1_STATE  | BUMPER_2_STATE  | BUMPER_3_STATE  | END_MSG  |
| 0x84  | 0x000302  | 0x010302  | 0x020302  | 0x030302  | 0x0D0A  |


#### OUT_COMPUTER_CONTROLLER_STATE (15-bytes)
A response to the `IN_COMPUTER_GET_STATE` command.

| Byte 1  | Byte 2-4  | Byte 5-7  | Byte 8-10  | Byte 11-13  |  Byte 14-15  |
| ------------- | ------------- | ------------- | ------------- | -------------  | -------------  |
| CMD  | BUMPER_0_STATE  | BUMPER_1_STATE  | BUMPER_2_STATE  | BUMPER_3_STATE  | END_MSG  |
| 0x88  | 0x000302  | 0x010302  | 0x020302  | 0x030302  | 0x0D0A  |
