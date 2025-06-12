import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedDocument } from '../types';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';  // npm install pdfjs-dist

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
Respond as a JSON object with keys "summary","category","keyTerms","recommendations".
`;

const DocumentUpload: React.FC<DocumentUploadProps> = ({ language }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Translations
  const t = {
    en: {
      processing: 'Processing…',
      completed: 'Analysis completed',
      error: 'Processing error'
    },
    fr: {
      processing: 'En cours de traitement…',
      completed: 'Analyse terminée',
      error: 'Erreur de traitement'
    },
    ar: {
      processing: 'جاري المعالجة…',
      completed: 'تم التحليل',
      error: 'خطأ في المعالجة'
    }
  }[language];

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      if (file.size > 10 * 1024 * 1024) return;

      const id = Date.now().toString();
      setDocuments(docs => [...docs, {
        id, name: file.name, size: file.size, type: file.type,
        uploadDate: new Date(), status: 'processing'
      }]);

      try {
        // 1) Extract text (PDF only for now)
        let text = '';
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => (item as any).str).join(' ') + '\n\n';
          }
        } else {
          // For DOCX/DOC you’d want to send to a backend parser
          text = '[Non-PDF file: sending raw content length ' + file.size + ']';
        }

        // 2) Call Azure OpenAI
        const chatbody = {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text.substring(0, 15000) }
          ],
          max_tokens: 500,
          temperature: 0.3
        };
        const res = await fetch(
          `${AZURE_OPENAI_BASE}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${AZURE_OPENAI_VERSION}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': AZURE_OPENAI_KEY
            },
            body: JSON.stringify(chatbody)
          }
        );
        const { choices } =
          await res.json().catch(() => ({ choices: [] as any[] }));
        const assistant = choices[0]?.message?.content || '';

        // 3) Parse JSON out of assistant content
        let analysis = { summary: '', category: '', keyTerms: [] as string[], recommendations: [] as string[] };
        try {
          analysis = JSON.parse(assistant);
        } catch {
          console.warn('Failed to parse GPT JSON, raw:', assistant);
        }

        // 4) Update document
        setDocuments(docs => docs.map(d => d.id === id
          ? { ...d, status: 'completed', analysis }
          : d
        ));
      } catch (e) {
        console.error(e);
        setDocuments(docs => docs.map(d => d.id === id
          ? { ...d, status: 'error' }
          : d
        ));
      }
    });
  };

  // (Drag & drop, removeDocument, formatFileSize, etc. → unchanged)

  // ... your existing JSX below, just make sure to show
  //   doc.analysis.summary, doc.analysis.category, doc.analysis.keyTerms, doc.analysis.recommendations

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ... upload area, drag handlers ... */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx"
        onChange={e => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Document List */}
      {documents.map(doc => (
        <div key={doc.id} className="bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center">
            <div>
              <FileText className="inline mr-2 text-blue-600" />
              <span className="font-medium">{doc.name}</span>
            </div>
            <div className="flex items-center">
              {doc.status === 'processing' && <Loader2 className="animate-spin text-blue-600" />}
              {doc.status === 'completed' && <CheckCircle className="text-green-600" />}
              {doc.status === 'error' && <AlertCircle className="text-red-600" />}
              <button onClick={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))}>
                <X className="ml-3 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          </div>

          {doc.status === 'completed' && doc.analysis && (
            <div className="mt-4 grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded">
              <div>
                <h6 className="font-semibold">Summary</h6>
                <p className="text-sm">{doc.analysis.summary}</p>
              </div>
              <div>
                <h6 className="font-semibold">Category</h6>
                <span className="inline-block bg-blue-100 px-2 py-1 rounded">{doc.analysis.category}</span>
              </div>
              <div>
                <h6 className="font-semibold">Key Terms</h6>
                <div className="flex flex-wrap gap-2">
                  {doc.analysis.keyTerms.map((t, i) => (
                    <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <h6 className="font-semibold">Recommendations</h6>
                <ul className="list-disc list-inside text-sm">
                  {doc.analysis.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentUpload;
