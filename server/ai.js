import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate area description using AI
 * AI is for narration only - never affects game logic
 * @param {string} areaName - Name of the area
 * @param {Object} context - Additional context (current events, player actions, etc.)
 * @returns {Promise<string>} AI-generated description
 */
export async function generateAreaDescription(areaName, context = {}) {
  if (!process.env.OPENAI_API_KEY) {
    return `The ${areaName} awaits your exploration.`; // Fallback if no API key
  }

  try {
    const prompt = `You are a Dungeon Master for a tabletop RPG. Describe the area "${areaName}" in a dark fantasy style. Keep it concise (2-3 sentences). ${context.additionalInfo || ''}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative Dungeon Master for a dark fantasy tabletop RPG. Provide vivid, atmospheric descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `The mysterious ${areaName} stands before you, shrouded in shadow.`; // Fallback
  }
}

/**
 * Generate NPC dialogue using AI
 * @param {string} npcName - Name of the NPC
 * @param {string} playerMessage - What the player said to the NPC
 * @param {Object} npcContext - NPC personality, background, etc.
 * @returns {Promise<string>} AI-generated NPC response
 */
export async function generateNPCDialogue(npcName, playerMessage, npcContext = {}) {
  if (!process.env.OPENAI_API_KEY) {
    return `${npcName}: "I have nothing more to say."`; // Fallback
  }

  try {
    const prompt = `A player character says: "${playerMessage}"\n\nNPC: ${npcName}\nPersonality: ${npcContext.personality || 'mysterious'}\nBackground: ${npcContext.background || 'unknown'}\n\nGenerate a brief response (1-2 sentences) from this NPC in a dark fantasy style.`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative writer crafting NPC dialogue for a dark fantasy tabletop RPG. Keep responses brief and atmospheric.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.9
    });

    return `${npcName}: "${response.choices[0].message.content.trim()}"`;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `${npcName}: "..."`; // Fallback
  }
}

/**
 * Generate session summary using AI
 * @param {Array} sessionEvents - Array of events that happened during the session
 * @returns {Promise<string>} AI-generated summary
 */
export async function generateSessionSummary(sessionEvents) {
  if (!process.env.OPENAI_API_KEY) {
    return 'An epic adventure unfolded.'; // Fallback
  }

  try {
    const eventsText = sessionEvents
      .slice(-20) // Last 20 events
      .map(e => `- ${e}`)
      .join('\n');
    
    const prompt = `Summarize this D&D session in a brief, engaging way (3-4 sentences):\n\n${eventsText}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are summarizing a tabletop RPG session. Make it engaging and concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'The adventurers faced many challenges and emerged changed.'; // Fallback
  }
}