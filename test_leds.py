#!/usr/bin/env python3
"""
WS2812B LED Strip Test Script for Raspberry Pi 5

WIRING:
- LED Strip DIN  -> GPIO 10 (MOSI/SPI - Pin 19)
- LED Strip GND  -> Pi GND (Pin 6) AND Power Supply GND
- LED Strip 5V   -> External USB Power Supply 5V

Note: Pi 5 requires SPI mode, not PWM. Make sure SPI is enabled:
  sudo raspi-config -> Interface Options -> SPI -> Enable

For testing only (max ~10 LEDs): Can power from Pi's 5V pin
For full strip: MUST use external power supply
"""

import time
import spidev

# Configuration
LED_COUNT = 10  # Start with just 10 LEDs for testing
SPI_BUS = 0     # SPI bus (0 or 1)
SPI_DEVICE = 0  # SPI device (0 or 1)
SPI_SPEED_HZ = 3200000  # 3.2 MHz for WS2812B timing

# Initialize SPI
spi = spidev.SpiDev()
spi.open(SPI_BUS, SPI_DEVICE)
spi.max_speed_hz = SPI_SPEED_HZ
spi.mode = 0


def ws2812_encode(rgb_data):
    """
    Encode RGB data into SPI bits for WS2812B
    Each WS2812B bit is encoded as 4 SPI bits at 3.2MHz
    """
    # WS2812B timing using SPI encoding
    # 0 bit: 0b1000 (short high, long low)
    # 1 bit: 0b1110 (long high, short low)
    
    encoded = []
    for r, g, b in rgb_data:
        # WS2812B uses GRB order
        for byte in [g, r, b]:
            for bit in range(7, -1, -1):
                if byte & (1 << bit):
                    encoded.append(0b11111000)  # 1 bit
                else:
                    encoded.append(0b11000000)  # 0 bit
    
    return bytes(encoded)


def set_pixels(colors):
    """
    Set all pixels at once
    colors: list of (r, g, b) tuples, one per LED
    """
    data = ws2812_encode(colors)
    spi.writebytes(data)
    time.sleep(0.0001)  # Small delay for latch


def clear():
    """Turn off all LEDs"""
    colors = [(0, 0, 0) for _ in range(LED_COUNT)]
    set_pixels(colors)


def test_individual_control():
    """Test individual LED control"""
    print("Testing individual LED control...")
    clear()
    
    # Light up each LED one at a time in different colors
    color_list = [
        (255, 0, 0),    # Red
        (0, 255, 0),    # Green
        (0, 0, 255),    # Blue
        (255, 255, 0),  # Yellow
        (255, 0, 255),  # Magenta
        (0, 255, 255),  # Cyan
        (255, 255, 255) # White
    ]
    
    for i in range(LED_COUNT):
        colors = [(0, 0, 0) for _ in range(LED_COUNT)]
        colors[i] = color_list[i % len(color_list)]
        set_pixels(colors)
        print(f"LED {i}: {color_list[i % len(color_list)]}")
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
        colors = []
        for i in range(LED_COUNT):
            pixel_index = (i * 256 // LED_COUNT) + j
            colors.append(wheel(pixel_index & 255))
        set_pixels(colors)
        time.sleep(0.02)
    
    clear()


def test_all_same_color():
    """Test all LEDs same color"""
    print("Testing all LEDs same color...")
    
    color_list = [
        (255, 0, 0),    # Red
        (0, 255, 0),    # Green
        (0, 0, 255),    # Blue
        (255, 255, 255) # White
    ]
    
    for color in color_list:
        print(f"All LEDs: {color}")
        colors = [color for _ in range(LED_COUNT)]
        set_pixels(colors)
        time.sleep(1)
    
    clear()


def main():
    print("=" * 50)
    print("WS2812B LED Strip Test (Pi 5 - SPI Mode)")
    print("=" * 50)
    print(f"LED Count: {LED_COUNT}")
    print(f"SPI Bus: {SPI_BUS}, Device: {SPI_DEVICE}")
    print(f"SPI Speed: {SPI_SPEED_HZ} Hz")
    print(f"Pin: GPIO 10 (MOSI)")
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
    except Exception as e:
        print(f"\nError: {e}")
        print("\nMake sure SPI is enabled:")
        print("  sudo raspi-config -> Interface Options -> SPI -> Enable")
    finally:
        clear()
        spi.close()
        print("LEDs cleared, SPI closed")


if __name__ == "__main__":
    main()
