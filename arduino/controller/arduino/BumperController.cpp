#include "BumperController.h"
#include "SerialClient.h"
#include "SPIClient.h"
#include "board.h"
#include "configuration.h"
#include "BoardStateHandler.h"

BumperController::BumperController(Board* board, SPIClient* spiClient, SerialClient* serialClient) {
  this->board = board;
  this->boardStateHandler = new BoardStateHandler(board);
  this->spiClient = spiClient;
  this->serialClient = serialClient;
}

void BumperController::init() {
  serialClient->init(this);
  boardStateHandler->init();
  byte bumperCount = (sizeof(board->bumpers) / sizeof(Bumper));
  byte pins[bumperCount];
  for (byte i = 0; i < bumperCount; i++) {
    pins[i] = board->bumpers[i].pin;
  }
  spiClient->init(pins);
}

void BumperController::tick() {
  serialClient->tick();
  if (!connected) {
    return;
  }
  this->refreshStates();
  #ifdef DEBUG_MODE
  /* if (millis() - lastMillis > 1000) {
    lastMillis = millis();
    boardStateHandler->prettyPrint();
  } */
  #endif
  if (this->boardStateHandler->hasHitChanged() && this->boardStateHandler->isHit()) {
    confirmHit();
  }
  if (this->boardStateHandler->hasCalibrationChanged() && this->boardStateHandler->isCalibrated()) {
    sendCalibrationFinished();
  }
}


void BumperController::initBumpers() {
  Bumper* t;
  byte bumperCount = (sizeof(board->bumpers) / sizeof(Bumper));
  for (int i = 0; i < bumperCount; i++) {
    t = &(board->bumpers[i]);
    byte* state = spiClient->initBumper(t->pin, t->color);
    boardStateHandler->refreshState(t->id, state);
    free(state);
  }
}

bool BumperController::isConnected() {
  return connected;
}

void BumperController::setConnected(bool connected) {
  this->connected = connected;
  if (!connected) {
    #ifdef DEBUG_MODE
    Serial.println("Device disconnected from controller");
    #endif
  } else {
    #ifdef DEBUG_MODE
    Serial.println("Device connected to controller");
    #endif
    initBumpers();
    #ifdef DEBUG_MODE
    boardStateHandler->prettyPrint();
    #endif
    byte* state = getState();
    this->serialClient->sendConnected(state);
    free(state);
  }
}

void BumperController::changeTolerance(byte bumperId, byte tolerance) {
  spiClient->changeTolerance(board->bumpers[bumperId].pin, tolerance);
  refreshState(bumperId);
}


void BumperController::startCalibration(byte bumperId) {
  spiClient->startCalibration(board->bumpers[bumperId].pin);
  refreshState(bumperId);
}


void BumperController::enableBumpers() {
  byte bumperCount = (sizeof(board->bumpers) / sizeof(Bumper));
  for (byte i = 0; i < bumperCount; i++) {
    spiClient->enable(board->bumpers[i].pin);
    refreshState(i);
  }
}

void BumperController::enableBumper(byte bumperId) {
  spiClient->enable(board->bumpers[bumperId].pin);
  refreshState(bumperId);
}

void BumperController::disableBumper(byte bumperId) {
  spiClient->disable(board->bumpers[bumperId].pin);
  refreshState(bumperId);
}


void BumperController::disableAndBlinkBumper(byte bumperId) {
  spiClient->disableAndBlink(board->bumpers[bumperId].pin);
  refreshState(bumperId);
}


void BumperController::disableAndBlinkBumpers() {
  byte bumperCount = (sizeof(board->bumpers) / sizeof(Bumper));
  for (byte i = 0; i < bumperCount; i++) {
    spiClient->disableAndBlink(board->bumpers[i].pin);
    refreshState(i);
  }
}


void BumperController::refreshStates() {
  byte bumperCount = (sizeof(board->bumpers) / sizeof(Bumper));
  for (byte i = 0; i < bumperCount; i++) {
    refreshState(i);
  }
}

void BumperController::refreshState(byte bumperId) {
  Bumper* t = &(board->bumpers[bumperId]);
  byte* state = spiClient->getState(t->pin);
  boardStateHandler->refreshState(t->id, state);
  free(state);
}


void BumperController::confirmHit() {
  byte* state = getState();
  this->serialClient->sendBumperHit(state);
  free(state);
  #ifdef DEBUG_MODE
    Serial.println("HIT Confirmed");
  #endif
}


void BumperController::sendCalibrationFinished() {
  byte* state = getState();
  this->serialClient->sendCalibrationFinished(state);
  free(state);
  #ifdef DEBUG_MODE
    Serial.println("Calibration Finished");
  #endif
}

byte* BumperController::getState() {
  byte* state = new byte[CONTROLLER_STATE_SIZE];
  byte i = 0;
  Bumper* t;
  byte bumperCount = (sizeof(board->bumpers) / sizeof(Bumper));
  for (byte i = 0; i < bumperCount; i++) {
    t = &(board->bumpers[i]);
    state[3 * i] = t->id;
    state[3 * i + 1] = t->connected + (t->calibrating << 1) + (t->enabled << 2) + (t->hit << 3);
    state[3 * i + 2] = t->tolerance;
  }
  return state;
}


void BumperController::resetBumpers() {
  byte bumperCount = (sizeof(board->bumpers) / sizeof(Bumper));
  for (byte i = 0; i < bumperCount; i++) {
    Bumper* t = &(board->bumpers[i]);
    spiClient->reset(t->pin);
  }
}
