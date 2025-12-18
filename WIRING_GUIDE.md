# Volumetric Display Wiring Guide
## WS2812B LED Strip with Multiple Arms

### Overview
- Total: 300 LEDs (16.4ft strip)
- Design: Multiple arms connected with wire extensions
- Control: Single ESP32 GPIO pin (chained strips)

### Physical Layout Example (4 arms, 75 LEDs each):

```
         ARM 2 (75 LEDs)
              |
              |
    ARM 3-----+-----ARM 1 (75 LEDs each)
   (75 LEDs)  |
              |
           ARM 4 (75 LEDs)
              |
         [Motor/Hub]
              |
          [ESP32]
```

### Wire Extensions Between Arms

**Cut your strip into segments:**
- Example: 4 arms × 75 LEDs = 4 segments
- Leave 3-6 inches at cut points for soldering

**Wire Needed per Extension:**
1. **Data (DIN):** 24 AWG (white wire)
2. **5V Power:** 18-20 AWG (red wire) 
3. **Ground:** 18-20 AWG (black wire)

**Wire Lengths:**
- Hub to first arm: ~6-12 inches
- Between arms: ~4-8 inches (across the center)
- Keep as short as practical

### Recommended Wire:
- **Silicone stranded wire** (flexible for spinning)
- **18 AWG for power/ground**
- **24 AWG for data**
- Get multiple colors for easy identification

### Wiring Pattern (Chained):

```
ESP32 GPIO14 ──→ ARM1 DIN
                 ARM1 DOUT ──wire──→ ARM2 DIN
                                     ARM2 DOUT ──wire──→ ARM3 DIN
                                                         ARM3 DOUT ──wire──→ ARM4 DIN

Power Supply 5V ──→ HUB ──18AWG──→ ARM1 5V ──18AWG──→ ARM2 5V (etc.)
                          └──18AWG──→ ARM3 5V ──18AWG──→ ARM4 5V

Power Supply GND ──→ HUB ──18AWG──→ All Arms + ESP32 GND (common)
```

### Important: Power Injection

**Problem:** With 300 LEDs, voltage drop will cause dimming at the end of the chain.

**Solution:** Power injection at multiple points:

```
Power Supply (+5V, GND)
     ├──→ ARM 1 (beginning)
     ├──→ ARM 2 (middle point)
     └──→ ARM 4 (end)
```

**Power injection wires:** 18 AWG from power supply to each injection point

### Soldering Connection Points:

On WS2812B strips, you'll see pads labeled:
- **5V** or **+5V** (power in)
- **DIN** or **DI** (data in)
- **GND** or **G** (ground)
- **DOUT** or **DO** (data out) - connects to next segment's DIN

### Materials Needed:

**Wire:**
- 18 AWG silicone stranded wire (red, black) - 10-15 feet total
- 24 AWG silicone stranded wire (white/yellow) - 5 feet for data

**Connectors (optional but recommended):**
- JST SM 3-pin connectors (for easy disconnect between arms)
- Heat shrink tubing
- Solder and flux

**Power:**
- 5V power supply, **minimum 20A** (60W+ recommended)
  * 300 LEDs × 60mA = 18A max (full white)
  * Real usage: 5-10A typical for colorful patterns
  * Get 20-30A supply for headroom

### Pro Tips:

1. **Test before cutting:** Run the whole strip first to verify it works
2. **Label everything:** Mark which end is DIN vs DOUT on each segment
3. **Strain relief:** Use zip ties or hot glue where wires connect to prevent pulling
4. **For spinning:** Use a slip ring (at least 6-wire) to transfer power/data while rotating
5. **Color code:** Red=5V, Black=GND, White/Yellow=Data
6. **Data signal:** Add 330Ω resistor between ESP32 and first LED's DIN (protects against voltage spikes)
7. **Power cap:** Add 1000µF capacitor across power supply terminals (smooths voltage)

### Voltage Drop Calculator:

At full brightness (worst case):
- 75 LEDs/arm × 60mA = 4.5A per arm
- 1 foot of 18 AWG @ 4.5A = ~0.03V drop
- 3 feet total path = ~0.1V drop (acceptable)

**Rule of thumb:** If LEDs at the end look dim/wrong color, add power injection point

### ESP32 Code Adjustment:

Change in your .ino file:
```cpp
#define NUM_LEDS 300  // Full strip
```

That's it! The ESP32 doesn't care if LEDs are physically separated.



