// Romantic Web Audio Synthesizer & Music Engine
// Generates a soft, warm ambient romantic piano/music-box melody
// with zero external audio dependencies, plus supports custom audio tracks.

class RomanticMusicEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.volume = 0.35;
        this.tempo = 68; // BPM
        this.timer = null;
        this.customAudio = null;
        this.isCustom = false;
        this.currentStep = 0;

        // Romantic chord progression in D Major / B Minor (dreamy, emotional)
        // Chords: Dmaj9 -> Bm7 -> Gmaj7 -> Aadd9
        this.chords = [
            // Dmaj9 (D, F#, A, C#, E)
            [146.83, 220.00, 277.18, 329.63, 369.99, 440.00, 554.37],
            // Bm7 (B, D, F#, A)
            [123.47, 185.00, 220.00, 293.66, 369.99, 440.00, 587.33],
            // Gmaj7 (G, B, D, F#)
            [98.00, 146.83, 196.00, 246.94, 293.66, 369.99, 493.88],
            // Asus4 / A9 (A, E, G, B, C#)
            [110.00, 164.81, 220.00, 293.66, 329.63, 440.00, 554.37]
        ];

        this.arpeggioPatterns = [
            [0, 2, 4, 3, 5, 4, 3, 2],
            [0, 1, 3, 4, 6, 4, 3, 1],
            [0, 2, 3, 5, 4, 3, 2, 1],
            [0, 1, 2, 4, 5, 3, 2, 1]
        ];
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.setupReverb();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setupReverb() {
        // Create subtle lush stereo reverb using impulse response
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * 2.5;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const decay = Math.exp(-i / (sampleRate * 0.8));
            left[i] = (Math.random() * 2 - 1) * decay;
            right[i] = (Math.random() * 2 - 1) * decay;
        }

        this.convolver = this.ctx.createConvolver();
        this.convolver.buffer = impulse;

        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.45;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;

        this.convolver.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
    }

    playNote(freq, time, duration = 2.0, velocity = 0.5) {
        if (!this.ctx) return;

        // Warm piano/celesta tone with fundamental + harmonics
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();

        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, time);
        filter.frequency.exponentialRampToValueAtTime(450, time + duration);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, time);

        // Warm soft overtone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, time);

        // Sparkling music box shimmer
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3, time);

        const osc2Gain = this.ctx.createGain();
        osc2Gain.gain.value = 0.25;
        osc2.connect(osc2Gain);

        const osc3Gain = this.ctx.createGain();
        osc3Gain.gain.value = 0.08;
        osc3.connect(osc3Gain);

        osc1.connect(noteGain);
        osc2Gain.connect(noteGain);
        osc3Gain.connect(noteGain);

        noteGain.connect(filter);
        filter.connect(this.masterGain);
        filter.connect(this.convolver);

        // Envelope: soft bell/piano attack, long gentle release
        const attack = 0.04;
        noteGain.gain.setValueAtTime(0.0001, time);
        noteGain.gain.linearRampToValueAtTime(velocity * 0.3, time + attack);
        noteGain.gain.exponentialRampToValueAtTime(0.00001, time + duration);

        osc1.start(time);
        osc2.start(time);
        osc3.start(time);

        osc1.stop(time + duration);
        osc2.stop(time + duration);
        osc3.stop(time + duration);
    }

    startMelody() {
        if (this.isPlaying) return;
        this.init();
        this.isPlaying = true;

        let chordIndex = 0;
        let step = 0;
        const stepTime = (60 / this.tempo) * 0.75; // 8th-note duration

        const loop = () => {
            if (!this.isPlaying || this.isCustom) return;

            const now = this.ctx.currentTime;
            const currentChord = this.chords[chordIndex];
            const pattern = this.arpeggioPatterns[chordIndex % this.arpeggioPatterns.length];

            const noteIndex = pattern[step % pattern.length];
            const freq = currentChord[noteIndex % currentChord.length];

            // Bass drone on measure start
            if (step % pattern.length === 0) {
                this.playNote(currentChord[0] * 0.5, now, 3.8, 0.45);
            }

            // Arpeggio note
            const vel = step % 2 === 0 ? 0.38 : 0.22;
            this.playNote(freq, now, 2.2, vel);

            step++;
            if (step % pattern.length === 0) {
                chordIndex = (chordIndex + 1) % this.chords.length;
            }

            this.timer = setTimeout(loop, stepTime * 1000);
        };

        loop();
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.customAudio) {
            this.customAudio.pause();
        }
    }

    playCelebrationFanfare() {
        this.init();
        const now = this.ctx.currentTime;
        // Joyful romantic chime fanfare: D5 -> F#5 -> A5 -> D6 with sparkling harmonics
        const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98];
        notes.forEach((freq, i) => {
            this.playNote(freq, now + i * 0.12, 3.5, 0.6);
            this.playNote(freq * 0.5, now + i * 0.12, 3.5, 0.4);
        });
    }

    playKissChime() {
        this.init();
        const now = this.ctx.currentTime;
        [659.25, 880.00, 1318.51].forEach((freq, i) => {
            this.playNote(freq, now + i * 0.08, 1.8, 0.4);
        });
    }

    setCustomAudio(url) {
        if (this.customAudio) {
            this.customAudio.pause();
        }
        this.isCustom = true;
        this.customAudio = new Audio(url);
        this.customAudio.loop = true;
        this.customAudio.volume = this.volume;
        if (this.isPlaying) {
            this.customAudio.play().catch(() => {});
        }
    }

    switchToProcedural() {
        if (this.customAudio) {
            this.customAudio.pause();
            this.customAudio = null;
        }
        this.isCustom = false;
        if (this.isPlaying) {
            this.startMelody();
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            if (this.isCustom && this.customAudio) {
                this.customAudio.play().catch(() => {});
                this.isPlaying = true;
            } else {
                this.startMelody();
            }
            return true;
        }
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx ? this.ctx.currentTime : 0);
        }
        if (this.customAudio) {
            this.customAudio.volume = this.volume;
        }
    }
}

window.romanticAudio = new RomanticMusicEngine();
