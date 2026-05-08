import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleGenAI, Modality, Session } from "@google/genai";
import { AudioRecorder } from "@/lib/audio-recorder";
import { AudioStreamer } from "@/lib/audio-streamer";
import { audioContext, base64ToArrayBuffer } from "@/lib/audio-utils";
import { VolMeterWorklet } from "@/lib/worklets";
import { LIVE_API_KEY, LIVE_SYSTEM_PROMPT } from "@/lib/gemini";

const LiveCallButton = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0);

    const sessionRef = useRef<Session | null>(null);
    const audioRecorderRef = useRef<AudioRecorder | null>(null);
    const audioStreamerRef = useRef<AudioStreamer | null>(null);
    const clientRef = useRef<GoogleGenAI | null>(null);
    const isConnectedRef = useRef(false);

    // Initialize audio streamer
    useEffect(() => {
        audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
            const streamer = new AudioStreamer(audioCtx);
            streamer
                .addWorklet("vumeter-out", VolMeterWorklet, (ev: MessageEvent) => {
                    setVolume(ev.data.volume);
                })
                .then(() => {
                    audioStreamerRef.current = streamer;
                });
        });
    }, []);

    // Helper to stop recorder and clean up
    const cleanupRecorder = useCallback(() => {
        isConnectedRef.current = false;
        if (audioRecorderRef.current) {
            audioRecorderRef.current.removeAllListeners();
            audioRecorderRef.current.stop();
            audioRecorderRef.current = null;
        }
        audioStreamerRef.current?.stop();
    }, []);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        try {
            // Resume AudioContext on user gesture (click)
            if (audioStreamerRef.current) {
                const ctx = audioStreamerRef.current.context;
                if (ctx.state === "suspended") {
                    await ctx.resume();
                }
            }

            clientRef.current = new GoogleGenAI({ apiKey: LIVE_API_KEY });

            const session = await clientRef.current.live.connect({
                model: "gemini-2.5-flash-native-audio-latest",
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: {
                        parts: [{ text: LIVE_SYSTEM_PROMPT }],
                    },
                },
                callbacks: {
                    onopen: () => {
                        console.log("Live API connected");
                        isConnectedRef.current = true;
                        setIsConnected(true);
                        setIsConnecting(false);
                    },
                    onmessage: (message) => {
                        if (!isConnectedRef.current) return;
                        if (message.serverContent?.modelTurn?.parts) {
                            const parts = message.serverContent.modelTurn.parts;
                            for (const part of parts) {
                                if (part.inlineData && part.inlineData.data) {
                                    const streamer = audioStreamerRef.current;
                                    if (!streamer) {
                                        console.warn("No audio streamer available");
                                        return;
                                    }
                                    console.log("Audio chunk received:", part.inlineData.mimeType, "dataLen:", part.inlineData.data.length, "ctxState:", streamer.context.state);
                                    const data = base64ToArrayBuffer(part.inlineData.data);
                                    streamer.addPCM16(new Uint8Array(data));
                                }
                            }
                        }
                        if (message.serverContent?.turnComplete) {
                            console.log("Turn complete");
                        }
                        if (message.serverContent && "interrupted" in message.serverContent) {
                            audioStreamerRef.current?.stop();
                        }
                    },
                    onerror: (error: unknown) => {
                        const e = error as ErrorEvent;
                        console.error("Live API error:", e.message, e.error, e);
                        cleanupRecorder();
                        setIsConnected(false);
                        setIsConnecting(false);
                    },
                    onclose: (event: unknown) => {
                        const e = event as CloseEvent;
                        console.log("Live API disconnected — code:", e.code, "reason:", e.reason, "wasClean:", e.wasClean);
                        cleanupRecorder();
                        setIsConnected(false);
                        setIsConnecting(false);
                    },
                },
            });

            sessionRef.current = session;

            // Start audio recording
            const recorder = new AudioRecorder();
            recorder.on("data", (base64: string) => {
                if (sessionRef.current && isConnectedRef.current) {
                    try {
                        sessionRef.current.sendRealtimeInput({
                            media: {
                                mimeType: "audio/pcm;rate=16000",
                                data: base64,
                            },
                        });
                    } catch {
                        // WebSocket closed, stop sending
                        cleanupRecorder();
                    }
                }
            });
            recorder.on("volume", (vol: number) => {
                if (isConnectedRef.current) setVolume(vol);
            });
            await recorder.start();
            audioRecorderRef.current = recorder;
        } catch (error) {
            console.error("Connection failed:", error);
            cleanupRecorder();
            setIsConnecting(false);
        }
    }, [cleanupRecorder]);

    const disconnect = useCallback(() => {
        // Stop recorder and mark disconnected
        cleanupRecorder();

        // Close session after recorder is stopped
        try {
            sessionRef.current?.close();
        } catch {
            // Ignore close errors
        }
        sessionRef.current = null;
        setIsConnected(false);
        setIsMuted(false);
    }, [cleanupRecorder]);

    const toggleMute = useCallback(() => {
        if (isMuted) {
            audioRecorderRef.current?.start();
        } else {
            audioRecorderRef.current?.stop();
        }
        setIsMuted(!isMuted);
    }, [isMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isConnected && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="absolute bottom-20 right-0 bg-card rounded-2xl p-4 shadow-xl border border-border min-w-[280px]"
                    >
                        <div className="text-center mb-3">
                            <h4 className="font-bold text-foreground text-lg">🌾 কৃষিসাথী লাইভ</h4>
                            <p className="text-sm text-muted-foreground">বাংলায় কথা বলুন...</p>
                        </div>

                        {/* Voice visualization */}
                        <div className="flex items-center justify-center gap-1 h-16 mb-3">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 bg-primary rounded-full"
                                    animate={{
                                        height: isConnected
                                            ? Math.max(4, Math.random() * volume * 500 + 4)
                                            : 4,
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full w-12 h-12"
                                onClick={toggleMute}
                            >
                                {isMuted ? (
                                    <MicOff className="w-5 h-5 text-destructive" />
                                ) : (
                                    <Mic className="w-5 h-5 text-primary" />
                                )}
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="rounded-full w-12 h-12"
                                onClick={disconnect}
                            >
                                <PhoneOff className="w-5 h-5" />
                            </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground mt-3">
                            কৃষি সংক্রান্ত যেকোনো প্রশ্ন করুন
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={isConnected ? disconnect : connect}
                    disabled={isConnecting}
                    className={`rounded-full w-16 h-16 shadow-xl ${isConnected
                        ? "bg-destructive hover:bg-destructive/90"
                        : "bg-primary hover:bg-primary/90"
                        }`}
                    size="icon"
                >
                    {isConnecting ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Phone className="w-7 h-7" />
                        </motion.div>
                    ) : isConnected ? (
                        <PhoneOff className="w-7 h-7" />
                    ) : (
                        <Phone className="w-7 h-7" />
                    )}
                </Button>
            </motion.div>

            {!isConnected && !isConnecting && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center mt-2 text-muted-foreground font-medium whitespace-nowrap"
                >
                    📞 কৃষিসাথীকে কল করুন
                </motion.p>
            )}
            {isConnecting && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center mt-2 text-primary font-medium"
                >
                    সংযোগ হচ্ছে...
                </motion.p>
            )}
        </div>
    );
};

export default LiveCallButton;
