import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';

const CHAT_HISTORY_KEY = 'echoaid-chat-history';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to load chat history:", error);
      localStorage.removeItem(CHAT_HISTORY_KEY); // Clear corrupted data
      return [];
    }
  });
  
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } else {
        // If messages are cleared, remove from storage too.
        localStorage.removeItem(CHAT_HISTORY_KEY);
      }
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const initializeChat = () => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        // Convert our message format to the format Gemini API expects for history
        const history = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: `You are Echo, a friendly and reassuring AI assistant for the EchoAid disaster response platform. Your primary goal is to help users by answering their questions about disaster safety and how to use the app. Keep your answers concise, clear, and calming. Do not provide medical advice, but you can suggest when to seek professional medical help. Be empathetic and supportive. Start the conversation by introducing yourself and asking how you can help.`,
            },
        });
    } catch (error) {
        console.error("Failed to initialize Gemini Chat:", error);
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am unable to connect right now. Please try again later.' }]);
    }
  };

  const startConversation = async () => {
    if (!chatRef.current) {
        console.error("Chat ref not initialized before starting conversation.");
        setMessages([{ sender: 'bot', text: 'Error initializing chat. Please close and reopen.' }]);
        return;
    }

    setIsLoading(true);
    try {
        const initialResponse = await chatRef.current.sendMessage({ message: "Hello" });
        if (initialResponse) {
            setMessages([{ sender: 'bot', text: initialResponse.text }]);
        }
    } catch (error) {
        console.error("Chatbot initial message error:", error);
        setMessages([{ sender: 'bot', text: 'Sorry, I am having trouble starting our conversation. Please try again.' }]);
    } finally {
        setIsLoading(false);
    }
  };


  const handleToggleChat = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) {
      // Re-initialize the chat session with the current history every time it's opened.
      initializeChat(); 
      if (messages.length === 0) {
        // This will only run for a brand new user with no history.
        startConversation();
      }
    } else {
      // When closing, clear the ref to free up memory.
      chatRef.current = null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading || !chatRef.current) return;

    const newMessages = [...messages, { sender: 'user' as const, text: trimmedInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: trimmedInput });
      setMessages(prev => [...prev, { sender: 'bot', text: response.text }]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'I seem to be having trouble responding. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleChat}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform hover:scale-110 z-50"
        aria-label="Open AI chatbot"
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Bot className="text-primary-500" size={24} />
              <h3 className="text-lg font-bold">Echo - AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center"><Bot className="text-primary-500" size={20} /></div>}
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                 {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center"><UserIcon size={20} /></div>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center"><Bot className="text-primary-500" size={20} /></div>
                 <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-slate-700 rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-grow bg-gray-100 dark:bg-slate-700 border-transparent rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button type="submit" className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 disabled:bg-primary-300" disabled={isLoading || !userInput.trim()}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;