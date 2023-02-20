#include "BoardStateHandler.h"
#include "board.h"
#include "configuration.h"

BoardStateHandler::BoardStateHandler(Board* board) {
  this->board = board;
  this->previousBoard = (Board*) malloc(sizeof(struct Board));
  memcpy(this->previousBoard, this->board, sizeof(struct Board));
}

void BoardStateHandler::init() {
  byte bumperCount = (sizeof(board->bumpers) / sizeof(struct Bumper));
  for (int i = 0; i < bumperCount; i++) {
    pinMode(board->bumpers[i].pin, OUTPUT);
  }
}

void BoardStateHandler::refreshState(byte id, byte* state) {
  Bumper* pT = &(previousBoard->bumpers[id]);
  Bumper* cT = &(board->bumpers[id]);
  memcpy(pT, cT, sizeof(struct Bumper));
  // State is [0b 0000 HEKC, tolerance]
  // H is hit
  // E is enabled
  // K is calibrating
  // C is connected
  cT->connected = state[0] & 0x01;
  cT->calibrating = state[0] & 0x02;
  cT->enabled = state[0] & 0x04;
  cT->hit = state[0] & 0x08;
  cT->tolerance = state[1];
}

bool BoardStateHandler::hasHitChanged() {
  bool r = false;
  byte bumperCount = (sizeof(board->bumpers) / sizeof(struct Bumper));
  for (int i = 0; i < bumperCount; i++) {
    if (board->bumpers[i].connected && (board->bumpers[i].hit != previousBoard->bumpers[i].hit)) {
      r = true;
    }
  }
  return r;
}

bool BoardStateHandler::hasCalibrationChanged() {
  bool r = false;
  byte bumperCount = (sizeof(board->bumpers) / sizeof(struct Bumper));
  for (int i = 0; i < bumperCount; i++) {
    if (board->bumpers[i].calibrating != previousBoard->bumpers[i].calibrating) {
      r = true;
    }
  }
  return r;
}

bool BoardStateHandler::isCalibrated() {
  bool r = true;
  byte bumperCount = (sizeof(board->bumpers) / sizeof(struct Bumper));
  for (int i = 0; i < bumperCount; i++) {
    if (board->bumpers[i].calibrating) {
      r = false;
    }
  }
  return r;
}

bool BoardStateHandler::isHit() {
  bool r = false;
  byte bumperCount = (sizeof(board->bumpers) / sizeof(struct Bumper));
  for (int i = 0; i < bumperCount; i++) {
    if (board->bumpers[i].hit) {
      r = true;
    }
  }
  #ifdef DEBUG_MODE
  if (r) {
    byte bumperCount = (sizeof(board->bumpers) / sizeof(struct Bumper));
    for (int i = 0; i < bumperCount; i++) {
      if (board->bumpers[i].hit) {
        #ifdef DEBUG_MODE
        Serial.print("Hit bumper ");
        Serial.println(board->bumpers[i].id);
        #endif
      }
    }
  }
  #endif
  return r;
}

void BoardStateHandler::prettyPrint() {
  byte bumperCount = (sizeof(board->bumpers) / sizeof(struct Bumper));
  Serial.println("-------------------------------");
  for (int i = 0; i < bumperCount; i++) {
    Serial.print("Bumper ");
    Serial.print(board->bumpers[i].id);
    Serial.print(" connected: ");
    Serial.print(board->bumpers[i].connected);
    Serial.print(" calibrating: ");
    Serial.print(board->bumpers[i].calibrating);
    Serial.print(" enabled: ");
    Serial.print(board->bumpers[i].enabled);
    Serial.print(" hit: ");
    Serial.print(board->bumpers[i].hit);
    Serial.print(" tolerance: ");
    Serial.print(board->bumpers[i].tolerance);
    Serial.println("");
  }
}
