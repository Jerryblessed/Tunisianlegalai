import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LegalChat from './components/LegalChat';
import DocumentUpload from './components/DocumentUpload';
import ProcessGuides from './components/ProcessGuides';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [currentLanguage, setCurrentLanguage] = useState('ar');

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <Hero onSectionChange={setCurrentSection} language={currentLanguage} />;
      case 'chat':
        return (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <LegalChat language={currentLanguage} />
          </div>
        );
      case 'documents':
        return (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <DocumentUpload language={currentLanguage} />
          </div>
        );
      case 'processes':
        return (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <ProcessGuides language={currentLanguage} />
          </div>
        );
      default:
        return <Hero onSectionChange={setCurrentSection} language={currentLanguage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Header
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onLanguageChange={setCurrentLanguage}
        currentLanguage={currentLanguage}
      />
      
      <main>
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {currentLanguage === 'ar' ? 'تونس القانونية الذكية' : 
                 currentLanguage === 'fr' ? 'TuniLegal AI' : 
                 'TuniLegal AI'}
              </h3>
              <p className="text-gray-400">
                {currentLanguage === 'ar' ? 'منصة ذكية لتبسيط القوانين التونسية والإجراءات الإدارية' :
                 currentLanguage === 'fr' ? 'Plateforme intelligente pour simplifier les lois tunisiennes et les procédures administratives' :
                 'Smart platform to simplify Tunisian laws and administrative procedures'}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {currentLanguage === 'ar' ? 'الخدمات' : 
                 currentLanguage === 'fr' ? 'Services' : 
                 'Services'}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>{currentLanguage === 'ar' ? 'استشارة قانونية' : currentLanguage === 'fr' ? 'Conseil juridique' : 'Legal Consultation'}</li>
                <li>{currentLanguage === 'ar' ? 'تحليل الوثائق' : currentLanguage === 'fr' ? 'Analyse de documents' : 'Document Analysis'}</li>
                <li>{currentLanguage === 'ar' ? 'دليل الإجراءات' : currentLanguage === 'fr' ? 'Guide des procédures' : 'Process Guide'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {currentLanguage === 'ar' ? 'تواصل معنا' : 
                 currentLanguage === 'fr' ? 'Contact' : 
                 'Contact'}
              </h4>
              <p className="text-gray-400">
                {currentLanguage === 'ar' ? 'مطور في إطار هاكاثون AINS 3.0' :
                 currentLanguage === 'fr' ? 'Développé dans le cadre d\'AINS 3.0 Hackathon' :
                 'Developed for AINS 3.0 Hackathon'}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>
              © 2025 TuniLegal AI. {currentLanguage === 'ar' ? 'جميع الحقوق محفوظة' : 
                                   currentLanguage === 'fr' ? 'Tous droits réservés' : 
                                   'All rights reserved'}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
