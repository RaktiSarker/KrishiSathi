import { createWorkletFromSrc, registeredWorklets } from "./audioworklet-registry";

export class AudioStreamer {
    private sampleRate: number = 24000;
    private bufferSize: number = 7680;
    private audioQueue: Float32Array[] = [];
    private isPlaying: boolean = false;
    private isStreamComplete: boolean = false;
    private checkInterval: number | null = null;
    private scheduledTime: number = 0;
    private initialBufferTime: number = 0.1;
    public gainNode: GainNode;
    public source: AudioBufferSourceNode;

    public onComplete = () => { };

    constructor(public context: AudioContext) {
        this.gainNode = this.context.createGain();
        this.source = this.context.createBufferSource();
        this.gainNode.connect(this.context.destination);
        this.addPCM16 = this.addPCM16.bind(this);
    }

    async addWorklet<T extends (d: unknown) => void>(
        workletName: string,
        workletSrc: string,
        handler: T
    ): Promise<this> {
        let workletsRecord = registeredWorklets.get(this.context);
        if (workletsRecord && workletsRecord[workletName]) {
            workletsRecord[workletName].handlers.push(handler);
            return Promise.resolve(this);
        }

        if (!workletsRecord) {
            registeredWorklets.set(this.context, {});
            workletsRecord = registeredWorklets.get(this.context)!;
        }

        workletsRecord[workletName] = { handlers: [handler] };

        const src = createWorkletFromSrc(workletName, workletSrc);
        await this.context.audioWorklet.addModule(src);
        const worklet = new AudioWorkletNode(this.context, workletName);
        workletsRecord[workletName].node = worklet;

        return this;
    }

    private _processPCM16Chunk(chunk: Uint8Array): Float32Array {
        const float32Array = new Float32Array(chunk.length / 2);
        const dataView = new DataView(chunk.buffer);
        for (let i = 0; i < chunk.length / 2; i++) {
            try {
                const int16 = dataView.getInt16(i * 2, true);
                float32Array[i] = int16 / 32768;
            } catch (e) {
                console.error(e);
            }
        }
        return float32Array;
    }

    addPCM16(chunk: Uint8Array) {
        // Resume context if suspended (browser autoplay policy)
        if (this.context.state === "suspended") {
            console.log("AudioContext suspended, resuming...");
            this.context.resume();
        }
        this.isStreamComplete = false;
        const float32Array = this._processPCM16Chunk(chunk);
        this.audioQueue.push(float32Array);
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.scheduledTime = this.context.currentTime + this.initialBufferTime;
            console.log("Starting audio playback, queue:", this.audioQueue.length, "ctxState:", this.context.state, "gainValue:", this.gainNode.gain.value);
            this.scheduleNextBuffer();
        }
    }

    private createAudioBuffer(data: Float32Array): AudioBuffer {
        const audioBuffer = this.context.createBuffer(
            1,
            data.length,
            this.sampleRate
        );
        audioBuffer.getChannelData(0).set(data);
        return audioBuffer;
    }

    private scheduleNextBuffer() {
        const SCHEDULE_AHEAD_TIME = 0.2;

        while (
            this.audioQueue.length > 0 &&
            this.scheduledTime < this.context.currentTime + SCHEDULE_AHEAD_TIME
        ) {
            const data = this.audioQueue.shift()!;
            const audioBuffer = this.createAudioBuffer(data);
            const source = this.context.createBufferSource();
            source.buffer = audioBuffer;

            // Connect through worklets if available
            const workletsRecord = registeredWorklets.get(this.context);
            if (workletsRecord) {
                const workletNames = Object.keys(workletsRecord);
                if (workletNames.length > 0) {
                    source.connect(workletsRecord[workletNames[0]].node!);
                    for (let i = 0; i < workletNames.length - 1; i++) {
                        const currentWorklet = workletsRecord[workletNames[i]];
                        const nextWorklet = workletsRecord[workletNames[i + 1]];
                        if (currentWorklet.node && nextWorklet.node) {
                            currentWorklet.node.connect(nextWorklet.node);
                        }
                    }
                    const lastWorklet =
                        workletsRecord[workletNames[workletNames.length - 1]];
                    if (lastWorklet.node) {
                        lastWorklet.node.connect(this.gainNode);
                    }
                } else {
                    source.connect(this.gainNode);
                }
            } else {
                source.connect(this.gainNode);
            }

            // Process worklet messages
            if (workletsRecord) {
                for (const name of Object.keys(workletsRecord)) {
                    const w = workletsRecord[name];
                    if (w.node) {
                        w.node.port.onmessage = (ev) => {
                            w.handlers.forEach((h) => h.call(w.node!.port, ev));
                        };
                    }
                }
            }

            source.start(this.scheduledTime);
            this.scheduledTime += audioBuffer.duration;
        }

        if (this.audioQueue.length > 0 || !this.isStreamComplete) {
            this.checkInterval = window.setTimeout(
                () => this.scheduleNextBuffer(),
                25
            );
        } else {
            this.isPlaying = false;
            this.onComplete();
        }
    }

    stop() {
        this.isStreamComplete = true;
        this.audioQueue = [];
        this.isPlaying = false;
        if (this.checkInterval) {
            clearTimeout(this.checkInterval);
            this.checkInterval = null;
        }
    }
}
