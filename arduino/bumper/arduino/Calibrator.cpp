#include "Calibrator.h"
#include "board.h"
#include "configuration.h"


Calibrator::Calibrator(Trigger* trigger) {
  this->trigger = trigger;
  reset();
}

void Calibrator::start() {
  maxThreshold = 0;
  loops = 0;
  lastVal = 0;
  done = false;
  #ifdef DEBUG_MODE
  Serial.println("Calibration started");
  #endif
}

void Calibrator::reset() {
  maxThreshold = 0;
  loops = -1;
  lastVal = 0;
  done = false;
  Serial.println("Calibration reset");
}

void Calibrator::tick() {
  if (loops == (CALIBRATION_IT_COUNT - 1)) {
    #ifdef DEBUG_MODE
    Serial.print("Calibration finished. Threshold was:");
    Serial.print(trigger->threshold);
    Serial.print(" now is ");
    Serial.println(maxThreshold);
    Serial.print(" actual is ");
    Serial.println(maxThreshold * 1.2);

    #endif
    trigger->threshold = maxThreshold*1.2;
    ++loops;
    return;
  }
  lastVal = analogRead(trigger->btn);
  if (lastVal > maxThreshold) {
    maxThreshold = lastVal;
  }
  delay(2);
  ++loops;
}


bool Calibrator::hasCalibrationStateChanged() {
  if(loops == CALIBRATION_IT_COUNT && !done) {
    done = true;
    return true;
  }
  return false;
}

bool Calibrator::isDone() {
  return loops == CALIBRATION_IT_COUNT;
}

bool Calibrator::isCalibrating() {
  return loops > -1 && loops < CALIBRATION_IT_COUNT;
}
