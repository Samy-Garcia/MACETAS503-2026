import { useState, useEffect } from "react";

const plantDetailsData = {
  "aloe-vera": {
    name: "Cuidado del Aloe Vera",
    img: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80",
    light: "El aloe vera prospera en ambientes luminosos y crece mejor cuando se coloca cerca de una ventana con abundante luz natural...",
    water: "Riega tu aloe vera aproximadamente cada 2 a 3 semanas...",
    soil: "El aloe vera requiere un suelo con buen drenaje...",
    temperature: "Esta planta prefiere temperaturas cálidas..."
  },

  "bamboo": {
    name: "Cuidado del Bambú",
    img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80",
    light: "El bambú de la suerte prefiere la luz solar brillante pero indirecta. La luz solar directa puede quemar sus hojas con facilidad, mientras que la falta de luz ralentizará su crecimiento drásticamente.",
    water: "Si lo cultivas en agua, cámbiala cada una o dos semanas usando agua filtrada o purificada. Si está en tierra, mantén el sustrato ligeramente húmedo pero nunca encharcado.",
    soil: "En caso de plantarlo en maceta con tierra, prefiere un suelo poroso rico en nutrientes y con excelente capacidad de filtración de agua.",
    temperature: "Se desarrolla mejor en ambientes templados de interior, idealmente en un rango de temperatura entre 18°C y 24°C. Evita corrientes de aire frío."
  },


  "cactus": {
    name: "Cuidado de los Cactus",
    img: "https://images.unsplash.com/photo-1508022159815-6db1b774ec26?auto=format&fit=crop&w=600&q=80",
    light: "Requieren una gran cantidad de luz solar directa. Colócalos en la ventana más soleada disponible, idealmente orientada al sur o al oeste para que reciban varias horas de sol al día.",
    water: "Aplica la regla de oro: riega profundamente solo cuando la tierra esté completamente seca. En invierno, prácticamente suspende los riegos por completo (una vez al mes es suficiente).",
    soil: "Sustrato específico para cactus y suculentas que contenga bastante arena gruesa, piedra pómez o perlita. El drenaje rápido es el factor más crítico para su supervivencia.",
    temperature: "Soportan temperaturas muy elevadas durante el día, pero prefiere mantenerse protegido si las temperaturas caen por debajo de los 10°C por la noche."
  },

  "begonia": {
    name: "Cuidado de la Begonia",
    img: "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=600&q=80",
    light: "Prefieren luz indirecta media a alta. Demasiado sol directo marchitará y quemará sus delicadas hojas, mientras que muy poca luz provocará que pierda sus colores vibrantes.",
    water: "Mantén la tierra constantemente húmeda pero no saturada de agua. Riega cuando la superficie del sustrato comience a sentirse seca al tacto y evita mojar sus hojas directamente.",
    soil: "Sustrato ligero, rico en materia orgánica y turba, que retenga un nivel saludable de humedad sin llegar a compactarse.",
    temperature: "Son plantas de climas cálidos y húmedos. Prosperan muy bien en interiores entre los 15°C y 22°C. Mantener alejadas de calefactores y aires acondicionados."
  }
};

export function usePlantCare(plantId) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const data = plantDetailsData[plantId] || null;
    
    setPlant(data);
    setLoading(false);
  }, [plantId]);

  return { plant, loading };
}