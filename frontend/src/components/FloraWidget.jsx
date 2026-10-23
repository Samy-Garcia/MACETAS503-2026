import React, { useState, useEffect, useRef } from 'react';
import { useFloraContext } from '../context/FloraContext.jsx';
import { useFloraClient } from '../hooks/useFloraClient.js';

const PAGE_CONFIG = {
  home: {
    welcome: 'Hola, soy FLORA. ¿Buscas algo en especial?',
    suggestions: ['Plantas de interior', 'Plantas fáciles de cuidar', 'Regalar una planta']
  },
  catalog: {
    welcome: '¿Te ayudo a encontrar la maceta o planta ideal?',
    suggestions: ['Plantas para poca luz', 'Macetas para suculentas', 'Plantas purificadoras']
  },
  product: {
    welcome: '¿Quieres saber más sobre este producto?',
    suggestions: ['Cuidados de esta planta', 'Maceta compatible', 'Es apta para mascotas']
  },
  cart: {
    welcome: '¿Quieres finalizar tu compra?',
    suggestions: ['Ver total', 'Aplicar cupón', 'Ir a pagar']
  },
  checkout: {
    welcome: '¿Necesitas ayuda con el pago?',
    suggestions: ['Métodos de pago', 'Envío', 'Cupón de descuento']
  },
  orders: {
    welcome: '¿Quieres rastrear tus pedidos?',
    suggestions: ['Ver estado', 'Rastrear envío', 'Ayuda']
  },
  wishlist: {
    welcome: '¿Quieres gestionar tu lista de deseos?',
    suggestions: ['Ver wishlist', 'Mover al carrito', 'Ver ofertas']
  },
  profile: {
    welcome: '¿Necesitas ayuda con tu perfil?',
    suggestions: ['Ver puntos', 'Editar perfil', 'Recompensas']
  },
  rewards: {
    welcome: '¿Quieres saber cómo usar tus hojas?',
    suggestions: ['Ver puntos', 'Canjear recompensas', 'Cómo ganar']
  },
  guide: {
    welcome: '¿Qué planta tienes? Te ayudo con sus cuidados.',
    suggestions: ['Monstera', 'Suculenta', 'Pothos', 'Otra planta']
  },
  faq: {
    welcome: '¿Tienes alguna duda? Pregúntame.',
    suggestions: ['Envíos', 'Devoluciones', 'Pagos']
  }
};

const FloraWidget = () => {
  const { currentPage, isOpen, toggleWidget, closeWidget } = useFloraContext();
  const { sendMessage, loading, error } = useFloraClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const config = PAGE_CONFIG[currentPage] || PAGE_CONFIG.home;
    setMessages([
      {
        role: 'bot',
        content: config.welcome
      }
    ]);
    setSuggestions(config.suggestions || []);
  }, [currentPage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const message = text || input;
    if (!message.trim()) return;
    if (loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    const thinkingId = Date.now();
    setMessages(prev => [...prev, {
      role: 'bot',
      content: 'Pensando...',
      id: thinkingId,
      isThinking: true
    }]);

    const response = await sendMessage(message, [], currentPage);
    
    setMessages(prev => prev.filter(msg => msg.id !== thinkingId));

    if (response) {
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } else {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Lo siento, hubo un error. Por favor, intenta de nuevo.'
      }]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatText = (text) => {
    if (!text) return text;
    
    if (!text.includes('**')) {
      return text.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    }
    
    const parts = text.split('**');
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      }
      return part.split('\n').map((line, i, arr) => (
        <React.Fragment key={`${index}-${i}`}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <>
      <button
        onClick={toggleWidget}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-[#8E929B] to-[#A4B8AC] hover:shadow-xl'
        }`}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L4 6l8 4 8-4-8-4z M12 10v8 M4 14l8 4 8-4 M4 18l8 4 8-4" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 max-[480px]:w-[calc(100%-32px)] max-[480px]:h-[calc(100%-120px)] max-[480px]:right-4 max-[480px]:bottom-20">
          <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-[#8E929B] to-[#A4B8AC] text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div>
                <div className="text-sm font-semibold">FLORA</div>
                <div className="text-[10px] opacity-80">Asistente de plantas</div>
              </div>
            </div>
            <button 
              onClick={closeWidget}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex-shrink-0">
            <span>Estás en:</span>
            <span className="bg-[#A4B8AC] text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
              {currentPage === 'home' && 'Inicio'}
              {currentPage === 'catalog' && 'Catálogo'}
              {currentPage === 'product' && 'Producto'}
              {currentPage === 'cart' && 'Carrito'}
              {currentPage === 'checkout' && 'Pago'}
              {currentPage === 'orders' && 'Pedidos'}
              {currentPage === 'wishlist' && 'Lista de deseos'}
              {currentPage === 'profile' && 'Perfil'}
              {currentPage === 'rewards' && 'Recompensas'}
              {currentPage === 'guide' && 'Guía de cuidados'}
              {currentPage === 'faq' && 'Preguntas frecuentes'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2.5">
            {messages.map((msg, index) => (
              <div
                key={msg.id || `msg-${index}`}
                className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === 'bot' 
                    ? 'bg-white text-gray-800 self-start rounded-bl-none shadow-sm' 
                    : 'bg-[#A4B8AC] text-white self-end rounded-br-none'
                } ${msg.isThinking ? 'opacity-60' : ''}`}
              >
                {msg.role === 'bot' && (
                  <div className="text-[10px] font-semibold text-[#8E929B] mb-1">FLORA</div>
                )}
                {msg.isThinking ? (
                  <span>Pensando...</span>
                ) : (
                  <span>{formatText(msg.content)}</span>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-gray-100 bg-white flex-shrink-0">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={loading}
                  className="px-3 py-1 text-xs border border-gray-200 rounded-full bg-white text-gray-600 hover:bg-gray-50 hover:border-[#A4B8AC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 px-3 py-2.5 border-t border-gray-200 bg-white flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full outline-none focus:border-[#A4B8AC] focus:ring-2 focus:ring-[#A4B8AC]/20 disabled:opacity-50 transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-[#8E929B] text-white text-sm font-medium rounded-full hover:bg-[#A4B8AC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloraWidget;