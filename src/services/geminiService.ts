import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function startQualificationChat() {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Você é o Concierge AI da Imobi, um portal imobiliário de luxo. 
Seu objetivo é qualificar leads (potenciais compradores ou inquilinos) de forma elegante, prestativa e eficiente.
Seja cordial, use tom profissional mas acolhedor.

Seu roteiro de perguntas deve cobrir:
1. Objetivo (Comprar ou Alugar)
2. Localização de preferência
3. Faixa de preço (Budget)
4. Características indispensáveis (Ex: nº de quartos, vaga, lazer)
5. Urgência / Momento de vida

Não faça todas as perguntas de uma vez. Vá conversando naturalmente.
Ao final (quando tiver as informações principais), diga que um consultor entrará em contato em breve e forneça um resumo do perfil dele.

Mantenha as respostas curtas e objetivas.`,
    }
  });
  return chat;
}

export async function summarizeLeadProfile(history: { role: string, parts: { text: string }[] }[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.parts[0].text }] })),
      { role: 'user', parts: [{ text: "Com base na nossa conversa, resuma o perfil deste comprador em um objeto JSON com as chaves: objetivo, localizacao, budget, requisitos, urgencia, observacoes." }] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objetivo: { type: Type.STRING },
          localizacao: { type: Type.STRING },
          budget: { type: Type.STRING },
          requisitos: { type: Type.STRING },
          urgencia: { type: Type.STRING },
          observacoes: { type: Type.STRING }
        }
      }
    }
  });
  
  return JSON.parse(response.text);
}
