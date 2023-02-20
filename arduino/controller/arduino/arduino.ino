// #include <WebUSB.h>

// #include "WebUSB.h"

#include "configuration.h"
#include "SerialClient.h"
#include "BumperController.h"
#include "SPIClient.h"
#include "board.h"

Board board = {
  {
    {BUMPER_1_ID, BUMPER_1_PIN, CRGB(BUMPER_1_COLOR), false, false, false, false, 0},
    {BUMPER_2_ID, BUMPER_2_PIN, CRGB(BUMPER_2_COLOR), false, false, false, false, 0},
    {BUMPER_3_ID, BUMPER_3_PIN, CRGB(BUMPER_3_COLOR), false, false, false, false, 0},
    {BUMPER_4_ID, BUMPER_4_PIN, CRGB(BUMPER_4_COLOR), false, false, false, false, 0}
  }
};

SPIClient spiClient = SPIClient();
SerialClient serialClient = SerialClient();
BumperController ctrl = BumperController(&board, &spiClient, &serialClient);

void setup() {
  #ifdef DEBUG_MODE
    Serial.begin(BAUD_RATE);
    while(!Serial);
    delay(1000);
    Serial.println("started");
  #endif
  ctrl.init();
}

void loop() {
    ctrl.tick();
}
