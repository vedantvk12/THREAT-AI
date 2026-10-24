import pyaudio
import numpy as np

def test_microphone():
    p = pyaudio.PyAudio()
    
    print("\n--- 🎤 MICROPHONE TEST ---")
    print("I will attempt to read from every device.")
    print("Make noise (Clap/Talk) to see which ID moves!")
    print("------------------------------------------")

    # Try the first 5 devices
    for i in range(p.get_device_count()):
        try:
            info = p.get_device_info_by_index(i)
            if info['maxInputChannels'] > 0:
                name = info['name']
                print(f"\nTesting ID {i}: {name}")
                
                stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, 
                                input=True, input_device_index=i, frames_per_buffer=4096)
                
                # Listen for 3 seconds per device
                for _ in range(15):
                    data = stream.read(4096, exception_on_overflow=False)
                    volume = np.frombuffer(data, dtype=np.int16)
                    peak = np.abs(volume).max()
                    
                    # Draw a bar based on volume
                    bars = "#" * int(peak / 500)
                    print(f"ID {i} Volume: |{bars.ljust(50)}|", end='\r')
                
                stream.stop_stream()
                stream.close()
                print(f"\nDone testing ID {i}.")
        except Exception as e:
            # Skip devices that fail (like HDMI outputs)
            pass

    p.terminate()

if __name__ == "__main__":
    test_microphone()