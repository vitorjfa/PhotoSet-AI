
import { GoogleGenAI, Type } from "@google/genai";
import { Camera, Lens, Scenario, Recommendation } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getSmartRecommendation(
  camera: Camera,
  lens: Lens,
  scenario: Scenario
): Promise<Recommendation> {
  const prompt = `Como um mestre em fotografia, forneça configurações detalhadas para o seguinte setup:
Câmera: ${camera.brand} ${camera.model} (ISO Máx: ${camera.maxIso})
Lente: ${lens.name} (Abertura Máx: f/${lens.maxAperture})
Cenário: ${scenario.name} (${scenario.description})

IMPORTANTE: 
1. Respeite as limitações físicas! Se a lente é f/${lens.maxAperture}, nunca recomende uma abertura maior (número f menor). 
2. Se a câmera tem ISO Máx de ${camera.maxIso}, nunca recomende um ISO maior.
3. Responda em Português do Brasil.

O retorno DEVE ser um objeto JSON seguindo este esquema exato:
{
  "mode": "Modo de disparo (ex: Prioridade de Abertura Av/A)",
  "iso": "Valor de ISO recomendado",
  "aperture": "Abertura f/ recomendada",
  "shutter": "Velocidade de obturador recomendada",
  "wb": "Balanço de branco recomendado",
  "focusMode": "Modo de foco (ex: AF-S, AF-C)",
  "focusPoints": "Configuração de pontos de foco",
  "metering": "Modo de medição de luz",
  "reason": "Explicação didática de 2 frases sobre por que usar estas configurações",
  "tips": ["Dica prática 1", "Dica prática 2"],
  "composition": ["Sugestão de composição 1", "Sugestão de composição 2"],
  "alerts": ["Alerta importante ou aviso de equipamento"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING },
            iso: { type: Type.STRING },
            aperture: { type: Type.STRING },
            shutter: { type: Type.STRING },
            wb: { type: Type.STRING },
            focusMode: { type: Type.STRING },
            focusPoints: { type: Type.STRING },
            metering: { type: Type.STRING },
            reason: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            composition: { type: Type.ARRAY, items: { type: Type.STRING } },
            alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["mode", "iso", "aperture", "shutter", "wb", "focusMode", "focusPoints", "metering", "reason", "tips", "composition", "alerts"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro ao buscar recomendação via Gemini:", error);
    // Fallback básico em caso de erro na API
    return {
      mode: "Manual",
      iso: "400",
      aperture: `f/${lens.maxAperture}`,
      shutter: "1/125",
      wb: "Auto",
      focusMode: "AF-S",
      focusPoints: "Ponto único central",
      metering: "Matricial",
      reason: "Houve um problema na conexão, mas estas são configurações básicas de segurança para este cenário.",
      tips: ["Verifique a iluminação ambiente", "Use um tripé se necessário"],
      composition: ["Regra dos terços", "Mantenha o horizonte reto"],
      alerts: ["Certifique-se que a bateria está carregada"]
    };
  }
}
