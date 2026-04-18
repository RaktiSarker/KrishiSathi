export const AudioRecordingWorklet = `
class AudioProcessingWorklet extends AudioWorkletProcessor {
  buffer = new Int16Array(2048);
  bufferWriteIndex = 0;

  constructor() {
    super();
    this.hasAudio = false;
  }

  process(inputs) {
    if (inputs[0].length) {
      const channel0 = inputs[0][0];
      this.processChunk(channel0);
    }
    return true;
  }

  sendAndClearBuffer() {
    this.port.postMessage({
      event: "chunk",
      data: {
        int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
      },
    });
    this.bufferWriteIndex = 0;
  }

  processChunk(float32Array) {
    const l = float32Array.length;
    for (let i = 0; i < l; i++) {
      const int16Value = float32Array[i] * 32768;
      this.buffer[this.bufferWriteIndex++] = int16Value;
      if (this.bufferWriteIndex >= this.buffer.length) {
        this.sendAndClearBuffer();
      }
    }
    if (this.bufferWriteIndex >= this.buffer.length) {
      this.sendAndClearBuffer();
    }
  }
}
`;

export const VolMeterWorklet = `
class VolMeter extends AudioWorkletProcessor {
  volume;
  updateIntervalInMS;
  nextUpdateFrame;

  constructor() {
    super();
    this.volume = 0;
    this.updateIntervalInMS = 25;
    this.nextUpdateFrame = this.updateIntervalInMS;
    this.port.onmessage = event => {
      if (event.data.updateIntervalInMS) {
        this.updateIntervalInMS = event.data.updateIntervalInMS;
      }
    };
  }

  get intervalInFrames() {
    return (this.updateIntervalInMS / 1000) * sampleRate;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    // Pass through audio to output so sound is not swallowed
    if (input.length > 0 && output.length > 0) {
      for (let channel = 0; channel < input.length; channel++) {
        if (output[channel] && input[channel]) {
          output[channel].set(input[channel]);
        }
      }
    }

    if (input.length > 0) {
      const samples = input[0];
      let sum = 0;
      for (let i = 0; i < samples.length; ++i) {
        sum += samples[i] * samples[i];
      }
      const rms = Math.sqrt(sum / samples.length);
      this.volume = Math.max(rms, this.volume * 0.7);
      this.nextUpdateFrame -= samples.length;
      if (this.nextUpdateFrame < 0) {
        this.nextUpdateFrame += this.intervalInFrames;
        this.port.postMessage({ volume: this.volume });
      }
    }
    return true;
  }
}
`;
