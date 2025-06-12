import React, { useState } from 'react';
import { ChevronRight, Clock, CheckCircle, Circle, AlertCircle, BookOpen } from 'lucide-react';
import { LegalProcess, ProcessStep } from '../types';

interface ProcessGuidesProps {
  language: string;
}

const ProcessGuides: React.FC<ProcessGuidesProps> = ({ language }) => {
  const [selectedProcess, setSelectedProcess] = useState<LegalProcess | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const content = {
    ar: {
      title: 'دليل الإجراءات الإدارية',
      subtitle: 'خطوات مبسطة للإجراءات الحكومية والقانونية',
      selectProcess: 'اختر الإجراء',
      backToList: 'العودة للقائمة',
      estimatedTime: 'الوقت المقدر',
      difficulty: 'مستوى الصعوبة',
      completed: 'مكتمل',
      markComplete: 'وضع علامة كمكتمل',
      markIncomplete: 'إلغاء الإكمال',
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
      required: 'مطلوب',
      optional: 'اختياري'
    },
    fr: {
      title: 'Guide des Procédures Administratives',
      subtitle: 'Étapes simplifiées pour les procédures gouvernementales et juridiques',
      selectProcess: 'Sélectionner la procédure',
      backToList: 'Retour à la liste',
      estimatedTime: 'Temps estimé',
      difficulty: 'Niveau de difficulté',
      completed: 'Terminé',
      markComplete: 'Marquer comme terminé',
      markIncomplete: 'Marquer comme non terminé',
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
      required: 'Requis',
      optional: 'Optionnel'
    },
    en: {
      title: 'Administrative Process Guide',
      subtitle: 'Simplified steps for government and legal procedures',
      selectProcess: 'Select Process',
      backToList: 'Back to List',
      estimatedTime: 'Estimated Time',
      difficulty: 'Difficulty Level',
      completed: 'Completed',
      markComplete: 'Mark as Complete',
      markIncomplete: 'Mark as Incomplete',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      required: 'Required',
      optional: 'Optional'
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  // Sample processes data
  const processes: LegalProcess[] = [
    {
      id: '1',
      title: language === 'ar' ? 'تأسيس شركة' : language === 'fr' ? 'Création d\'entreprise' : 'Company Formation',
      description: language === 'ar' 
        ? 'خطوات تأسيس شركة جديدة في تونس'
        : language === 'fr'
        ? 'Étapes pour créer une nouvelle entreprise en Tunisie'
        : 'Steps to establish a new company in Tunisia',
      category: language === 'ar' ? 'الأعمال' : language === 'fr' ? 'Affaires' : 'Business',
      estimatedDuration: language === 'ar' ? '2-4 أسابيع' : language === 'fr' ? '2-4 semaines' : '2-4 weeks',
      difficulty: 'medium',
      steps: [
        {
          id: '1-1',
          title: language === 'ar' ? 'اختيار اسم الشركة' : language === 'fr' ? 'Choisir le nom de l\'entreprise' : 'Choose Company Name',
          description: language === 'ar' 
            ? 'تحقق من توفر الاسم لدى المعهد الوطني للملكية الصناعية'
            : language === 'fr'
            ? 'Vérifier la disponibilité du nom auprès de l\'Institut National de la Normalisation et de la Propriété Industrielle'
            : 'Check name availability with the National Institute for Standardization and Industrial Property',
          completed: false,
          required: true,
          estimatedTime: '1-2 أيام'
        },
        {
          id: '1-2',
          title: language === 'ar' ? 'إعداد النظام الأساسي' : language === 'fr' ? 'Préparer les statuts' : 'Prepare Articles of Incorporation',
          description: language === 'ar'
            ? 'صياغة النظام الأساسي للشركة مع محامي أو خبير قانوني'
            : language === 'fr'
            ? 'Rédiger les statuts de la société avec un avocat ou un expert juridique'
            : 'Draft company articles with a lawyer or legal expert',
          completed: false,
          required: true,
          estimatedTime: '3-5 أيام'
        },
        {
          id: '1-3',
          title: language === 'ar' ? 'إيداع رأس المال' : language === 'fr' ? 'Dépôt du capital' : 'Capital Deposit',
          description: language === 'ar'
            ? 'إيداع رأس المال في بنك معتمد والحصول على شهادة الإيداع'
            : language === 'fr'
            ? 'Déposer le capital dans une banque agréée et obtenir le certificat de dépôt'
            : 'Deposit capital in an approved bank and obtain deposit certificate',
          completed: false,
          required: true,
          estimatedTime: '1-2 أيام'
        }
      ]
    },
    {
      id: '2',
      title: language === 'ar' ? 'الحصول على جواز سفر' : language === 'fr' ? 'Obtenir un passeport' : 'Obtain Passport',
      description: language === 'ar'
        ? 'إجراءات الحصول على جواز سفر تونسي'
        : language === 'fr'
        ? 'Procédures pour obtenir un passeport tunisien'
        : 'Procedures to obtain a Tunisian passport',
      category: language === 'ar' ? 'الوثائق الشخصية' : language === 'fr' ? 'Documents personnels' : 'Personal Documents',
      estimatedDuration: language === 'ar' ? '1-2 أسابيع' : language === 'fr' ? '1-2 semaines' : '1-2 weeks',
      difficulty: 'easy',
      steps: [
        {
          id: '2-1',
          title: language === 'ar' ? 'جمع الوثائق المطلوبة' : language === 'fr' ? 'Rassembler les documents requis' : 'Gather Required Documents',
          description: language === 'ar'
            ? 'بطاقة التعريف الوطنية، شهادة ميلاد، صور شمسية'
            : language === 'fr'
            ? 'Carte d\'identité nationale, acte de naissance, photos d\'identité'
            : 'National ID card, birth certificate, passport photos',
          completed: false,
          required: true,
          estimatedTime: '1 يوم'
        }
      ]
    }
  ];

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return t.easy;
      case 'medium':
        return t.medium;
      case 'hard':
        return t.hard;
      default:
        return difficulty;
    }
  };

  if (selectedProcess) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Process Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <button
            onClick={() => setSelectedProcess(null)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            {t.backToList}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedProcess.title}
              </h2>
              <p className="text-gray-600">{selectedProcess.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="text-center">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {t.estimatedTime}
                </div>
                <span className="font-semibold text-gray-900">
                  {selectedProcess.estimatedDuration}
                </span>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">{t.difficulty}</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProcess.difficulty)}`}>
                  {getDifficultyText(selectedProcess.difficulty)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-4">
          {selectedProcess.steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            return (
              <div
                key={step.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                  isCompleted ? 'border-green-500 bg-green-50' : 'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-white font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {step.title}
                      </h3>
                      {step.required && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {t.required}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {step.estimatedTime && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {step.estimatedTime}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleStepCompletion(step.id)}
                    className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isCompleted
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    {isCompleted ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t.completed}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Circle className="h-4 w-4 mr-1" />
                        {t.markComplete}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h2>
        <p className="text-lg text-gray-600">{t.subtitle}</p>
      </div>

      {/* Process Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processes.map((process) => (
          <div
            key={process.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedProcess(process)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(process.difficulty)}`}>
                  {getDifficultyText(process.difficulty)}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {process.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {process.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {process.estimatedDuration}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{process.steps.length} خطوات</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessGuides;