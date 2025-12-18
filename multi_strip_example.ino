/*
 * Multiple WS2812B LED Strips on ESP32
 * Control up to 8+ strips simultaneously on different pins
 * 
 * Each strip can have different lengths and is controlled independently
 * Perfect for volumetric displays with multiple arms/spokes
 */

#include <FastLED.h>

// Configuration for multiple strips
#define NUM_STRIPS 4
#define LEDS_PER_STRIP 75  // 75 LEDs per strip = 300 total / 4 strips

// Pin assignments (use any GPIO pins)
const uint8_t LED_PINS[NUM_STRIPS] = {14, 27, 26, 25};

// LED arrays - one for each strip
CRGB strip0[LEDS_PER_STRIP];
CRGB strip1[LEDS_PER_STRIP];
CRGB strip2[LEDS_PER_STRIP];
CRGB strip3[LEDS_PER_STRIP];

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Multi-Strip LED Control - ESP32");
  Serial.printf("Strips: %d\n", NUM_STRIPS);
  Serial.printf("LEDs per strip: %d\n", LEDS_PER_STRIP);
  Serial.printf("Total LEDs: %d\n", NUM_STRIPS * LEDS_PER_STRIP);
  
  // Add all strips
  FastLED.addLeds<WS2812B, 14, GRB>(strip0, LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 27, GRB>(strip1, LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 26, GRB>(strip2, LEDS_PER_STRIP);
  FastLED.addLeds<WS2812B, 25, GRB>(strip3, LEDS_PER_STRIP);
  
  FastLED.setBrightness(51);
  FastLED.clear();
  FastLED.show();
  
  Serial.println("Setup complete!");
}

void loop() {
  // Example: Light each strip a different color
  fill_solid(strip0, LEDS_PER_STRIP, CRGB::Red);
  fill_solid(strip1, LEDS_PER_STRIP, CRGB::Green);
  fill_solid(strip2, LEDS_PER_STRIP, CRGB::Blue);
  fill_solid(strip3, LEDS_PER_STRIP, CRGB::Yellow);
  FastLED.show();
  delay(2000);
  
  // Example: Rotating pattern across strips
  for (int offset = 0; offset < 255; offset++) {
    for (int i = 0; i < LEDS_PER_STRIP; i++) {
      strip0[i] = CHSV((i + offset) % 255, 255, 255);
      strip1[i] = CHSV((i + offset + 64) % 255, 255, 255);
      strip2[i] = CHSV((i + offset + 128) % 255, 255, 255);
      strip3[i] = CHSV((i + offset + 192) % 255, 255, 255);
    }
    FastLED.show();
    delay(20);
  }
  
  FastLED.clear();
  FastLED.show();
  delay(500);
}



