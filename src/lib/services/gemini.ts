import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from "$env/static/private";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Generates questions from a given set of PDF array buffers via a stream.
 * @param pdfs Array of objects containing the base64 encoded PDF string and a display name.
 * @param count Number of questions to generate.
 */
export const generateQuestionsStreamFromPapers = async (
  pdfs: { base64: string; name: string }[],
  count: number = 5,
  questionType: string = "Theory",
  additionalContext: string = ""
) => {
  const model = "gemini-3.1-flash-lite-preview";

  const contextStr = additionalContext.trim()
    ? `\nAdditionally, please adhere to the following custom instructions:\n"${additionalContext}"\n`
    : "";

  let typeInstructions = "";
  if (questionType === "Practice") {
    typeInstructions = "Focus on practical, problem-solving questions. If the material contains formulas, code, algorithms, or mathematical concepts, formulate questions where the student must calculate, trace, or actively solve a problem.";
  } else {
    typeInstructions = "Focus on theoretical, conceptual questions that test understanding, definitions, and broad concepts.";
  }

  const prompt = `ROLE: You are an elite, world-class university professor and an expert instructional designer.
TASK: Deeply analyze the provided course materials and create highly rigorous, context-aware practice questions based STRICTLY on the documents provided.

STEP 1: DEEP ANALYSIS (Chain of Thought)
First, use the "analysis" field to synthesize the core concepts, critical formulas, main arguments, and key learning objectives found in the texts. Deeply understand the subject matter before writing any questions.

STEP 2: QUESTION GENERATION
Based strictly on your analysis, generate exactly ${count} highly comprehensive ${questionType.toLowerCase()} practice questions.
Refuse to ask trivial surface-level questions. Frame the questions to test deep comprehension, synthesis, or application of the material.

TYPE RULES:
${typeInstructions}
- Whenever math, formulas, or equations are involved, you MUST format them using standard LaTeX (e.g. $inline$ and $$block$$).
- Do NOT wrap LaTeX math inside markdown code blocks.
- **Questions MUST be self-contained.** Do NOT refer to 'the provided documents', 'the exam', or 'the paper' within the question or answer text. Just present the problem directly.
- **Answer Quality**: Answers MUST be extremely detailed, providing rigorous step-by-step logic, calculations, or explanations. However, they must remain highly efficient—avoid all filler text, introductory fluff, or conversational bridge phrases.
${contextStr}`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: [
        { text: prompt },
        ...pdfs.map(pdf => ({
          inlineData: {
            data: pdf.base64,
            mimeType: "application/pdf"
          }
        }))
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.STRING,
              description: "Extremely thorough, step-by-step analysis and synthesis of the provided materials."
            },
            questions: {
              type: Type.ARRAY,
              description: "The list of generated practice questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "A highly contextual, rigorous question that tests deep understanding." },
                  answer: { type: Type.STRING, description: "A heavily detailed step-by-step logic, explanation and solution." },
                  source: { type: Type.STRING, description: "Exact document name and associated topic or page." }
                },
                required: ["question", "answer", "source"]
              }
            }
          },
          required: ["analysis", "questions"]
        },
        temperature: 0.4,
        topP: 0.8,
      }
    });

    return responseStream;
  } catch (error) {
    console.error("Error starting question stream:", error);
    throw new Error("Failed to start generating questions. Ensure the API key is correct and valid.");
  }
};
