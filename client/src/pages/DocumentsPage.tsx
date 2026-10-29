import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, Upload, FileText, Trash2, MessageSquare, 
  Mic, Sparkles, CheckCircle2, AlertCircle, RefreshCw, X, Download, Volume2, VolumeX
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { UploadedDocument } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { ProgressiveItem } from '../components/common/ProgressiveReveal';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [summaryModal, setSummaryModal] = useState<{ title: string; content: string } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const { data: documents = [], isLoading } = useQuery<UploadedDocument[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('Ukuran file maksimal adalah 15 MB.');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah dokumen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChatWithDoc = async (docId: string, filename: string) => {
    try {
      const res = await api.post('/conversations', {
        title: `Diskusi: ${filename.substring(0, 25)}`
      });
      navigate(`/chat/${res.data.data.id}`);
    } catch (err) {
      navigate('/chat');
    }
  };

  const handleSummarize = async (docId: string, filename: string) => {
    setIsSummarizing(true);
    try {
      const res = await api.post(`/documents/${docId}/summarize`);
      setSummaryModal({
        title: filename,
        content: res.data.data.summary
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pt-1 sm:pt-3 animate-fade-in duration-300">
      
      {/* Header */}
      <div className="animate-stagger-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs font-bold mb-2 shadow-glow-sm">
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Knowledge Vault & Slide Storage</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          My Documents (Materi Presentasi)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Unggah dokumen PDF atau presentasi PPTX Anda untuk dianalisis, dirangkum, atau dijadikan referensi tanya-jawab AI secara mendalam.
        </p>
      </div>

      {/* Upload Zone */}
      <form onSubmit={handleUploadSubmit} className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-2">
        <div className="border-2 border-dashed border-slate-300 dark:border-white/[0.12] rounded-3xl p-6 sm:p-10 text-center hover:border-brand-500/70 transition-all duration-300 cursor-pointer relative bg-white/40 dark:bg-white/[0.02] hover:bg-white/60 dark:hover:bg-white/[0.04] group">
          <input
            type="file"
            accept=".pdf,.pptx,.ppt,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 text-brand-400 flex items-center justify-center mx-auto mb-3 shadow-glow-sm group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
            {selectedFile ? selectedFile.name : 'Pilih atau Tarik File PDF / PPTX ke Sini'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maksimum ukuran file: 15 MB • Format didukung: PDF, PPTX, TXT
          </p>
        </div>

        {uploadError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 border border-rose-200 dark:border-rose-900/50 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {selectedFile && (
          <div className="flex justify-end gap-3 pt-2 animate-fade-in">
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isUploading ? 'Mengekstrak Teks Dokumen...' : 'Konfirmasi & Unggah Dokumen'}
            </button>
          </div>
        )}
      </form>

      {/* Documents List Table */}
      <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] glass-card-luxury specular-border space-y-4 border border-slate-200/90 dark:border-white/[0.09] shadow-2xl animate-stagger-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
          <span>Daftar Dokumen Tersimpan</span>
          <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
            {documents.length} File
          </span>
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat daftar dokumen secara bertahap...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada dokumen yang diunggah. Unggah file PDF atau PPTX di atas untuk mulai berlatih.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <ProgressiveItem
                key={doc.id}
                index={index}
                baseDelayMs={110}
                stepMs={95}
                className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-blue text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md">
                      {doc.originalFilename}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className={`font-bold ${doc.processingStatus === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {doc.processingStatus === 'completed' ? 'Siap Digunakan' : doc.processingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <button
                    onClick={() => handleSummarize(doc.id, doc.originalFilename)}
                    disabled={isSummarizing}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-extrabold text-xs transition border border-indigo-200/60 dark:border-indigo-800/40 disabled:opacity-50"
                    title="Buat Ringkasan Dokumen"
                  >
                    {isSummarizing ? 'Meringkas...' : 'Ringkas'}
                  </button>

                  <button
                    onClick={() => handleChatWithDoc(doc.id, doc.originalFilename)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-600 dark:text-brand-300 font-extrabold text-xs transition flex items-center gap-1 border border-brand-500/20 shadow-glow-sm"
                    title="Gunakan untuk Chat AI"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Tanya AI</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Yakin ingin menghapus dokumen ini?')) {
                        deleteMutation.mutate(doc.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </ProgressiveItem>
            ))}
          </div>
        )}
      </div>

      {/* Summary Modal with Specular Blur */}
      {summaryModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-dropdown specular-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[82vh] overflow-y-auto space-y-4 border border-white/[0.12] shadow-2xl animate-fade-in-scale">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                Ringkasan: {summaryModal.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => isSpeaking ? stop() : speak(summaryModal.content, { persona: 'assistant' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-500 dark:text-brand-300 text-xs font-bold border border-brand-500/25 transition"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Suara' : 'Dengarkan Ringkasan'}</span>
                </button>
                <button
                  onClick={() => {
                    if (isSpeaking) stop();
                    setSummaryModal(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">
              {summaryModal.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
