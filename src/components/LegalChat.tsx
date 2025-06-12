import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, FileText, Loader2 } from 'lucide-react';
import { Message } from '../types';

interface LegalChatProps {
  language: string;
}

// AI Configuration
const AZURE_OPENAI_BASE = "https://thisisoajo.openai.azure.com";
const AZURE_OPENAI_MODEL = "gpt-4o";
const AZURE_OPENAI_KEY = "9I4UEJweVUdih04Uv8AXcAxs5H8jSQRfwaugcSQYHcI882wSpFvqJQQJ99BAACL93NaXJ3w3AAABACOGkv4f";
const AZURE_OPENAI_VERSION = "2023-06-01-preview";

const LegalChat: React.FC<LegalChatProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const content = {
    ar: {
      placeholder: 'اكتب سؤالك القانوني هنا...',
      send: 'إرسال',
      recording: 'جاري التسجيل...',
      speaking: 'جاري النطق...',
      welcome: 'مرحباً! أنا مساعدك القانوني الذكي. يمكنني مساعدتك في فهم القوانين التونسية والإجراءات الإدارية. كيف يمكنني مساعدتك اليوم؟'
    },
    fr: {
      placeholder: 'Tapez votre question juridique ici...',
      send: 'Envoyer',
      recording: 'Enregistrement...',
      speaking: 'En cours de lecture...',
      welcome: 'Bonjour ! Je suis votre assistant juridique intelligent. Je peux vous aider à comprendre les lois tunisiennes et les procédures administratives. Comment puis-je vous aider aujourd\'hui ?'
    },
    en: {
      placeholder: 'Type your legal question here...',
      send: 'Send',
      recording: 'Recording...',
      speaking: 'Speaking...',
      welcome: 'Hello! I\'m your intelligent legal assistant. I can help you understand Tunisian laws and administrative procedures. How can I help you today?'
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  useEffect(() => {
    // Add welcome message on component mount
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: t.welcome,
        timestamp: new Date()
      }]);
    }
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSystemPrompt = () => {
    const prompts = {
      ar: `أنت مساعد قانوني ذكي متخصص في القانون التونسي. يجب أن تقدم إجابات دقيقة ومفيدة باللغة العربية حول:
- القوانين والتشريعات التونسية
- الإجراءات الإدارية والبيروقراطية
- حقوق المواطنين وواجباتهم
- إجراءات تأسيس الشركات والأعمال
- القضايا المدنية والتجارية

يجب أن تكون إجاباتك:
- دقيقة ومبنية على القانون التونسي
- واضحة ومفهومة للمواطن العادي
- تتضمن خطوات عملية عند الحاجة
- تنصح بمراجعة محامي للحالات المعقدة`,
      
      fr: `Vous êtes un assistant juridique intelligent spécialisé dans le droit tunisien. Vous devez fournir des réponses précises et utiles en français sur:
- Les lois et réglementations tunisiennes
- Les procédures administratives et bureaucratiques
- Les droits et devoirs des citoyens
- Les procédures de création d'entreprises
- Les questions civiles et commerciales

Vos réponses doivent être:
- Précises et basées sur le droit tunisien
- Claires et compréhensibles pour le citoyen ordinaire
- Inclure des étapes pratiques si nécessaire
- Conseiller de consulter un avocat pour les cas complexes`,
      
      en: `You are an intelligent legal assistant specialized in Tunisian law. You must provide accurate and helpful answers in English about:
- Tunisian laws and regulations
- Administrative and bureaucratic procedures
- Citizens' rights and duties
- Business establishment procedures
- Civil and commercial matters

Your answers should be:
- Accurate and based on Tunisian law
- Clear and understandable for ordinary citizens
- Include practical steps when needed
- Advise consulting a lawyer for complex cases`
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${AZURE_OPENAI_BASE}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${AZURE_OPENAI_VERSION}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_OPENAI_KEY
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: getSystemPrompt() },
              ...newMessages.map(msg => ({ role: msg.role, content: msg.content }))
            ],
            max_tokens: 1000,
            temperature: 0.3
          })
        }
      );

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : language === 'fr'
          ? 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleRecording = () => {
    // Voice recording functionality would be implemented here
    setIsRecording(!isRecording);
    // For demo purposes, we'll just toggle the state
  };

  const toggleSpeech = () => {
    // Text-to-speech functionality would be implemented here
    setIsSpeaking(!isSpeaking);
    // For demo purposes, we'll just toggle the state
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              {language === 'ar' ? 'المساعد القانوني' : 
               language === 'fr' ? 'Assistant Juridique' : 
               'Legal Assistant'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-lg transition-colors ${
                isSpeaking 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              {message.timestamp && (
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-gray-600">جاري الكتابة...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          
          <div className="flex-1">
            <textarea
              ref={chatInputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        {isRecording && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-red-600">
            <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-sm">{t.recording}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalChat;