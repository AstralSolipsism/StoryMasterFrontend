# StoryMaster API 数据模式定义

本文档详细定义了StoryMaster API中使用的所有数据模式，帮助前端开发人员理解数据结构。

## 通用模式

### 分页响应

```typescript
interface PaginatedResponse<T> {
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message: string;
  timestamp: string;
}
```

### 错误响应

```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    status_code: number;
    details: Record<string, any>;
  };
  request_id?: string;
}
```

### 成功响应

```typescript
interface SuccessResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}
```

## 认证相关模式

### 用户信息

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}
```

### 登录请求

```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

### 注册请求

```typescript
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}
```

### 认证响应

```typescript
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
```

## 角色相关模式

### 角色基础信息

```typescript
interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  race: string;
  background: string;
  alignment: string;
  experience_points: number;
  hit_points: number;
  temporary_hit_points?: number;
  armor_class: number;
  speed: number;
  proficiency_bonus: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  session_id?: string;
}
```

### 角色职业

```typescript
enum CharacterClass {
  FIGHTER = "fighter";
  WIZARD = "wizard";
  CLERIC = "cleric";
  ROGUE = "rogue";
  BARBARIAN = "barbarian";
  BARD = "bard";
  DRUID = "druid";
  MONK = "monk";
  PALADIN = "paladin";
  RANGER = "ranger";
  SORCERER = "sorcerer";
  WARLOCK = "warlock";
}
```

### 角色种族

```typescript
enum Race {
  HUMAN = "human";
  ELF = "elf";
  DWARF = "dwarf";
  HALFLING = "halfling";
  DRAGONBORN = "dragonborn";
  GNOME = "gnome";
  HALF_ELF = "half_elf";
  HALF_ORC = "half_orc";
  TIEFLING = "tiefling";
}
```

### 角色属性

```typescript
interface Abilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface AbilityScores extends Abilities {
  strength_mod: number;
  dexterity_mod: number;
  constitution_mod: number;
  intelligence_mod: number;
  wisdom_mod: number;
  charisma_mod: number;
}
```

### 角色技能

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  ability: keyof Abilities;
  proficiency: boolean;
  bonus: number;
  custom?: boolean;
}

interface CharacterSkills {
  athletics: Skill;
  acrobatics: Skill;
  sleight_of_hand: Skill;
  stealth: Skill;
  arcana: Skill;
  history: Skill;
  investigation: Skill;
  nature: Skill;
  religion: Skill;
  animal_handling: Skill;
  insight: Skill;
  medicine: Skill;
  perception: Skill;
  survival: Skill;
  deception: Skill;
  intimidation: Skill;
  performance: Skill;
  persuasion: Skill;
}
```

### 角色装备

```typescript
interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  description: string;
  weight: number;
  value: number;
  rarity: ItemRarity;
  properties: EquipmentProperty[];
  requirements?: EquipmentRequirement[];
}

enum EquipmentType {
  WEAPON = "weapon";
  ARMOR = "armor";
  SHIELD = "shield";
  TOOL = "tool";
  MOUNT = "mount";
  VEHICLE = "vehicle";
  MAGIC_ITEM = "magic_item";
}

interface EquipmentProperty {
  name: string;
  value: number | string;
  description?: string;
}
```

### 角色法术

```typescript
interface Spell {
  id: string;
  name: string;
  level: number;
  school: SpellSchool;
  casting_time: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  ritual: boolean;
  concentration: boolean;
  higher_levels?: string;
}

enum SpellSchool {
  ABJURATION = "abjuration";
  CONJURATION = "conjuration";
  DIVINATION = "divination";
  ENCHANTMENT = "enchantment";
  EVOCATION = "evocation";
  ILLUSION = "illusion";
  NECROMANCY = "necromancy";
  TRANSMUTATION = "transmutation";
}
```

### 角色创建/更新请求

```typescript
interface CreateCharacterRequest {
  name: string;
  class: CharacterClass;
  race: string;
  background: string;
  alignment: string;
  abilities: Abilities;
  skill_choices?: string[];
  equipment?: string[];
  spells?: string[];
  backstory?: string;
  personality_traits?: string[];
  ideals?: string;
  bonds?: string;
  flaws?: string;
}

interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {
  experience_points?: number;
  hit_points?: number;
  temporary_hit_points?: number;
  equipment_changes?: EquipmentChange[];
  spell_changes?: SpellChange[];
}
```

## 游戏会话相关模式

### 游戏会话

```typescript
interface GameSession {
  id: string;
  name: string;
  description: string;
  dungeon_master_id: string;
  dungeon_master: User;
  max_players: number;
  current_players: number;
  status: SessionStatus;
  setting: string;
  campaign_id?: string;
  characters: Character[];
  created_at: string;
  updated_at: string;
  started_at?: string;
  ended_at?: string;
}

enum SessionStatus {
  PLANNING = "planning";
  WAITING = "waiting";
  ACTIVE = "active";
  PAUSED = "paused";
  COMPLETED = "completed";
  CANCELLED = "cancelled";
}
```

### 会话创建请求

```typescript
interface CreateSessionRequest {
  name: string;
  description: string;
  max_players: number;
  setting: string;
  campaign_id?: string;
  scheduled_start?: string;
  ruleset?: string;
  is_private?: boolean;
  password?: string;
}
```

### 会话加入请求

```typescript
interface JoinSessionRequest {
  character_id: string;
  password?: string;
}
```

## 剧本相关模式

### 剧本

```typescript
interface Script {
  id: string;
  title: string;
  description: string;
  difficulty: ScriptDifficulty;
  estimated_duration: string;
  min_players: number;
  max_players: number;
  recommended_level: number;
  tags: string[];
  author_id: string;
  author: User;
  rating?: number;
  rating_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  scenes: Scene[];
}

enum ScriptDifficulty {
  EASY = "easy";
  MEDIUM = "medium";
  HARD = "hard";
  DEADLY = "deadly";
}
```

### 场景

```typescript
interface Scene {
  id: string;
  title: string;
  description: string;
  order: number;
  script_id: string;
  encounters: Encounter[];
  treasure?: Treasure[];
  notes?: string;
  image_url?: string;
  audio_url?: string;
}
```

### 遭遇

```typescript
interface Encounter {
  id: string;
  title: string;
  description: string;
  type: EncounterType;
  difficulty: number;
  monsters: Monster[];
  traps?: Trap[];
  rewards?: Reward[];
  tactics?: string;
}

enum EncounterType {
  COMBAT = "combat";
  PUZZLE = "puzzle";
  SOCIAL = "social";
  SKILL_CHALLENGE = "skill_challenge";
  EXPLORATION = "exploration";
}
```

## WebSocket消息模式

### 基础消息结构

```typescript
interface WebSocketMessage {
  type: MessageType;
  data: any;
  timestamp: string;
  sender_id?: string;
  message_id?: string;
}
```

### 消息类型

```typescript
enum MessageType {
  // 系统消息
  SYSTEM = "system";
  JOIN = "join";
  LEAVE = "leave";
  
  // 聊天消息
  CHAT = "chat";
  
  // 游戏动作
  ACTION = "action";
  DICE_ROLL = "dice_roll";
  
  // 角色更新
  CHARACTER_UPDATE = "character_update";
  CHARACTER_CREATE = "character_create";
  CHARACTER_DELETE = "character_delete";
  
  // 会话状态
  SESSION_UPDATE = "session_update";
  SCENE_CHANGE = "scene_change";
  
  // DM专用
  DM_MESSAGE = "dm_message";
  PRIVATE_MESSAGE = "private_message";
}
```

### 聊天消息

```typescript
interface ChatMessage {
  type: MessageType.CHAT;
  data: {
    content: string;
    channel: "general" | "dm" | "private";
    target_character_id?: string;
  };
  sender: {
    id: string;
    name: string;
    type: "player" | "dm" | "system";
  };
  timestamp: string;
}
```

### 骰子投掷

```typescript
interface DiceRollMessage {
  type: MessageType.DICE_ROLL;
  data: {
    formula: string;
    result: number;
    details: DiceRollDetail[];
    character_id?: string;
    is_private?: boolean;
  };
  sender: {
    id: string;
    name: string;
  };
}

interface DiceRollDetail {
  die_type: string;
  count: number;
  result: number;
  critical?: boolean;
}
```

### 游戏动作

```typescript
interface ActionMessage {
  type: MessageType.ACTION;
  data: {
    action_type: ActionType;
    target_id?: string;
    parameters: Record<string, any>;
    character_id: string;
  };
  sender: {
    id: string;
    name: string;
  };
}

enum ActionType {
  ATTACK = "attack";
  CAST_SPELL = "cast_spell";
  USE_ABILITY = "use_ability";
  USE_ITEM = "use_item";
  MOVE = "move";
  HIDE = "hide";
  SEARCH = "search";
  INTERACT = "interact";
}
```

## 健康检查相关模式

### 健康状态

```typescript
interface HealthStatus {
  status: "healthy" | "degraded" | "error";
  timestamp: string;
  version: string;
  environment: string;
  uptime?: number;
  system: SystemInfo;
  database: DatabaseStatus;
  services: ServicesStatus;
}
```

### 系统信息

```typescript
interface SystemInfo {
  platform: string;
  python_version: string;
  cpu: {
    percent: number;
    count: number;
  };
  memory: {
    percent: number;
    total_mb: number;
    available_mb: number;
  };
  disk: {
    percent: number;
    total_gb: number;
    free_gb: number;
  };
}
```

### 数据库状态

```typescript
interface DatabaseStatus {
  neo4j: {
    status: "healthy" | "error" | "disabled";
    message: string;
  };
  redis: {
    status: "healthy" | "error" | "disabled";
    message: string;
  };
}
```

### 服务状态

```typescript
interface ServicesStatus {
  openai?: {
    status: "healthy" | "error" | "disabled";
    message: string;
  };
  anthropic?: {
    status: "healthy" | "error" | "disabled";
    message: string;
  };
  ollama?: {
    status: "healthy" | "error" | "disabled";
    message: string;
    models?: string[];
  };
}
```

## 前端TypeScript类型定义

```typescript
// api-types.ts
export interface StoryMasterAPI {
  // 认证
  auth: {
    login: (data: LoginRequest) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    refresh: () => Promise<AuthResponse>;
    logout: () => Promise<void>;
  };
  
  // 角色管理
  characters: {
    list: (params?: CharacterListParams) => Promise<PaginatedResponse<Character>>;
    get: (id: string) => Promise<SuccessResponse<Character>>;
    create: (data: CreateCharacterRequest) => Promise<SuccessResponse<Character>>;
    update: (id: string, data: UpdateCharacterRequest) => Promise<SuccessResponse<Character>>;
    delete: (id: string) => Promise<void>;
  };
  
  // 游戏会话
  sessions: {
    list: (params?: SessionListParams) => Promise<PaginatedResponse<GameSession>>;
    get: (id: string) => Promise<SuccessResponse<GameSession>>;
    create: (data: CreateSessionRequest) => Promise<SuccessResponse<GameSession>>;
    join: (id: string, data: JoinSessionRequest) => Promise<void>;
    leave: (id: string) => Promise<void>;
  };
  
  // 剧本
  scripts: {
    list: (params?: ScriptListParams) => Promise<PaginatedResponse<Script>>;
    get: (id: string) => Promise<SuccessResponse<Script>>;
    create: (data: CreateScriptRequest) => Promise<SuccessResponse<Script>>;
  };
  
  // 健康检查
  health: {
    check: () => Promise<HealthStatus>;
    simple: () => Promise<{status: string; timestamp: string; version: string}>;
    database: () => Promise<DatabaseStatus>;
  };
}
```

这些模式定义可以在前端项目中直接使用，确保类型安全和数据一致性。建议将这些定义保存在前端项目的 `types/api-types.ts` 文件中。