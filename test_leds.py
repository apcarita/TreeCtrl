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
import board
import neopixel

# Configuration
LED_COUNT = 10  # Start with just 10 LEDs for testing
LED_PIN = board.D18  # GPIO 18 (PWM capable)
BRIGHTNESS = 0.2  # 20% brightness for testing (0.0 to 1.0)

# Initialize the LED strip
# auto_write=False means we update all LEDs at once with .show()
pixels = neopixel.NeoPixel(
    LED_PIN,
    LED_COUNT,
    brightness=BRIGHTNESS,
    auto_write=False,
    pixel_order=neopixel.GRB  # WS2812B uses GRB order
)


def clear():
    """Turn off all LEDs"""
    pixels.fill((0, 0, 0))
    pixels.show()


def test_individual_control():
    """Test individual LED control"""
    print("Testing individual LED control...")
    clear()
    
    # Light up each LED one at a time in different colors
    colors = [
        (255, 0, 0),    # Red
        (0, 255, 0),    # Green
        (0, 0, 255),    # Blue
        (255, 255, 0),  # Yellow
        (255, 0, 255),  # Magenta
        (0, 255, 255),  # Cyan
        (255, 255, 255) # White
    ]
    
    for i in range(LED_COUNT):
        color = colors[i % len(colors)]
        pixels[i] = color
        pixels.show()
        print(f"LED {i}: {color}")
        time.sleep(0.3)
    
    time.sleep(1)
    clear()


def test_rainbow_chase():
    """Create a rainbow chase effect"""
    print("Testing rainbow chase...")
    
    def wheel(pos):
        """Generate rainbow colors across 0-255 positions"""
        if pos < 85:
            return (pos * 3, 255 - pos * 3, 0)
        elif pos < 170:
            pos -= 85
            return (255 - pos * 3, 0, pos * 3)
        else:
            pos -= 170
            return (0, pos * 3, 255 - pos * 3)
    
    for j in range(255):
        for i in range(LED_COUNT):
            pixel_index = (i * 256 // LED_COUNT) + j
            pixels[i] = wheel(pixel_index & 255)
        pixels.show()
        time.sleep(0.02)
    
    clear()


def test_all_same_color():
    """Test all LEDs same color"""
    print("Testing all LEDs same color...")
    
    colors = [
        (255, 0, 0),    # Red
        (0, 255, 0),    # Green
        (0, 0, 255),    # Blue
        (255, 255, 255) # White
    ]
    
    for color in colors:
        print(f"All LEDs: {color}")
        pixels.fill(color)
        pixels.show()
        time.sleep(1)
    
    clear()


def main():
    print("=" * 50)
    print("WS2812B LED Strip Test")
    print("=" * 50)
    print(f"LED Count: {LED_COUNT}")
    print(f"Brightness: {BRIGHTNESS * 100}%")
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

