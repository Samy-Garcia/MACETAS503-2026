// backend/list-models.js
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  const API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('Error de API:', data.error);
      return;
    }

    console.log('Modelos disponibles para tu API Key:');
    console.log('----------------------------------------');

    data.models.forEach(model => {
      const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
      console.log(`- ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Soporta generateContent: ${supportsGenerate ? '✅ Sí' : '❌ No'}`);
      console.log('----------------------------------------');
    });

  } catch (error) {
    console.error('Error al listar modelos:', error);
  }
}

listModels();