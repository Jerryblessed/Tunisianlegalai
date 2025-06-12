import React from 'react';
import { MessageCircle, FileText, Mic, Upload, ArrowRight, Shield } from 'lucide-react';

interface HeroProps {
  onSectionChange: (section: string) => void;
  language: string;
}

const Hero: React.FC<HeroProps> = ({ onSectionChange, language }) => {
  const content = {
    ar: {
      title: 'مساعدك القانوني الذكي',
      subtitle: 'احصل على المساعدة القانونية والإدارية المتخصصة باللغة العربية',
      description: 'منصة ذكية تستخدم الذكاء الاصطناعي لتبسيط القوانين التونسية وتوجيهك خلال الإجراءات الإدارية المعقدة',
      features: [
        { icon: MessageCircle, title: 'استشارة قانونية فورية', desc: 'احصل على إجابات دقيقة للأسئلة القانونية' },
        { icon: FileText, title: 'تحليل الوثائق', desc: 'رفع وتحليل المستندات القانونية' },
        { icon: Mic, title: 'التفاعل الصوتي', desc: 'تحدث واستمع للمساعدة القانونية' },
        { icon: Upload, title: 'نماذج ووثائق', desc: 'احصل على النماذج والوثائق الرسمية' }
      ],
      cta: 'ابدأ المحادثة الآن',
      trustBadge: 'مدعوم بالذكاء الاصطناعي المتقدم'
    },
    fr: {
      title: 'Votre Assistant Juridique Intelligent',
      subtitle: 'Obtenez une aide juridique et administrative spécialisée en français',
      description: 'Plateforme intelligente utilisant l\'IA pour simplifier les lois tunisiennes et vous guider dans les procédures administratives complexes',
      features: [
        { icon: MessageCircle, title: 'Conseil juridique instantané', desc: 'Obtenez des réponses précises aux questions juridiques' },
        { icon: FileText, title: 'Analyse de documents', desc: 'Téléchargez et analysez des documents juridiques' },
        { icon: Mic, title: 'Interaction vocale', desc: 'Parlez et écoutez pour l\'assistance juridique' },
        { icon: Upload, title: 'Formulaires et documents', desc: 'Accédez aux formulaires et documents officiels' }
      ],
      cta: 'Commencer la conversation',
      trustBadge: 'Alimenté par l\'IA avancée'
    },
    en: {
      title: 'Your Intelligent Legal Assistant',
      subtitle: 'Get specialized legal and administrative help in English',
      description: 'Smart platform using AI to simplify Tunisian laws and guide you through complex administrative procedures',
      features: [
        { icon: MessageCircle, title: 'Instant Legal Advice', desc: 'Get accurate answers to legal questions' },
        { icon: FileText, title: 'Document Analysis', desc: 'Upload and analyze legal documents' },
        { icon: Mic, title: 'Voice Interaction', desc: 'Speak and listen for legal assistance' },
        { icon: Upload, title: 'Forms & Documents', desc: 'Access official forms and documents' }
      ],
      cta: 'Start Conversation Now',
      trustBadge: 'Powered by Advanced AI'
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {t.features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-blue-100">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-800" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={() => onSectionChange('chat')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-900 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {t.cta}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          
          <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-600" />
            <span>{t.trustBadge}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;