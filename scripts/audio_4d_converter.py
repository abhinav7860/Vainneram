#!/usr/bin/env python3
"""
Vainneram 4D Audio Offline Converter
Adapted from Bargaisl/audio-4d-conv for Kerala Chayakada Nostalgia vault.

Usage:
  python scripts/audio_4d_converter.py <input_audio_path> [output_path] [--speed 0.6] [--intensity 3.5]
"""

import sys
import os
import argparse
import numpy as np

# Automatically find ffmpeg in project root if not in PATH
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
ffmpeg_path = os.path.join(project_root, "ffmpeg.exe")
if os.path.exists(ffmpeg_path):
    os.environ["PATH"] = project_root + os.pathsep + os.environ.get("PATH", "")

def convert_to_4d(input_file, output_file=None, speed=0.08, sharpness=2.5, format="mp3"):
    try:
        from pydub import AudioSegment
    except ImportError:
        print("Please install pydub: pip install pydub numpy")
        return False

    if not output_file:
        base, ext = os.path.splitext(input_file)
        output_file = f"{base}_4D.{format}"

    print(f"Loading {input_file}...")
    audio = AudioSegment.from_file(input_file)
    audio = audio.set_channels(2).set_frame_rate(44100)

    samples = np.array(audio.get_array_of_samples()).astype(np.float32) / 32768.0
    if audio.channels == 2:
        samples = samples.reshape((-1, 2))

    num_samples = len(samples)
    duration = num_samples / audio.frame_rate
    t = np.linspace(0, duration, num_samples)

    # Circular 360-degree phase modulation (Bargaisl/audio-4d-conv algorithm)
    phase = 2 * np.pi * speed * t

    # Sinusoidal panning law with sharpness exponent
    left_gain = (np.abs(np.cos(phase)) ** sharpness)
    right_gain = (np.abs(np.sin(phase)) ** sharpness)

    # Normalize gain to prevent clipping
    max_gain = np.maximum(left_gain, right_gain)
    max_gain[max_gain == 0] = 1.0
    # Blend with ambient baseline (0.35) so neither ear ever goes completely dead
    left_gain = 0.35 + 0.65 * (left_gain / max_gain)
    right_gain = 0.35 + 0.65 * (right_gain / max_gain)

    left_in = samples[:, 0]
    right_in = samples[:, 1]

    left_out = left_in * left_gain
    right_out = right_in * right_gain

    stereo = np.column_stack((left_out, right_out))
    max_val = np.max(np.abs(stereo))
    if max_val > 0:
        stereo /= max_val

    stereo = (stereo * 32767).astype(np.int16)
    out_audio = AudioSegment(
        stereo.tobytes(),
        frame_rate=audio.frame_rate,
        sample_width=2,
        channels=2
    )

    print(f"Exporting 4D audio to {output_file}...")
    out_audio.export(output_file, format=format, bitrate="320k")
    print(f"Successfully converted: {output_file}")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert audio to 4D spatial audio")
    parser.add_argument("input", help="Path to input audio file")
    parser.add_argument("-o", "--output", help="Path to output audio file")
    parser.add_argument("-s", "--speed", type=float, default=0.08, help="Orbit speed in revolutions per second (default: 0.08)")
    parser.add_argument("-i", "--intensity", type=float, default=2.5, help="Spatial panning sharpness (default: 2.5)")
    parser.add_argument("-f", "--format", default="mp3", choices=["mp3", "wav"], help="Output format")

    args = parser.parse_args()
    convert_to_4d(args.input, args.output, args.speed, args.intensity, args.format)
