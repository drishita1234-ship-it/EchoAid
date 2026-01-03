import { GoogleGenAI, Type } from "@google/genai";
import type { EmergencyType } from "../types";

// The API key must be obtained exclusively from `process.env.API_KEY`.
// Assume this variable is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface AnalysisResult {
    urgencyScore: number;
    summary: string;
}

export interface GroundedInfo {
    text: string;
    sources: { title: string; uri: string }[];
}


export const analyzeSOS = async (description: string, type: EmergencyType): Promise<AnalysisResult> => {
    const prompt = `
        Analyze the following emergency request and provide a JSON response.
        Emergency Type: ${type}
        Description: "${description}"

        Based on the information, determine an urgency score from 1 (lowest) to 10 (highest).
        Also, provide a brief, one-sentence summary of the situation.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        urgencyScore: {
                            type: Type.INTEGER,
                            description: "A numerical score from 1 to 10 indicating the urgency."
                        },
                        summary: {
                            type: Type.STRING,
                            description: "A concise, one-sentence summary of the emergency."
                        }
                    },
                    required: ["urgencyScore", "summary"]
                },
            },
        });
        
        // The .text property provides the direct string output.
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (typeof result.urgencyScore === 'number' && typeof result.summary === 'string') {
            return result;
        } else {
            throw new Error("Invalid response structure from Gemini API");
        }
    } catch (error) {
        console.error("Error analyzing SOS with Gemini API:", error);
        throw new Error("Failed to analyze emergency request. Please try again.");
    }
};

export const getMapGroundedInfo = async (query: string, location: { lat: number, lng: number }): Promise<GroundedInfo> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.lat,
                            longitude: location.lng
                        }
                    }
                }
            }
        });

        const text = response.text;
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources = chunks
            .map((chunk: any) => chunk.maps)
            .filter(Boolean)
            .map((maps: any) => ({
                title: maps.title || 'Google Maps Place',
                uri: maps.uri
            }));

        return { text, sources };

    } catch (error) {
        console.error("Error getting map grounded info with Gemini API:", error);
        throw new Error("Failed to get information about the area. Please try again.");
    }
};

export const getSearchGroundedInfo = async (query: string): Promise<GroundedInfo> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find recent news or official reports about this potential emergency: "${query}". Summarize the findings.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources = chunks
            .map((chunk: any) => chunk.web)
            .filter(Boolean)
            .map((web: any) => ({
                title: web.title || 'Web Search Result',
                uri: web.uri
            }));

        return { text, sources };

    } catch (error) {
        console.error("Error getting search grounded info with Gemini API:", error);
        throw new Error("Failed to get information from web search. Please try again.");
    }
};
