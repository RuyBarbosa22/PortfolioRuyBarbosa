import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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
      title: 'Conversa com Menebot',
      placeholder: 'Digite sua mensagem...',
      send: 'Enviar',
      connecting: 'Conectando...',
      disconnected: 'Desconectado',
      typing: 'Menebot está digitando...',
      welcomeMessage: 'Olá! Sou o Menebot 🤖 Pergunte-me sobre Ruy Barbosa de Castro!',
    },
    en: {
      title: 'Chat with Menebot',
      placeholder: 'Type your message...',
      send: 'Send',
      connecting: 'Connecting...',
      disconnected: 'Disconnected',
      typing: 'Menebot is typing...',
      welcomeMessage: 'Hello! I am Menebot 🤖 Ask me about Ruy Barbosa de Castro!',
    },
    es: {
      title: 'Conversación con Menebot',
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

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: data.message,
        sender: 'bot',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl shadow-purple-500/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-[var(--font-montserrat)]">
                {content.title}
              </h2>
              <p className="text-xs text-gray-400">
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
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
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
              <div className="bg-gray-800 text-gray-100 rounded-2xl px-4 py-3">
                <p className="text-sm font-['Roboto_Mono',monospace] text-gray-400">
                  {content.typing}
                </p>
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
              className="flex-1 px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {content.send}
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
