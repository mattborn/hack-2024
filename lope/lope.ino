#include "HX711.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Pin Definitions
const int LOADCELL_DOUT_PIN = 2;
const int LOADCELL_SCK_PIN = 3;
const int MOTOR_CONTROL_PIN = 9;  // PWM output
const int BATTERY_SENSE_PIN = A0;
const int ASSIST_LEVEL_PIN = A1;  // Potentiometer for assist level

// Constants
const float FORCE_THRESHOLD = 1.0;    // Minimum force to start assist
const float MAX_FORCE = 15.0;         // Maximum force for full power
const float MAX_SPEED = 8.0;          // Maximum speed in km/h
const float ACCEL_RATE = 0.1;         // Power increase per 10ms
const float DECEL_RATE = 0.2;         // Power decrease per 10ms
const float BATTERY_FULL = 42.0;      // Full battery voltage
const float BATTERY_LOW = 34.0;       // Low battery voltage
const float CALIBRATION_FACTOR = -7050.0;  // Adjust based on load cell

// Objects
HX711 loadCell;
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Set I2C address

// Variables
float currentForce = 0.0;
float currentPower = 0.0;
float targetPower = 0.0;
float batteryVoltage = 0.0;
float assistLevel = 0.5;
unsigned long lastUpdate = 0;
bool systemEnabled = false;

void setup() {
  Serial.begin(9600);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.print("LOPE Starting...");
  
  // Initialize load cell
  loadCell.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  loadCell.set_scale(CALIBRATION_FACTOR);
  loadCell.tare();
  
  // Initialize motor control
  pinMode(MOTOR_CONTROL_PIN, OUTPUT);
  analogWrite(MOTOR_CONTROL_PIN, 0);
  
  delay(1000);
  lcd.clear();
}

void loop() {
  // Read sensors every 10ms
  if (millis() - lastUpdate >= 10) {
    readSensors();
    updatePower();
    updateMotor();
    updateDisplay();
    lastUpdate = millis();
  }
}

void readSensors() {
  // Read force from strain gauge
  if (loadCell.is_ready()) {
    currentForce = loadCell.get_units();
  }
  
  // Read battery voltage
  int batteryRaw = analogRead(BATTERY_SENSE_PIN);
  batteryVoltage = map(batteryRaw, 0, 1023, 0, 42000) / 1000.0;
  
  // Read assist level (0.2 to 1.0)
  int assistRaw = analogRead(ASSIST_LEVEL_PIN);
  assistLevel = map(assistRaw, 0, 1023, 20, 100) / 100.0;
  
  // Enable system only if battery voltage is safe
  systemEnabled = (batteryVoltage > BATTERY_LOW);
}

void updatePower() {
  if (!systemEnabled) {
    targetPower = 0;
    return;
  }
  
  // Calculate target power based on force
  if (currentForce > FORCE_THRESHOLD) {
    float normalizedForce = constrain(currentForce, 0, MAX_FORCE) / MAX_FORCE;
    targetPower = normalizedForce * assistLevel * 255;  // PWM max is 255
  } else {
    targetPower = 0;
  }
  
  // Gradually adjust current power to target
  if (currentPower < targetPower) {
    currentPower = min(currentPower + (255 * ACCEL_RATE), targetPower);
  } else if (currentPower > targetPower) {
    currentPower = max(currentPower - (255 * DECEL_RATE), targetPower);
  }
}

void updateMotor() {
  // Only output power if system is enabled
  if (systemEnabled) {
    analogWrite(MOTOR_CONTROL_PIN, (int)currentPower);
  } else {
    analogWrite(MOTOR_CONTROL_PIN, 0);
  }
}

void updateDisplay() {
  static unsigned long lastDisplayUpdate = 0;
  
  // Update display every 500ms to prevent flicker
  if (millis() - lastDisplayUpdate >= 500) {
    lcd.clear();
    
    // First line: Force and Power
    lcd.setCursor(0, 0);
    lcd.print("F:");
    lcd.print(currentForce, 1);
    lcd.print("kg P:");
    lcd.print((int)(currentPower / 2.55));
    lcd.print("%");
    
    // Second line: Battery and Assist
    lcd.setCursor(0, 1);
    lcd.print("B:");
    lcd.print(batteryVoltage, 1);
    lcd.print("V A:");
    lcd.print((int)(assistLevel * 100));
    lcd.print("%");
    
    lastDisplayUpdate = millis();
  }
}
