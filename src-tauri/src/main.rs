#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use crossbeam_channel::{bounded, Receiver, Sender};
use serde::{Deserialize, Serialize};
use tauri::State;
use cpal::traits::{HostTrait, DeviceTrait, StreamTrait};

// ============================================================
// AUDIO THREAD TYPES
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioCommand {
    pub cmd_type: String,
    pub track: Option<usize>,
    pub value: Option<f64>,
    pub data: Option<Vec<u8>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioState {
    pub is_playing: bool,
    pub current_step: usize,
    pub bpm: u64,
    pub cpu_usage: f64,
}

// ============================================================
// TRACK STATE (for per-track volume/pan/mute/solo)
// ============================================================

#[derive(Clone)]
struct TrackState {
    volume: f64,
    pan: f64,
    muted: bool,
    soloed: bool,
}

// ============================================================
// AUDIO ENGINE (REAL-TIME THREAD)
// ============================================================

struct AudioEngine {
    sample_rate: u32,
    command_rx: Receiver<AudioCommand>,
    state_tx: Sender<AudioState>,
    is_running: Arc<AtomicBool>,
    current_step: Arc<AtomicU64>,
    bpm: Arc<AtomicU64>,
}

impl AudioEngine {
    fn new(
        command_rx: Receiver<AudioCommand>,
        state_tx: Sender<AudioState>,
        is_running: Arc<AtomicBool>,
        current_step: Arc<AtomicU64>,
        bpm: Arc<AtomicU64>,
    ) -> Self {
        Self {
            sample_rate: 48000,
            command_rx,
            state_tx,
            is_running,
            current_step,
            bpm,
        }
    }

    fn run(self) {
        println!("[AudioThread] Starting real-time audio engine");

        // Initialize cpal audio output (cpal 0.15+ API)
        let host = cpal::default_host();

        let device = match host.default_output_device() {
            Some(d) => d,
            None => {
                eprintln!("[AudioThread] No output device available");
                return;
            }
        };

        let supported_config = match device.default_output_config() {
            Ok(c) => c,
            Err(e) => {
                eprintln!("[AudioThread] Failed to get output config: {}", e);
                return;
            }
        };

        println!("[AudioThread] Device: {:?}", device.name());
        println!("[AudioThread] Config: {:?}", supported_config);

        let sample_rate = supported_config.sample_rate().0;
        let channels = supported_config.channels();
        let stream_config: cpal::StreamConfig = supported_config.into();

        // Track states (volume, pan, muted, soloed) - 7 tracks
        let track_states: Arc<parking_lot::RwLock<Vec<TrackState>>> = Arc::new(
            parking_lot::RwLock::new(
                (0..7)
                    .map(|_| TrackState {
                        volume: 0.7,
                        pan: 0.0,
                        muted: false,
                        soloed: false,
                    })
                    .collect()
            )
        );

        let is_running_clone = self.is_running.clone();
        let current_step_clone = self.current_step.clone();
        let bpm_clone = self.bpm.clone();
        let command_rx_clone = self.command_rx.clone();
        let state_tx_clone = self.state_tx.clone();

        // Master volume
        let master_volume = Arc::new(parking_lot::RwLock::new(0.7));
        let master_volume_clone = master_volume.clone();
        let track_states_clone = track_states.clone();

        let err_fn = |err| eprintln!("[AudioThread] Stream error: {}", err);

        let stream = match device.build_output_stream(
            &stream_config,
            move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                // Non-blocking command check
                while let Ok(cmd) = command_rx_clone.try_recv() {
                    match cmd.cmd_type.as_str() {
                        "set_volume" => {
                            if let Some(v) = cmd.value {
                                *master_volume_clone.write() = v.clamp(0.0, 1.0);
                            }
                        }
                        "set_track_volume" => {
                            if let (Some(t), Some(v)) = (cmd.track, cmd.value) {
                                let mut states = track_states_clone.write();
                                if t < states.len() {
                                    states[t].volume = v.clamp(0.0, 1.0);
                                }
                            }
                        }
                        "set_track_pan" => {
                            if let (Some(t), Some(v)) = (cmd.track, cmd.value) {
                                let mut states = track_states_clone.write();
                                if t < states.len() {
                                    states[t].pan = v.clamp(-1.0, 1.0);
                                }
                            }
                        }
                        "toggle_mute" => {
                            if let Some(t) = cmd.track {
                                let mut states = track_states_clone.write();
                                if t < states.len() {
                                    states[t].muted = !states[t].muted;
                                }
                            }
                        }
                        "toggle_solo" => {
                            if let Some(t) = cmd.track {
                                let mut states = track_states_clone.write();
                                if t < states.len() {
                                    states[t].soloed = !states[t].soloed;
                                }
                            }
                        }
                        "set_bpm" => {
                            if let Some(v) = cmd.value {
                                bpm_clone.store(v as u64, Ordering::Relaxed);
                            }
                        }
                        "play" => {
                            is_running_clone.store(true, Ordering::Relaxed);
                        }
                        "stop" => {
                            is_running_clone.store(false, Ordering::Relaxed);
                        }
                        _ => {}
                    }
                }

                // Calculate step timing
                let bpm_val = bpm_clone.load(Ordering::Relaxed) as f64;
                let samples_per_step = (sample_rate as f64 * 60.0) / (bpm_val * 4.0);

                // Phase accumulators
                let mut phase: f64 = 0.0;
                let mut step_phase: f64 = 0.0;

                // Fill audio buffer
                for frame in data.chunks_mut(channels as usize) {
                    // Simple test tone - replace with actual synth DSP
                    let sample = if is_running_clone.load(Ordering::Relaxed) {
                        let freq = 220.0;
                        let master_vol = *master_volume.read();
                        let val = (phase * 2.0 * std::f64::consts::PI * freq / sample_rate as f64).sin();
                        (val * master_vol * 0.15) as f32
                    } else {
                        0.0
                    };

                    phase += 1.0;
                    if phase >= sample_rate as f64 {
                        phase = 0.0;
                    }

                    // Update step counter for sequencer sync
                    step_phase += 1.0;
                    if step_phase >= samples_per_step {
                        step_phase = 0.0;
                        let step = current_step_clone.fetch_add(1, Ordering::Relaxed);
                        // Send state update (non-blocking)
                        let _ = state_tx_clone.try_send(AudioState {
                            is_playing: is_running_clone.load(Ordering::Relaxed),
                            current_step: ((step + 1) % 32) as usize,
                            bpm: bpm_clone.load(Ordering::Relaxed),
                            cpu_usage: 0.0,
                        });
                    }

                    // Stereo output
                    for sample_out in frame.iter_mut() {
                        *sample_out = sample;
                    }
                }
            },
            err_fn,
            None,
        ) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("[AudioThread] Failed to build stream: {}", e);
                return;
            }
        };

        // Start playback stream
        if let Err(e) = stream.play() {
            eprintln!("[AudioThread] Failed to start stream: {}", e);
            return;
        }

        println!("[AudioThread] Audio stream running at {} Hz, {} channels", sample_rate, channels);

        // Keep thread alive
        loop {
            thread::sleep(Duration::from_millis(100));
        }
    }
}

// ============================================================
// TAURI APPLICATION STATE
// ============================================================

pub struct AppState {
    pub command_tx: Sender<AudioCommand>,
    pub audio_running: Arc<AtomicBool>,
    pub current_step: Arc<AtomicU64>,
    pub bpm: Arc<AtomicU64>,
}

// ============================================================
// TAURI COMMANDS
// ============================================================

#[tauri::command]
fn start_audio(state: State<AppState>) -> Result<String, String> {
    state.audio_running.store(true, Ordering::Relaxed);
    let cmd = AudioCommand {
        cmd_type: "play".to_string(),
        track: None,
        value: None,
        data: None,
    };
    let _ = state.command_tx.send(cmd);
    println!("[Tauri] Audio started");
    Ok("Audio started".to_string())
}

#[tauri::command]
fn stop_audio(state: State<AppState>) -> Result<String, String> {
    state.audio_running.store(false, Ordering::Relaxed);
    let cmd = AudioCommand {
        cmd_type: "stop".to_string(),
        track: None,
        value: None,
        data: None,
    };
    let _ = state.command_tx.send(cmd);
    println!("[Tauri] Audio stopped");
    Ok("Audio stopped".to_string())
}

#[tauri::command]
fn set_volume(state: State<AppState>, value: f64) -> Result<String, String> {
    let cmd = AudioCommand {
        cmd_type: "set_volume".to_string(),
        track: None,
        value: Some(value),
        data: None,
    };
    state.command_tx.send(cmd).map_err(|e| e.to_string())?;
    Ok(format!("Volume set to {}", value))
}

#[tauri::command]
fn set_track_volume(state: State<AppState>, track: usize, value: f64) -> Result<String, String> {
    let cmd = AudioCommand {
        cmd_type: "set_track_volume".to_string(),
        track: Some(track),
        value: Some(value),
        data: None,
    };
    state.command_tx.send(cmd).map_err(|e| e.to_string())?;
    Ok(format!("Track {} volume set to {}", track, value))
}

#[tauri::command]
fn set_track_pan(state: State<AppState>, track: usize, value: f64) -> Result<String, String> {
    let cmd = AudioCommand {
        cmd_type: "set_track_pan".to_string(),
        track: Some(track),
        value: Some(value),
        data: None,
    };
    state.command_tx.send(cmd).map_err(|e| e.to_string())?;
    Ok(format!("Track {} pan set to {}", track, value))
}

#[tauri::command]
fn toggle_mute(state: State<AppState>, track: usize) -> Result<String, String> {
    let cmd = AudioCommand {
        cmd_type: "toggle_mute".to_string(),
        track: Some(track),
        value: None,
        data: None,
    };
    state.command_tx.send(cmd).map_err(|e| e.to_string())?;
    Ok(format!("Track {} mute toggled", track))
}

#[tauri::command]
fn toggle_solo(state: State<AppState>, track: usize) -> Result<String, String> {
    let cmd = AudioCommand {
        cmd_type: "toggle_solo".to_string(),
        track: Some(track),
        value: None,
        data: None,
    };
    state.command_tx.send(cmd).map_err(|e| e.to_string())?;
    Ok(format!("Track {} solo toggled", track))
}

#[tauri::command]
fn set_bpm(state: State<AppState>, bpm: u64) -> Result<String, String> {
    let cmd = AudioCommand {
        cmd_type: "set_bpm".to_string(),
        track: None,
        value: Some(bpm as f64),
        data: None,
    };
    state.command_tx.send(cmd).map_err(|e| e.to_string())?;
    state.bpm.store(bpm, Ordering::Relaxed);
    Ok(format!("BPM set to {}", bpm))
}

#[tauri::command]
fn get_audio_state(state: State<AppState>) -> Result<AudioState, String> {
    Ok(AudioState {
        is_playing: state.audio_running.load(Ordering::Relaxed),
        current_step: (state.current_step.load(Ordering::Relaxed) % 32) as usize,
        bpm: state.bpm.load(Ordering::Relaxed),
        cpu_usage: 0.0,
    })
}

// ============================================================
// MAIN
// ============================================================

fn main() {
    // Lock-free channels for UI <-> Audio thread communication
    let (command_tx, command_rx): (Sender<AudioCommand>, Receiver<AudioCommand>) = bounded(1024);
    let (state_tx, _state_rx): (Sender<AudioState>, Receiver<AudioState>) = bounded(64);

    // Shared atomic state
    let audio_running = Arc::new(AtomicBool::new(false));
    let current_step = Arc::new(AtomicU64::new(0));
    let bpm = Arc::new(AtomicU64::new(128));

    // Spawn real-time audio thread
    let audio_running_clone = audio_running.clone();
    let current_step_clone = current_step.clone();
    let bpm_clone = bpm.clone();

    thread::spawn(move || {
        let engine = AudioEngine::new(
            command_rx,
            state_tx,
            audio_running_clone,
            current_step_clone,
            bpm_clone,
        );
        engine.run();
    });

    println!("[Main] Audio thread spawned");
    println!("[Main] Tauri starting...");

    // Build Tauri app
    tauri::Builder::default()
        .manage(AppState {
            command_tx,
            audio_running,
            current_step,
            bpm,
        })
        .invoke_handler(tauri::generate_handler![
            start_audio,
            stop_audio,
            set_volume,
            set_track_volume,
            set_track_pan,
            toggle_mute,
            toggle_solo,
            set_bpm,
            get_audio_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
