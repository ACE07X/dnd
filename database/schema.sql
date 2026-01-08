-- =============================================================================
-- DND RPG - SUPABASE DATABASE SCHEMA
-- Multiplayer Online Tabletop RPG
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS & PROFILES
-- =============================================================================

-- Player profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    total_xp INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHARACTERS
-- =============================================================================

-- Character classes reference
CREATE TABLE public.character_classes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    base_hp INTEGER NOT NULL,
    hp_per_level INTEGER NOT NULL,
    base_ac INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    primary_stat TEXT NOT NULL,
    abilities JSONB DEFAULT '[]'::jsonb,
    passive_ability JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert starter classes
INSERT INTO public.character_classes (name, description, base_hp, hp_per_level, base_ac, speed, primary_stat, abilities, passive_ability) VALUES
('Warrior', 'Frontline fighter, absorbs damage, controls enemy positioning', 10, 6, 16, 4, 'Strength',
 '[{"name": "Power Strike", "type": "action", "effect": "+2 damage on weapon attack"},
   {"name": "Shield Bash", "type": "bonus", "effect": "Push enemy 1 tile, they lose Reaction"},
   {"name": "Taunt", "type": "bonus", "effect": "1 enemy must attack you for 1 round (DC 12 Will save)"},
   {"name": "Defensive Stance", "type": "bonus", "effect": "+2 AC, Speed reduced to 2 until next turn"}]'::jsonb,
 '{"name": "Hold the Line", "effect": "Enemies have -1 Speed in tiles adjacent to you"}'::jsonb),

('Rogue', 'High burst damage, scouting, disabling traps and locks', 6, 4, 14, 5, 'Dexterity',
 '[{"name": "Sneak Attack", "type": "passive", "effect": "+1d6 damage if ally is adjacent to target or you have advantage"},
   {"name": "Backstab", "type": "action", "effect": "Attack from behind: +2 ATK and Sneak Attack always applies"},
   {"name": "Evasion", "type": "reaction", "effect": "On DEX save success, take 0 damage (half on fail)"},
   {"name": "Disarm Trap", "type": "action", "effect": "DEX check to disable traps/locks (DC varies)"},
   {"name": "Shadow Step", "type": "bonus", "effect": "Teleport 2 tiles to unoccupied shadowed tile"}]'::jsonb,
 '{"name": "Cunning", "effect": "Can take Dash or Disengage as Bonus Action"}'::jsonb),

('Mage', 'Area damage, crowd control, utility spells', 6, 4, 11, 4, 'Intelligence',
 '[{"name": "Arcane Bolt", "type": "action", "cost": 0, "effect": "Ranged attack (6 tiles), 1d6 damage"},
   {"name": "Fireball", "type": "action", "cost": 5, "effect": "2-tile radius, 2d6 fire, DEX save half"},
   {"name": "Frost Nova", "type": "action", "cost": 3, "effect": "Adjacent enemies: 1d6 cold + Speed -2 next turn"},
   {"name": "Shield", "type": "reaction", "cost": 2, "effect": "+4 AC against one attack"},
   {"name": "Heal", "type": "action", "cost": 4, "effect": "Ally regains 1d8 + INT HP (touch)"}]'::jsonb,
 '{"name": "Arcane Recovery", "effect": "Regain 2 Mana at start of each turn"}'::jsonb);

-- Player characters
CREATE TABLE public.characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    class_id INTEGER REFERENCES public.character_classes(id) NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    xp INTEGER DEFAULT 0,
    current_hp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    current_mana INTEGER DEFAULT 0,
    max_mana INTEGER DEFAULT 0,
    strength INTEGER DEFAULT 10,
    dexterity INTEGER DEFAULT 10,
    constitution INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    wisdom INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    equipment JSONB DEFAULT '{}'::jsonb,
    inventory JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- GAME SESSIONS & ROOMS
-- =============================================================================

-- Game rooms/lobbies
CREATE TABLE public.game_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'paused', 'completed')),
    max_players INTEGER DEFAULT 4 CHECK (max_players >= 2 AND max_players <= 4),
    current_players INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{
        "turnTimer": 45,
        "difficulty": "normal",
        "narrationFrequency": "balanced"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room participants
CREATE TABLE public.room_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    is_ready BOOLEAN DEFAULT false,
    is_connected BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, profile_id)
);

-- Game sessions (actual gameplay instances)
CREATE TABLE public.game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID,
    current_turn INTEGER DEFAULT 0,
    turn_order JSONB DEFAULT '[]'::jsonb,
    current_player_index INTEGER DEFAULT 0,
    map_data JSONB DEFAULT '{}'::jsonb,
    game_state JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER
);

-- =============================================================================
-- COMBAT & ENCOUNTERS
-- =============================================================================

-- Encounter templates
CREATE TABLE public.encounter_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'boss')),
    enemies JSONB NOT NULL,
    rewards JSONB DEFAULT '{}'::jsonb,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active encounters in sessions
CREATE TABLE public.encounters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.encounter_templates(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'victory', 'defeat', 'fled')),
    round_number INTEGER DEFAULT 1,
    enemies_state JSONB DEFAULT '[]'::jsonb,
    players_state JSONB DEFAULT '[]'::jsonb,
    combat_log JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- =============================================================================
-- QUESTS & MAPS
-- =============================================================================

-- Quest templates
CREATE TABLE public.quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    quest_type TEXT CHECK (quest_type IN ('rescue', 'hunt', 'retrieval', 'mystery', 'defense', 'exploration')),
    difficulty TEXT CHECK (difficulty IN ('easy', 'normal', 'hard', 'epic')),
    estimated_duration INTEGER, -- minutes
    objectives JSONB DEFAULT '[]'::jsonb,
    map_template JSONB DEFAULT '{}'::jsonb,
    encounters JSONB DEFAULT '[]'::jsonb,
    rewards JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Map rooms for procedural generation
CREATE TABLE public.map_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    room_type TEXT CHECK (room_type IN ('entrance', 'corridor', 'chamber', 'treasure', 'trap', 'boss', 'safe', 'puzzle')),
    description_prompt TEXT, -- For Claude to expand
    features JSONB DEFAULT '[]'::jsonb,
    connections INTEGER DEFAULT 1, -- max doors/passages
    tile_layout JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ITEMS & LOOT
-- =============================================================================

-- Item definitions
CREATE TABLE public.items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    item_type TEXT CHECK (item_type IN ('weapon', 'armor', 'shield', 'accessory', 'consumable', 'quest')),
    rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    stats JSONB DEFAULT '{}'::jsonb,
    effects JSONB DEFAULT '[]'::jsonb,
    value INTEGER DEFAULT 0,
    is_tradeable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some starter items
INSERT INTO public.items (name, description, item_type, rarity, stats, value) VALUES
('Iron Sword', 'A standard iron sword', 'weapon', 'common', '{"damage": "1d8", "type": "melee"}'::jsonb, 50),
('Steel Longsword', 'A well-crafted steel blade', 'weapon', 'uncommon', '{"damage": "1d8+1", "type": "melee"}'::jsonb, 150),
('Leather Armor', 'Basic leather protection', 'armor', 'common', '{"ac_bonus": 2, "dex_cap": 3}'::jsonb, 45),
('Chain Mail', 'Interlocking metal rings', 'armor', 'uncommon', '{"ac_bonus": 4, "dex_cap": 2}'::jsonb, 200),
('Wooden Shield', 'A sturdy wooden shield', 'shield', 'common', '{"ac_bonus": 2}'::jsonb, 25),
('Health Potion', 'Restores 2d4+2 HP', 'consumable', 'common', '{"heal": "2d4+2"}'::jsonb, 50),
('Mana Potion', 'Restores 2d4 Mana', 'consumable', 'common', '{"mana": "2d4"}'::jsonb, 50);

-- =============================================================================
-- AI & NARRATION
-- =============================================================================

-- AI narration log (for session recaps and history)
CREATE TABLE public.narrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    narration_type TEXT CHECK (narration_type IN ('area', 'combat', 'npc', 'quest', 'summary', 'flavor')),
    trigger_event TEXT, -- What triggered the narration
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPC templates for AI dialogue
CREATE TABLE public.npcs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    personality TEXT,
    speech_pattern TEXT,
    secrets JSONB DEFAULT '[]'::jsonb,
    dialogue_context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PLAYER ACTIONS & HISTORY
-- =============================================================================

-- Action log for replays and AI context
CREATE TABLE public.action_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    action_data JSONB NOT NULL,
    dice_roll JSONB, -- {d20: result, modifier: x, total: y}
    result TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Session summaries (AI generated)
CREATE TABLE public.session_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
    summary_text TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb,
    player_stats JSONB DEFAULT '{}'::jsonb,
    mvp_player_id UUID REFERENCES public.profiles(id),
    unresolved_threads JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_characters_profile ON public.characters(profile_id);
CREATE INDEX idx_room_players_room ON public.room_players(room_id);
CREATE INDEX idx_room_players_profile ON public.room_players(profile_id);
CREATE INDEX idx_game_sessions_room ON public.game_sessions(room_id);
CREATE INDEX idx_encounters_session ON public.encounters(session_id);
CREATE INDEX idx_narrations_session ON public.narrations(session_id);
CREATE INDEX idx_action_log_session ON public.action_log(session_id);
CREATE INDEX idx_game_rooms_code ON public.game_rooms(code);
CREATE INDEX idx_game_rooms_status ON public.game_rooms(status);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Characters: users can manage their own
CREATE POLICY "Users can view own characters" ON public.characters FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can create own characters" ON public.characters FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (profile_id = auth.uid());

-- Game rooms: anyone can view active, hosts can manage
CREATE POLICY "Anyone can view waiting rooms" ON public.game_rooms FOR SELECT USING (status = 'waiting' OR host_id = auth.uid());
CREATE POLICY "Authenticated users can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Hosts can update their rooms" ON public.game_rooms FOR UPDATE USING (host_id = auth.uid());

-- Room players: participants can view their room
CREATE POLICY "Players can view their room" ON public.room_players FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.room_players rp WHERE rp.room_id = room_players.room_id AND rp.profile_id = auth.uid()
));
CREATE POLICY "Users can join rooms" ON public.room_players FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can leave rooms" ON public.room_players FOR DELETE USING (profile_id = auth.uid());

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_game_rooms_updated_at BEFORE UPDATE ON public.game_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate room code on insert
CREATE OR REPLACE FUNCTION set_room_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_room_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_room_code_trigger BEFORE INSERT ON public.game_rooms FOR EACH ROW EXECUTE FUNCTION set_room_code();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- DONE
-- =============================================================================
