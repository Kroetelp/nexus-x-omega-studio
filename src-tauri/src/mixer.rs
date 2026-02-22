// ============================================================
// NEXUS-X RUST AUDIO ENGINE - PHASE 4
// Multi-Channel Mixer + Master Effects
// ============================================================

use std::f64::consts::PI;

/// Master EQ Band
#[derive(Clone, Debug)]
pub struct EqBand {
    pub frequency: f64,
    pub gain: f64,      // dB
    pub q: f64,
    // Coefficients
    b0: f64, b1: f64, b2: f64,
    a1: f64, a2: f64,
    // State
    x1: f64, x2: f64,
    y1: f64, y2: f64,
}

impl EqBand {
    pub fn new(frequency: f64, gain_db: f64, q: f64, sample_rate: f64) -> Self {
        let a = 10.0_f64.powf(gain_db / 40.0);
        let w0 = 2.0 * PI * frequency / sample_rate;
        let alpha = w0.sin() / (2.0 * q);

        let b0 = 1.0 + alpha * a;
        let b1 = -2.0 * w0.cos();
        let b2 = 1.0 - alpha * a;
        let a0 = 1.0 + alpha / a;
        let a1 = 2.0 * w0.cos();
        let a2 = -(1.0 - alpha / a);

        Self {
            frequency,
            gain: gain_db,
            q,
            b0: b0 / a0,
            b1: b1 / a0,
            b2: b2 / a0,
            a1: a1 / a0,
            a2: a2 / a0,
            x1: 0.0,
            x2: 0.0,
            y1: 0.0,
            y2: 0.0,
        }
    }

    /// Process a single sample through the EQ band
    #[inline]
    pub fn process(&mut self, input: f64) -> f64 {
        let output = self.b0 * input
            + self.b1 * self.x1
            + self.b2 * self.x2
            - self.a1 * self.y1
            - self.a2 * self.y2;

        self.x2 = self.x1;
        self.x1 = input;
        self.y2 = self.y1;
        self.y1 = output;

        output
    }

    pub fn update(&mut self, gain_db: f64, sample_rate: f64) {
        *self = Self::new(self.frequency, gain_db, self.q, sample_rate);
    }
}

/// Master Limiter with Lookahead
#[derive(Clone, Debug)]
pub struct Limiter {
    pub threshold: f64,    // 0.0 to 1.0
    pub release: f64,      // seconds
    pub lookahead: usize,  // samples
    buffer: Vec<f64>,
    buffer_pos: usize,
    envelope: f64,
    sample_rate: f64,
}

impl Limiter {
    pub fn new(sample_rate: f64, threshold: f64, release: f64) -> Self {
        let lookahead = (sample_rate * 0.005) as usize; // 5ms lookahead
        Self {
            threshold,
            release,
            lookahead,
            buffer: vec![0.0; lookahead + 1],
            buffer_pos: 0,
            envelope: 0.0,
            sample_rate,
        }
    }

    #[inline]
    pub fn process(&mut self, input: f64) -> f64 {
        // Store input in lookahead buffer
        self.buffer[self.buffer_pos] = input;

        // Calculate envelope
        let abs_input = input.abs();
        let attack_coeff = 0.9999; // Very fast attack
        let release_coeff = (-1.0 / (self.release * self.sample_rate)).exp();

        if abs_input > self.envelope {
            self.envelope = attack_coeff * self.envelope + (1.0 - attack_coeff) * abs_input;
        } else {
            self.envelope = release_coeff * self.envelope + (1.0 - release_coeff) * abs_input;
        }

        // Calculate gain reduction
        let gain = if self.envelope > self.threshold {
            self.threshold / self.envelope
        } else {
            1.0
        };

        // Apply gain to delayed signal
        let delayed_pos = (self.buffer_pos + 1) % self.lookahead;
        let output = self.buffer[delayed_pos] * gain;

        self.buffer_pos = (self.buffer_pos + 1) % self.lookahead;

        output
    }
}

/// Soft Clipper for warm saturation
#[derive(Clone, Debug)]
pub struct SoftClipper {
    pub threshold: f64,
    pub amount: f64,
}

impl SoftClipper {
    pub fn new(threshold: f64, amount: f64) -> Self {
        Self { threshold, amount }
    }

    #[inline]
    pub fn process(&self, input: f64) -> f64 {
        let abs_input = input.abs();
        if abs_input < self.threshold {
            input
        } else {
            let sign = input.signum();
            let excess = abs_input - self.threshold;
            let clipped = self.threshold + excess / (1.0 + excess * self.amount);
            sign * clipped.min(1.0)
        }
    }
}

/// Multi-Channel Mixer with Master Effects
pub struct Mixer {
    // EQ Bands (Low, Mid, High)
    eq_low: EqBand,
    eq_mid: EqBand,
    eq_high: EqBand,

    // Master Effects
    limiter: Limiter,
    clipper: SoftClipper,

    // Settings
    pub master_volume: f64,
    sample_rate: f64,
}

impl Mixer {
    pub fn new(sample_rate: f64) -> Self {
        Self {
            eq_low: EqBand::new(100.0, 0.0, 0.7, sample_rate),    // 100Hz Low Shelf
            eq_mid: EqBand::new(1000.0, 0.0, 1.0, sample_rate),   // 1kHz Peak
            eq_high: EqBand::new(8000.0, 0.0, 0.7, sample_rate),  // 8kHz High Shelf
            limiter: Limiter::new(sample_rate, 0.95, 0.1),
            clipper: SoftClipper::new(0.8, 2.0),
            master_volume: 0.8,
            sample_rate,
        }
    }

    /// Mix multiple channels with pan and volume
    #[inline]
    pub fn mix_channels(
        &self,
        channels: &[(f64, f64, f64, bool, bool)], // (sample, volume, pan, muted, soloed)
        any_soloed: bool,
    ) -> (f64, f64) {
        let mut left = 0.0;
        let mut right = 0.0;

        for (sample, volume, pan, muted, soloed) in channels {
            // Skip muted tracks (or non-soloed if any track is soloed)
            if *muted || (any_soloed && !soloed) {
                continue;
            }

            // Apply volume
            let vol_sample = sample * volume;

            // Apply pan (constant power panning)
            let angle = (pan + 1.0) * PI / 4.0; // -1 to 1 -> 0 to PI/2
            let left_gain = angle.cos();
            let right_gain = angle.sin();

            left += vol_sample * left_gain;
            right += vol_sample * right_gain;
        }

        (left, right)
    }

    /// Process master bus with EQ, Limiter, Soft Clip
    #[inline]
    pub fn process_master(&mut self, left: f64, right: f64) -> (f32, f32) {
        // Apply EQ
        let eq_l = self.eq_low.process(left);
        let eq_l = self.eq_mid.process(eq_l);
        let eq_l = self.eq_high.process(eq_l);

        let eq_r = self.eq_low.process(right);
        let eq_r = self.eq_mid.process(eq_r);
        let eq_r = self.eq_high.process(eq_r);

        // Apply master volume
        let vol_l = eq_l * self.master_volume;
        let vol_r = eq_r * self.master_volume;

        // Apply limiter
        let limited_l = self.limiter.process(vol_l);
        let limited_r = self.limiter.process(vol_r);

        // Apply soft clipper for warmth
        let clipped_l = self.clipper.process(limited_l);
        let clipped_r = self.clipper.process(limited_r);

        (clipped_l as f32, clipped_r as f32)
    }

    /// Update EQ band gains (in dB)
    pub fn set_eq(&mut self, low_db: f64, mid_db: f64, high_db: f64) {
        self.eq_low.update(low_db, self.sample_rate);
        self.eq_mid.update(mid_db, self.sample_rate);
        self.eq_high.update(high_db, self.sample_rate);
    }

    /// Update limiter threshold
    pub fn set_limiter_threshold(&mut self, threshold: f64) {
        self.limiter.threshold = threshold.clamp(0.0, 1.0);
    }

    /// Update soft clipper amount
    pub fn set_clip_amount(&mut self, amount: f64) {
        self.clipper.amount = amount.clamp(0.0, 10.0);
    }
}

// ============================================================
// TESTS
// ============================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eq_band() {
        let mut eq = EqBand::new(1000.0, 6.0, 1.0, 48000.0);
        let input = 0.5;
        let output = eq.process(input);
        assert!(output > input); // Gain should boost
    }

    #[test]
    fn test_limiter() {
        let mut limiter = Limiter::new(48000.0, 0.5, 0.1);
        let input = 1.0; // Above threshold
        let output = limiter.process(input);
        assert!(output.abs() <= 0.51); // Should be limited
    }

    #[test]
    fn test_soft_clipper() {
        let clipper = SoftClipper::new(0.8, 2.0);
        let output = clipper.process(1.5);
        assert!(output.abs() < 1.5); // Should be clipped
    }

    #[test]
    fn test_mixer() {
        let mixer = Mixer::new(48000.0);
        let channels = vec![
            (0.5, 0.8, 0.0, false, false), // Center
            (0.3, 0.6, -0.5, false, false), // Left
        ];
        let (l, r) = mixer.mix_channels(&channels, false);
        assert!(l > 0.0 && r > 0.0);
    }
}
