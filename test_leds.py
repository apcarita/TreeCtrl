#!/usr/bin/env python3
"""
WS2812B LED Strip Test Script for Raspberry Pi

WIRING:
- LED Strip DIN  -> GPIO 18 (Pin 12)
- LED Strip GND  -> Pi GND (Pin 6) AND Power Supply GND
- LED Strip 5V   -> External USB Power Supply 5V

For testing only (max ~10 LEDs): Can power from Pi's 5V pin
For full strip: MUST use external power supply
"""

import time
from rpi_ws281x import PixelStrip, Color

# Configuration
LED_COUNT = 10       # Start with just 10 LEDs for testing
LED_PIN = 18         # GPIO 18 (PWM capable)
LED_FREQ_HZ = 800000 # LED signal frequency in hertz
LED_DMA = 10         # DMA channel to use for generating signal
LED_BRIGHTNESS = 51  # 0-255, starting at 20% (51/255)
LED_INVERT = False   # True to invert the signal
LED_CHANNEL = 0      # 0 or 1

# Initialize the LED strip
pixels = PixelStrip(
    LED_COUNT,
    LED_PIN,
    LED_FREQ_HZ,
    LED_DMA,
    LED_INVERT,
    LED_BRIGHTNESS,
    LED_CHANNEL
)
pixels.begin()


def clear():
    """Turn off all LEDs"""
    for i in range(pixels.numPixels()):
        pixels.setPixelColor(i, Color(0, 0, 0))
    pixels.show()


def test_individual_control():
    """Test individual LED control"""
    print("Testing individual LED control...")
    clear()
    
    # Light up each LED one at a time in different colors
    colors = [
        Color(255, 0, 0),    # Red
        Color(0, 255, 0),    # Green
        Color(0, 0, 255),    # Blue
        Color(255, 255, 0),  # Yellow
        Color(255, 0, 255),  # Magenta
        Color(0, 255, 255),  # Cyan
        Color(255, 255, 255) # White
    ]
    
    for i in range(LED_COUNT):
        color = colors[i % len(colors)]
        pixels.setPixelColor(i, color)
        pixels.show()
        print(f"LED {i}: RGB color")
        time.sleep(0.3)
    
    time.sleep(1)
    clear()


def test_rainbow_chase():
    """Create a rainbow chase effect"""
    print("Testing rainbow chase...")
    
    def wheel(pos):
        """Generate rainbow colors across 0-255 positions"""
        if pos < 85:
            return Color(pos * 3, 255 - pos * 3, 0)
        elif pos < 170:
            pos -= 85
            return Color(255 - pos * 3, 0, pos * 3)
        else:
            pos -= 170
            return Color(0, pos * 3, 255 - pos * 3)
    
    for j in range(255):
        for i in range(LED_COUNT):
            pixel_index = (i * 256 // LED_COUNT) + j
            pixels.setPixelColor(i, wheel(pixel_index & 255))
        pixels.show()
        time.sleep(0.02)
    
    clear()


def test_all_same_color():
    """Test all LEDs same color"""
    print("Testing all LEDs same color...")
    
    colors = [
        Color(255, 0, 0),    # Red
        Color(0, 255, 0),    # Green
        Color(0, 0, 255),    # Blue
        Color(255, 255, 255) # White
    ]
    
    for color in colors:
        print(f"All LEDs: color")
        for i in range(pixels.numPixels()):
            pixels.setPixelColor(i, color)
        pixels.show()
        time.sleep(1)
    
    clear()


def main():
    print("=" * 50)
    print("WS2812B LED Strip Test")
    print("=" * 50)
    print(f"LED Count: {LED_COUNT}")
    print(f"Brightness: {LED_BRIGHTNESS}/255 ({int(LED_BRIGHTNESS/255*100)}%)")
    print(f"Pin: GPIO 18")
    print("=" * 50)
    print()
    
    try:
        # Run tests
        test_all_same_color()
        time.sleep(0.5)
        
        test_individual_control()
        time.sleep(0.5)
        
        test_rainbow_chase()
        
        print("\nAll tests complete!")
        
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    finally:
        clear()
        print("LEDs cleared")


if __name__ == "__main__":
    main()

