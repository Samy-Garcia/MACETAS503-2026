// backend/src/services/modelRouter.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Lista de modelos en orden de prioridad
const MODEL_PRIORITY = [
  {
    name: 'models/gemini-3.6-flash',
    displayName: 'Gemini 3.6 Flash',
    type: 'flash'
  },
  {
    name: 'models/gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    type: 'pro'
  },
  {
    name: 'models/gemini-3.5-flash',
    displayName: 'Gemini 3.5 Flash',
    type: 'flash'
  },
  {
    name: 'models/gemini-flash-latest',
    displayName: 'Gemini Flash Latest',
    type: 'flash'
  },
  {
    name: 'models/gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite',
    type: 'lite'
  }
];

// Estado de disponibilidad de cada modelo
const modelAvailability = {};

// Inicializar todos los modelos como disponibles
MODEL_PRIORITY.forEach(model => {
  modelAvailability[model.name] = {
    available: true,
    lastError: null,
    errorCount: 0,
    lastAttempt: null
  };
});

// Función para marcar un modelo como fallido
const markModelAsFailed = (modelName, error) => {
  if (modelAvailability[modelName]) {
    modelAvailability[modelName].available = false;
    modelAvailability[modelName].lastError = error;
    modelAvailability[modelName].errorCount += 1;
    modelAvailability[modelName].lastAttempt = new Date();
    console.log(`[ROUTER] Modelo ${modelName} marcado como NO DISPONIBLE`);
  }
};

// Función para restaurar un modelo (después de un tiempo)
const restoreModel = (modelName) => {
  if (modelAvailability[modelName]) {
    modelAvailability[modelName].available = true;
    modelAvailability[modelName].errorCount = 0;
    console.log(`[ROUTER] Modelo ${modelName} restaurado como DISPONIBLE`);
  }
};

// Función para obtener el primer modelo disponible
const getAvailableModel = () => {
  // Primero intentar con modelos disponibles
  for (const model of MODEL_PRIORITY) {
    if (modelAvailability[model.name]?.available) {
      return model;
    }
  }
  
  // Si todos están caídos, usar el primero (pero con advertencia)
  console.warn('[ROUTER] Todos los modelos están caídos. Usando el primero de la lista.');
  return MODEL_PRIORITY[0];
};

// Función principal para generar contenido con routing
export const generateWithRouting = async (contents, retryCount = 0) => {
  const maxRetries = MODEL_PRIORITY.length * 2; // Máximo de intentos
  
  // Obtener el modelo disponible
  const model = getAvailableModel();
  const modelName = model.name;
  
  console.log(`[ROUTER] Usando modelo: ${model.displayName} (${modelName})`);
  console.log(`[ROUTER] Intento ${retryCount + 1}/${maxRetries}`);
  
  try {
    // Inicializar Gemini con la API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelInstance = genAI.getGenerativeModel({ model: modelName });
    
    const result = await modelInstance.generateContent({
      contents: contents
    });
    
    const response = await result.response;
    
    // Si llegamos aquí, el modelo funcionó
    // Restaurar el modelo si estaba caído
    if (!modelAvailability[modelName].available) {
      restoreModel(modelName);
    }
    
    // Restablecer contador de errores
    modelAvailability[modelName].errorCount = 0;
    
    return {
      success: true,
      response: response.text(),
      modelUsed: modelName,
      modelDisplayName: model.displayName
    };
    
  } catch (error) {
    console.error(`[ROUTER] Error con modelo ${model.displayName}:`, error.message);
    
    // Marcar el modelo como fallido
    markModelAsFailed(modelName, error.message);
    
    // Verificar si debemos reintentar
    const errorMessage = error.message || '';
    const isRetryable = 
      errorMessage.includes('503') ||
      errorMessage.includes('429') ||
      errorMessage.includes('high demand') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('deadline');
    
    if (isRetryable && retryCount < maxRetries) {
      console.log(`[ROUTER] Reintentando con otro modelo...`);
      
      // Esperar un poco antes de reintentar (backoff)
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 8000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reintentar con el siguiente modelo disponible
      return generateWithRouting(contents, retryCount + 1);
    }
    
    // Si no es retryable o ya no hay más intentos
    return {
      success: false,
      error: error.message,
      modelUsed: modelName,
      modelDisplayName: model.displayName
    };
  }
};

// Función para obtener el estado de todos los modelos
export const getModelStatus = () => {
  const status = {};
  for (const model of MODEL_PRIORITY) {
    status[model.name] = {
      ...modelAvailability[model.name],
      displayName: model.displayName,
      type: model.type
    };
  }
  return status;
};

// Función para restaurar todos los modelos (útil para reset)
export const resetAllModels = () => {
  for (const model of MODEL_PRIORITY) {
    modelAvailability[model.name] = {
      available: true,
      lastError: null,
      errorCount: 0,
      lastAttempt: null
    };
  }
  console.log('[ROUTER] Todos los modelos han sido restaurados');
};