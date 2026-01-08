import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Master system prompt for all AI interactions
const MASTER_SYSTEM_PROMPT = `You are the Dungeon Master narrator for a dark fantasy tabletop RPG.

ABSOLUTE RULES:
- You DESCRIBE events, you never DECIDE them
- You never mention dice, numbers, stats, or game mechanics
- You never say what players do — only what they observe
- You maintain a tone of: dark, atmospheric, wondrous, slightly ominous
- You keep responses concise: 2-4 sentences unless summarizing

You are a calm, immersive narrator — never a chatbot.`;

/**
 * Generate area description using Claude
 * AI is for narration only - never affects game logic
 * @param {string} areaName - Name of the area
 * @param {Object} context - Additional context (room type, lighting, features)
 * @returns {Promise<string>} AI-generated description
 */
export async function generateAreaDescription(areaName, context = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getFallbackAreaDescription(areaName);
  }

  try {
    const prompt = buildAreaPrompt(areaName, context);

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      system: MASTER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Claude API error:', error.message);
    return getFallbackAreaDescription(areaName);
  }
}

function buildAreaPrompt(areaName, context) {
  return `Describe this location the party has just entered:

Location: ${areaName}
Type: ${context.roomType || 'dungeon'}
Lighting: ${context.lighting || 'dim torchlight'}
Notable Features: ${context.features?.join(', ') || 'ancient stone walls'}
Threat Level: ${context.threatLevel || 'unknown'}

Guidelines:
- Use 2-3 vivid sentences
- Include at least 2 senses (sight, sound, smell, touch)
- Hint at one potential danger or mystery
- Never describe player actions or reactions`;
}

function getFallbackAreaDescription(areaName) {
  const fallbacks = [
    `The ${areaName} stretches before you, shadows dancing at the edges of your torchlight. Something stirs in the darkness beyond.`,
    `Cold air rushes from the ${areaName}, carrying whispers of ages past. Your footsteps echo against ancient stone.`,
    `The ${areaName} awaits, silent and watchful. Dust motes hang suspended in the dim light.`
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Generate NPC dialogue using Claude
 * @param {string} npcName - Name of the NPC
 * @param {string} playerMessage - What the player said to the NPC
 * @param {Object} npcContext - NPC personality, role, secrets
 * @returns {Promise<string>} AI-generated NPC response
 */
export async function generateNPCDialogue(npcName, playerMessage, npcContext = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return `${npcName}: "..."`;
  }

  try {
    const prompt = buildNPCPrompt(npcName, playerMessage, npcContext);

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      system: `${MASTER_SYSTEM_PROMPT}

You are voicing an NPC in conversation. Stay in character completely. Keep responses to 1-3 sentences. Never break character.`,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Claude API error:', error.message);
    return `${npcName}: "I have nothing more to say."`;
  }
}

function buildNPCPrompt(npcName, playerMessage, context) {
  return `NPC Profile:
Name: ${npcName}
Role: ${context.role || 'townsperson'}
Personality: ${context.personality || 'cautious, weary'}
Speech Pattern: ${context.speechPattern || 'common'}
Current Mood: ${context.mood || 'neutral'}
Secret/Goal: ${context.secret || 'none known'}

The player says: "${playerMessage}"

Respond as ${npcName} in 1-3 sentences. Stay in character.`;
}

/**
 * Generate combat flavor text using Claude
 * @param {Object} combatEvent - Details of the combat action
 * @returns {Promise<string>} AI-generated combat narration
 */
export async function generateCombatFlavor(combatEvent) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getFallbackCombatFlavor(combatEvent);
  }

  try {
    const prompt = `Narrate this combat moment (1-2 sentences only):

Action: ${combatEvent.action}
Actor: ${combatEvent.actorName} (${combatEvent.actorClass})
Target: ${combatEvent.targetName}
Result: ${combatEvent.result}
${combatEvent.isCritical ? 'THIS IS A CRITICAL HIT - make it dramatic!' : ''}

Never mention numbers or dice. Make it visceral and dramatic.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      system: MASTER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Claude API error:', error.message);
    return getFallbackCombatFlavor(combatEvent);
  }
}

function getFallbackCombatFlavor(event) {
  if (event.result === 'hit') {
    return event.isCritical
      ? `${event.actorName}'s strike finds its mark with devastating precision.`
      : `${event.actorName}'s attack connects with ${event.targetName}.`;
  } else if (event.result === 'miss') {
    return `${event.actorName}'s attack goes wide, missing ${event.targetName}.`;
  } else if (event.result === 'kill') {
    return `${event.targetName} falls, the light fading from their eyes.`;
  }
  return `The battle rages on.`;
}

/**
 * Generate session summary using Claude
 * @param {Array} sessionEvents - Array of events that happened
 * @param {Object} playerHighlights - Notable player moments
 * @returns {Promise<string>} AI-generated summary
 */
export async function generateSessionSummary(sessionEvents, playerHighlights = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return 'The adventurers faced many challenges and emerged changed.';
  }

  try {
    const eventsText = sessionEvents
      .slice(-20)
      .map(e => `- ${e}`)
      .join('\n');

    const highlightsText = Object.entries(playerHighlights)
      .map(([player, highlight]) => `- ${player}: ${highlight}`)
      .join('\n');

    const prompt = `Summarize this session as an epic chronicle (100-150 words):

SESSION EVENTS:
${eventsText}

PLAYER HIGHLIGHTS:
${highlightsText || '- Various heroic deeds'}

Requirements:
- Write in past tense, narrative style
- Include 2-3 major events
- Highlight one memorable player moment
- Note one unresolved thread for next session
- Maintain dark fantasy tone
- Do NOT mention dice, HP, or mechanics`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: MASTER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Claude API error:', error.message);
    return 'The adventurers faced many challenges and emerged changed.';
  }
}

/**
 * Generate quest hook using Claude
 * @param {Object} questContext - Current region, threats, party goal
 * @param {string} questType - Type of quest (rescue, hunt, retrieval, mystery, defense)
 * @returns {Promise<string>} AI-generated quest hook
 */
export async function generateQuestHook(questContext, questType = 'mystery') {
  if (!process.env.ANTHROPIC_API_KEY) {
    return 'A plea for help reaches your ears. Someone needs heroes.';
  }

  try {
    const prompt = `Generate a quest hook for the party (3-4 sentences):

Region: ${questContext.region || 'dark forest'}
Active Threats: ${questContext.threats || 'unknown dangers'}
Party Goal: ${questContext.partyGoal || 'seeking adventure'}
Recent Event: ${questContext.recentEvent || 'arrived in town'}
Quest Type: ${questType}

Requirements:
- Must have clear objectives but room for player choice
- Must have moral complexity or personal stakes
- Must NOT promise specific rewards
- Create urgency without railroading`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      system: MASTER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Claude API error:', error.message);
    return 'A plea for help reaches your ears. Someone needs heroes.';
  }
}

// Export all functions
export default {
  generateAreaDescription,
  generateNPCDialogue,
  generateCombatFlavor,
  generateSessionSummary,
  generateQuestHook
};