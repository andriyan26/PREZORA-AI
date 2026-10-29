import { useState, useEffect, useCallback } from 'react';
import {
  normalizeIndonesianSpeech,
  splitIntoIndonesianBreathClauses,
  getPersonaVoiceProfile,
  PersonaVoiceProfile,
} from '../utils/indonesianSpeechNormalizer';

export interface SpeakOptions {
  lang?: string;
  persona?: string;
  rateOverride?: number;
  rate?: number;
  skipChime?: boolean;
}

// Global Singleton State to guarantee ZERO audio collision ("Anti-Bentrok") across all pages/components
let globalActiveSessionId = 0;
let globalAudioElement: HTMLAudioElement | null = null;
let globalClauseTimer: ReturnType<typeof setTimeout> | null = null;
let globalIsMuted = false;
let globalVoiceRate = Number(localStorage.getItem('prezora_voice_speed') || '1.0');
let globalPreferredPersona = localStorage.getItem('prezora_voice_persona') || 'assistant';
const clientAudioBlobCache = new Map<string, string>();

// Shared Web Audio API Studio Humanizer Context
let sharedAudioCtx: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Connects an HTMLAudioElement through a Studio Vocal Humanizer DSP chain:
 * 1. 85Hz High-Pass Filter (cleans digital rumble)
 * 2. 210Hz Warmth Chest Resonance Filter (adds human vocal tract warmth)
 * 3. 3200Hz Indonesian Articulation Clarity Filter (makes pronunciation crystal clear)
 * 4. 7500Hz Anti-Metallic Sibilance Softener (removes robotic/metallic AI harshness)
 * 5. Soft Studio Dynamics Compressor (broadcast podcast mic feel)
 */
function attachStudioHumanizerDSP(audioEl: HTMLAudioElement, profile: PersonaVoiceProfile) {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    const source = ctx.createMediaElementSource(audioEl);

    // 1. High-pass filter at 85Hz
    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 85;

    // 2. Warmth Chest Resonance at 210Hz
    const warmthFilter = ctx.createBiquadFilter();
    warmthFilter.type = 'peaking';
    warmthFilter.frequency.value = 210;
    warmthFilter.Q.value = 0.85;
    warmthFilter.gain.value = profile.warmthDb ?? 3.0;

    // 3. Indonesian Articulation Clarity at 3200Hz
    const presenceFilter = ctx.createBiquadFilter();
    presenceFilter.type = 'peaking';
    presenceFilter.frequency.value = 3200;
    presenceFilter.Q.value = 1.0;
    presenceFilter.gain.value = profile.presenceDb ?? 2.2;

    // 4. Anti-Metallic High-Shelf Softener at 7500Hz
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'highshelf';
    airFilter.frequency.value = 7500;
    airFilter.gain.value = profile.airCutDb ?? -2.5;

    // 5. Studio Broadcast Compressor
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 2.8;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.16;

    source
      .connect(highPass)
      .connect(warmthFilter)
      .connect(presenceFilter)
      .connect(airFilter)
      .connect(compressor)
      .connect(ctx.destination);
  } catch (e) {
    // If MediaElementSource fails or is unsupported, browser falls back to direct audio playback seamlessly
  }
}

const notifySpeakingState = (speaking: boolean, paused = false) => {
  (window as any).__prezoraIsSpeaking = speaking;
  if (!speaking) {
    (window as any).__prezoraLastSpokeAt = Date.now();
  }
  window.dispatchEvent(
    new CustomEvent('prezora-tts-state', {
      detail: {
        isSpeaking: speaking,
        isPaused: paused,
        isMuted: globalIsMuted,
        rate: globalVoiceRate,
        persona: globalPreferredPersona,
      },
    })
  );
};

export const stopAllPrezoraAudio = () => {
  globalActiveSessionId += 1;
  if (globalClauseTimer) {
    clearTimeout(globalClauseTimer);
    globalClauseTimer = null;
  }
  if (globalAudioElement) {
    try {
      globalAudioElement.onended = null;
      globalAudioElement.onerror = null;
      globalAudioElement.pause();
      globalAudioElement.currentTime = 0;
    } catch (e) {
      // ignore
    }
    globalAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
  notifySpeakingState(false, false);
};

// Subtle, warm acoustic notification chime (Web Audio API)
const playChimeTone = () => {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.13); // E5

    osc2.frequency.setValueAtTime(261.63, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(329.63, ctx.currentTime + 0.13);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.28);
    osc2.stop(ctx.currentTime + 0.28);
  } catch (e) {
    // ignore audio context restrictions
  }
};

/**
 * Ranks available browser SpeechSynthesisVoices to find the most human-like Indonesian voice
 */
function selectBestIndonesianBrowserVoice(
  voices: SpeechSynthesisVoice[],
  preferredGender: 'female' | 'male' = 'female'
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const scored = voices.map((v) => {
    let score = 0;
    const name = v.name.toLowerCase();
    const lang = (v.lang || '').toLowerCase();

    if (lang === 'id-id' || lang === 'id_id') score += 100;
    else if (lang.startsWith('id')) score += 85;
    else if (name.includes('indonesia') || name.includes('bahasa')) score += 80;
    else if (lang.startsWith('ms')) score += 40;

    if (score > 0) {
      if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 55;
      if (name.includes('gadis') || name.includes('ardi') || name.includes('damayanti')) score += 45;
      if (name.includes('google')) score += 35;

      if (
        preferredGender === 'female' &&
        (name.includes('gadis') || name.includes('damayanti') || name.includes('female') || name.includes('google'))
      ) {
        score += 15;
      }
      if (preferredGender === 'male' && (name.includes('ardi') || name.includes('male'))) {
        score += 15;
      }
    }

    return { voice: v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  if (scored[0] && scored[0].score > 0) {
    return scored[0].voice;
  }

  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Computes human-like dynamic micro-prosody multiplier for a given Indonesian clause
 */
function computeClauseProsodyRate(clause: string, baseRate: number, profile: PersonaVoiceProfile): number {
  const trimmed = clause.trim();
  const isQuestion = trimmed.endsWith('?');
  const isGreeting = /^(halo|hai|selamat|terima kasih|baik|wah|nah|oke|sip|senang)/i.test(trimmed);
  const isTransitionOrPoint = /^(pertama|kedua|ketiga|keempat|kelima|jadi intinya|jadi kesimpulannya|makanya|penting)/i.test(trimmed);

  let multiplier = profile.rateMultiplier;
  if (isGreeting) {
    multiplier *= 0.99; // Warm, welcoming opening cadence
  } else if (isTransitionOrPoint) {
    multiplier *= 0.97; // Slightly deliberate, clear emphasis on key points
  } else if (isQuestion) {
    multiplier *= 1.01; // Natural inquisitive flow
  } else {
    multiplier *= 1.02; // Smooth conversational Indonesian rhythm
  }

  return Math.max(0.75, Math.min(1.45, baseRate * multiplier));
}

/**
 * Computes natural human breathing pause (ms) after a clause based on its punctuation & length
 */
function computeHumanBreathPauseMs(clause: string, profile: PersonaVoiceProfile): number {
  const trimmed = clause.trim();
  if (trimmed.endsWith('?')) return profile.clausePauseMs + 55;
  if (trimmed.endsWith('!')) return profile.clausePauseMs + 40;
  if (trimmed.endsWith(',')) return Math.max(110, Math.round(profile.clausePauseMs * 0.65));
  return profile.clausePauseMs;
}

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(Boolean((window as any).__prezoraIsSpeaking));
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(globalIsMuted);
  const [rate, setRateState] = useState(globalVoiceRate);
  const [persona, setPersonaState] = useState(globalPreferredPersona);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported] = useState(true);

  useEffect(() => {
    const handleGlobalState = (e: any) => {
      if (e.detail) {
        setIsSpeaking(Boolean(e.detail.isSpeaking));
        setIsPaused(Boolean(e.detail.isPaused));
        setIsMuted(Boolean(e.detail.isMuted));
        if (typeof e.detail.rate === 'number') setRateState(e.detail.rate);
        if (typeof e.detail.persona === 'string') setPersonaState(e.detail.persona);
      }
    };

    window.addEventListener('prezora-tts-state', handleGlobalState);

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const avail = window.speechSynthesis.getVoices();
        if (avail && avail.length > 0) {
          setVoices(avail);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.removeEventListener('prezora-tts-state', handleGlobalState);
    };
  }, []);

  /**
   * Prosody-Tuned Browser SpeechSynthesis (Used when Microsoft Gadis/Ardi Natural Online is available or as offline fallback)
   */
  const speakWithBrowserProsody = useCallback(
    (rawText: string, sessionId: number, activePersona: string, effectiveRate: number) => {
      if (!('speechSynthesis' in window)) {
        notifySpeakingState(false, false);
        return;
      }

      const profile = getPersonaVoiceProfile(activePersona);
      const clauses = splitIntoIndonesianBreathClauses(rawText, 115);
      if (clauses.length === 0) {
        notifySpeakingState(false, false);
        return;
      }

      const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
      const chosenVoice = selectBestIndonesianBrowserVoice(currentVoices, profile.preferredGender);

      let currentIndex = 0;

      const speakNextClause = () => {
        if (sessionId !== globalActiveSessionId || globalIsMuted) {
          notifySpeakingState(false, false);
          return;
        }

        if (currentIndex >= clauses.length) {
          notifySpeakingState(false, false);
          return;
        }

        const clauseText = clauses[currentIndex];
        currentIndex += 1;

        const utterance = new SpeechSynthesisUtterance(clauseText);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang || 'id-ID';
        } else {
          utterance.lang = 'id-ID';
        }

        const isQuestion = clauseText.trim().endsWith('?');
        const isGreeting = /^(halo|selamat|hai|terima kasih|baik|wah|nah)/i.test(clauseText.trim());

        utterance.rate = computeClauseProsodyRate(clauseText, effectiveRate, profile);
        utterance.pitch = isQuestion
          ? Math.min(1.18, profile.pitch + 0.05)
          : isGreeting
          ? Math.min(1.14, profile.pitch + 0.03)
          : profile.pitch;

        utterance.onstart = () => {
          if (sessionId === globalActiveSessionId) {
            notifySpeakingState(true, false);
          }
        };

        utterance.onend = () => {
          if (sessionId !== globalActiveSessionId) return;
          if (currentIndex < clauses.length) {
            const pauseMs = computeHumanBreathPauseMs(clauseText, profile);
            globalClauseTimer = setTimeout(() => {
              if (sessionId === globalActiveSessionId) {
                speakNextClause();
              }
            }, pauseMs);
          } else {
            notifySpeakingState(false, false);
          }
        };

        utterance.onerror = () => {
          if (sessionId === globalActiveSessionId) {
            notifySpeakingState(false, false);
          }
        };

        if (!(window as any).__prezoraUtterances) {
          (window as any).__prezoraUtterances = [];
        }
        (window as any).__prezoraUtterances.push(utterance);
        if ((window as any).__prezoraUtterances.length > 20) {
          (window as any).__prezoraUtterances.shift();
        }

        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          notifySpeakingState(false, false);
        }
      };

      speakNextClause();
    },
    [voices]
  );

  /**
   * Fetches or retrieves cached blob URL for a single Indonesian breath clause
   */
  const fetchClauseBlobUrl = async (clauseText: string, activePersona: string): Promise<string> => {
    const cacheKey = `${activePersona}:${clauseText}`;
    const existing = clientAudioBlobCache.get(cacheKey);
    if (existing) return existing;

    const response = await fetch('/api/v1/tts/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: clauseText,
        persona: activePersona,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS HTTP ${response.status}`);
    }

    const blob = await response.blob();
    if (blob.size < 80) {
      throw new Error('Empty audio buffer');
    }

    const audioUrl = URL.createObjectURL(blob);
    if (clientAudioBlobCache.size > 120) {
      const oldestKey = clientAudioBlobCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = clientAudioBlobCache.get(oldestKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        clientAudioBlobCache.delete(oldestKey);
      }
    }
    clientAudioBlobCache.set(cacheKey, audioUrl);
    return audioUrl;
  };

  /**
   * Main speak function — Plays Clause-by-Clause Humanized Indonesian Audio with Studio EQ & Natural Breathing Pauses
   */
  const speak = useCallback(
    async (text: string, optionsOrLang?: string | SpeakOptions) => {
      if (globalIsMuted || !text || !text.trim()) return;

      // Immediately stop any previous audio or TTS so voices NEVER collide ("Anti-Bentrok")
      stopAllPrezoraAudio();
      const mySessionId = globalActiveSessionId;

      const opts: SpeakOptions =
        typeof optionsOrLang === 'string' ? { lang: optionsOrLang } : optionsOrLang || {};

      const activePersona = opts.persona || globalPreferredPersona || 'assistant';
      const effectiveRate = opts.rateOverride ?? opts.rate ?? globalVoiceRate ?? 1.0;
      const profile = getPersonaVoiceProfile(activePersona);

      if (!opts.skipChime) {
        playChimeTone();
      }

      const clauses = splitIntoIndonesianBreathClauses(text, 105).slice(0, 18);
      if (clauses.length === 0) return;

      notifySpeakingState(true, false);

      // Pre-fetch neural Indonesian clauses in parallel (up to 3 ahead) for ultra-low latency & zero lag between breath clauses
      try {
        const clausePromises = new Map<number, Promise<string>>();
        const triggerPrefetch = (idx: number) => {
          if (idx < clauses.length && !clausePromises.has(idx)) {
            clausePromises.set(idx, fetchClauseBlobUrl(clauses[idx], activePersona));
          }
        };

        // Start prefetching first 3 clauses immediately
        triggerPrefetch(0);
        triggerPrefetch(1);
        triggerPrefetch(2);

        const playClauseAtIndex = async (idx: number) => {
          if (mySessionId !== globalActiveSessionId || globalIsMuted) {
            notifySpeakingState(false, false);
            return;
          }

          if (idx >= clauses.length) {
            globalAudioElement = null;
            notifySpeakingState(false, false);
            return;
          }

          // Prefetch 2 clauses ahead
          triggerPrefetch(idx + 1);
          triggerPrefetch(idx + 2);

          const clauseText = clauses[idx];
          const urlPromise = clausePromises.get(idx) || fetchClauseBlobUrl(clauseText, activePersona);
          const audioUrl = await urlPromise;

          if (mySessionId !== globalActiveSessionId || globalIsMuted) {
            return;
          }

          const audio = new Audio(audioUrl);
          globalAudioElement = audio;

          // Route through Studio Vocal Humanizer DSP (Warmth + Clarity + De-Harshness + Compressor)
          attachStudioHumanizerDSP(audio, profile);

          // Apply dynamic clause-level prosody rate while preserving natural human vocal pitch
          audio.playbackRate = computeClauseProsodyRate(clauseText, effectiveRate, profile);
          if ('preservesPitch' in audio) {
            (audio as any).preservesPitch = true;
          } else if ('mozPreservesPitch' in audio) {
            (audio as any).mozPreservesPitch = true;
          } else if ('webkitPreservesPitch' in audio) {
            (audio as any).webkitPreservesPitch = true;
          }

          audio.onplay = () => {
            if (mySessionId === globalActiveSessionId) {
              notifySpeakingState(true, false);
            }
          };

          audio.onended = () => {
            if (mySessionId !== globalActiveSessionId) return;
            if (idx + 1 < clauses.length) {
              const pauseMs = computeHumanBreathPauseMs(clauseText, profile);
              globalClauseTimer = setTimeout(() => {
                if (mySessionId === globalActiveSessionId) {
                  playClauseAtIndex(idx + 1).catch(() => {
                    notifySpeakingState(false, false);
                  });
                }
              }, pauseMs);
            } else {
              globalAudioElement = null;
              notifySpeakingState(false, false);
            }
          };

          audio.onerror = () => {
            if (mySessionId === globalActiveSessionId) {
              globalAudioElement = null;
              speakWithBrowserProsody(clauses.slice(idx).join('. '), mySessionId, activePersona, effectiveRate);
            }
          };

          await audio.play();
        };

        await playClauseAtIndex(0);
      } catch (err) {
        if (mySessionId === globalActiveSessionId && !globalIsMuted) {
          speakWithBrowserProsody(text, mySessionId, activePersona, effectiveRate);
        }
      }
    },
    [speakWithBrowserProsody, voices]
  );

  const pause = useCallback(() => {
    if (globalAudioElement && !globalAudioElement.paused) {
      globalAudioElement.pause();
      notifySpeakingState(true, true);
      return;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      notifySpeakingState(true, true);
    }
  }, []);

  const resume = useCallback(() => {
    if (globalAudioElement && globalAudioElement.paused) {
      globalAudioElement.play().catch(() => {});
      notifySpeakingState(true, false);
      return;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      notifySpeakingState(true, false);
    }
  }, []);

  const cancel = useCallback(() => {
    stopAllPrezoraAudio();
  }, []);

  const toggleMute = useCallback(() => {
    globalIsMuted = !globalIsMuted;
    if (globalIsMuted) {
      stopAllPrezoraAudio();
    } else {
      notifySpeakingState(false, false);
    }
  }, []);

  const setRate = useCallback((newRate: number) => {
    const clamped = Math.max(0.7, Math.min(1.5, newRate));
    globalVoiceRate = clamped;
    localStorage.setItem('prezora_voice_speed', String(clamped));
    if (globalAudioElement) {
      globalAudioElement.playbackRate = clamped;
    }
    notifySpeakingState(Boolean((window as any).__prezoraIsSpeaking), false);
  }, []);

  const setPersona = useCallback((newPersona: string) => {
    globalPreferredPersona = newPersona;
    localStorage.setItem('prezora_voice_persona', newPersona);
    notifySpeakingState(Boolean((window as any).__prezoraIsSpeaking), false);
  }, []);

  return {
    isSpeaking,
    isPaused,
    isMuted,
    rate,
    persona,
    voices,
    isSupported,
    speak,
    stop: cancel,
    pause,
    resume,
    cancel,
    toggleMute,
    setRate,
    setPersona,
    playChime: playChimeTone,
  };
};
