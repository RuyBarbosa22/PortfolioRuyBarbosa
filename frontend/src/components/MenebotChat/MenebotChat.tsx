import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import menebotFrente from '../../assets/content/menebot/menebot_frente.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  language?: string;
}

interface MenebotChatProps {
  email: string;
  onClose: () => void;
  language?: 'pt' | 'en' | 'es';
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const MenebotChat: React.FC<MenebotChatProps> = ({ email, onClose, language = 'pt' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contentByLang: Record<string, { title: string; placeholder: string; send: string; connecting: string; disconnected: string; typing: string; welcomeMessage: string }> = {
    pt: {
      title: 'Menebot',
      placeholder: 'Digite sua mensagem...',
      send: 'Enviar',
      connecting: 'Conectando...',
      disconnected: 'Desconectado',
      typing: 'Menebot está digitando...',
      welcomeMessage: 'Olá! Sou o Menebot 🤖 Pergunte-me sobre Ruy Barbosa de Castro!',
    },
    en: {
      title: 'Menebot',
      placeholder: 'Type your message...',
      send: 'Send',
      connecting: 'Connecting...',
      disconnected: 'Disconnected',
      typing: 'Menebot is typing...',
      welcomeMessage: 'Hello! I am Menebot 🤖 Ask me about Ruy Barbosa de Castro!',
    },
    es: {
      title: 'Menebot',
      placeholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      connecting: 'Conectando...',
      disconnected: 'Desconectado',
      typing: 'Menebot está escribiendo...',
      welcomeMessage: '¡Hola! Soy Menebot 🤖 ¡Pregúntame sobre Ruy Barbosa de Castro!',
    },
  };

  const content = contentByLang[language];

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Atualiza mensagem de boas-vindas quando idioma muda
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === 'welcome') {
      setMessages((prev) => [
        {
          ...prev[0],
          text: content.welcomeMessage,
        },
        ...prev.slice(1),
      ]);
    }
  }, [language]); // Atualiza apenas quando o idioma muda

  // Conexão WebSocket
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado ao servidor');
      setIsConnected(true);

      // Mensagem de boas-vindas
      setMessages([
        {
          id: 'welcome',
          text: content.welcomeMessage,
          sender: 'bot',
          timestamp: Date.now(),
        },
      ]);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado do servidor');
      setIsConnected(false);
    });

    newSocket.on('response', (data: { message: string; language: string }) => {
      console.log('📨 Resposta recebida:', data);
      setIsTyping(false);

      const newMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.message,
        sender: 'bot',
        timestamp: Date.now(),
        language: data.language,
      };

      setMessages((prev) => [...prev, newMessage]);
    });

    newSocket.on('error', (data: { message: string }) => {
      console.error('❌ Erro:', data);
      setIsTyping(false);

      // Só adiciona mensagem se houver um texto de erro
      if (data && data.message) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: data.message,
          sender: 'bot',
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Limpando conexão WebSocket');
      newSocket.close();
    };
  }, []); // Array vazio - conecta apenas uma vez

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket || !isConnected) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Envia para o servidor
    socket.emit('message', {
      message: inputMessage,
      email: email,
    });

    setIsTyping(true);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-24 bg-black/90 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl w-full max-w-4xl h-[80vh] shadow-2xl shadow-purple-500/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src={menebotFrente} 
                alt="Menebot" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Roboto_Mono',monospace]">
                {content.title}
              </h2>
              <p className="text-xs text-gray-400 font-['Roboto_Mono',monospace]">
                {isConnected ? '🟢 Online' : content.disconnected}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm font-['Roboto_Mono',monospace] whitespace-pre-wrap">
                  {message.text}
                </p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 rounded-2xl px-6 py-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-purple-500/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={content.placeholder}
              disabled={!isConnected}
              className="flex-1 min-w-0 px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-['Roboto_Mono',monospace]"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-['Roboto_Mono',monospace] flex items-center justify-center"
            >
              <span className="hidden sm:inline">{content.send}</span>
              <svg className="inline sm:hidden w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-400 mt-2 font-['Roboto_Mono',monospace]">
              {content.connecting}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
