import React, { useState, useEffect, useRef } from 'react';
import { useFlora } from '../hooks/useFlora';

const FloraChat = () => {
  const { sendMessage, generateContent, loading, error } = useFlora();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hola Admin, soy FLORA. ¿En qué te ayudo con tu negocio de plantas?'
    }
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const previews = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push({
            url: e.target.result,
            name: file.name,
            type: file.type,
            size: file.size
          });
          setFilePreviews([...previews]);
        };
        reader.readAsDataURL(file);
      } else {
        previews.push({
          url: null,
          name: file.name,
          type: file.type,
          size: file.size,
          isPdf: true
        });
        setFilePreviews([...previews]);
      }
    }
  }, [files]);

  const typeText = async (fullText, setMessagesFn, thinkingId) => {
    setIsStreaming(true);
    let currentText = '';
    const chars = fullText.split('');
    
    setMessagesFn(prev => {
      const filtered = prev.filter(msg => msg.id !== thinkingId);
      return [...filtered, { 
        role: 'bot', 
        content: '',
        id: 'streaming-' + Date.now(),
        isStreaming: true
      }];
    });

    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i];
      setMessagesFn(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex] && updated[lastIndex].isStreaming) {
          updated[lastIndex].content = currentText;
        }
        return updated;
      });
      
      let delay = 15;
      if (chars[i] === '.' || chars[i] === ',' || chars[i] === ';' || chars[i] === ':') {
        delay = 40;
      } else if (chars[i] === ' ' && chars[i+1] && chars[i+1] === ' ') {
        delay = 8;
      } else if (i % 50 === 0) {
        delay = 20;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setMessagesFn(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (updated[lastIndex] && updated[lastIndex].isStreaming) {
        updated[lastIndex].isStreaming = false;
      }
      return updated;
    });
    
    setIsStreaming(false);
  };

  const formatText = (text) => {
    if (!text) return text;
    
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return <strong key={index}>{content}</strong>;
      }
      return part;
    });
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;
    if (loading || isStreaming) return;

    const userMessage = {
      role: 'user',
      content: input || 'Analiza este archivo',
      files: filePreviews.map(f => ({
        url: f.url,
        name: f.name,
        isPdf: f.isPdf || false
      }))
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const thinkingId = Date.now();
    setMessages(prev => [...prev, {
      role: 'bot',
      content: 'Procesando...',
      id: thinkingId,
      isThinking: true
    }]);

    const response = await sendMessage(input, files);
    
    setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
    setFiles([]);
    setFilePreviews([]);
    setShowMenu(false);

    if (response) {
      await typeText(response, setMessages, thinkingId);
    } else {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Error al procesar tu solicitud. Intenta de nuevo.'
      }]);
    }
  };

  const handleGenerateContent = async () => {
    if (!input.trim() || isGenerating || isStreaming) return;

    setIsGenerating(true);
    const userMessage = { 
      role: 'user', 
      content: 'Generar: ' + input 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const thinkingId = Date.now();
    setMessages(prev => [...prev, {
      role: 'bot',
      content: 'Generando contenido...',
      id: thinkingId,
      isThinking: true
    }]);

    const response = await generateContent(input);
    setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
    setIsGenerating(false);

    if (response) {
      await typeText(response, setMessages, thinkingId);
    } else {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Error al generar contenido. Intenta de nuevo.'
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e) => {
    if (e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileList]);
      setShowMenu(false);
    }
  };

  const handlePdfSelect = (e) => {
    if (e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileList]);
      setShowMenu(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const toggleMenu = () => {
    if (!loading && !isGenerating && !isStreaming) {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg shadow-[#8E929B]/10 hover:shadow-xl hover:shadow-[#8E929B]/20 transition-shadow duration-300 overflow-hidden border border-[#DCEIDA]/30">
      {/* Header - con icono de hoja */}
      <div className="flex justify-between items-center px-4 py-2.5 bg-gradient-to-r from-[#8E929B] to-[#A4B8AC] text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L4 6l8 4 8-4-8-4z M12 10v8 M4 14l8 4 8-4 M4 18l8 4 8-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide leading-tight">FLORA</h2>
            <span className="text-[9px] opacity-80 font-medium">Asistente IA</span>
          </div>
        </div>
        <button
          onClick={handleGenerateContent}
          disabled={isGenerating || !input.trim() || isStreaming}
          className="text-[10px] bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isGenerating ? 'Generando...' : 'Generar contenido'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#FBE0D9]/5 space-y-4 scroll-smooth">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} ${msg.isThinking ? 'opacity-60' : ''}`}
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#DCEIDA]/30 flex items-center justify-center text-[10px] font-bold text-[#8E929B]">
              {msg.role === 'user' ? 'A' : 'F'}
            </div>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                msg.role === 'bot'
                  ? 'bg-white text-[#1A1A1A] rounded-tl-none border border-[#DCEIDA]/20'
                  : 'bg-[#A4B8AC] text-white rounded-tr-none'
              } ${msg.isStreaming ? 'border-l-4 border-l-[#A4B8AC]' : ''}`}
            >
              {msg.role === 'user' && msg.files && msg.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.files.map((file, idx) => (
                    <div key={idx} className="relative">
                      {file.url ? (
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="max-w-[120px] max-h-[120px] rounded-lg object-cover border border-[#DCEIDA]/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center border border-[#DCEIDA]/20">
                          <svg className="w-8 h-8 text-[#8E929B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-[9px] text-black/50 block truncate max-w-[120px]">
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {msg.isStreaming ? (
                msg.content
              ) : (
                <span>{formatText(msg.content)}</span>
              )}
              {msg.isStreaming && (
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#A4B8AC] animate-pulse"></span>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* File previews */}
      {filePreviews.length > 0 && (
        <div className="px-4 py-1.5 bg-[#FBE0D9]/10 border-t border-[#DCEIDA]/20">
          <div className="flex flex-wrap gap-1.5 items-center">
            {filePreviews.map((preview, index) => (
              <div key={index} className="group flex items-center gap-1.5 bg-white rounded-xl border border-[#DCEIDA]/20 shadow-sm px-2 py-1 transition-all hover:shadow-md">
                {preview.url ? (
                  <img 
                    src={preview.url} 
                    alt={preview.name}
                    className="w-7 h-7 rounded object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded bg-[#FBE0D9]/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#8E929B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className="text-[10px] text-black/70 max-w-[70px] truncate font-medium">
                  {preview.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="w-4 h-4 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={clearFiles}
              className="text-[10px] text-black/40 hover:text-black/80 underline transition-colors ml-1"
            >
              Limpiar todo
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-[#DCEIDA]/20 relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          multiple
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={pdfInputRef}
          onChange={handlePdfSelect}
          multiple
          accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx"
          className="hidden"
        />

        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className={`w-9 h-9 rounded-full border-2 border-[#DCEIDA]/30 flex items-center justify-center transition-all duration-200 ${
              showMenu 
                ? 'bg-[#A4B8AC] text-white border-[#A4B8AC] shadow-md' 
                : 'bg-transparent text-[#8E929B] hover:bg-[#FBE0D9]/20 hover:border-[#A4B8AC]'
            }`}
            disabled={loading || isGenerating || isStreaming}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-[#DCEIDA]/20 overflow-hidden min-w-[180px] z-10 animate-[slideUp_0.2s_ease]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-[#FBE0D9]/10 transition-colors flex items-center gap-3 text-[#1A1A1A] group"
              >
                <span className="w-7 h-7 rounded-full bg-[#FBE0D9]/20 flex items-center justify-center group-hover:bg-[#A4B8AC] group-hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                Subir imagen
              </button>
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-[#FBE0D9]/10 transition-colors flex items-center gap-3 text-[#1A1A1A] group border-t border-[#DCEIDA]/10"
              >
                <span className="w-7 h-7 rounded-full bg-[#FBE0D9]/20 flex items-center justify-center group-hover:bg-[#A4B8AC] group-hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
                Subir PDF o documento
              </button>
            </div>
          )}
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={files.length > 0 ? "Escribe un mensaje o pide analizar los archivos..." : "Escribe tu mensaje para FLORA..."}
          disabled={loading || isGenerating || isStreaming}
          className="flex-1 px-4 py-2 border-2 border-[#DCEIDA]/30 rounded-full text-sm outline-none focus:border-[#A4B8AC] focus:ring-4 focus:ring-[#A4B8AC]/10 disabled:opacity-50 transition-all bg-[#FAFAFA] text-[#1A1A1A] placeholder:text-black/30"
        />
        <button
          onClick={handleSend}
          disabled={loading || isGenerating || isStreaming || (!input.trim() && files.length === 0)}
          className="px-5 py-2 bg-[#8E929B] text-white rounded-full hover:bg-[#A4B8AC] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.97] flex-shrink-0"
        >
          {loading || isStreaming ? 'Enviando...' : 'Enviar'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 bg-[#ECB7B3]/15 text-[#8E5A55] text-sm text-center border-t border-[#ECB7B3]/20">
           {error}
        </div>
      )}
    </div>
  );
};

export default FloraChat;