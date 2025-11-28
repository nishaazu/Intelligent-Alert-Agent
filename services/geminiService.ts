import { GoogleGenAI } from "@google/genai";
import { AlertInput, Outlet } from '../types';
import { OUTLETS } from './mockData';

const getOutletName = (id: number): string => {
  const outlet = OUTLETS.find(o => o.id === id);
  return outlet ? outlet.name : `Outlet #${id}`;
};

export const generateAlertContent = async (input: AlertInput): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const outletName = getOutletName(input.outlet_id);

  const prompt = `
    You are an intelligent alert generation agent for the Hotel Seri Malaysia Halal Audit System.
    
    TASK: Generate a strictly formatted alert message based on the JSON input below.
    
    CONTEXT:
    Outlet Name: ${outletName}
    Trigger Type: ${input.trigger_type}
    Severity: ${input.severity}
    Details: ${JSON.stringify(input.details)}
    
    RULES:
    1. Use Malaysian English (e.g., use "certificate" instead of "certification" where appropriate).
    2. Be professional yet urgent based on severity.
    3. Calculate specific dates based on "today" (assume today is ${new Date().toLocaleDateString('en-GB')}).
    4. Follow this EXACT template format:
    
    [🔴/🟡/🟢] [SEVERITY]: [Material Name] certificate [issue description]
    
    Outlet: [Outlet Name]
    Material: [Material Name] ([Category])
    Supplier: [Supplier Name]
    Expiry Date: [Date] ([X] days from now)
    
    IMPACT:
    [Briefly describe impact on menus]
    
    ACTION REQUIRED:
    1. [Action 1]
    2. [Action 2]
    3. [Action 3]
    
    DEADLINE: [Date]
    
    This alert will escalate to Top Management if unresolved within [X] days.
    
    Ensure the "ACTION REQUIRED" steps are realistic for a Halal Executive in Malaysia.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Error: Empty response from AI agent.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate alert content using AI.");
  }
};