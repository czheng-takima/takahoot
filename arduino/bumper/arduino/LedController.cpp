#include "LedController.h"
#include "board.h"
#include "configuration.h"

LedController::LedController() {
  this->isBlinking = false;
  this->lastBlink = millis();
  this->lastBlinkValue = false;
  pinMode(LED_PIN, OUTPUT);
  FastLED.addLeds<LED_TYPE, LED_PIN>(leds, NUM_LEDS).setCorrection( TypicalLEDStrip );
  FastLED.setBrightness(BRIGHTNESS);
  color = CRGB::Black;
}

void LedController::reset() {
  for( int i = 0; i < NUM_LEDS; i++) {
    leds[i] = color;
  }
  FastLED.show();
}

void LedController::setConnected(bool connected) {
  reset();
}

void LedController::setColor(CRGB rgb) {
  for( int i = 0; i < NUM_LEDS; i++) {
      leds[i] = rgb;
  }
  color = rgb;
  isBlinking = false;
  FastLED.show();
}


void LedController::blinkColor(CRGB rgb) {
  for( int i = 0; i < NUM_LEDS; i++) {
      leds[i] = rgb;
  }
  color = rgb;
  isBlinking = true;
  FastLED.show();
}


void LedController::setReady(bool ready) {
  reset();
  if (ready) {
    // FIXME
    // digitalWrite(LED_YELLOW_PIN, HIGH);
    #ifdef DEBUG_MODE
      Serial.println("Led Yellow is high");
    #endif
  } else {
    // digitalWrite(LED_RED_PIN, HIGH);
    #ifdef DEBUG_MODE
      Serial.println("Led Red is high");
    #endif
  }
}

void LedController::tick() {
  if (isBlinking) {
    tickBlink();
  }
}

void LedController::tickBlink() {
  if ((millis() - lastBlink) < LED_BLINK_TIME_MS) {
    return;
  }
  lastBlink = millis();
  lastBlinkValue = !lastBlinkValue;
  if (lastBlinkValue) {
    palette = computeSingleColorPalette(color);
  } else {
    palette = computeBlackPalette();
  }
  
  for( int i = 0; i < NUM_LEDS; i++) {
    leds[i] = ColorFromPalette(palette, 0, BRIGHTNESS, blending);
  }
  FastLED.show();
/*   #ifdef DEBUG_MODE
    Serial.print("Leds are Blinking ");
    Serial.println(lastBlinkValue ? "ON" : "OFF");
  #endif */
}


CRGBPalette16 LedController::computeBlackPalette() {
  return CRGBPalette16(CRGB::Black);
}

CRGBPalette16 LedController::computeSingleColorPalette(CRGB color) {
  return CRGBPalette16(color);
}

CRGBPalette16 LedController::computeWaveColorPalette(CRGB color) {
  return CRGBPalette16(color);
}
