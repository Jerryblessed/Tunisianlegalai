import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedDocument } from '../types';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // npm install pdfjs-dist

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

    A concise summary.

    A legal category.

    5 key terms.

    3 practical recommendations.
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
supportedFormats: 'PDF, DOC, DOCX jusqu'à 10MB',
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

    