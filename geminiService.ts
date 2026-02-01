
import { GoogleGenAI, Type } from "@google/genai";
import { TravelEvent, MOMData, Member, Registration } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMOM = async (event: TravelEvent, momData: MOMData, participants: string[]) => {
  const ai = getAI();
  const prompt = `
    Generate a professional "Minutes of Meeting" (MOM) document for the following travel community event:
    Event: ${event.title}
    Date: ${event.date}
    Agenda: ${momData.agenda}
    Participants Count: ${participants.length}
    Participants Names: ${participants.join(", ")}
    Discussions: ${momData.discussions}
    Action Items: ${momData.actionItems}
    Next Steps: ${momData.nextSteps}

    Format the output as a well-structured Markdown document with clear headers and bullet points. 
    Maintain a friendly but professional community tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating MOM:", error);
    return "Error generating MOM document. Please try again.";
  }
};

export const generateWhatsAppTemplate = async (event: TravelEvent) => {
  const ai = getAI();
  const prompt = `
    Create a catchy and informative WhatsApp broadcast announcement for this travel community trip:
    Trip Name: ${event.title}
    Date: ${event.date}
    Description: ${event.description}
    Capacity: ${event.capacity}
    Registration Deadline: ${event.deadline}

    Make it engaging with emojis and clear calls to action. Use the format common for Indian community groups.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating WhatsApp template:", error);
    return "Join our next trip! Check the app for details.";
  }
};
