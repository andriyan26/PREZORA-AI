import { useState, useEffect, useRef, useCallback } from 'react';
import { stopAllPrezoraAudio } from './useSpeechSynthesis';
import { correctIndonesianSttTranscript } from '../utils/indonesianSpeechNormalizer';

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    lang = 'id-ID',
    continuous = true,
    interimResults = true,
    onResult,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const restartTimerRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Listen to AI TTS state to prevent speaker-to-mic acoustic echo collision ("Anti-Bentrok")
  useEffect(() => {
    const handleTtsState = (e: any) => {
      const aiSpeaking = Boolean(e?.detail?.isSpeaking);
      if (aiSpeaking) {
        // Clear any interim bleed while AI is speaking
        setInterimTranscript('');
      }
    };
    window.addEventListener('prezora-tts-state', handleTtsState);
    return () => window.removeEventListener('prezora-tts-state', handleTtsState);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      // Anti-Bentrok Guard: Ignore audio picked up while AI is speaking or within 450ms echo tail
      const isAiSpeaking = Boolean((window as any).__prezoraIsSpeaking);
      const lastSpokeAt = Number((window as any).__prezoraLastSpokeAt || 0);
      if (isAiSpeaking || Date.now() - lastSpokeAt < 450) {
        setInterimTranscript('');
        return;
      }

      let currentFinal = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      setInterimTranscript(correctIndonesianSttTranscript(currentInterim));

      if (currentFinal.trim()) {
        const cleanFinal = correctIndonesianSttTranscript(currentFinal.trim());
        setTranscript((prev) => {
          const updated = prev ? `${prev} ${cleanFinal}` : cleanFinal;
          return updated;
        });

        if (onResultRef.current) {
          onResultRef.current(cleanFinal);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      let errMsg = 'Terjadi kendala pada pengenalan suara.';
      if (event.error === 'not-allowed') {
        errMsg = 'Izin mikrofon belum diberikan. Klik ikon gembok di address bar browser untuk mengizinkan mikrofon.';
        shouldListenRef.current = false;
        setIsListening(false);
      } else if (event.error === 'network') {
        errMsg = 'Koneksi jaringan suara terputus sementara, menyambungkan ulang...';
      }

      setError(errMsg);
      if (onErrorRef.current) {
        onErrorRef.current(errMsg);
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (shouldListenRef.current) {
            try {
              recognition.start();
              setIsListening(true);
            } catch (e: any) {
              // Ignore InvalidStateError if already active
            }
          }
        }, 220);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [lang, continuous, interimResults]);

  const startListening = useCallback(() => {
    setError(null);
    if (!isSupported) {
      setError('Browser ini belum mendukung Web Speech API. Silakan gunakan Google Chrome atau Microsoft Edge.');
      return;
    }

    // If user manually starts talking while AI is speaking, politely stop AI voice to prevent collision
    if ((window as any).__prezoraIsSpeaking) {
      stopAllPrezoraAudio();
    }

    shouldListenRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        if (err.name === 'InvalidStateError') {
          setIsListening(true);
        } else {
          setError(err.message || 'Gagal memulai rekaman suara.');
        }
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  };
};
