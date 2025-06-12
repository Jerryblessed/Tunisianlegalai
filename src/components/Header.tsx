import React from 'react';
import { Scale, Menu, Globe } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

const Header: React.FC<HeaderProps> = ({ 
  currentSection, 
  onSectionChange, 
  onLanguageChange, 
  currentLanguage 
}) => {
  const sections = [
    { id: 'home', label: 'الرئيسية', labelEn: 'Home' },
    { id: 'chat', label: 'استشارة قانونية', labelEn: 'Legal Chat' },
    { id: 'documents', label: 'الوثائق', labelEn: 'Documents' },
    { id: 'processes', label: 'الإجراءات', labelEn: 'Processes' },
  ];

  const languages = [
    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-gradient-to-br from-blue-800 to-blue-600 p-2 rounded-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                تونس القانونية الذكية
              </h1>
              <p className="text-xs text-gray-600">TuniLegal AI</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 space-x-reverse">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentSection === section.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                {currentLanguage === 'ar' ? section.label : section.labelEn}
              </button>
            ))}
          </nav>

          {/* Language Selector */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-800 hover:bg-blue-50">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;