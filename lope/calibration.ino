/*
 * Calibration utility for LOPE strain gauge
 * Upload this sketch first to calibrate the load cell
 */

#include "HX711.h"

const int LOADCELL_DOUT_PIN = 2;
const int LOADCELL_SCK_PIN = 3;

HX711 scale;

void setup() {
  Serial.begin(9600);
  Serial.println("LOPE Load Cell Calibration");
  Serial.println("Remove all weight from strain gauge");
  
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale();
  scale.tare();
  
  Serial.println("Place known weight on strain gauge");
  Serial.println("Enter weight in kg in Serial Monitor");
}

void loop() {
  if (scale.is_ready()) {
    if (Serial.available()) {
      float knownWeight = Serial.parseFloat();
      if (knownWeight > 0) {
        long reading = scale.get_units(10);
        float calibrationFactor = reading / knownWeight;
        
        Serial.print("Calibration factor: ");
        Serial.println(calibrationFactor);
        Serial.println("Update CALIBRATION_FACTOR in main sketch");
      }
    }
    
    Serial.print("Raw reading: ");
    Serial.println(scale.get_value());
  }
  delay(100);
}
