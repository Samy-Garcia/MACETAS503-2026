import fs from 'fs';
import { generateWithRouting } from '../services/modelRouter.js';

const CLIENT_SYSTEM_PROMPT = `
  Eres FLORA, una asistente de inteligencia artificial experta en plantas y jardinería.
  
  REGLAS:
  - Eres amable, cálida y cercana (como una amiga que sabe de plantas)
  - Hablas en español, con un tono informal pero profesional
  - Te especializas en: cuidados de plantas, macetas, jardinería, recomendaciones
  - Ayudas a los clientes a encontrar el producto ideal según sus necesidades
  - Puedes dar consejos de cuidado para plantas específicas
  - Si te preguntan por un producto, recomiendas basándote en tus conocimientos
  - Si no sabes algo, lo admites y sugieres consultar con el equipo de soporte
  - NUNCA dices que eres Gemini o de Google
  - Te presentas como "FLORA" en tu primer mensaje
  - Usas **negritas** para resaltar información importante
  
  LO QUE PUEDES HACER:
  - Recomendar plantas según el espacio, luz, experiencia del cliente
  - Explicar cuidados de plantas específicas
  - Sugerir macetas según la planta
  - Dar consejos de jardinería
  - Ayudar a elegir productos según necesidades
  
  LO QUE NO PUEDES HACER:
  - No puedes navegar por la página
  - No puedes agregar productos al carrito
  - No puedes ver el inventario en tiempo real
  - Si el cliente quiere comprar, indícale que puede buscar el producto en la tienda
  
  EJEMPLO DE RESPUESTA:
  "Para tu departamento con poca luz, te recomiendo una **Sansevieria**. Es resistente, necesita poco riego y purifica el aire. ¿Quieres saber más sobre sus cuidados?"
`;

const handleGeminiError = (error) => {
  console.error('Error original:', error);
  const errorMessage = error.message || '';
  
  if (errorMessage.includes('503') || errorMessage.includes('high demand')) {
    return 'FLORA está teniendo mucha demanda en este momento. Por favor, espera unos segundos y vuelve a intentarlo.';
  }
  if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return 'Has alcanzado el límite de peticiones por ahora. Espera un momento y vuelve a intentarlo.';
  }
  if (errorMessage.includes('API key') || errorMessage.includes('invalid') || errorMessage.includes('403')) {
    return 'Error de autenticación. Por favor, contacta al administrador.';
  }
  if (errorMessage.includes('unsupported') || errorMessage.includes('mime type')) {
    return 'El tipo de archivo no está soportado. Usa imágenes o PDF.';
  }
  if (errorMessage.includes('size') || errorMessage.includes('large')) {
    return 'El archivo es demasiado grande. El máximo es 10MB.';
  }
  if (errorMessage.includes('timeout') || errorMessage.includes('504')) {
    return 'La respuesta está tomando más tiempo de lo normal. Intenta de nuevo.';
  }
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'El modelo de IA no está disponible. Intenta más tarde.';
  }
  return 'Ups, algo salió mal. Por favor, intenta de nuevo.';
};

export const chatWithClient = async (req, res) => {
  try {
    const { message, currentPage } = req.body;
    const files = req.files || [];

    if (!message && files.length === 0) {
      return res.status(400).json({ success: false, error: 'Por favor, escribe un mensaje o sube un archivo.' });
    }

    const parts = [];
    const pageContext = currentPage ? `\n[Contexto: El usuario está en la página "${currentPage}"]` : '';
    const userMessage = message || 'Analiza este archivo';
    parts.push({ text: CLIENT_SYSTEM_PROMPT + pageContext + "\n\nUsuario: " + userMessage });

    for (const file of files) {
      const filePath = file.path;
      const mimeType = file.mimetype;
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        const base64Data = fileData.toString('base64');
        parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
        fs.unlinkSync(filePath);
      }
    }

    const result = await generateWithRouting(
      [{ role: "user", parts: parts }]
    );

    if (!result.success) {
      const userMessage = handleGeminiError({ message: result.error });
      return res.status(500).json({ success: false, error: userMessage });
    }

    let textResponse = '';
    
    if (result.response) {
      if (typeof result.response.text === 'function') {
        try {
          textResponse = result.response.text();
        } catch (e) {
          console.log('[FLORA CLIENTE] Error al obtener texto:', e.message);
        }
      }
      
      if (!textResponse && typeof result.response === 'string') {
        textResponse = result.response;
      }
      
      if (!textResponse && result.response.candidates && result.response.candidates[0]?.content?.parts) {
        textResponse = result.response.candidates[0].content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join('');
      }
    }
    
    if (!textResponse && result.text) {
      textResponse = result.text;
    }

    res.json({ 
      success: true, 
      response: textResponse || 'Lo siento, no pude generar una respuesta.', 
      modelUsed: result.modelUsed 
    });

  } catch (error) {
    console.error('[FLORA CLIENTE] Error general:', error);
    const userMessage = handleGeminiError(error);
    res.status(500).json({ success: false, error: userMessage });
  }
};