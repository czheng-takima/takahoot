#include <Arduino.h>
// #include <FastLED.h>
#include <SPI.h>

struct Board;
struct Trigger;
class BoardStateHandler;
class SPIClient;
class SerialClient;

class BumperController {
public:
  BumperController(Board* board, SPIClient* spiClient, SerialClient* serialClient);
  // This is called once at startup
  void init();
  // This is called at every loop
  void tick();
  /**
   Initialize bumpers.
   This is called by the SerialClient on demand, or when connection state changes.
  */
  void initBumpers();
  /**
   Connect or disconnect Controller from Computer.
  */
  void setConnected(bool connected);
  bool isConnected();
  /**
   Change bumper Tolerance
  */
  void changeTolerance(byte bumperId, byte tolerance);
  /**
   Start calibration for a specific bumper
  */
  void startCalibration(byte bumperId);
  /**
   Enable all bumpers
  */
  void enableBumpers();
  /**
   Enable a specific bumper
  */
  void enableBumper(byte bumperId);
  /**
   Disable a specific bumper
  */
  void disableBumper(byte bumperId);
  /**
   Disable and blink a specific bumper
  */
  void disableAndBlinkBumper(byte bumperId);
  /**
   Disable and blink all bumpers
  */
  void disableAndBlinkBumpers();
  /**
    Retrieve the bumper state
    Controller state is defined like the following:
    bumperId | state (0b 0000 HEKC) | tolerance
    for each bumper.
    Therefore, it consists of 12 bytes.
  */
  byte* getState();
  /**
   Reset bumpers.
   This is called by the SerialClient on demand
  */
  void resetBumpers();

private:
  Board* board;
  SPIClient* spiClient;
  SerialClient* serialClient;
  BoardStateHandler* boardStateHandler;
  void refreshStates();
  void refreshState(byte bumperId);
  void confirmHit();
  void sendCalibrationFinished();
  bool connected;
  long lastMillis;
};
