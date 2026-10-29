import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Copy, Check, 
  RotateCcw, Trash2, Sparkles, Bot, User as UserIcon, 
  X, ChevronDown, Rocket, GraduationCap, Briefcase, Zap, Plus, Square, Radio
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Conversation, UploadedDocument } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { ProgressiveItem } from '../components/common/ProgressiveReveal';

export const AssistantChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    return localStorage.getItem('prezora_chat_autospeak') !== 'false';
  });
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const usedVoiceInputRef = useRef(false);

  // Speech Recognition (Voice STT)
  const { 
    isListening, 
    transcript, 
    interimTranscript,
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition({
    lang: 'id-ID',
    onResult: (text) => {
      usedVoiceInputRef.current = true;
      setInputMessage((prev) => (prev ? `${prev} ${text}` : text));
    }
  });

  // Speech Synthesis (Natural Indonesian TTS Voice Readout)
  const { 
    speak, 
    cancel,
    isSpeaking, 
    isMuted, 
    toggleMute 
  } = useSpeechSynthesis();

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMsgId(null);
    }
  }, [isSpeaking]);

  const toggleAutoSpeak = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    localStorage.setItem('prezora_chat_autospeak', String(next));
    if (!next && isSpeaking) {
      cancel();
    }
  };

  // Fetch or create conversation
  const { data: conversation, isLoading } = useQuery<Conversation>({
    queryKey: ['conversation', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/conversations/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  // Fetch uploaded documents for reference selection
  const { data: documents = [] } = useQuery<UploadedDocument[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data.data;
    }
  });

  // Auto-create initial conversation if on /chat root
  useEffect(() => {
    if (!id) {
      api.post('/conversations', { title: 'Percakapan Baru' }).then(res => {
        navigate(`/chat/${res.data.data.id}`, { replace: true });
      });
    }
  }, [id, navigate]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isSending]);

  const handleSendMessage = async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = (overridePrompt ?? inputMessage).trim();
    if (!textToSend || isSending || !id) return;

    if (isListening) {
      stopListening();
    }

    const shouldSpeakReply = autoSpeak || usedVoiceInputRef.current;
    usedVoiceInputRef.current = false;

    setInputMessage('');
    resetTranscript();
    setIsSending(true);

    try {
      const res = await api.post(`/conversations/${id}/messages`, {
        content: textToSend,
        documentId: selectedDocId || undefined
      });
      await queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });

      const aiMsg = res.data?.data?.assistantMessage;
      if (aiMsg?.content && shouldSpeakReply && !isMuted) {
        setSpeakingMsgId(aiMsg.id);
        speak(aiMsg.content, { persona: 'assistant' });
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = (content: string, msgId: string) => {
    if (isSpeaking && speakingMsgId === msgId) {
      cancel();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      speak(content, { persona: 'assistant' });
    }
  };

  const handleRegenerate = async (msgId: string) => {
    if (!id || isSending) return;
    setIsSending(true);
    try {
      const res = await api.post(`/conversations/${id}/messages/${msgId}/regenerate`);
      await queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      const updatedMsg = res.data?.data;
      if (updatedMsg?.content && autoSpeak && !isMuted) {
        setSpeakingMsgId(updatedMsg.id);
        speak(updatedMsg.content, { persona: 'assistant' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!id || !window.confirm('Hapus percakapan ini secara permanen?')) return;
    cancel();
    try {
      await api.delete(`/conversations/${id}`);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate('/chat');
    } catch (err) {
      console.error(err);
    }
  };

  const messages = conversation?.messages || [];
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const starterPrompts = [
    {
      category: 'Seminar & Sidang',
      icon: GraduationCap,
      color: 'text-brand-400 bg-brand-500/15 border-brand-500/20',
      prompt: 'Bagaimana cara membuka presentasi seminar yang memikat dan tidak gugup?'
    },
    {
      category: 'Pitching Startup',
      icon: Rocket,
      color: 'text-accent-blue bg-accent-blue/15 border-accent-blue/20',
      prompt: 'Buatkan outline elevator pitch 3 menit untuk produk inovasi berbasis AI'
    },
    {
      category: 'Komunikasi Bisnis',
      icon: Briefcase,
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
      prompt: 'Jelaskan konsep arsitektur microservices dengan analogi restoran modern'
    },
    {
      category: 'Retorika Vokal',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
      prompt: 'Bagaimana teknik modulasi nada suara agar audiens tetap fokus menyimak?'
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-10.5rem)] lg:h-[calc(100dvh-7.5rem)] min-h-[460px] rounded-3xl sm:rounded-[2.5rem] glass-card-luxury specular-border overflow-hidden border border-slate-200/90 dark:border-white/[0.09] shadow-2xl relative animate-stagger-1">
      
      {/* Chat Top Bar (Responsive for Mobile HP & Web) */}
      <div className="px-3.5 sm:px-7 py-3 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/75 dark:bg-[#0B1122]/85 backdrop-blur-2xl flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-blue text-white flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse-subtle" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {conversation?.title || 'Percakapan Asisten AI'}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="truncate">Suara Indonesia Natural • Realtime</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Document Reference Selector */}
          {documents.length > 0 && (
            <div className="relative hidden md:block">
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="text-xs py-1.5 pl-3 pr-7 rounded-xl bg-slate-100 dark:bg-darkCard border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 max-w-[160px] truncate focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none font-semibold cursor-pointer"
                title="Pilih dokumen acuan"
              >
                <option value="">📎 Tanpa Dokumen</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    📄 {doc.originalFilename}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Auto-Speak Natural Voice Toggle */}
          <button
            type="button"
            onClick={toggleAutoSpeak}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition active:scale-95 ${
              autoSpeak
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
            }`}
            title={autoSpeak ? 'Suara Otomatis Aktif (AI langsung berbicara)' : 'Aktifkan Suara Otomatis AI'}
          >
            <Radio className={`w-3.5 h-3.5 ${autoSpeak ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{autoSpeak ? 'Auto-Suara ON' : 'Auto-Suara OFF'}</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={async () => {
              cancel();
              const res = await api.post('/conversations', { title: 'Percakapan Baru' });
              navigate(`/chat/${res.data.data.id}`);
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-600 dark:text-brand-300 border border-brand-500/25 text-xs font-bold transition active:scale-95"
            title="Mulai Sesi Chat Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baru</span>
          </button>

          {/* Mute/Unmute Audio */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-darkCard transition active:scale-95"
            title={isMuted ? 'Nyalakan Suara AI' : 'Bisukan Suara AI'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
          </button>

          {/* Delete Conversation */}
          <button
            onClick={handleDeleteConversation}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95"
            title="Hapus Percakapan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-5">
        {isLoading ? (
          <div className="space-y-4 py-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] animate-pulse max-w-xl" />
            ))}
          </div>
        ) : messages.length === 0 && !isSending ? (
          <div className="min-h-full flex flex-col items-center justify-start sm:justify-center text-center max-w-2xl mx-auto p-2 sm:p-6 py-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-accent-blue text-white flex items-center justify-center mb-3 sm:mb-4 shadow-glow-md flex-shrink-0 animate-stagger-1">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse-subtle" />
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mb-2 animate-stagger-2">
              Apa yang ingin kita bahas hari ini?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 leading-relaxed max-w-md animate-stagger-3">
              Diskusikan topik presentasi, gali argumen sidang, perhalus naskah bicara, atau klik mikrofon untuk ngobrol langsung dengan suara Indonesia natural.
            </p>

            {/* Luxury Starter Prompt Bento Cards with Progressive Reveal */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {starterPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <ProgressiveItem key={idx} index={idx} baseDelayMs={260} stepDelayMs={150}>
                    <button
                      onClick={() => handleSendMessage(undefined, item.prompt)}
                      className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/75 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] hover:border-brand-500/50 text-left transition-all duration-300 group shadow-sm hover:shadow-glow-sm hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <div className={`p-1.5 rounded-xl border ${item.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-brand-400 transition-colors">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        "{item.prompt}"
                      </p>
                    </button>
                  </ProgressiveItem>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isThisMsgSpeaking = isSpeaking && speakingMsgId === msg.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 max-w-3xl animate-fade-in-up ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                style={{ animationDelay: `${Math.min(index * 0.08, 0.4)}s` }}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-purple shadow-glow-sm'
                      : 'bg-gradient-to-tr from-darkCard to-indigo-950 border border-white/10 shadow-glow-sm'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-brand-300" />}
                </div>

                <div
                  className={`rounded-3xl p-3.5 sm:p-5 text-xs sm:text-sm leading-relaxed transition-all min-w-0 ${
                    isUser
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                      : 'glass-panel text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-white/[0.09] shadow-sm'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-medium break-words">{msg.content}</div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm prose-p:my-1.5 prose-headings:my-2 prose-pre:my-2 prose-pre:bg-[#070C1A] prose-pre:border prose-pre:border-white/10 prose-pre:p-3.5 prose-pre:rounded-2xl break-words overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Assistant Toolbar */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5">
                      <button
                        onClick={() => handleSpeakMessage(msg.content, msg.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                          isThisMsgSpeaking
                            ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-brand-500/10 text-brand-600 dark:text-brand-300 hover:bg-brand-500/20'
                        }`}
                      >
                        {isThisMsgSpeaking ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Hentikan Suara</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Dengarkan Suara Natural</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRegenerate(msg.id)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-brand-400 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Ulangi</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing Indicator */}
        {isSending && (
          <div className="flex gap-3 max-w-2xl mr-auto animate-fade-in-up">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#131D38] to-[#0A1020] border border-white/10 flex items-center justify-center flex-shrink-0 text-brand-400 shadow-glow-sm">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="glass-panel rounded-3xl p-4 flex items-center gap-3 border border-brand-500/30">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-brand-600 dark:text-brand-300 font-bold">
                PREZORA AI sedang menyiapkan respons...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Floating Banner */}
      {isListening && (
        <div className="mx-3 sm:mx-4 mb-2 p-2.5 sm:p-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue text-white rounded-2xl flex items-center justify-between gap-2 text-xs font-bold shadow-glow-md animate-fade-in-down">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="waveform-bar text-white" />
              <span className="waveform-bar text-white" />
              <span className="waveform-bar text-white" />
              <span className="waveform-bar text-white" />
            </div>
            <span className="truncate">
              {interimTranscript ? `"${interimTranscript}..."` : 'Mendengarkan suara Anda... Silakan berbicara'}
            </span>
          </div>
          <button
            onClick={stopListening}
            className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition active:scale-95 flex-shrink-0"
          >
            Selesai
          </button>
        </div>
      )}

      {/* Selected Document Tag */}
      {selectedDoc && (
        <div className="px-4 py-1.5 bg-brand-50/60 dark:bg-brand-950/40 border-t border-brand-200/50 dark:border-white/5 flex items-center justify-between text-xs text-brand-700 dark:text-brand-300">
          <span className="truncate">📎 Acuan Dokumen Aktif: <strong>{selectedDoc.originalFilename}</strong></span>
          <button 
            onClick={() => setSelectedDocId('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Bar Form */}
      <div className="p-2.5 sm:p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#0B1122]/90 backdrop-blur-2xl">
        <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-2 sm:gap-2.5 max-w-4xl mx-auto">
          {/* Microphone STT Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                usedVoiceInputRef.current = true;
                startListening();
              }
            }}
            className={`p-3 sm:p-3.5 rounded-2xl flex-shrink-0 transition-all active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200/70 dark:border-white/[0.08]'
            }`}
            title={isListening ? 'Berhenti Merekam' : 'Bicara Menggunakan Mikrofon'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Textarea */}
          <div className="flex-1 relative min-w-0">
            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan atau klik mikrofon untuk ngobrol langsung..."
              className="w-full resize-none max-h-28 py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-2xl bg-slate-50 dark:bg-[#080E1E] border border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 transition leading-relaxed shadow-inner"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 text-white shadow-glow-sm transition active:scale-95 flex-shrink-0"
            title="Kirim Pesan"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
