
import { GoogleGenAI } from "@google/genai";
import { InventoryItem, Product } from "../types";

// In a real app, this key would come from a secure backend or environment variable injection.
// For this demo, we assume process.env.API_KEY is available as per instructions.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export interface InvoiceItem {
  name: string;
  qty: number;
  marketRate: number; // The price on the invoice
  pzRate: number; // Calculated/Mocked PZ price
}

export const getMarketAnalysis = async (inventory: InventoryItem[], products: Product[]): Promise<string> => {
  if (!apiKey) return "API Key is missing. Please configure the environment.";

  try {
    const model = 'gemini-2.5-flash';
    
    // Prepare context
    const inventorySummary = inventory.map(i => {
      const product = products.find(p => p.id === i.productId);
      return `- ${product?.name}: ${i.quantityKg}kg, Expires: ${new Date(i.expiryDate).toLocaleDateString()}`;
    }).join('\n');

    const prompt = `
      You are an expert agricultural market analyst for Platform Zero, a B2B produce marketplace.
      
      Here is the current inventory available on the platform:
      ${inventorySummary}

      Please provide a concise market analysis (max 150 words). 
      Highlight:
      1. Which items are in oversupply (risk of waste).
      2. Suggestions for dynamic pricing (e.g., discount items expiring soon).
      3. A quick sustainability tip for farmers.
      
      Format the output with bold headers.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Market Analysis is currently unavailable.";
  }
};

export const getPricingAdvice = async (productName: string, quantity: number, daysToExpiry: number): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `I have ${quantity}kg of ${productName} that expires in ${daysToExpiry} days. 
            Give me a specific pricing strategy to maximize revenue while ensuring it sells before expiry.
            Keep it under 3 sentences.`
        });
        return response.text || "No advice available.";
    } catch (e) {
        return "Could not fetch pricing advice.";
    }
}

export const identifyProductFromImage = async (base64Image: string): Promise<{ name: string; quality: string; confidence: number }> => {
  if (!apiKey) {
    // Mock response for demo if API key isn't working/set
    return new Promise(resolve => setTimeout(() => resolve({ 
      name: "Eggplants", 
      quality: "Grade A - Shiny skin, firm texture", 
      confidence: 0.95 
    }), 2000));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        },
        {
          text: "Identify the fresh produce in this image. Return a JSON object with 'name' (generic product name, e.g. Eggplants, Apples) and 'quality' (brief 5-word quality assessment based on visual cues)."
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
        const json = JSON.parse(text);
        return {
            name: json.name || "Unknown Produce",
            quality: json.quality || "Standard Quality",
            confidence: 0.9
        };
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { name: "Eggplants", quality: "Visual analysis failed (Mock)", confidence: 0.0 };
  }
};

export const extractInvoiceItems = async (base64Data: string, mimeType: string): Promise<InvoiceItem[]> => {
  if (!apiKey) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        {
          text: `Analyze this food invoice image/document. Extract a list of line items found in the document.
          For each item return: 
          - 'name' (string, e.g. "Tomatoes Truss")
          - 'qty' (number, defaults to 1 if not found)
          - 'marketRate' (number, the unit price on the invoice).
          
          Also estimate a 'pzRate' (number) for each item, which represents a "Platform Zero" wholesale price. The pzRate should generally be 15-25% lower than the marketRate found on the invoice.
          
          Return ONLY a JSON array of objects. Example: [{"name": "Milk", "qty": 10, "marketRate": 3.50, "pzRate": 2.80}]`
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Invoice Analysis Error:", error);
    return [];
  }
};
