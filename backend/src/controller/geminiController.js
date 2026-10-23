// backend/src/controller/geminiController.js
import fs from 'fs';
import { generateWithRouting, getModelStatus } from '../services/modelRouter.js';

// Sistema de manejo de errores para el usuario
const handleGeminiError = (error, modelUsed) => {
  console.error('Error original:', error);
  
  const errorMessage = error.message || '';
  
  if (errorMessage.includes('503') || errorMessage.includes('high demand')) {
    return `FLORA está teniendo mucha demanda en este momento. Probando con otro modelo... (${modelUsed})`;
  }
  
  if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return `Límite de peticiones alcanzado. Probando con otro modelo... (${modelUsed})`;
  }
  
  if (errorMessage.includes('API key') || errorMessage.includes('invalid') || errorMessage.includes('403')) {
    return 'Error de autenticación. Por favor, contacta al administrador.';
  }
  
  if (errorMessage.includes('unsupported') || errorMessage.includes('mime type')) {
    return 'El tipo de archivo que intentas subir no está soportado. Usa imágenes (JPG, PNG, WEBP) o PDF.';
  }
  
  if (errorMessage.includes('size') || errorMessage.includes('large')) {
    return 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.';
  }
  
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'El modelo no está disponible. Probando con otro modelo...';
  }
  
  return 'Ups, algo salió mal. Por favor, intenta de nuevo en unos momentos.';
};

const SYSTEM_PROMPT = `
  Eres FLORA, una asistente de inteligencia artificial experta en plantas y jardinería.
  
  REGLAS:
  - La PRIMERA vez que hables, preséntate como "FLORA"
  - Después de la presentación, responde de forma natural y directa
  - NUNCA dices que eres Gemini o de Google
  - Hablas en español
  - Eres amable y profesional
  - Te especializas en: cuidados de plantas, riego, luz, sustrato, plagas, jardinería
  - Si te envían una imagen, identifica la planta y da consejos de cuidado
  - Si te envían un PDF, extrae la información relevante
  - Si no sabes algo, lo admites y ofreces ayuda alternativa
`;

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const files = req.files || [];

    if (!message && files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Por favor, escribe un mensaje o sube un archivo para FLORA.' 
      });
    }

    // Construir el contenido
    const parts = [];
    const userMessage = message || 'Analiza este archivo';
    parts.push({ text: SYSTEM_PROMPT + "\n\nUsuario: " + userMessage });

    // Procesar archivos
    for (const file of files) {
      const filePath = file.path;
      const mimeType = file.mimetype;
      
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        const base64Data = fileData.toString('base64');
        
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
        
        fs.unlinkSync(filePath);
      }
    }

    // Usar el router para generar contenido
    const result = await generateWithRouting([
      {
        role: "user",
        parts: parts
      }
    ]);

    if (result.success) {
      res.json({ 
        success: true, 
        response: result.response,
        modelUsed: result.modelUsed,
        modelDisplayName: result.modelDisplayName
      });
    } else {
      const userMessage = handleGeminiError(result.error, result.modelDisplayName);
      res.status(500).json({ 
        success: false, 
        error: userMessage,
        modelUsed: result.modelUsed
      });
    }

  } catch (error) {
    console.error('Error en chatWithGemini:', error);
    const userMessage = handleGeminiError(error, 'desconocido');
    res.status(500).json({ 
      success: false, 
      error: userMessage 
    });
  }
};

// Endpoint para ver el estado de los modelos
export const getModelsStatus = async (req, res) => {
  try {
    const status = getModelStatus();
    res.json({
      success: true,
      models: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener estado de modelos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estado de modelos'
    });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { prompt, temperature = 0.7, maxTokens = 1000 } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Por favor, describe qué contenido quieres generar.' 
      });
    }

    const result = await generateWithRouting([
      {
        role: "user",
        parts: [{ 
          text: SYSTEM_PROMPT + "\n\nTarea: " + prompt 
        }]
      }
    ]);

    if (result.success) {
      res.json({ 
        success: true, 
        response: result.response,
        modelUsed: result.modelUsed,
        modelDisplayName: result.modelDisplayName
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }

  } catch (error) {
    console.error('Error en generateContent:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al generar contenido' 
    });
  }
};