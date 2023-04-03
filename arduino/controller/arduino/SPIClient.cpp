#include "SPIClient.h"
#include "configuration.h"
#include "board.h"
#include <SPI.h>

SPIClient::SPIClient() {
}

void SPIClient::init(byte* pins) {
  // SPI initialization
  SPI.begin();
  SPI.setClockDivider(SPI_CLOCK_DIV8);
  for (byte i = 0; i < sizeof(pins); i++) {
    pinMode(pins[i], OUTPUT);
    digitalWrite(pins[i], HIGH);
  }
}

byte* SPIClient::initBumper(byte pin, CRGB color) {
  #ifdef DEBUG_MODE
  Serial.print("Initializing bumper on pin ");
  Serial.println(pin);
  #endif
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_CONNECT);
  transferSPI(color.red);
  transferSPI(color.green);
  transferSPI(color.blue);
  bool connected = getResponseBuffer();
  digitalWrite(pin, HIGH);
  if (!connected) {
    #ifdef DEBUG_MODE
    Serial.println("Bumper is not connected");
    #endif
    return new byte[2]{0x00, 0x00};
  }
  return new byte[2]{buffer[0], buffer[1]};
}

bool SPIClient::startCalibration(byte pin) {
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_START_CALIBRATION);
  bool success = getResponseBuffer();
  digitalWrite(pin, HIGH);
  return success;
}

bool SPIClient::changeTolerance(byte pin, byte tolerance) {
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_CHANGE_TOLERANCE);
  transferSPI(tolerance);
  bool success = getResponseBuffer();
  digitalWrite(pin, HIGH);
  return success;
}


bool SPIClient::enable(byte pin) {
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_ENABLE);
  bool success = getResponseBuffer();
  digitalWrite(pin, HIGH);
  return success;
}


bool SPIClient::disable(byte pin) {
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_DISABLE);
  bool success = getResponseBuffer();
  digitalWrite(pin, HIGH);
  return success;
}


bool SPIClient::disableAndBlink(byte pin) {
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_DISABLE_AND_BLINK);
  bool success = getResponseBuffer();
  digitalWrite(pin, HIGH);
  return success;
}


byte* SPIClient::getState(byte pin) {
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_GET_STATE);
  bool success = getResponseBuffer();
  digitalWrite(pin, HIGH);
  if (success) {
    return new byte[2]{buffer[0], buffer[1]};
  }
  return new byte[2]{0x00, 0x00};
}


bool SPIClient::reset(byte pin) {
  digitalWrite(pin, LOW);
  transferSPI(OUT_BUMPER_RESET);
  bool success = getResponseBuffer();
  digitalWrite(pin, HIGH);
  return success;
}

bool SPIClient::getResponseBuffer() {
  byte c = 0;
  byte bufferSize = *(&buffer + 1) - buffer;
  do {
    buffer[c] = transferSPI(0x00);
  } while (++c < bufferSize && (c < END_MESSAGE_SIZE || (buffer[c - END_MESSAGE_SIZE] != END_MESSAGE[0] && buffer[c - END_MESSAGE_SIZE + 1] != END_MESSAGE[1])));
  #ifdef DEBUG_MODE_SPI
  Serial.print("Inc ");
  Serial.print(c);
  Serial.print(" bytes: ");
  Serial.print(buffer[0]);
  Serial.print(" ");
  Serial.print(buffer[1]);
  Serial.print(" ");
  Serial.print(buffer[2]);
  Serial.print(" ");
  Serial.println(buffer[3]);
  #endif
  return (c >= END_MESSAGE_SIZE && buffer[c - END_MESSAGE_SIZE] == END_MESSAGE[0] && buffer[c - END_MESSAGE_SIZE + 1] == END_MESSAGE[1]);
}

byte SPIClient::transferSPI(byte c) {
  byte i = SPI.transfer(c);
  delay(10);
  return i;
}
