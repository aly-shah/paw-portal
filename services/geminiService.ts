
import { GoogleGenAI } from "@google/genai";
import { Pet, ServiceProvider, CarePlan, PawScanResult, HealthRecord } from "../types";

// Initialize the client with the API key from the environment
// Note: In a real production app, you might proxy this through a backend to hide the key,
// but for this client-side demo we access process.env.API_KEY directly as instructed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const generatePetAdvice = async (query: string, context?: string): Promise<string> => {
  try {
    const prompt = `
      You are a helpful, empathetic, and knowledgeable pet care assistant named "PawPal".
      User Context: ${context || 'General pet owner'}
      User Query: ${query}

      Provide a concise, friendly, and practical answer.
      If the user asks for medical advice, give general information but always recommend seeing a vet for specific issues.
      Format with simple paragraphs.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "I'm having trouble thinking right now. Please try again later.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't connect to the pet knowledge base right now.";
  }
};

export const formatMedicalRecord = async (roughNotes: string): Promise<string> => {
  try {
    const prompt = `
      You are a professional veterinary scribe. 
      Convert the following rough clinical notes into a structured, professional medical record format.
      Use the SOAP format (Subjective, Objective, Assessment, Plan) if applicable, or just clean up the grammar and terminology.
      Keep it concise and clinical.

      Rough Notes: "${roughNotes}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || roughNotes;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return roughNotes; // Return original text if AI fails
  }
};

export const analyzeClinicalRisks = async (currentNotes: string, patientHistoryStr: string): Promise<string[]> => {
    try {
      const prompt = `
        You are a Veterinary Clinical Decision Support System.
        Analyze the current consult notes against the patient's history.
        Identify potential risks, contraindications, or missed checks.
        
        Patient History: ${patientHistoryStr}
        Current Notes: ${currentNotes}
        
        Output a JSON array of strings. Each string is a short, specific alert. 
        Example: ["Patient is geriatric; consider kidney function panel before NSAIDs", "History of vaccine reaction; monitor closely"]
        If no major risks, return an empty array.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
  
      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Risk Analysis Error:", error);
      return [];
    }
  };
  
  export const generateDischargeSummary = async (clinicalNotes: string, treatment: string, ownerName: string, petName: string): Promise<string> => {
      try {
        const prompt = `
          You are a Veterinary Client Communication Bot.
          Write a friendly, clear, and reassuring discharge email to the pet owner.
          
          Owner: ${ownerName}
          Pet: ${petName}
          Clinical Findings: ${clinicalNotes}
          Treatment Plan: ${treatment}
          
          Structure:
          1. Friendly greeting.
          2. Simple summary of what was found (layman terms).
          3. Clear instructions on what to do next (medication, rest, etc.).
          4. Warning signs to watch for.
          5. Warm sign-off.
        `;
    
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
        });
    
        return response.text || "Error generating summary.";
      } catch (error) {
        console.error("Gemini Discharge Summary Error:", error);
        return "Thank you for your visit today. Please follow the instructions provided by the veterinarian.";
      }
  };

  // --- TIER 4: CO-PILOT INTELLIGENCE ---

  export const generateDifferentialDiagnosis = async (symptoms: string, breed: string, age: number): Promise<string[]> => {
    try {
        const prompt = `
        You are a Veterinary Diagnostic Assistant.
        Patient: ${breed}, ${age} years old.
        Symptoms/Findings: ${symptoms}.

        List 3-5 potential differential diagnoses, ordered by likelihood based on breed predispositions and age.
        Return ONLY a JSON array of strings.
        Example: ["Pancreatitis", "Foreign Body Obstruction", "Gastroenteritis"]
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '[]');
    } catch (error) {
        console.error("Gemini DiffDx Error:", error);
        return ["Unable to generate differential diagnosis."];
    }
  };

  export const checkDrugInteractions = async (newDrug: string, currentHistory: string): Promise<string[]> => {
    try {
        const prompt = `
        You are a Veterinary Pharmacology Safety Expert.
        Patient Medical History/Context: ${currentHistory}
        New Prescription Intended: ${newDrug}

        Check for ANY contraindications, interactions with prior conditions, or breed-specific drug sensitivities (e.g. MDR1 gene).
        Return a JSON array of warning strings. If it seems safe, return an empty array.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '[]');
    } catch (error) {
        return [];
    }
  };

  export const suggestBillingCodes = async (notes: string, treatment: string): Promise<any[]> => {
    try {
        const prompt = `
        You are a Veterinary Medical Billing Assistant.
        Based on the clinical notes and treatment, suggest appropriate billing codes.
        
        Notes: ${notes}
        Treatment: ${treatment}

        Return a JSON array of objects with: { "code": string, "desc": string, "price": number (in PKR) }.
        Assume realistic PKR pricing for a home visit vet in Pakistan.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '[]');
    } catch (error) {
        return [];
    }
  };

  // --- OWNER DASHBOARD INTELLIGENCE ---

  export const analyzeSymptom = async (symptom: string, petName: string): Promise<{ urgency: 'LOW' | 'MEDIUM' | 'HIGH', advice: string }> => {
    try {
        const prompt = `
        You are a Veterinary AI Triage Assistant.
        Pet: ${petName}
        Symptom reported by owner: "${symptom}"

        Analyze the symptom severity.
        Return a JSON object with:
        - "urgency": "LOW" (Monitor at home), "MEDIUM" (Schedule Vet Visit), or "HIGH" (Emergency/Immediate Care).
        - "advice": A concise 1-2 sentence recommendation on what to do next.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{"urgency": "LOW", "advice": "Monitor closely."}');
    } catch (error) {
        return { urgency: 'LOW', advice: "Please consult a veterinarian." };
    }
  };

  // --- VENDOR AI ---
  export const generateProductListing = async (productName: string): Promise<{ description: string, tags: string[], category: string, suggestedPrice: number }> => {
      try {
          const prompt = `
            You are an E-commerce Merchandising AI for a Pet Store.
            Product Name: "${productName}"
            
            Generate the following details:
            1. A catchy, benefit-driven product description (2-3 sentences).
            2. 3-5 relevant SEO tags.
            3. The best category (Food, Toy, Accessory, Health, Grooming).
            4. A realistic suggested price in PKR (Pakistani Rupees).

            Return ONLY a JSON object.
            Example: { "description": "...", "tags": ["..."], "category": "Toy", "suggestedPrice": 1500 }
          `;

          const response = await ai.models.generateContent({
              model: MODEL_NAME,
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });

          return JSON.parse(response.text || '{}');
      } catch (error) {
          return { description: "High quality pet product.", tags: [], category: 'Accessory', suggestedPrice: 0 };
      }
  };

  // --- SERVICE MATCHING AI ---
  export const generateProviderQuestions = async (provider: ServiceProvider, pet: Pet): Promise<{ insight: string, questions: string[], compatibilityScore: number }> => {
    try {
        // Construct a rich context from the Pet object
        const petContext = `
          Name: ${pet.name}
          Type: ${pet.type}
          Breed: ${pet.breed}
          Age: ${pet.age} years
          Weight: ${pet.weight} kg
          Environment: ${pet.dynamicDetails?.environment || 'Unknown'}
          Personality: ${pet.personality?.tags?.join(', ') || 'Unknown'}
          Energy Level: ${pet.personality?.energyLevel || 'Unknown'}
          Medical History: ${pet.history?.map(h => h.type + ': ' + h.notes).join('; ') || 'None'}
          Dietary: ${pet.dietaryNotes || 'None'}
        `;

        const providerContext = `
          Name: ${provider.name}
          Service Type: ${provider.type}
          Specialties: ${provider.specialties?.join(', ')}
          Description: ${provider.description}
        `;

        const prompt = `
          You are a Smart Match Assistant for Pet Owners.
          
          Pet Details:
          ${petContext}

          Provider Details:
          ${providerContext}

          Task:
          1. Analyze compatibility. Consider the pet's size/breed vs provider specialties (e.g. big dogs vs small dog specialists), medical needs, and environment.
          2. Generate a "PawPal Insight" (1-2 sentences) assessing the fit. Be honest if there's a potential mismatch (e.g. "This walker specializes in small breeds, but your dog is large").
          3. Generate 3 specific, hard-hitting interview questions the owner should ask based on the pet's specific history/needs.
          4. Give a compatibility score from 0 to 100.

          Return a JSON object: { "insight": "string", "questions": ["q1", "q2", "q3"], "compatibilityScore": number }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{"insight": "Standard match check.", "questions": ["Experience?"], "compatibilityScore": 80}');
    } catch (error) {
        console.error("Smart Match Error", error);
        return {
            insight: "Unable to run deep analysis right now. Consider general compatibility.",
            questions: ["What is your experience with this breed?", "Do you have emergency protocols?", "Can you provide references?"],
            compatibilityScore: 50
        };
    }
  };

  // --- HEALTH HUB AI: preventive care plan ---
  export const generateCarePlan = async (pet: Pet, history: HealthRecord[] = []): Promise<CarePlan> => {
    try {
        const historyStr = history.length
          ? history.map(h => `${h.date} — ${h.type}: ${h.title}`).join('; ')
          : 'No records on file.';

        const prompt = `
          You are a Preventive Veterinary Care Planner.
          Pet:
            Name: ${pet.name}
            Type: ${pet.type}
            Breed: ${pet.breed}
            Age: ${pet.age} years
            Weight: ${pet.weight} kg
            Neutered: ${pet.neutered ? 'Yes' : 'Unknown'}
            Energy Level: ${pet.personality?.energyLevel || 'Unknown'}
          Existing health records: ${historyStr}

          Build a personalised preventive-care plan for the next 12 months.
          Consider breed-specific risks, age-appropriate vaccines, dental care,
          parasite prevention, weight management, and wellness checkups.

          Return ONLY a JSON object:
          {
            "summary": "1-2 sentence overview of priorities",
            "tasks": [
              { "title": "string", "dueInDays": number, "category": "VACCINE|MEDICATION|CHECKUP|GROOMING|OTHER" }
            ]
          }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{"summary":"","tasks":[]}');
    } catch (error) {
        console.error("Care Plan Error", error);
        return {
            summary: "We couldn't generate a plan right now. A yearly checkup and up-to-date vaccines are always a good baseline.",
            tasks: [
                { title: 'Annual wellness checkup', dueInDays: 30, category: 'CHECKUP' },
                { title: 'Update core vaccinations', dueInDays: 14, category: 'VACCINE' },
            ],
        };
    }
  };

  // --- PAWSCAN: multimodal visual health triage ---
  // The only feature that sends an image to Gemini — uses an inlineData part
  // alongside the text prompt, then returns a structured JSON triage.
  export const scanPetPhoto = async (
    imageBase64: string,
    mimeType: string,
    pet: Pet,
    concern: string,
  ): Promise<PawScanResult> => {
    try {
        const prompt = `
          You are a Veterinary AI performing a VISUAL triage from an owner-submitted photo.
          Pet: ${pet.name}, a ${pet.age}-year-old ${pet.breed} (${pet.type}).
          Owner's concern: "${concern || 'General check'}"

          Examine the image. Identify visible signs only — do not diagnose.
          Return ONLY a JSON object:
          {
            "urgency": "LOW" | "MEDIUM" | "HIGH",
            "observations": ["what is visible in the photo"],
            "possibleCauses": ["plausible non-diagnostic possibilities"],
            "recommendation": "clear next step, e.g. 'Monitor at home' or 'Book a vet within 24h'",
            "disclaimer": "a short reminder that this is not a diagnosis"
          }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType } },
                    { text: prompt },
                ],
            },
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("PawScan Error", error);
        return {
            urgency: 'LOW',
            observations: ['Unable to analyse the image right now.'],
            possibleCauses: [],
            recommendation: 'Please try again, or consult a veterinarian if you are concerned.',
            disclaimer: 'AI visual checks are not a substitute for professional veterinary diagnosis.',
        };
    }
  };
