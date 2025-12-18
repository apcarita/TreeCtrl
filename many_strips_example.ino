/*
 * Control MANY LED strips (30+) with ESP32
 * Uses array-based approach for easy management
 * 
 * Useful pins on ESP32:
 * GPIO: 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33
 * Avoid: 0, 1, 6-11 (boot/flash), 34-39 (input only)
 */

#include <FastLED.h>

#define NUM_STRIPS 8       // Can go up to ~16 on ESP32
#define LEDS_PER_STRIP 10  // Adjust based on your setup

// Pin assignments - add more as needed
const uint8_t LED_PINS[NUM_STRIPS] = {
  14, 27, 26, 25, 33, 32, 23, 22
  // Add more: 21, 19, 18, 17, 16, 15, 13, 12, 5, 4, 2
};

// LED array - each strip gets its own array
CRGB leds[NUM_STRIPS][LEDS_PER_STRIP];

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Many Strips LED Control - ESP32");
  Serial.printf("Strips: %d\n", NUM_STRIPS);
  Serial.printf("LEDs per strip: %d\n", LEDS_PER_STRIP);
  Serial.printf("Total LEDs: %d\n", NUM_STRIPS * LEDS_PER_STRIP);
  
  // Add all strips dynamically
  // Unfortunately FastLED requires compile-time pin specification
  // So we need to add each manually:
  FastLED.addLeds<WS2812B, 14, GRB>(leds[0], LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 27, GRB>(leds[1], LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 26, GRB>(leds[2], LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 25, GRB>(leds[3], LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 33, GRB>(leds[4], LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 32, GRB>(leds[5], LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 23, GRB>(leds[6], LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 22, GRB>(leds[7], LEDS_PER_STRIP);
  // Add more as needed...
  
  FastLED.setBrightness(51);
  FastLED.clear();
  FastLED.show();
  
  Serial.println("Setup complete!");
}

void loop() {
  // Easy access: leds[strip][led]
  
  // Example 1: Light each strip sequentially
  for (int strip = 0; strip < NUM_STRIPS; strip++) {
    fill_solid(leds[strip], LEDS_PER_STRIP, CRGB::Red);
    FastLED.show();
    Serial.printf("Strip %d ON\n", strip);
    delay(300);
    fill_solid(leds[strip], LEDS_PER_STRIP, CRGB::Black);
  }
  FastLED.show();
  delay(1000);
  
  // Example 2: Radial pattern (for volumetric display)
  for (int angle = 0; angle < 360; angle += 5) {
    for (int strip = 0; strip < NUM_STRIPS; strip++) {
      // Calculate which LED should be lit based on rotation angle
      int stripAngle = (strip * 360 / NUM_STRIPS);
      int hue = (stripAngle + angle) % 255;
      
      for (int led = 0; led < LEDS_PER_STRIP; led++) {
        leds[strip][led] = CHSV(hue, 255, 255 * led / LEDS_PER_STRIP);
      }
    }
    FastLED.show();
    delay(20);
  }
  
  FastLED.clear();
  FastLED.show();
  delay(1000);
}

// Helper function: Set a specific LED on a specific strip
void setPixel(int strip, int led, CRGB color) {
  if (strip < NUM_STRIPS && led < LEDS_PER_STRIP) {
    leds[strip][led] = color;
  }
}

// Helper function: Clear a specific strip
void clearStrip(int strip) {
  if (strip < NUM_STRIPS) {
    fill_solid(leds[strip], LEDS_PER_STRIP, CRGB::Black);
  }
}



