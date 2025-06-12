import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedDocument } from '../types';

interface DocumentUploadProps {
  language: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ language }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const content = {
    ar: {
      title: 'تحليل الوثائق القانونية',
      subtitle: 'ارفع وثائقك للحصول على تحليل قانوني شامل',
      dropText: 'اسحب وأفلت الملفات هنا أو',
      browseText: 'تصفح الملفات',
      supportedFormats: 'PDF, DOC, DOCX حتى 10MB',
      processing: 'جاري المعالجة...',
      completed: 'تم التحليل',
      error: 'خطأ في المعالجة',
      analysis: 'التحليل',
      summary: 'الملخص',
      category: 'التصنيف',
      keyTerms: 'المصطلحات الرئيسية',
      recommendations: 'التوصيات'
    },
    fr: {
      title: 'Analyse de Documents Juridiques',
      subtitle: 'Téléchargez vos documents pour une analyse juridique complète',
      dropText: 'Glissez et déposez les fichiers ici ou',
      browseText: 'parcourir les fichiers',
      supportedFormats: 'PDF, DOC, DOCX jusqu\'à 10MB',
      processing: 'En cours de traitement...',
      completed: 'Analyse terminée',
      error: 'Erreur de traitement',
      analysis: 'Analyse',
      summary: 'Résumé',
      category: 'Catégorie',
      keyTerms: 'Termes clés',
      recommendations: 'Recommandations'
    },
    en: {
      title: 'Legal Document Analysis',
      subtitle: 'Upload your documents for comprehensive legal analysis',
      dropText: 'Drag and drop files here or',
      browseText: 'browse files',
      supportedFormats: 'PDF, DOC, DOCX up to 10MB',
      processing: 'Processing...',
      completed: 'Analysis completed',
      error: 'Processing error',
      analysis: 'Analysis',
      summary: 'Summary',
      category: 'Category',
      keyTerms: 'Key Terms',
      recommendations: 'Recommendations'
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.size <= 10 * 1024 * 1024) { // 10MB limit
        const newDocument: UploadedDocument = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
          status: 'processing'
        };

        setDocuments(prev => [...prev, newDocument]);

        // Simulate document processing
        setTimeout(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDocument.id 
              ? {
                  ...doc,
                  status: 'completed' as const,
                  analysis: {
                    summary: language === 'ar' 
                      ? 'هذه وثيقة قانونية تتضمن شروط وأحكام عقد. تحتوي على بنود تخص الحقوق والواجبات للأطراف المتعاقدة.'
                      : language === 'fr'
                      ? 'Ce document juridique contient les termes et conditions d\'un contrat. Il comprend des clauses concernant les droits et obligations des parties contractantes.'
                      : 'This legal document contains contract terms and conditions. It includes clauses regarding rights and obligations of contracting parties.',
                    category: language === 'ar' ? 'عقد تجاري' : language === 'fr' ? 'Contrat commercial' : 'Commercial Contract',
                    keyTerms: language === 'ar' 
                      ? ['العقد', 'الأطراف', 'الالتزامات', 'المسؤولية', 'الإنهاء']
                      : language === 'fr'
                      ? ['Contrat', 'Parties', 'Obligations', 'Responsabilité', 'Résiliation']
                      : ['Contract', 'Parties', 'Obligations', 'Liability', 'Termination'],
                    recommendations: [
                      language === 'ar' 
                        ? 'يُنصح بمراجعة شروط الدفع بعناية'
                        : language === 'fr'
                        ? 'Il est recommandé d\'examiner attentivement les conditions de paiement'
                        : 'It is recommended to carefully review payment terms',
                      language === 'ar'
                        ? 'التأكد من وضوح بنود المسؤولية'
                        : language === 'fr'
                        ? 'S\'assurer de la clarté des clauses de responsabilité'
                        : 'Ensure clarity of liability clauses'
                    ]
                  }
                }
              : doc
          ));
        }, 3000);
      }
    });
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusText = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'processing':
        return t.processing;
      case 'completed':
        return t.completed;
      case 'error':
        return t.error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h2>
        <p className="text-lg text-gray-600">{t.subtitle}</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-lg text-gray-700">
              {t.dropText}{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t.browseText}
              </button>
            </p>
            <p className="text-sm text-gray-500 mt-2">{t.supportedFormats}</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {language === 'ar' ? 'الوثائق المرفوعة' : 
             language === 'fr' ? 'Documents téléchargés' : 
             'Uploaded Documents'}
          </h3>

          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Document Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(doc.size)} • {doc.uploadDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(doc.status)}
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(doc.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              {doc.status === 'completed' && doc.analysis && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <h5 className="font-semibold text-gray-900 mb-3">{t.analysis}</h5>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">{t.summary}</h6>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {doc.analysis.summary}
                      </p>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">{t.category}</h6>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {doc.analysis.category}
                      </span>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">{t.keyTerms}</h6>
                      <div className="flex flex-wrap gap-2">
                        {doc.analysis.keyTerms.map((term, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">{t.recommendations}</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {doc.analysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
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