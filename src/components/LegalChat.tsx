import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, FileText, Loader2 } from 'lucide-react';
import { Message } from '../types';

// Add these types to handle browser SpeechRecognition events if using TypeScript
// You might need to add "dom.iterable" to your tsconfig.json `lib` array.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface LegalChatProps {
  language: string;
}

// !! SECURITY WARNING !!
// Do NOT hardcode API keys in your frontend code.
// Use environment variables (e.g., import.meta.env.VITE_AZURE_OPENAI_KEY)
// and make API calls from a secure backend server.
const AZURE_OPENAI_BASE = "https://thisisoajo.openai.azure.com";
const AZURE_OPENAI_MODEL = "gpt-4o";
const AZURE_OPENAI_KEY = "9I4UEJweVUdih04Uv8AXcAxs5H8jSQRfwaugcSQYHcI882wSpFvqJQQJ99BAACL93NaXJ3w3AAABACOGkv4f";

const AZURE_OPENAI_VERSION = "2023-06-01-preview";

const LegalChat: React.FC<LegalChatProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // This state now means "Text-to-Speech is enabled"
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  // Ref to hold the SpeechRecognition instance
  const recognitionRef = useRef<any>(null);

  const content = {
    // ... (content object is unchanged)
    ar: { placeholder: 'اكتب سؤالك القانوني هنا...', send: 'إرسال', recording: 'جاري التسجيل...', speaking: 'جاري النطق...', welcome: 'مرحباً! أنا مساعدك القانوني الذكي. يمكنني مساعدتك في فهم القوانين التونسية والإجراءات الإدارية. كيف يمكنني مساعدتك اليوم؟' },
    fr: { placeholder: 'Tapez votre question juridique ici...', send: 'Envoyer', recording: 'Enregistrement...', speaking: 'En cours de lecture...', welcome: 'Bonjour ! Je suis votre assistant juridique intelligent. Je peux vous aider à comprendre les lois tunisiennes et les procédures administratives. Comment puis-je vous aider aujourd\'hui ?' },
    en: { placeholder: 'Type your legal question here...', send: 'Send', recording: 'Recording...', speaking: 'Speaking...', welcome: 'Hello! I\'m your intelligent legal assistant. I can help you understand Tunisian laws and administrative procedures. How can I help you today?' }
  };

  const t = content[language as keyof typeof content] || content.en;

  // Map app language to Web Speech API language codes
  const languageMap = {
    en: 'en-US',
    fr: 'fr-FR',
    ar: 'ar-SA',
  };

  // --- START: SPEECH-TO-TEXT (STT) & TEXT-TO-SPEECH (TTS) LOGIC ---

  // 1. Setup Speech Recognition on component mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop listening after user stops talking
    recognition.interimResults = true; // Show results as the user speaks

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setInputValue(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel(); // Clean up TTS on unmount
    };
  }, []);

  // 2. Update recognition language when the language prop changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageMap[language as keyof typeof languageMap];
    }
  }, [language]);

  // 3. Text-to-Speech function
  const speakText = (text: string, lang: string) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageMap[lang as keyof typeof languageMap];
    window.speechSynthesis.speak(utterance);
  };

  // 4. Function to toggle voice recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel(); // Stop TTS before recording
      setInputValue(''); // Clear input before starting
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // 5. Function to toggle TTS on/off
  const toggleSpeech = () => {
    const newTtsState = !isSpeaking;
    setIsSpeaking(newTtsState);
    if (!newTtsState) {
      window.speechSynthesis.cancel(); // If turning off, stop any active speech
    }
  };

  // --- END: SPEECH & TTS LOGIC ---
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.welcome, timestamp: new Date() }]);
    }
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Auto-resize textarea height
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSystemPrompt = () => {
    // ... (getSystemPrompt function is unchanged)
    const prompts = { ar: `...`, fr: `...`, en: `...` };
    return prompts[language as keyof typeof prompts] || prompts.en;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    window.speechSynthesis.cancel(); // Stop any speaking before sending

    const userMessage: Message = {
      role: 'user', content: inputValue.trim(), timestamp: new Date()
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
          headers: { 'Content-Type': 'application/json', 'api-key': AZURE_OPENAI_KEY },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: getSystemPrompt() },
              ...newMessages.map(msg => ({ role: msg.role, content: msg.content }))
            ],
            max_tokens: 1000, temperature: 0.3
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

        // ** Speak the assistant's response if TTS is enabled **
        if (isSpeaking) {
          speakText(assistantMessage.content, language);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: language === 'ar' ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Sorry, an error occurred. Please try again.',
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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              {language === 'ar' ? 'المساعد القانوني' : language === 'fr' ? 'Assistant Juridique' : 'Legal Assistant'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSpeech}
              title={isSpeaking ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
              className={`p-2 rounded-lg transition-colors ${
                isSpeaking 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {/* ... (Messages mapping is unchanged) ... */}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl px-4 py-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              {message.timestamp && (<p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{message.timestamp.toLocaleTimeString()}</p>)}
            </div>
          </div>
        ))}
        {isLoading && (<div className="flex justify-start"><div className="bg-gray-100 rounded-lg px-4 py-3"><div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin text-blue-600" /><span className="text-gray-600">{language === 'ar' ? 'جاري الكتابة...' : 'Typing...'}</span></div></div></div>)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <button
            onClick={toggleRecording}
            title={isRecording ? "Stop Recording" : "Start Recording"}
            className={`p-3 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-y-hidden"
              rows={1}
              style={{ maxHeight: '120px' }}
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