#include <Arduino.h>
//#include <WebUSB.h>
#include <USBAPI.h>

#include "configuration.h"
class BumperController;


// All outbound message commands start with 0011 <=> 48
#define IN_COMPUTER_CONNECTED 0x30 // <=> 0011 0000
#define IN_COMPUTER_START_CALIBRATION 0x31 // <=> 0011 0001 0xBUMPERID
#define IN_COMPUTER_CHANGE_TOLERANCE 0x32 // <=> 0011 0010 0xBUMPERID 0xTOLERANCE

#define IN_COMPUTER_ENABLE_BUMPER 0x33 // <=> 0011 0100 0xBUMPERID
#define IN_COMPUTER_ENABLE_BUMPERS 0x34 // <=> 0011 0011
#define IN_COMPUTER_DISABLE_BUMPER 0x35 // <=> 0011 0101 0xBUMPERID
#define IN_COMPUTER_DISABLE_BUMPER_AND_BLINK 0x36 // <=> 0011 0110 0xBUMPERID
#define IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK 0x37 // <=> 0011 0110

#define IN_COMPUTER_GET_STATE 0x38 // <=> 0011 1000

#define IN_COMPUTER_RESET 0x3F // <=> 0011 1000

#define OUT_COMPUTER_CONNECTED 0x80 // <=> 0011 0000
#define OUT_COMPUTER_CALIBRATION_STARTED 0x81 // <=> 1100 0001
#define OUT_COMPUTER_CALIBRATION_FINISHED 0x82 // <=> 1100 0010
#define OUT_COMPUTER_BUMPER_HIT 0x84 // <=> 1100 0100
#define OUT_COMPUTER_CONTROLLER_STATE 0x88 // <=> 1100 1000

class SerialClient {
public:
  SerialClient();
  void tick();
  void init(BumperController* ctrl);
  void sendConnected(byte* state);
  void sendBumperHit(byte* state);
  void sendState(byte* state);
  void sendCalibrationStarted();
  void sendCalibrationFinished(byte* state);
  void onRequest(byte cmd);
private:
  BumperController* ctrl;
  byte buffer[4] = {0, 0, 0, 0};
  bool parsing;
  byte total;
  byte currentIndex;
  void processCommand();
  const byte END_MESSAGE[2] = { 0x0D, 0x0A };
  const byte END_MESSAGE_SIZE = 2;
  //WebUSB WebUSBSerial = {WEBUSB_PROTOCOL, WEBUSB_HOST};
  Serial_ WebUSBSerial = Serial_();
};
