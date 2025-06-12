import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedDocument } from '../types';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface DocumentUploadProps {
  language: 'en' | 'fr' | 'ar';
}

const AZURE_OPENAI_BASE = "https://thisisoajo.openai.azure.com";
const AZURE_OPENAI_MODEL = "gpt-4o";
const AZURE_OPENAI_KEY = "9I4UEJweVUdih04Uv8AXcAxs5H8jSQRfwaugcSQYHcI882wSpFvqJQQJ99BAACL93NaXJ3w3AAABACOGkv4f";
const AZURE_OPENAI_VERSION = "2023-06-01-preview";

const SYSTEM_PROMPT = `
You are a Tunisian legal assistant.
Given the user's document, extract:
1) A concise summary.
2) A legal category.
3) 5 key terms.
4) 3 practical recommendations.
Respond as JSON with keys "summary","category","keyTerms","recommendations".
`;

const DocumentUpload: React.FC<DocumentUploadProps> = ({ language }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      title: 'Legal Document Analysis',
      subtitle: 'Upload your documents for comprehensive legal analysis',
      dropText: 'Drag and drop files here or',
      browseText: 'browse files',
      supportedFormats: 'PDF, DOC, DOCX up to 10MB',
      processing: 'Processing…',
      completed: 'Analysis completed',
      error: 'Processing error',
      analysis: 'Analysis',
      summary: 'Summary',
      category: 'Category',
      keyTerms: 'Key Terms',
      recommendations: 'Recommendations',
      noDocs: 'No documents yet. Upload a file to get started.'
    },
    fr: {
      title: 'Analyse de Documents Juridiques',
      subtitle: 'Téléchargez vos documents pour une analyse juridique complète',
      dropText: 'Glissez et déposez les fichiers ici ou',
      browseText: 'parcourir les fichiers',
      supportedFormats: 'PDF, DOC, DOCX jusqu\'à 10MB',
      processing: 'En cours de traitement…',
      completed: 'Analyse terminée',
      error: 'Erreur de traitement',
      analysis: 'Analyse',
      summary: 'Résumé',
      category: 'Catégorie',
      keyTerms: 'Termes Clés',
      recommendations: 'Recommandations',
      noDocs: 'Aucun document pour le moment. Téléchargez un fichier pour commencer.'
    },
    ar: {
      title: 'تحليل الوثائق القانونية',
      subtitle: 'ارفع مستنداتك للحصول على تحليل قانوني شامل',
      dropText: 'اسحب وأفلت الملفات هنا أو',
      browseText: 'تصفح الملفات',
      supportedFormats: 'PDF, DOC, DOCX حتى 10MB',
      processing: 'جاري المعالجة…',
      completed: 'تم التحليل',
      error: 'خطأ في المعالجة',
      analysis: 'التحليل',
      summary: 'الملخص',
      category: 'التصنيف',
      keyTerms: 'المصطلحات الرئيسية',
      recommendations: 'التوصيات',
      noDocs: 'لا توجد وثائق حتى الآن. ارفع مستندًا للبدء.'
    }
  }[language];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type !== 'dragleave');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      if (file.size > 10 * 1024 * 1024) return;

      const id = Date.now() + '_' + Math.random().toString(36).slice(2);
      setDocuments(d => [...d, {
        id, name: file.name, size: file.size, type: file.type,
        uploadDate: new Date(), status: 'processing'
      }]);

      try {
        // Extract PDF text
        let text = '';
        if (file.type === 'application/pdf') {
          const buf = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(it => (it as any).str).join(' ') + '\n\n';
          }
        } else {
          text = `[Unsupported format: ${file.type}]`;
        }

        // Update with raw content
        setDocuments(docs => docs.map(d => d.id === id ? { ...d, content: text } : d));

        // Call Azure GPT-4o
        const payload = {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text.slice(0,15000) }
          ],
          max_tokens: 500,
          temperature: 0.3
        };
        const res = await fetch(
          `${AZURE_OPENAI_BASE}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${AZURE_OPENAI_VERSION}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': AZURE_OPENAI_KEY },
            body: JSON.stringify(payload)
          }
        );
        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content || '';
        let analysis = { summary: '', category: '', keyTerms: [], recommendations: [] as string[] };
        try { analysis = JSON.parse(raw); } catch { console.warn('Parse failed', raw); }

        // Final update
        setDocuments(docs => docs.map(d => d.id === id
          ? { ...d, status: 'completed', analysis }
          : d
        ));
      } catch (err) {
        console.error(err);
        setDocuments(docs => docs.map(d => d.id === id
          ? { ...d, status: 'error' }
          : d
        ));
      }
    });
  };

  const removeDocument = (id: string) =>
    setDocuments(docs => docs.filter(d => d.id !== id));

  const formatSize = (bytes: number) => {
    const i = Math.floor(Math.log(bytes)/Math.log(1024));
    return (bytes/Math.pow(1024,i)).toFixed(2) + ['B','KB','MB','GB'][i];
  };

  const getStatusIcon = (status: UploadedDocument['status']) => {
    if (status === 'processing') return <Loader2 className="animate-spin text-blue-600" />;
    if (status === 'completed') return <CheckCircle className="text-green-600" />;
    return <AlertCircle className="text-red-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 rounded-lg p-12 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag} onDragOver={handleDrag}
        onDragLeave={handleDrag} onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-4 text-blue-600" size={48} />
        <p className="text-lg">
          {t.dropText}{' '}
          <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 underline">
            {t.browseText}
          </button>
        </p>
        <p className="text-sm text-gray-500 mt-2">{t.supportedFormats}</p>
        <input
          ref={fileInputRef} type="file" multiple
          accept=".pdf,.doc,.docx"
          onChange={e => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <p className="text-center text-gray-500">{t.noDocs}</p>
      ) : (
        <div className="space-y-6">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white shadow rounded-lg border p-4 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-600" size={24} />
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.uploadDate).toLocaleDateString()} • {formatSize(doc.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(doc.status)}
                  <span className="text-sm">{doc.status === 'processing' ? t.processing : doc.status === 'completed' ? t.completed : t.error}</span>
                  <button onClick={() => removeDocument(doc.id)} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="text-gray-500" size={16}/>
                  </button>
                </div>
              </div>

              {/* Raw Content */}
              {doc.content && (
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap text-gray-700">
                  {doc.content}
                </div>
              )}

              {/* Analysis */}
              {doc.status === 'completed' && doc.analysis && (
                <div className="grid gap-4 md:grid-cols-2 bg-gray-50 p-4 rounded">
                  <div>
                    <h5 className="font-semibold">{t.summary}</h5>
                    <p className="text-sm text-gray-700">{doc.analysis.summary}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold">{t.category}</h5>
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {doc.analysis.category}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold">{t.keyTerms}</h5>
                    <div className="flex flex-wrap gap-2">
                      {doc.analysis.keyTerms.map((term, i) => (
                        <span key={i} className="bg-gray-200 px-2 py-1 rounded text-xs">{term}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold">{t.recommendations}</h5>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                      {doc.analysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
