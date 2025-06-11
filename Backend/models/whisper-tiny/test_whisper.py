
import os
import sys
from faster_whisper import WhisperModel

# Set cache directory
cache_dir = os.path.join(os.getcwd(), "whisper_cache")
os.makedirs(cache_dir, exist_ok=True)

print(f"WHISPER_CACHE_DIR: {cache_dir}")

# Download and load the model
model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8",
    download_root=cache_dir
)
print("Model loaded successfully")

# Test with a dummy audio file
import numpy as np
from scipy.io import wavfile

# Create a 1-second silent audio file
sample_rate = 16000
audio = np.zeros(sample_rate, dtype=np.float32)
wavfile.write("test.wav", sample_rate, audio)

# Test transcription
segments, info = model.transcribe("test.wav", beam_size=5)
print(f"Detected language: {info.language}")
print("Whisper model test successful")
