# LOPE Electric Assist System

## Safety Guidelines
- Maximum speed: 8 km/h for jogging safety
- Gradual power application (100ms 0-100%)
- Immediate power cutoff on release
- Low voltage cutoff at 34V
- Over-current protection via software limits

## Calibration Process
1. Upload calibration sketch
2. Zero with no load
3. Add known weight (10kg recommended)
4. Record calibration factor
5. Update main sketch

## Hardware Selection
- Load cell: 50kg rated (3x max expected force)
- Motor: 250W-350W BLDC (36V)
- Battery: 36V Li-ion with BMS
- Controller: Arduino Nano recommended

## Development Notes
- Test force response at walking speed first
- Verify emergency cutoff before full power testing
- Calibrate on flat ground
- Test voltage monitoring with variable power supply

## Testing Protocol
1. Start with 20% assist level
2. Test emergency cutoff at each power level
3. Verify smooth acceleration/deceleration
4. Test on slight incline last
5. Log all calibration values
6. Document voltage sag under load

## Common Issues
- False triggers from bumps: increase FORCE_THRESHOLD
- Jerky acceleration: decrease ACCEL_RATE
- Slow response: check load cell mounting
- Inconsistent assist: verify battery voltage
