#include "CommService.h"
#include "GameController.h"
#include "LedController.h"
#include "configuration.h"
#include "board.h"
#include "msg.h"

CommService::CommService(GameController* gameController, LedController* ledController) {
  this->gameController = gameController;
  this->ledController = ledController;
  this->currentIndex = 0;
  this->total = 0;
}

void CommService::tick() {
  if (Serial.available() > 0) {
    byte cmd = Serial.read();
  }
}

Msg CommService::onRequest(byte cmd) {
  if (!parsing) {
    switch (cmd) {
      // 1-byte commands
      case IN_CONTROLLER_RESET:
      case IN_CONTROLLER_START_CALIBRATION:
      case IN_CONTROLLER_ENABLE_TRIGGER:
      case IN_CONTROLLER_DISABLE_TRIGGER:
      case IN_CONTROLLER_DISABLE_TRIGGER_AND_BLINK:
      case IN_CONTROLLER_GET_STATE:
        buffer[0] = cmd;
        return processCommand();
        break;
      // 2-byte commands
      case IN_CONTROLLER_CHANGE_TOLERANCE:
        buffer[0] = cmd;
        parsing = true;
        total = 1;
        break;
      // 4-byte commands
      case IN_CONTROLLER_CONNECTED:
        buffer[0] = cmd;
        parsing = true;
        total = 3;
        break;
    }
  } else {
    buffer[1 + currentIndex] = cmd;
    if (++currentIndex == total) {
      currentIndex = 0;
      parsing = false;
      return processCommand();
    }
  }
  return {0, NULL};
}

Msg CommService::processCommand() {
  byte size = 0;
  byte* data = NULL;
  switch (buffer[0]) {
    case IN_CONTROLLER_CONNECTED:
      return processControllerConnected();
      break;
    case IN_CONTROLLER_START_CALIBRATION:
      return processControllerStartCalibration();
      break;
    case IN_CONTROLLER_ENABLE_TRIGGER:
      this->gameController->enable();
      break;
    case IN_CONTROLLER_DISABLE_TRIGGER:
      this->gameController->disable();
      break;
    case IN_CONTROLLER_DISABLE_TRIGGER_AND_BLINK:
      this->gameController->disableAndBlink();
      break;
    case IN_CONTROLLER_CHANGE_TOLERANCE:
      this->gameController->changeTolerance(buffer[1]);
      break;
    case IN_CONTROLLER_GET_STATE:
      return processControllerGetState();
    case IN_CONTROLLER_RESET:
      return processControllerReset();
    default:
      return computeMsg(0, NULL);
  }
  return computeMsg(0, NULL);
}

Msg CommService::processControllerConnected() {
  gameController->setConnected(true);
  gameController->setColor(CRGB(buffer[1], buffer[2], buffer[3]));
  return computeMsg(2, gameController->getState());
}

void(* resetFunc) (void) = 0; //declare reset function @ address 0

Msg CommService::processControllerReset() {
  // asm volatile ("  jmp 0"); 
  resetFunc();
  return computeMsg(0, NULL);
}

Msg CommService::processControllerGetState() {
  return computeMsg(2, gameController->getState());
}

Msg CommService::processControllerStartCalibration() {
  this->gameController->disableAndBlink();
  this->gameController->calibrate();
  return computeMsg(2, gameController->getState());
  
}

Msg CommService::computeMsg(byte size, byte* src) {
  byte* data = (byte*) malloc(size + END_MESSAGE_SIZE);
  if (size > 0) {
    memcpy(data, src, size);
  }
  free(src);
  memcpy(data + size, END_MESSAGE, END_MESSAGE_SIZE);
  return Msg{size + END_MESSAGE_SIZE, data};
}
