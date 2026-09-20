import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Bot,
  AlertCircle,
  File,
} from 'lucide-react';
import { DocumentCategory, DocumentItem, UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (doc: DocumentItem) => void;
  user?: UserProfile;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  user,
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Certificates');
  const [organization, setOrganization] = useState('');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'image' | 'zip'>('pdf');
  const [uploadStep, setUploadStep] = useState<number>(0); // 0: Form, 1: Uploading/OCR, 2: NLP/Embeddings, 3: Complete
  const [error, setError] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const handleClose = () => {
    clearAllTimers();
    setUploadStep(0);
    setError('');
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  const categories: DocumentCategory[] = [
    'Projects',
    'Certificates',
    'Internships',
    'Achievements',
    'Research',
    'Hackathons',
    'Academics',
    'Skills',
    'Resume',
  ];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') setFileType('docx');
      else if (['png', 'jpg', 'jpeg'].includes(ext || '')) setFileType('image');
      else if (ext === 'zip') setFileType('zip');
      else setFileType('pdf');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadStep > 0) return; // Submission re-entry guard
    if (!title) {
      setError('Document title is required');
      return;
    }

    setError('');
    setUploadStep(1); // Step 1: Text & file processing

    try {
      let extractedContent = rawText;
      let contentBase64 = '';

      if (selectedFile) {
        contentBase64 = await readFileAsBase64(selectedFile);
        if (!extractedContent && (selectedFile.type.startsWith('text/') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md'))) {
          try {
            extractedContent = await selectedFile.text();
          } catch (e) {}
        }
      }

      setUploadStep(2); // Step 2: Gemini NLP & indexing
      const token = localStorage.getItem('myai_vault_token');

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          fileName: fileName || selectedFile?.name || `${title.replace(/\s+/g, '_')}.${fileType}`,
          fileType,
          category,
          organization: organization || (user?.university !== 'Stanford University' ? user?.university : '') || '',
          rawText: extractedContent || '',
          contentBase64,
          email: user?.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.document) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStep(3); // Complete
      onUploadSuccess(data.document);

      // Reset form state cleanly after completion
      setTimeout(() => {
        setUploadStep(0);
        setTitle('');
        setOrganization('');
        setRawText('');
        setFileName('');
        setSelectedFile(null);
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please check backend connection.');
      setUploadStep(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E0D8] rounded-2xl w-full max-w-xl p-6 sm:p-8 text-[#2F3437] shadow-xl relative overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#8A9095] hover:text-[#2F3437] p-2 rounded-lg bg-[#F7F3EA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-[#EAF0EC] border border-[#6F8F72]/30 text-[#0F4C4C]">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2F3437]">{t('upload.title')}</h2>
            <p className="text-xs text-[#5A6065]">{t('upload.file_types')}</p>
          </div>
        </div>

        {/* Pipeline Progress View */}
        {uploadStep > 0 ? (
          <div className="py-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF0EC] text-[#0F4C4C] flex items-center justify-center mx-auto border border-[#6F8F72]/40 animate-pulse">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#2F3437]">
                {uploadStep === 1
                  ? t('upload.step1')
                  : uploadStep === 2
                  ? t('upload.step2')
                  : t('upload.step3')}
              </h3>
              <p className="text-xs text-[#5A6065] max-w-sm mx-auto">
                {t('upload.processing')}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-4 pt-2 text-xs">
              <div
                className={`flex items-center space-x-1 ${
                  uploadStep >= 1 ? 'text-[#0F4C4C] font-bold' : 'text-[#8A9095]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>OCR</span>
              </div>
              <span className="text-[#8A9095]">→</span>
              <div
                className={`flex items-center space-x-1 ${
                  uploadStep >= 2 ? 'text-[#0F4C4C] font-bold' : 'text-[#8A9095]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Embeddings</span>
              </div>
              <span className="text-[#8A9095]">→</span>
              <div
                className={`flex items-center space-x-1 ${
                  uploadStep >= 3 ? 'text-[#6F8F72] font-bold' : 'text-[#8A9095]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Indexed</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="p-6 rounded-2xl bg-[#F7F3EA] border-2 border-dashed border-[#0F4C4C]/30 hover:border-[#0F4C4C] transition-colors text-center space-y-2 relative"
            >
              <input
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg,.zip"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-[#0F4C4C] mx-auto" />
              <div className="text-xs font-semibold text-[#2F3437]">
                {fileName ? (
                  <span className="text-[#0F4C4C] font-mono">Selected: {fileName}</span>
                ) : (
                  <span>{t('upload.drag_drop')}</span>
                )}
              </div>
              <p className="text-[10px] text-[#5A6065]">{t('upload.file_types')}</p>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#5A6065] font-medium mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford Deep Learning Certificate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3.5 py-2 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
                />
              </div>

              <div>
                <label className="block text-[#5A6065] font-medium mb-1">{t('docs.table_cat')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3.5 py-2 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#5A6065] font-medium mb-1">{t('docs.table_org')}</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford Online, Goldman Sachs, AWS"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3.5 py-2 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#5A6065] font-medium mb-1">
                  Optional Key Excerpt / Text Content
                </label>
                <textarea
                  rows={2}
                  placeholder="Paste certificate or project text excerpt for AI processing..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl p-3 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-[#5A6065] hover:text-[#2F3437] text-xs font-medium"
              >
                {t('upload.close')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-semibold text-xs shadow-xs"
              >
                {t('header.upload_btn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
