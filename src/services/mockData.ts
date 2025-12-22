import { computed } from 'vue';
import i18n from '../i18n';

export interface Entity {
  id: string;
  name: string;
  type: 'Spell' | 'Monster' | 'Item' | 'Rule' | 'Location' | 'Character' | 'Task';
  description: string;
  relations: Array<{ targetId: string; type: string }>;
}

export interface BookNode {
  id: string;
  title: string;
  type: 'chapter' | 'section' | 'table';
  children?: BookNode[];
  parentId?: string;
}

export interface ChapterContent extends BookNode {
  content: string; // Markdown string
  order: number;
  prevId?: string;
  nextId?: string;
  relatedEntities: string[]; // IDs of related entities
}

// For Scripts scenarios, keeping a simple structure similar to the old Chapter
export interface Scenario {
    id: string;
    title: string;
    content: string;
    relatedEntities: string[];
}

export interface Script {
    id: string;
    title: string;
    description: string;
    scenarios: Scenario[];
    characters: string[]; // IDs of entities
    tasks: string[]; // IDs of entities
}

export interface CharacterSheet {
  id: string;
  name: string;
  avatar?: string;
  class: string;
  level: number;
  race: string;
  background: string;
  alignment: string;
  xp: number;
  speed: number;
  proficiencyBonus: number;
  hp: { current: number; max: number; temp?: number };
  hitDice: { total: string; current: number };
  deathSaves?: {
      successes: number;
      failures: number;
  };
  ac: number;
  initiative?: number; // Optional override, otherwise calc from Dex
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  proficiencies: {
      skills: string[]; // List of skill keys e.g., 'arcana', 'history'
      savingThrows: string[]; // List of stat keys e.g., 'int', 'wis'
      languages: string[];
      tools: string[];
      weapons: string[];
      armor: string[];
  };
  inventory: Array<{
    id: string; // ID of the item entity
    qty: number;
    weight?: string;
    notes?: string;
  }>;
  spells: string[]; // IDs of spells
  relationships: string[]; // IDs of entities
  history: string; // Markdown
  attacks: Array<{
      name: string;
      bonus: string;
      damage: string;
      type: string;
  }>;
  features: Array<{
      name: string;
      source: string; // e.g. 'Racial', 'Class', 'Feat'
      description: string;
  }>;
  personality: {
      traits: string;
      ideals: string;
      bonds: string;
      flaws: string;
  };
  resources: Array<{ // For spell slots, bardic inspiration, etc.
      name: string;
      total: number;
      current: number;
  }>;
}

export interface Agent {
  id: string;
  name: string;
  type: 'system' | 'narrator' | 'npc' | 'logic';
  description: string;
  config: {
    model: string;
    temperature: number;
    promptTemplate: string;
    rules: string[];
  };
  connectedTo: string[]; // IDs of agents this one sends data to
}

// --- English Data ---
const mockEntities_en: Record<string, Entity> = {
  'fireball': {
    id: 'fireball',
    name: 'Fireball',
    type: 'Spell',
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.',
    relations: [
      { targetId: 'dexterity', type: 'requires_save' },
      { targetId: 'magic_missile', type: 'school_evocation' }
    ]
  },
  'magic_missile': {
    id: 'magic_missile',
    name: 'Magic Missile',
    type: 'Spell',
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.',
    relations: [
      { targetId: 'force_damage', type: 'deals_damage' },
      { targetId: 'fireball', type: 'school_evocation' }
    ]
  },
  'goblin': {
    id: 'goblin',
    name: 'Goblin',
    type: 'Monster',
    description: 'Goblins are small, black-hearted, selfish humanoids that lair in caves, abandoned mines, despoiled dungeons, and other dismal settings. They are individually weak, but dangerous in large numbers.',
    relations: [
      { targetId: 'scimitar', type: 'equips' },
      { targetId: 'shortbow', type: 'equips' },
      { targetId: 'dark_cave', type: 'lives_in' }
    ]
  },
  'dexterity': {
    id: 'dexterity',
    name: 'Dexterity',
    type: 'Rule',
    description: 'Dexterity measures agility, reflexes, and balance.',
    relations: []
  },
  'scimitar': {
    id: 'scimitar',
    name: 'Scimitar',
    type: 'Item',
    description: 'A martial melee weapon that deals 1d6 slashing damage.',
    relations: []
  },
  'force_damage': {
    id: 'force_damage',
    name: 'Force Damage',
    type: 'Rule',
    description: 'Force is pure magical energy focused into a damaging form.',
    relations: []
  },
  'shortbow': {
    id: 'shortbow',
    name: 'Shortbow',
    type: 'Item',
    description: 'A simple ranged weapon that deals 1d6 piercing damage.',
    relations: []
  },
  'dark_cave': {
      id: 'dark_cave',
      name: 'Dark Cave',
      type: 'Location',
      description: 'A damp, dark cave smelling of rot and goblin refuse.',
      relations: [{ targetId: 'goblin', type: 'inhabited_by' }]
  },
  'village_elder': {
      id: 'village_elder',
      name: 'Village Elder',
      type: 'Character',
      description: 'The wise leader of the village, concerned about the recent attacks.',
      relations: [{ targetId: 'save_the_village', type: 'gives_quest' }]
  },
  'save_the_village': {
      id: 'save_the_village',
      name: 'Save the Village',
      type: 'Task',
      description: 'The goblins have been raiding the village stores. Stop them!',
      relations: [{ targetId: 'dark_cave', type: 'location' }]
  },
  'elara': {
      id: 'elara',
      name: 'Elara Moonwhisper',
      type: 'Character',
      description: 'An elven wizard with a passion for ancient history.',
      relations: [
          { targetId: 'magic_missile', type: 'knows_spell' },
          { targetId: 'fireball', type: 'knows_spell' },
          { targetId: 'village_elder', type: 'ally' }
      ]
  }
};

const mockRulebook_en: BookNode[] = [
    {
        id: 'phb',
        title: "Player's Handbook",
        type: 'chapter',
        children: [
            {
                id: 'ch3_classes',
                title: 'Chapter 3: Classes',
                type: 'chapter',
                parentId: 'phb',
                children: [
                    {
                        id: 'class_wizard',
                        title: 'Wizard',
                        type: 'section',
                        parentId: 'ch3_classes',
                    }
                ]
            },
            {
                id: 'ch9_combat',
                title: 'Chapter 9: Combat',
                type: 'chapter',
                parentId: 'phb',
            },
            {
                id: 'ch10_magic',
                title: 'Chapter 10: Spellcasting',
                type: 'chapter',
                parentId: 'phb',
            }
        ]
    }
];

const mockRulebookContent_en: Record<string, ChapterContent> = {
    'class_wizard': {
        id: 'class_wizard',
        title: 'Wizard',
        type: 'section',
        order: 1,
        parentId: 'ch3_classes',
        content: `# Wizard
Wizards are supreme magic-users, defined and united as a class by the spells they cast. Drawing on the subtle weave of magic that permeates the cosmos, wizards cast spells of explosive fire, arcing lightning, subtle deception, and brute-force mind control.

## Arcane Recovery
You have learned to regain some of your magical energy by studying your spellbook.

## Spells
Wizards learn many spells. A young wizard might master [Magic Missile] for defense, while a more experienced one might cast [Fireball] to devastate their enemies.`,
        relatedEntities: ['magic_missile', 'fireball']
    },
    'ch9_combat': {
        id: 'ch9_combat',
        title: 'Chapter 9: Combat',
        type: 'chapter',
        order: 2,
        parentId: 'phb',
        content: `# Combat
Typical combat relies on [Dexterity] for initiative and AC.

## The Order of Combat
A typical combat encounter is a clash between two sides, a flurry of weapon swings, feints, parries, footwork, and spellcasting.`,
        relatedEntities: ['dexterity']
    },
    'ch10_magic': {
        id: 'ch10_magic',
        title: 'Chapter 10: Spellcasting',
        type: 'chapter',
        order: 3,
        parentId: 'phb',
        content: `# Spellcasting
Magic permeates the worlds of D&D and famously often appears in the form of a spell.
Some spells deal [Force Damage], others deal fire or cold damage.`,
        relatedEntities: ['force_damage']
    }
};

const mockScripts_en: Script[] = [
    {
        id: 'shadows_over_brook',
        title: 'Shadows over Brook',
        description: 'A starter adventure for level 1 characters involving a goblin infestation.',
        scenarios: [
            {
                id: 'intro',
                title: 'The Plea',
                content: 'The party arrives in the village. The [Village Elder] approaches them with a look of desperation. "Please," he says, "You must help us [Save the Village] from the monsters!"',
                relatedEntities: ['village_elder', 'save_the_village']
            },
            {
                id: 'cave_entrance',
                title: 'Into the Dark',
                content: 'The party tracks the raiders to a [Dark Cave]. The smell is awful. Inside, they hear the chattering of a [Goblin] patrol.',
                relatedEntities: ['dark_cave', 'goblin']
            }
        ],
        characters: ['village_elder', 'goblin'],
        tasks: ['save_the_village']
    }
];

const mockCharacters_en: CharacterSheet[] = [
    {
        id: 'elara',
        name: 'Elara Moonwhisper',
        avatar: 'https://i.pinimg.com/736x/84/c4/23/84c4238711bd459b1587a8bfa04464c2.jpg',
        class: 'Wizard',
        level: 3,
        race: 'Elf',
        background: 'Sage',
        alignment: 'Chaotic Good',
        xp: 900,
        speed: 30,
        proficiencyBonus: 2,
        hp: { current: 18, max: 22 },
        hitDice: { total: '3d6', current: 3 },
        ac: 12,
        stats: { str: 8, dex: 14, con: 12, int: 17, wis: 13, cha: 10 },
        proficiencies: {
            skills: ['arcana', 'history', 'insight', 'investigation'],
            savingThrows: ['int', 'wis'],
            languages: ['Common', 'Elvish', 'Draconic'],
            tools: [],
            weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows'],
            armor: []
        },
        inventory: [
            { id: 'shortbow', qty: 1, weight: '2 lb', notes: 'Given by father' },
            { id: 'scimitar', qty: 1, weight: '3 lb', notes: 'Looted from goblin' }
        ],
        spells: ['magic_missile', 'fireball'],
        relationships: ['village_elder'],
        history: 'Elara grew up studying the arcane arts in the high towers of Silvermoon. She set out on her adventure to document the lost spells of the ancient world. During her travels, she met the [Village Elder] and promised to aid his people.',
        attacks: [
            { name: 'Dagger', bonus: '+4', damage: '1d4+2', type: 'Piercing' },
            { name: 'Firebolt', bonus: '+5', damage: '1d10', type: 'Fire' }
        ],
        features: [
            { name: 'Darkvision', source: 'Elf', description: 'Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions.' },
            { name: 'Fey Ancestry', source: 'Elf', description: 'You have advantage on saving throws against being charmed, and magic can’t put you to sleep.' },
            { name: 'Arcane Recovery', source: 'Wizard', description: 'You have learned to regain some of your magical energy by studying your spellbook.' }
        ],
        personality: {
            traits: "I use polysyllabic words that convey the impression of great erudition.",
            ideals: "Knowledge. The path to power and self-improvement is through knowledge.",
            bonds: "I have an ancient text that holds terrible secrets that must not fall into the wrong hands.",
            flaws: "I speak without really thinking through my words, invariably insulting others."
        },
        resources: [
            { name: '1st Level Slots', total: 4, current: 2 },
            { name: '2nd Level Slots', total: 2, current: 1 }
        ]
    }
];

const mockAgents_en: Agent[] = [
  {
    id: 'input_processor',
    name: 'Input Processor',
    type: 'system',
    description: 'Analyzes user input to determine intent.',
    config: {
      model: 'gpt-4o',
      temperature: 0.2,
      promptTemplate: 'Analyze the following user input and categorize it: {{input}}',
      rules: ['Always classify as Intent.', 'Extract key entities.']
    },
    connectedTo: ['rule_engine', 'narrator']
  },
  {
    id: 'rule_engine',
    name: 'Rule Engine',
    type: 'logic',
    description: 'Checks game state against D&D 5e rules.',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      promptTemplate: 'Given the intent {{intent}}, determine the necessary skill checks.',
      rules: ['Refer to PHB 5e.', 'Prioritize RAW over RAI.']
    },
    connectedTo: ['combat_manager', 'narrator']
  },
  {
    id: 'combat_manager',
    name: 'Combat Manager',
    type: 'logic',
    description: 'Manages initiative, health, and turns.',
    config: {
      model: 'gpt-4o',
      temperature: 0.1,
      promptTemplate: 'Update combat state based on action: {{action}}',
      rules: ['Track HP strictly.', 'Announce critical hits.']
    },
    connectedTo: ['narrator']
  },
  {
    id: 'narrator',
    name: 'Narrator',
    type: 'narrator',
    description: 'Weaves the story and outcomes together.',
    config: {
      model: 'gpt-4o',
      temperature: 0.8,
      promptTemplate: 'Describe the scene based on: {{context}}',
      rules: ['Be immersive.', 'Use sensory details.', 'Keep it under 200 words unless necessary.']
    },
    connectedTo: ['output_formatter']
  },
  {
    id: 'output_formatter',
    name: 'Output Formatter',
    type: 'system',
    description: 'Formats the final response for the UI.',
    config: {
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      promptTemplate: 'Format this text to JSON: {{text}}',
      rules: ['Ensure valid JSON.', 'Structure for UI components.']
    },
    connectedTo: []
  }
];

// --- Chinese Data ---
const mockEntities_zh: Record<string, Entity> = {
  'fireball': {
    id: 'fireball',
    name: '火球术 (Fireball)',
    type: 'Spell',
    description: '一道亮光从你的指尖闪过，飞向你选择的范围内的一个点，随后伴随着低沉的轰鸣声爆发成火焰。以该点为中心的20英尺半径球体内的每个生物都必须进行一次敏捷豁免。豁免失败的目标受到8d6火焰伤害，成功则伤害减半。',
    relations: [
      { targetId: 'dexterity', type: '需要豁免 (requires_save)' },
      { targetId: 'magic_missile', type: '塑能系 (school_evocation)' }
    ]
  },
  'magic_missile': {
    id: 'magic_missile',
    name: '魔法飞弹 (Magic Missile)',
    type: 'Spell',
    description: '你创造出三支发光的魔法飞弹。每支飞弹都会击中你在范围内可见的一个生物。每支飞弹对目标造成1d4 + 1点力场伤害。飞弹同时命中，你可以让它们击中同一个生物或分别击中多个生物。',
    relations: [
      { targetId: 'force_damage', type: '造成伤害 (deals_damage)' },
      { targetId: 'fireball', type: '塑能系 (school_evocation)' }
    ]
  },
  'goblin': {
    id: 'goblin',
    name: '哥布林 (Goblin)',
    type: 'Monster',
    description: '哥布林是体型小巧、心肠歹毒、自私自利的人形生物，它们居住在洞穴、废弃矿井、被掠夺的地牢和其他阴暗的地方。它们个体弱小，但成群结队时非常危险。',
    relations: [
      { targetId: 'scimitar', type: '装备 (equips)' },
      { targetId: 'shortbow', type: '装备 (equips)' },
      { targetId: 'dark_cave', type: '居住于 (lives_in)' }
    ]
  },
  'dexterity': {
    id: 'dexterity',
    name: '敏捷 (Dexterity)',
    type: 'Rule',
    description: '敏捷衡量灵活性、反应能力和平衡感。',
    relations: []
  },
  'scimitar': {
    id: 'scimitar',
    name: '弯刀 (Scimitar)',
    type: 'Item',
    description: '一种造成1d6挥砍伤害的军用近战武器。',
    relations: []
  },
  'force_damage': {
    id: 'force_damage',
    name: '力场伤害 (Force Damage)',
    type: 'Rule',
    description: '力场是聚焦成伤害形式的纯粹魔法能量。',
    relations: []
  },
  'shortbow': {
    id: 'shortbow',
    name: '短弓 (Shortbow)',
    type: 'Item',
    description: '一种造成1d6穿刺伤害的简易远程武器。',
    relations: []
  },
  'dark_cave': {
      id: 'dark_cave',
      name: '黑暗洞穴 (Dark Cave)',
      type: 'Location',
      description: '一个潮湿、黑暗的洞穴，散发着腐烂和哥布林垃圾的臭味。',
      relations: [{ targetId: 'goblin', type: '栖息 (inhabited_by)' }]
  },
  'village_elder': {
      id: 'village_elder',
      name: '村长 (Village Elder)',
      type: 'Character',
      description: '村庄的明智领袖，对最近的袭击感到担忧。',
      relations: [{ targetId: 'save_the_village', type: '发布任务 (gives_quest)' }]
  },
  'save_the_village': {
      id: 'save_the_village',
      name: '拯救村庄 (Save the Village)',
      type: 'Task',
      description: '哥布林一直在抢劫村庄的仓库。阻止它们！',
      relations: [{ targetId: 'dark_cave', type: '地点 (location)' }]
  },
  'elara': {
      id: 'elara',
      name: '艾拉·月语 (Elara Moonwhisper)',
      type: 'Character',
      description: '一位对古代历史充满热情的精灵法师。',
      relations: [
          { targetId: 'magic_missile', type: '掌握法术 (knows_spell)' },
          { targetId: 'fireball', type: '掌握法术 (knows_spell)' },
          { targetId: 'village_elder', type: '盟友 (ally)' }
      ]
  }
};

const mockRulebook_zh: BookNode[] = [
    {
        id: 'phb',
        title: "玩家手册",
        type: 'chapter',
        children: [
            {
                id: 'ch3_classes',
                title: '第3章：职业',
                type: 'chapter',
                parentId: 'phb',
                children: [
                    {
                        id: 'class_wizard',
                        title: '法师',
                        type: 'section',
                        parentId: 'ch3_classes',
                    }
                ]
            },
            {
                id: 'ch9_combat',
                title: '第9章：战斗',
                type: 'chapter',
                parentId: 'phb',
            },
            {
                id: 'ch10_magic',
                title: '第10章：施法',
                type: 'chapter',
                parentId: 'phb',
            }
        ]
    }
];

const mockRulebookContent_zh: Record<string, ChapterContent> = {
    'class_wizard': {
        id: 'class_wizard',
        title: '法师',
        type: 'section',
        order: 1,
        parentId: 'ch3_classes',
        content: `# 法师
法师是至高无上的魔法使用者，他们因所施展的法术而定义并团结在一起。法师利用渗透宇宙的微妙魔法网络，施展爆炸性的火焰、弧形闪电、微妙的欺骗和蛮力的精神控制法术。

## 奥术回想 (Arcane Recovery)
你学会了通过研习法术书来恢复一些魔法能量。

## 法术
法师学习许多法术。年轻的法师可能会掌握[魔法飞弹 (Magic Missile)]进行防御，而经验更丰富的法师可能会施展[火球术 (Fireball)]来摧毁敌人。`,
        relatedEntities: ['magic_missile', 'fireball']
    },
    'ch9_combat': {
        id: 'ch9_combat',
        title: '第9章：战斗',
        type: 'chapter',
        order: 2,
        parentId: 'phb',
        content: `# 战斗
典型的战斗依赖于[敏捷 (Dexterity)]来决定先攻和防御等级(AC)。

## 战斗流程
典型的战斗遭遇是双方之间的冲突，充满了武器挥舞、佯攻、招架、步法和施法。`,
        relatedEntities: ['dexterity']
    },
    'ch10_magic': {
        id: 'ch10_magic',
        title: '第10章：施法',
        type: 'chapter',
        order: 3,
        parentId: 'phb',
        content: `# 施法
魔法渗透在D&D的世界中，通常以法术的形式出现。
有些法术造成[力场伤害 (Force Damage)]，有些则造成火焰或寒冷伤害。`,
        relatedEntities: ['force_damage']
    }
};

const mockScripts_zh: Script[] = [
    {
        id: 'shadows_over_brook',
        title: '布鲁克溪的阴影 (Shadows over Brook)',
        description: '针对1级角色的入门冒险，涉及哥布林的侵扰。',
        scenarios: [
            {
                id: 'intro',
                title: '恳求',
                content: '队伍到达村庄。[村长 (Village Elder)]带着绝望的神情走近他们。“求求你们，”他说，“你们必须帮助我们从怪物手中[拯救村庄 (Save the Village)]！”',
                relatedEntities: ['village_elder', 'save_the_village']
            },
            {
                id: 'cave_entrance',
                title: '进入黑暗',
                content: '队伍追踪袭击者来到了一个[黑暗洞穴 (Dark Cave)]。气味难闻。在里面，他们听到了[哥布林 (Goblin)]巡逻队的喋喋不休。',
                relatedEntities: ['dark_cave', 'goblin']
            }
        ],
        characters: ['village_elder', 'goblin'],
        tasks: ['save_the_village']
    }
];

const mockCharacters_zh: CharacterSheet[] = [
    {
        id: 'elara',
        name: '艾拉·月语 (Elara Moonwhisper)',
        avatar: 'https://i.pinimg.com/736x/84/c4/23/84c4238711bd459b1587a8bfa04464c2.jpg',
        class: '法师',
        level: 3,
        race: '精灵',
        background: '贤者',
        alignment: '混乱善良',
        xp: 900,
        speed: 30,
        proficiencyBonus: 2,
        hp: { current: 18, max: 22 },
        hitDice: { total: '3d6', current: 3 },
        ac: 12,
        stats: { str: 8, dex: 14, con: 12, int: 17, wis: 13, cha: 10 },
        proficiencies: {
            skills: ['arcana', 'history', 'insight', 'investigation'],
            savingThrows: ['int', 'wis'],
            languages: ['通用语', '精灵语', '龙语'],
            tools: [],
            weapons: ['匕首', '飞镖', '投石索', '长棍', '轻弩'],
            armor: []
        },
        inventory: [
            { id: 'shortbow', qty: 1, weight: '2 lb', notes: '父亲赠送' },
            { id: 'scimitar', qty: 1, weight: '3 lb', notes: '从哥布林身上搜刮' }
        ],
        spells: ['magic_missile', 'fireball'],
        relationships: ['village_elder'],
        history: '艾拉在银月城的高塔中长大，学习奥术。她踏上冒险之旅，以记录古代世界失落的法术。在旅途中，她遇到了[村长 (Village Elder)]并承诺帮助他的人民。',
        attacks: [
            { name: '匕首', bonus: '+4', damage: '1d4+2', type: '穿刺' },
            { name: '火焰箭', bonus: '+5', damage: '1d10', type: '火焰' }
        ],
        features: [
            { name: '黑暗视觉', source: '精灵', description: '习惯了微光的森林和夜空，你在黑暗和微光条件下拥有卓越的视力。' },
            { name: '精类血统', source: '精灵', description: '你在对抗魅惑的豁免检定上具有优势，且魔法无法使你陷入睡眠。' },
            { name: '奥术回想', source: '法师', description: '你学会了通过研习法术书来恢复一些魔法能量。' }
        ],
        personality: {
            traits: "我总是使用多音节的词汇，给人一种博学的印象。",
            ideals: "知识。通往力量和自我提升的道路在于知识。",
            bonds: "我拥有一本古老的文本，其中包含绝不能落入坏人之手的可怕秘密。",
            flaws: "我说话不经过大脑，总是无意中冒犯别人。"
        },
        resources: [
            { name: '1环法术位', total: 4, current: 2 },
            { name: '2环法术位', total: 2, current: 1 }
        ]
    }
];

const mockAgents_zh: Agent[] = [
  {
    id: 'input_processor',
    name: '输入处理器',
    type: 'system',
    description: '分析用户输入以确定意图。',
    config: {
      model: 'gpt-4o',
      temperature: 0.2,
      promptTemplate: '分析以下用户输入并对其进行分类: {{input}}',
      rules: ['始终分类为 Intent (意图)。', '提取关键实体。']
    },
    connectedTo: ['rule_engine', 'narrator']
  },
  {
    id: 'rule_engine',
    name: '规则引擎',
    type: 'logic',
    description: '根据D&D 5e规则检查游戏状态。',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      promptTemplate: '给定意图 {{intent}}，确定必要的技能检定。',
      rules: ['参考 PHB 5e。', '优先考虑 RAW (规则原文) 而非 RAI (规则原意)。']
    },
    connectedTo: ['combat_manager', 'narrator']
  },
  {
    id: 'combat_manager',
    name: '战斗管理器',
    type: 'logic',
    description: '管理先攻、生命值和回合。',
    config: {
      model: 'gpt-4o',
      temperature: 0.1,
      promptTemplate: '根据动作更新战斗状态: {{action}}',
      rules: ['严格跟踪 HP。', '宣布暴击。']
    },
    connectedTo: ['narrator']
  },
  {
    id: 'narrator',
    name: '旁白',
    type: 'narrator',
    description: '编织故事和结果。',
    config: {
      model: 'gpt-4o',
      temperature: 0.8,
      promptTemplate: '基于以下内容描述场景: {{context}}',
      rules: ['具有沉浸感。', '使用感官细节。', '除非必要，否则保持在200字以内。']
    },
    connectedTo: ['output_formatter']
  },
  {
    id: 'output_formatter',
    name: '输出格式化器',
    type: 'system',
    description: '为UI格式化最终响应。',
    config: {
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      promptTemplate: '将此文本格式化为JSON: {{text}}',
      rules: ['确保有效的 JSON。', '为 UI 组件构建结构。']
    },
    connectedTo: []
  }
];

// --- Reactive Data Exports ---

const currentLocale = computed(() => (i18n.global.locale as any).value || i18n.global.locale);

export const mockEntities = computed(() => {
    return currentLocale.value === 'zh' ? mockEntities_zh : mockEntities_en;
});

// Exporting the catalog tree
export const mockCatalog = computed(() => {
    return currentLocale.value === 'zh' ? mockRulebook_zh : mockRulebook_en;
});

// Exporting the content map
export const mockChapterContent = computed(() => {
    return currentLocale.value === 'zh' ? mockRulebookContent_zh : mockRulebookContent_en;
});

// Deprecated: kept to prevent immediate extensive breakage before refactor, but returns empty or mapped data potentially?
// For now, let's remove it and let the compiler guide us in Step 2, or return a flattened version of the new data if needed.
// Returning an empty array to alert the developer (me) to fix the view.
// export const mockChapters = computed(() => []);

export const mockScripts = computed(() => {
    return currentLocale.value === 'zh' ? mockScripts_zh : mockScripts_en;
});

export const mockCharacters = computed(() => {
    return currentLocale.value === 'zh' ? mockCharacters_zh : mockCharacters_en;
});

export const mockAgents = computed(() => {
    return currentLocale.value === 'zh' ? mockAgents_zh : mockAgents_en;
});

// Helper to get graph data for a specific context
export const getGraphData = (centerId: string) => {
  const entities = mockEntities.value;
  const center = entities[centerId];
  if (!center) return { nodes: [], edges: [] };

  const nodes = [{ id: center.id, data: { label: center.name, type: center.type } }];
  const edges: any[] = [];

  center.relations.forEach(rel => {
    const target = entities[rel.targetId];
    if (target) {
      nodes.push({ id: target.id, data: { label: target.name, type: target.type } });
      edges.push({ source: center.id, target: target.id, data: { label: rel.type } });
    }
  });

  return { nodes, edges };
};

export const getAgentWorkflowData = () => {
    const agents = mockAgents.value;
    const nodes = agents.map(agent => ({
        id: agent.id,
        data: {
            label: agent.name,
            type: agent.type,
            agent: agent // store full agent data for easy access
        }
    }));

    const edges: any[] = [];
    agents.forEach(agent => {
        agent.connectedTo.forEach(targetId => {
            edges.push({
                source: agent.id,
                target: targetId,
                data: { label: 'flow' }
            });
        });
    });

    return { nodes, edges };
};
