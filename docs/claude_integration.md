# 🤖 Claude API Integration Design
## Multiplayer Online Tabletop RPG — AI Dungeon Master System

> **Design Philosophy:** Claude as a *calm, immersive Dungeon Master* — enhancing atmosphere and storytelling without touching mechanics. Like a narrator reading a novel, not a referee calling plays.

---

# 1️⃣ Claude-Optimized AI Features

## Leveraging Claude's Unique Strengths

| Claude Strength | Game Application | Why Claude Excels |
|-----------------|------------------|-------------------|
| **Rich Storytelling** | Area descriptions, dramatic moments | Long-form coherent prose, vivid sensory detail |
| **Natural Dialogue** | NPC conversations, villain monologues | Character voice consistency, emotional range |
| **Long-Form Memory** | Campaign continuity, callback references | Maintains context across sessions |
| **Consistent Worldbuilding** | Lore answers, faction relationships | Never contradicts established facts |
| **Nuanced Summaries** | Session recaps, story-so-far | Captures both events AND emotional beats |
| **Tone Calibration** | Dark fantasy without edginess | Understands "atmospheric" vs "gratuitous" |

---

## Redesigned AI Feature Set

### ✅ Claude DOES (Narrative Layer)

| Feature | Trigger | Claude's Role |
|---------|---------|---------------|
| **Area Narration** | Party enters new room/zone | Describe environment with sensory immersion |
| **NPC Voice** | Player interacts with NPC | Speak in character, react to player intent |
| **Quest Weaving** | New objective received | Frame quest with story context and stakes |
| **Combat Flavor** | Combat starts / major hit / death | Add dramatic color to mechanical events |
| **Session Recap** | Session ends | Summarize events as epic chronicle |
| **Lore Keeper** | Player asks world question | Answer in-character as ancient tome/sage |
| **Callback Memory** | Relevant past event detected | Reference previous session moments naturally |
| **Atmosphere Whispers** | Exploration in tense areas | Subtle environmental dread hints |

### ❌ Claude NEVER (Mechanical Layer)

| Forbidden Action | Why It's Forbidden | What Happens Instead |
|------------------|--------------------|-----------------------|
| Roll dice | Breaks server authority | Server rolls, Claude describes result |
| Decide hit/miss | Players lose agency | Server calculates, Claude narrates |
| Grant XP/loot | Unfair gameplay | Server awards, Claude announces |
| Move characters | Player control sacred | Server moves, Claude describes motion |
| Skip player turns | Frustrating | Claude waits for player input |
| Override rules | Inconsistent gameplay | Rules are code, Claude is flavor |

---

## The "Reactive Narrator" Model

Claude responds TO events, never initiates them:

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAME EVENT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PLAYER ACTION  ──▶  SERVER RESOLVES  ──▶  CLAUDE NARRATES   │
│   "I attack"          Roll: 18 (hit)        "Your blade finds  │
│                       Damage: 7             the gap in its     │
│                                             armor..."          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle:** Claude receives outcome data, then crafts narration. Never the reverse.

---

# 2️⃣ Claude Prompt Templates

## Master System Prompt (All Contexts)

```
You are the Dungeon Master narrator for a dark fantasy tabletop RPG called [GAME_NAME].

ABSOLUTE RULES:
- You DESCRIBE events, you never DECIDE them
- You never mention dice, numbers, stats, or game mechanics
- You never say what players do — only what they observe
- You maintain a tone of: dark, atmospheric, wondrous, slightly ominous
- You keep responses concise: 2-4 sentences unless summarizing

WORLD CONTEXT:
[Insert: Setting name, current region, major factions, active threats]

PARTY CONTEXT:
[Insert: Player names, classes, notable past actions, current quest]

SESSION CONTEXT:
[Insert: Last 5 significant events, current location, time of day]
```

---

## 🏔️ Area Narration Prompts

### System Prompt
```
You are describing a location the party has just entered. 

GUIDELINES:
- Use 2-3 vivid sentences
- Include at least 2 senses (sight, sound, smell, touch, taste)
- Hint at one potential danger or mystery
- Never describe player actions or reactions
- Maintain dark fantasy atmosphere

LOCATION DATA:
Type: [dungeon/forest/town/etc]
Lighting: [torch/moonlight/darkness/etc]
Notable Features: [list of objects, creatures, or details]
Hidden Elements: [secrets player might discover]
Threat Level: [safe/tense/dangerous]
```

### Example Outputs by Location Type

| Location | Claude Output |
|----------|---------------|
| **Crypt Entrance** | "Stale air rushes up from the stone steps, carrying the sweetness of decay. Your torchlight catches something scratched into the archway—claw marks, dragged downward. From below, a sound like chains dragging across stone." |
| **Forest Clearing** | "Moonlight pools in the center of the glade, bright enough to read by. The trees here grow in a perfect circle, bark scarred with old runes. Nothing stirs. Even the wind holds its breath." |
| **Tavern (Safe Haven)** | "Warmth floods over you and with it the smell of roasted boar and cheap ale. A fire crackles in the hearth; a bard strums something melancholy in the corner. For the first time in days, nothing here wants to kill you." |
| **Throne Room** | "Obsidian pillars rise into shadow. At the far end, a throne of fused bone and black iron—and upon it, something that was once human. Its crown is rusted. Its eyes are not." |

---

## 🗣️ NPC Dialogue Prompts

### System Prompt
```
You are voicing an NPC in conversation with a player.

NPC PROFILE:
Name: [name]
Role: [occupation/function]
Personality: [2-3 traits, e.g., "gruff, honest, war-weary"]
Secret/Goal: [what they want, what they're hiding]
Speech Pattern: [formal/casual/cryptic/etc]
Current Mood: [nervous/friendly/hostile/etc]

GUIDELINES:
- Stay in character completely
- Keep responses to 1-3 sentences
- React to player input naturally
- Never break character to explain game rules
- If asked about something unknown, deflect in-character
- Never decide outcomes — suggest, warn, or react only

PLAYER SAID: [player's statement or question]
```

### NPC Voice Examples

| NPC Type | Personality | Example Dialogue |
|----------|-------------|------------------|
| **Grizzled Blacksmith** | Blunt, practical, secretly caring | "That blade's seen better days. I can fix it, but it'll cost you—forty gold, and don't haggle. Lost my appetite for bargaining when I lost my apprentice to one of those... things outside town." |
| **Mysterious Oracle** | Cryptic, calm, knows too much | "You carry something that does not belong to you. No—don't show me. I already see it. Tell me, hero... did you take it, or did it choose you?" |
| **Nervous Merchant** | Fearful, opportunistic, hiding something | "Y-yes, I have what you need. But we should speak quickly, yes? The walls have ears here. Fifty gold and you never saw me. Deal?" |
| **Dying Knight** | Noble, regretful, at peace | "Take... the sigil. Show it to the Queen. Tell her... Aldric kept his oath. To the end. The end..." |
| **Charismatic Villain** | Polite, menacing, enjoying control | "Ah, you've come at last. I must admit, I expected this visit sooner. Please—sit. We have so much to discuss before I decide whether you leave this room alive." |

---

## 📜 Quest Generation Prompts

### System Prompt
```
Generate a quest hook for the party.

CONSTRAINTS:
- Must fit the current region and story context
- Must have clear objectives but room for player choice
- Must have moral complexity or personal stakes
- Must NOT promise specific rewards (server handles loot)
- Keep to 3-4 sentences maximum

CURRENT CONTEXT:
Region: [name, type]
Active Threats: [major antagonist, environmental danger]
Party Goal: [their overarching mission]
Recent Event: [what just happened]

QUEST TYPE: [rescue/hunt/retrieval/mystery/defense]
```

### Quest Hook Examples

| Quest Type | Claude Output |
|------------|---------------|
| **Rescue** | "The healer's daughter disappeared three nights past—last seen walking toward the old mill at midnight. The healer offers everything she has: information about the catacombs. But something in her voice suggests she knows exactly what took her daughter. And why." |
| **Hunt** | "Something hunts the eastern woods. Not wolf, not bear. Survivors speak of too many limbs and a sound like weeping. The village elder claims it only takes those who've broken promises. What did these people swear, and to whom?" |
| **Mystery** | "Lord Vance is dead—poison, the court whispers. His widow claims innocence; his brother claims inheritance; his servant claims something walked out of the lord's mirror the night he died. The crown demands answers before the funeral pyre burns the evidence." |
| **Defense** | "The horde reaches the valley by nightfall. The villagers cannot flee—the mountain pass is blocked by last week's avalanche. Someone must hold the eastern bridge until dawn. Someone must ensure there is still a village to save." |

---

## 📖 Session Summary Prompts

### System Prompt
```
Summarize this session as an epic chronicle.

REQUIREMENTS:
- Write in past tense, narrative style
- 100-150 words maximum
- Include 2-3 major events
- Highlight one heroic/memorable player moment
- Note one unresolved thread for next session
- Maintain dark fantasy tone
- Do NOT mention dice, HP, or mechanics

SESSION EVENTS:
[List of major events from server log]

PLAYER HIGHLIGHTS:
[Notable player actions flagged by server]
```

### Example Summary
```
SESSION 5: "The Hollow Bargain"

The party descended into the Thornwell Crypts seeking the Sunstone, 
but found instead a truth they weren't prepared for.

Sister Moira's warning proved prescient—the crypt guardians were 
not undead, but pilgrims, frozen in eternal vigilance by the very 
artifact the party sought. Kira's quick thinking saved the group 
when the third guardian nearly detected them; her distraction bought 
precious seconds while Marcus disabled the ward-locks.

In the deepest chamber, they found the Sunstone... held in the 
skeletal hands of a child. The inscription read: "Whoever takes 
this, takes also my burden."

Lyra took it anyway.

UNRESOLVED: What burden now follows the party? And why did the 
Oracle smile when they left her tower?
```

---

## ⚔️ Combat Flavor Prompts

### System Prompt
```
Narrate a combat moment (NOT outcome—just flavor).

CONTEXT:
Action: [attack/spell/death/critical/miss]
Actor: [character name and class]
Target: [enemy name and type]
Result: [hit/miss/kill] (already determined by server)
Damage: [number] (if applicable)

GUIDELINES:
- 1-2 sentences only
- Make it visceral and dramatic
- Never mention numbers or dice
- Vary descriptions—don't repeat phrases
- Match intensity to importance (crit > normal hit)
```

### Combat Flavor Examples

| Event | Claude Output |
|-------|---------------|
| **Normal Hit** | "Your blade bites deep into the orc's shoulder. It snarls but doesn't fall." |
| **Critical Hit** | "Time slows. Your strike finds the gap in its guard—the perfect arc, the perfect moment. The creature's eyes widen as it realizes, too late, what you are." |
| **Miss (Near)** | "Your sword whistles past its throat by a breath. The goblin grins. It shouldn't have." |
| **Miss (Bad)** | "The creature is faster than it looks. Your swing meets empty air while its laugh echoes off the walls." |
| **Killing Blow** | "The beast staggers, clutches at nothing, and falls. The silence that follows is somehow louder than the battle." |
| **Player Downed** | "The blow catches you across the chest. The world tilts. You hear your name, distant, as darkness creeps in from the edges." |

---

# 3️⃣ Gameplay Enhancement with AI

## AI-Enhanced Moments

Claude narration appears at **high-impact moments** to amplify emotion:

| Game Moment | AI Enhancement | Timing |
|-------------|----------------|--------|
| **Entering New Area** | Full area description | Immediate on transition |
| **Combat Starts** | Enemy reveal + threat setup | Before initiative roll |
| **Critical Hit** | Dramatic slowdown narration | After server confirms crit |
| **Player Downed** | Somber, tense description | After HP hits 0 |
| **Boss Reveal** | Extended dramatic entrance | Before boss stats shown |
| **Victory** | Triumphant aftermath | After last enemy falls |
| **Major Loot** | Item lore/history snippet | After player receives item |
| **Rest/Camp** | Peaceful respite description | When camp is made |
| **Quest Complete** | Resolution narration | After objective confirmed |
| **Session End** | Full session recap | Triggered by host |

---

## Reducing Downtime with Smart Narration

| Downtime Type | AI Solution |
|---------------|-------------|
| Waiting for slow player | **Atmosphere whispers**: subtle environmental details to maintain tension |
| Loading screens | **Lore snippets**: brief world facts or item histories |
| Between encounters | **Travel narration**: "The path winds through silent forest. An hour passes." |
| Post-combat lull | **Quick consequence**: "The echoes fade. Something in the next room just stopped moving." |

---

## Improving Weak Gameplay Moments

| Weak Moment | Problem | AI Enhancement |
|-------------|---------|----------------|
| Empty exploration rooms | No engagement | Claude describes 1 strange detail per room |
| Repeated enemy types | Feels grindy | Claude varies descriptions of same enemy |
| Predictable combat | Same rotation | Claude hints at enemy behavior changes |
| Quiet social players | One player talks to all NPCs | NPC directly addresses quiet player's character |
| Confusing objectives | Players forget quest | Claude offers subtle reminder in NPC dialogue |

---

# 4️⃣ UI/UX Integration with AI

## Where AI Appears

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME SCREEN                             │
├─────────────────────────────────────────────────────────────────┤
│  [PARTY STATUS]                              [TURN ORDER]       │
│                                                                 │
│                    ┌───────────────────┐                        │
│                    │   MAP / COMBAT    │                        │
│                    │      VIEW         │                        │
│                    │                   │                        │
│                    └───────────────────┘                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎭 AI NARRATION PANEL (Collapsible)                      │   │
│  │ "The door groans open. Beyond, torch-light flickers..."  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [ACTION BAR]              [CHAT]               [INVENTORY]     │
└─────────────────────────────────────────────────────────────────┘
```

### AI Panel Behavior

| UI Behavior | Implementation |
|-------------|----------------|
| **Position** | Bottom center, above action bar |
| **Size** | 2-3 lines visible, scrollable for history |
| **Animation** | Text fades in word-by-word (typewriter effect) |
| **Collapsible** | Click to minimize; icon pulses when new narration |
| **Skip Button** | Hold spacebar to instant-reveal text |
| **Voice Toggle** | Optional text-to-speech for narration |

---

## When AI Stays SILENT

Critical for avoiding AI fatigue:

| Situation | AI Behavior | Why |
|-----------|-------------|-----|
| **Mid-combat planning** | Silent | Don't interrupt tactical thinking |
| **Player-to-player chat** | Silent | Don't interrupt social moments |
| **Rapid repeated actions** | Silent after 2nd | Avoid spam on grinding |
| **Menu navigation** | Silent | Inventory management is mechanical |
| **Short movement** | Silent | Only narrate significant travel |
| **Same room re-entry** | Short or silent | Don't re-describe known areas |

---

## Anti-Spam & Throttling Rules

| Rule | Implementation |
|------|----------------|
| **Cooldown between narrations** | Minimum 8 seconds between AI messages |
| **Combat brevity** | During active combat, max 1 sentence per action |
| **Batch similar events** | 3 goblins die → one description, not three |
| **Player-triggered only** | NPC dialogue only when player initiates |
| **Skip after skip** | If player skips narration, reduce next narration length |
| **Priority queue** | Critical moments (boss, death) override cooldown |

---

## "Calm Dungeon Master" Presence

Making AI feel like a thoughtful narrator, not a chatbot:

| Chatbot Feel ❌ | Dungeon Master Feel ✅ |
|-----------------|------------------------|
| Instant responses | Brief pause (1-2 sec) before narration |
| Clinical language | Evocative, sensory prose |
| Explains mechanics | Describes fiction only |
| Overexplains | Trusts player imagination |
| Same phrases repeated | Varied vocabulary per session |
| Breaks character | Never acknowledges being AI |
| Talks too much | Knows when silence is powerful |

### Voice Calibration Settings

Let players tune AI presence:

| Setting | Options |
|---------|---------|
| **Narration Frequency** | Minimal / Balanced / Immersive |
| **Combat Flavor** | Off / Key Moments / Every Action |
| **NPC Verbosity** | Terse / Normal / Theatrical |
| **Session Recap** | Bullet Points / Narrative / Epic |

---

# 5️⃣ Multiplayer & Social Enhancements

## AI Features That Improve Friend Play

### 1. Group Recaps with Player Names

Claude addresses players by name, makes everyone feel included:

```
SESSION RECAP:

"Kira's lockpicks found their worth tonight—without her, the 
vault would remain sealed forever. Marcus took a blow meant 
for Lyra in the final clash, and Lyra repaid the debt with a 
healing word that pulled him from death's edge.

Together, you've done what the Duke's army could not. But the 
road to the capital is long, and something follows in your 
shadows."
```

### 2. Player Spotlight System

Server tracks and flags notable player actions. Claude highlights them:

| Tracked Event | Claude Highlight |
|---------------|------------------|
| Most damage dealt | "The [class] carved through the enemy ranks like a reaper through wheat." |
| Most healing done | "Without the [class]'s steady hands, the party would have fallen twice over." |
| Clever solution | "[Name]'s quick thinking turned certain defeat into narrow victory." |
| Unlucky streak | "[Name] faced the dice gods' wrath tonight—but survived to spite them." |
| MVP vote winner | "[Name] was named Champion of the Session by their companions." |

### 3. Shy Player Engagement

AI helps quiet players feel included without forcing them:

| Technique | Implementation |
|-----------|----------------|
| **Direct NPC address** | "The merchant looks past the others, meeting [quiet player]'s eyes. 'You. You look like someone who keeps secrets. I have a proposition.'" |
| **Lore for their class** | "The runes on the wall glow faintly as [mage player] approaches—they seem to recognize a kindred spirit." |
| **Callback to their past** | "The insignia on the knight's shield—[player] recognizes it. That's the order that destroyed their village." |
| **Skill opportunity** | Claude hints that a challenge suits their character's abilities |

### 4. Shared Party Memories

Claude tracks and references party history:

| Memory Type | Example Reference |
|-------------|-------------------|
| **Inside jokes** | "Another door. Last time, Marcus tried to kick one down and spent an hour in the infirmary." |
| **Past failures** | "The trap mechanism looks familiar. Too familiar. The Thornwood Incident comes to mind." |
| **Recurring enemies** | "This goblin wears the same marking as the one who escaped you in the caves. It remembers you." |
| **Party bonds** | "You've stood together in darker places than this. Whatever waits ahead, you won't face it alone." |

### 5. Party Banter Prompts

During downtime, Claude offers optional party conversation starters:

```
CAMP SCENE:

"The fire crackles. The night is quiet, for once. A rare moment 
to speak freely.

[Optional] Kira, what do you think of the new party member?
[Optional] Marcus, you've been quiet since the crypt. Something wrong?
[Optional] Lyra, will you tell the story of how you got that scar?"
```

Players can engage or ignore—no pressure.

---

## Social Feature: "Legend Board"

AI generates ongoing party statistics formatted as in-world legend:

```
THE LEGEND OF THE SILVER COMPANY

Battles Won: 23
Enemies Felled: 147
Dungeons Cleared: 4
Times Defeated Death: 7

Greatest Victory: The Hollow King's Fall
Narrowest Escape: The Bridge of Thornwell
Most Heroic Moment: Kira's leap across the chasm

The bards will sing of you. Eventually.
```

---

# 6️⃣ Technical Guidelines for Developers

## Context Management

| Context Type | Storage | TTL | What's Stored |
|--------------|---------|-----|---------------|
| **World Lore** | Static prompt prefix | Permanent | Setting, factions, major NPCs |
| **Campaign State** | Database → prompt | Session | Active quests, current region, party level |
| **Session Events** | Memory buffer | Session | Last 20 significant events |
| **Conversation** | Rolling window | 10 exchanges | NPC dialogue context |

### Context Window Strategy

```
PROMPT STRUCTURE:

[System Prompt: 500 tokens]
  └── World, rules, tone

[Campaign Context: 300 tokens]
  └── Current quest, region, threats

[Session Log: 400 tokens]
  └── Last 15-20 events

[Immediate Context: 200 tokens]
  └── Current scene, NPC profile, player input

[Response Space: ~600 tokens reserved]

TOTAL: ~2000 tokens per request
```

---

## Response Formatting

Claude responses should include metadata for UI parsing:

```json
{
  "type": "narration|dialogue|summary|flavor",
  "content": "The door groans open...",
  "speaker": null | "NPC_NAME",
  "emotion": "ominous|neutral|triumphant|somber",
  "priority": "high|normal|low"
}
```

---

## Fallback Handling

| Failure Type | Fallback Behavior |
|--------------|-------------------|
| Claude timeout (>3s) | Use pre-written generic narration |
| Rate limit hit | Queue narration, show "..." indicator |
| Invalid response | Log error, skip narration, continue game |
| Context too long | Summarize older context, retry |

---

## Tone Calibration Reference

| Desired Tone | Claude Prompt Modifier |
|--------------|------------------------|
| **Dark & Serious** | "Maintain a tone of dread and consequence. No humor unless bitter or ironic." |
| **Heroic Fantasy** | "Emphasize courage, sacrifice, and moments of hope amid darkness." |
| **Gritty Realism** | "Focus on physical details, mud, blood, exhaustion. Heroes are mortal." |
| **Mysterious** | "Leave more unsaid than said. Questions are more interesting than answers." |
| **Playful Dark** | "Balance genuine threat with dark humor. Villains can be theatrical." |

---

# Summary: Claude Integration Priorities

| Priority | Feature | Claude Strength Used |
|----------|---------|---------------------|
| 🔴 Critical | Area Narration | Rich storytelling, sensory detail |
| 🔴 Critical | NPC Dialogue | Character voice, natural conversation |
| 🟠 High | Session Summaries | Coherent long-form prose, emotional beats |
| 🟠 High | Quest Hooks | Worldbuilding consistency, stakes framing |
| 🟡 Medium | Combat Flavor | Varied descriptions, dramatic pacing |
| 🟡 Medium | Player Spotlight | Context memory, personalization |
| 🟢 Nice-to-have | Lore Keeper | Deep world knowledge, consistent answers |
| 🟢 Nice-to-have | Party Memories | Long-form memory, callbacks |

---

*Document Version: 1.0*
*AI System: Claude API*
*Design Goal: Calm, immersive Dungeon Master — never a chatbot*
