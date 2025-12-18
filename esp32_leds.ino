/*
 * WS2812B LED Strip Test for ESP32
 * 
 * WIRING:
 * - LED Strip DIN (white) -> GPIO 14 (D14)
 * - LED Strip GND (green) -> ESP32 GND AND Power Supply GND (common ground!)
 * - LED Strip 5V (red)    -> External Power Supply 5V
 * 
 * IMPORTANT: Connect grounds together! ESP32 GND must connect to Power Supply GND
 * 
 * Library: FastLED
 * Install via Arduino IDE: Tools -> Manage Libraries -> Search "FastLED"
 */

#include <FastLED.h>

// Configuration
#define LED_PIN 14          // GPIO 14 (D14)
#define NUM_LEDS 300        // Full strip - all 300 LEDs
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB     // WS2812B uses GRB order
#define BRIGHTNESS 51       // 0-255, starting at 20% (51/255)
                            // Keep low for testing! High brightness = high current

CRGB leds[NUM_LEDS];

// Debug variables
unsigned long frameCount = 0;
unsigned long lastDebugTime = 0;
const unsigned long DEBUG_INTERVAL = 1000;  // Print debug info every 1 second

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("======================================");
  Serial.println("LED Flash Test - 5Hz Blue");
  Serial.println("======================================");
  Serial.printf("LED Count: %d\n", NUM_LEDS);
  Serial.printf("Pin: GPIO %d\n", LED_PIN);
  Serial.printf("Brightness: %d/255 (%d%%)\n", BRIGHTNESS, (int)(BRIGHTNESS * 100 / 255));
  Serial.println("Flash Rate: 5Hz (200ms period)");
  Serial.println("======================================");
  
  // Initialize LED strip
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  FastLED.show();
  
  Serial.println("Starting flash sequence...");
}

void loop() {
  unsigned long loopStartTime = millis();
  
  // Flash blue at 5Hz
  // 5Hz = 5 flashes per second = 200ms period
  // On for 100ms, off for 100ms
  
  fill_solid(leds, NUM_LEDS, CRGB::Blue);
  FastLED.show();
  delay(100);  // 100ms on
  
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  FastLED.show();
  delay(100);  // 100ms off
  
  frameCount++;
  
  // Print debug info every second
  if (loopStartTime - lastDebugTime >= DEBUG_INTERVAL) {
    unsigned long elapsed = loopStartTime - lastDebugTime;
    float actualHz = (frameCount * 1000.0) / elapsed;
    
    Serial.println("--------------------------------------");
    Serial.printf("Frames: %lu\n", frameCount);
    Serial.printf("Elapsed: %lu ms\n", elapsed);
    Serial.printf("Actual Rate: %.2f Hz (target: 5 Hz)\n", actualHz);
    Serial.printf("Uptime: %lu seconds\n", loopStartTime / 1000);
    
    // Reset counters
    frameCount = 0;
    lastDebugTime = loopStartTime;
  }
}


