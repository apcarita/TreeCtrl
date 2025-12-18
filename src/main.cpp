/*
 * Christmas Tree LED Effect for ESP32
 * 
 * WIRING:
 * - LED Strip 1 DIN -> GPIO 14
 * - LED Strip 2 DIN -> GPIO 27
 * - LED Strip 3 DIN -> GPIO 26
 * - LED Strip 4 DIN -> GPIO 25
 * - All GND -> ESP32 GND AND Power Supply GND (common ground!)
 * - All 5V -> External Power Supply 5V
 * 
 * IMPORTANT: Connect grounds together! ESP32 GND must connect to Power Supply GND
 * 
 * Effect: 80% Green, 15% Red, 5% Blue - changes every 5 seconds
 * Library: FastLED
 */

#include <Arduino.h>
#include <FastLED.h>

// Configuration
#define LED_PIN_1 14
#define LED_PIN_2 27
#define LED_PIN_3 26
#define LED_PIN_4 25
#define NUM_LEDS 600        // LEDs per strip
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB     // WS2812B uses GRB order
#define BRIGHTNESS 20       // 0-255, starting at 20% (51/255)
                            // Keep low for testing! High brightness = high current

CRGB leds1[NUM_LEDS];
CRGB leds2[NUM_LEDS];
CRGB leds3[NUM_LEDS];
CRGB leds4[NUM_LEDS];

// Timing variables
unsigned long lastChangeTime = 0;
const unsigned long CHANGE_INTERVAL = 3000;  // Change pattern every 5 seconds

// Randomize LEDs with Christmas colors: 80% green, 15% red, 5% blue
void randomizeChristmasColors(CRGB* strip, int numLeds) {
  for (int i = 0; i < numLeds; i++) {
    int randVal = random(100);  // 0-99
    if (randVal < 80) {
      strip[i] = CRGB::Green;   // 80%
    } else if (randVal < 95) {
      strip[i] = CRGB::Red;     // 15%
    } else {
      strip[i] = CRGB::Blue;    // 5%
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("======================================");
  Serial.println("Christmas Tree Effect (4 Strips)");
  Serial.println("======================================");
  Serial.printf("LED Count per strip: %d\n", NUM_LEDS);
  Serial.printf("Pins: GPIO 14, 27, 26, 25\n");
  Serial.printf("Brightness: %d/255 (%d%%)\n", BRIGHTNESS, (int)(BRIGHTNESS * 100 / 255));
  Serial.println("Colors: 80% Green, 15% Red, 5% Blue");
  Serial.println("Pattern changes every 5 seconds");
  Serial.println("======================================");
  
  // Initialize random seed
  randomSeed(analogRead(0));
  
  // Initialize all 4 LED strips
  FastLED.addLeds<LED_TYPE, LED_PIN_1, COLOR_ORDER>(leds1, NUM_LEDS);
  FastLED.addLeds<LED_TYPE, LED_PIN_2, COLOR_ORDER>(leds2, NUM_LEDS);
  FastLED.addLeds<LED_TYPE, LED_PIN_3, COLOR_ORDER>(leds3, NUM_LEDS);
  FastLED.addLeds<LED_TYPE, LED_PIN_4, COLOR_ORDER>(leds4, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  
  // Set initial random pattern
  randomizeChristmasColors(leds1, NUM_LEDS);
  randomizeChristmasColors(leds2, NUM_LEDS);
  randomizeChristmasColors(leds3, NUM_LEDS);
  randomizeChristmasColors(leds4, NUM_LEDS);
  FastLED.show();
  
  lastChangeTime = millis();
  Serial.println("Christmas tree effect started!");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Change pattern every 5 seconds
  if (currentTime - lastChangeTime >= CHANGE_INTERVAL) {
    Serial.println("Changing pattern...");
    
    randomizeChristmasColors(leds1, NUM_LEDS);
    randomizeChristmasColors(leds2, NUM_LEDS);
    randomizeChristmasColors(leds3, NUM_LEDS);
    randomizeChristmasColors(leds4, NUM_LEDS);
    FastLED.show();
    
    lastChangeTime = currentTime;
    Serial.printf("Uptime: %lu seconds\n", currentTime / 1000);
  }
  
  delay(50);  // Small delay to prevent tight loop
}




