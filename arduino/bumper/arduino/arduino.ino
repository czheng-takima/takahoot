#include "configuration.h"
#include "CommService.h"
#include "GameController.h"
#include "LedController.h"
#include "board.h"
#include "msg.h"
#include <SPI.h>

Board board = {
  {BTN_TRIGGER, false, 0, 0},
  2
};

LedController ledController = LedController();
GameController gameController = GameController(&board, &ledController);
CommService commService = CommService(&gameController, &ledController);

// For SPI
int total;
byte sent;
byte* sendBuffer;

void setup() {
    Serial.begin(BAUD_RATE);

    // SPI initialization
    pinMode(SCK, INPUT);
    pinMode(SS, INPUT);
    pinMode(MOSI, INPUT);
    pinMode(MISO, OUTPUT);
    total = 0;
    sent = 0;
    SPCR |= _BV(SPE); // turn on SPI in slave mode
    // turn on interrupts
    SPCR |= _BV(SPIE);
    gameController.init();
}

// SPI interrupt routine
ISR (SPI_STC_vect) {
  byte req = SPDR;
  Msg res = commService.onRequest(req);
  if (res.size > 0) {
    // New command (NULL are no-ops)
    // Get response and put it in buffer. Will send until done.
    sendBuffer = res.data;
    total = res.size;
    sent = 0;
    /* #ifdef DEBUG_MODE
    Serial.print("Sending ");
    Serial.print(total);
    Serial.print(" bytes: ");
    for (int i = 0; i < total; i++) {
      Serial.print(sendBuffer[i]);
      Serial.print("  ");
    }
    Serial.println("");
    #endif */
  }
  if (total - sent > 0) {
    SPDR = sendBuffer[sent];
    sent++;
    // Wait for the end of the transmission
    while (!(SPSR & (1<<SPIF))){}
    if (total - sent == 0) {
      free(sendBuffer);
      sendBuffer = NULL;
    }
  } else {
    SPDR = 0;
  }
}

void loop() {
    // First Priority is checking incoming serial commands
    commService.tick();
    // Normal game cycle
    gameController.tick();

}
