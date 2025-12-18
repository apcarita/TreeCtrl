# WS2812B Troubleshooting - Random Colors/Glitching

## Your Issue: "Mostly blue but random colors flashing"

This is almost always one of these problems:

---

## 1. MOST COMMON: ESP32 Voltage Level (3.3V vs 5V)

**Problem:** ESP32 outputs 3.3V on GPIO pins, but WS2812B expects 5V data signal.

**Symptoms:**
- Random colors
- Glitching
- First few LEDs work, rest are random
- Works sometimes, fails other times

**Solution: Add Level Shifter**

### Quick Test (Temporary):
Try powering the ESP32 from the same 5V supply as the LEDs:
```
5V Power Supply ──┬─→ ESP32 VIN (NOT 3.3V pin!)
                  └─→ LED Strip 5V
```

This brings the ESP32 voltage closer to 5V, which can help.

### Proper Fix: 74HCT245 Level Shifter
- Converts 3.3V → 5V
- Cost: $1-2
- Wiring:
```
ESP32 GPIO14 (3.3V) ──→ 74HCT245 A1 pin
                         74HCT245 B1 pin ──→ LED Strip DIN
5V supply ──→ 74HCT245 VCC
ESP32 GND ──→ 74HCT245 GND
```

---

## 2. Missing Data Line Resistor

**Problem:** Signal reflections on data line cause glitches.

**Solution:** Add 330Ω resistor between ESP32 GPIO14 and LED strip DIN

```
ESP32 GPIO14 ──[330Ω resistor]── LED Strip DIN (white wire)
```

This is **required** by the WS2812B datasheet!

---

## 3. Missing Power Supply Capacitor

**Problem:** Power supply voltage spikes/dips as LEDs turn on/off.

**Solution:** Add 1000µF capacitor across power supply terminals

```
5V Power Supply
  (+) ──┬──→ To LEDs
        |
     [1000µF]  (Electrolytic capacitor)
        |      (Watch polarity! Long leg = +)
  (-) ──┴──→ To GND
```

---

## 4. Power Supply Issues

**Problem:** Insufficient current or voltage drop.

**Check:**
1. Is your power supply rated for at least 5A? (10A+ recommended for 300 LEDs)
2. Are the wires from power supply to LEDs thick enough? (18 AWG minimum)
3. Is the voltage actually 5V? (Measure with multimeter at the LED strip)

**Test:** Try with external USB power supply (2A) for just 10 LEDs.

---

## 5. Ground Not Connected

**Problem:** ESP32 and power supply don't share common ground.

**THIS IS CRITICAL:**
```
ESP32 GND ──┬──→ LED Strip GND (green wire)
            └──→ Power Supply GND (-)
```

All three grounds MUST be connected together!

---

## 6. Bad/Loose Connections

**Check:**
- Is the white wire (DIN) firmly connected to GPIO 14?
- Are you using solid solder joints or just twisted wires?
- Did you plug into the correct end of the strip? (DIN not DOUT)

**Test:** Wiggle the wires. If colors change, it's a bad connection.

---

## 7. First LED is Dead/Damaged

**Problem:** If the first LED is damaged, it corrupts data to all other LEDs.

**Test:** 
1. Cut off the first LED from the strip
2. Connect to the second LED's DIN pad
3. Set `NUM_LEDS` to 1 less

---

## Debugging Steps (In Order):

### Step 1: Verify with 10 LEDs
Upload the code with `NUM_LEDS = 10` and test.

**If still glitchy with 10 LEDs:**
- Hardware issue (voltage level, missing components, or bad connection)
- Continue to Step 2

**If works fine with 10 LEDs:**
- Power supply issue or data corruption over length
- Skip to Step 5

### Step 2: Check Common Ground
Use multimeter to verify continuity:
- ESP32 GND to LED Strip GND
- ESP32 GND to Power Supply GND (-)

**Not connected?** Fix this first!

### Step 3: Add Data Line Resistor
Solder a 330Ω resistor between ESP32 GPIO14 and LED DIN wire.

**Still glitchy?** Continue to Step 4.

### Step 4: Add Level Shifter
This is the most common fix for ESP32.

Either:
- Use 74HCT245 chip (~$1)
- OR power ESP32 from 5V supply (VIN pin)

**Still glitchy?** Check Step 7 (first LED might be bad).

### Step 5: Power Supply Issues (for 300 LEDs)
If 10 LEDs work but 300 don't:

1. **Measure voltage** at the far end of strip (should be 4.5V+, not <4V)
2. **Add power injection** every 100 LEDs
3. **Use thicker wires** (18 AWG) for 5V and GND
4. **Get bigger power supply** (20-30A for 300 LEDs)

---

## Quick Hardware Checklist:

- [ ] Common ground between ESP32, LEDs, and power supply?
- [ ] 330Ω resistor on data line?
- [ ] 1000µF capacitor on power supply?
- [ ] Level shifter or 5V power to ESP32 VIN?
- [ ] Power supply rated for enough current?
- [ ] Solid solder connections (not just twisted)?
- [ ] Connected to DIN end of strip (not DOUT)?
- [ ] Testing with small number first (10 LEDs)?

---

## Expected Behavior:

**Working correctly:**
- Solid blue flash
- All LEDs same color
- Smooth on/off transitions
- No random colors

**Still broken:**
- Random colors mixed with blue
- First LED works, rest random
- Colors change when touching wires
- Different behavior each power cycle

---

## Most Likely Fix for Your Issue:

Based on "mostly blue but random colors":

**#1: Add 330Ω resistor on data line** (try first, easiest)
**#2: Add level shifter** (ESP32 3.3V → 5V conversion)
**#3: Check common ground** (must be connected!)

Try these in order. The resistor alone might fix it!

