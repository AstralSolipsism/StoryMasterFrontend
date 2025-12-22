<template>
  <div class="flex h-[calc(100vh-4rem)] gap-4 overflow-hidden p-2">
    <!-- Left: Chat Interface (The "Table") -->
    <div class="flex-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-lg shadow-inner border border-stone-300 overflow-hidden relative">
      <!-- Chat Header -->
      <div class="p-4 bg-stone-100 border-b border-stone-200 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-amber-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="8" x2="16" y1="22" y2="22"/></svg>
          </div>
          <div>
            <h3 class="font-cinzel font-bold text-lg text-ink-black">{{ $t('play.dmTitle') }}</h3>
            <p class="text-xs text-stone-500 font-lato">{{ $t('play.session', { id: 42, title: 'The Whispering Cave' }) }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="p-2 hover:bg-stone-200 rounded text-stone-600" title="Voice Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6" ref="messagesContainer">
        <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <div 
            :class="[
              'max-w-[80%] rounded-2xl p-4 shadow-sm border font-lato leading-relaxed',
              msg.role === 'user' 
                ? 'bg-indigo-50 border-indigo-100 text-indigo-900 rounded-br-none' 
                : 'bg-stone-50 border-stone-200 text-stone-900 rounded-bl-none'
            ]"
          >
            <!-- DM Avatar if needed -->
            <div v-if="msg.role === 'ai'" class="font-cinzel font-bold text-xs text-indigo-800 mb-1">{{ $t('play.dmRole') }}</div>
            <div class="whitespace-pre-wrap">{{ msg.content }}</div>
            <div class="text-[10px] opacity-50 mt-2 text-right">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-stone-50 border border-stone-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></span>
              <span class="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-stone-200">
        <div class="relative">
          <textarea 
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            class="w-full bg-stone-50 border border-stone-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 resize-none h-14"
            :placeholder="$t('play.typing')"
          ></textarea>
          <button 
            @click="sendMessage"
            class="absolute right-2 top-2 p-2 bg-indigo-900 text-white rounded hover:bg-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Reference Book -->
    <div class="w-96 flex flex-col bg-parchment rounded-r-lg shadow-2xl border-l-4 border-l-ink-black/80 relative perspective-book">
       <!-- Book Spine Visual -->
       <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-stone-800 to-stone-600 rounded-l"></div>
       
       <!-- Tabs (Bookmarks) -->
       <div class="flex pl-4 pt-2 gap-1 border-b border-ink-black/10 bg-stone-100/50">
         <button 
           v-for="tab in ['Character', 'Spells', 'Scene']" 
           :key="tab"
           @click="activeTab = tab"
           :class="[
             'px-4 py-2 font-cinzel text-sm rounded-t transition-colors',
             activeTab === tab 
               ? 'bg-parchment text-ink-black font-bold border-t border-x border-ink-black/20 translate-y-[1px]' 
               : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
           ]"
         >
           {{ $t(`play.referenceTabs.${tab.toLowerCase()}`) }}
         </button>
       </div>

       <!-- Content -->
       <div class="flex-1 overflow-y-auto p-6 font-serif">
         
         <!-- Character Tab -->
         <div v-if="activeTab === 'Character'" class="space-y-6">
           <div class="text-center border-b-2 border-ink-black/20 pb-4">
             <h2 class="font-cinzel text-2xl font-bold">{{ character.name }}</h2>
             <p class="italic text-stone-600">{{ character.race }} {{ character.class }} (Lvl {{ character.level }})</p>
           </div>
           
           <div class="grid grid-cols-3 gap-2 text-center">
             <div v-for="(val, stat) in character.stats" :key="stat" class="p-2 bg-white/50 border border-ink-black/10 rounded">
               <div class="font-cinzel font-bold text-xs uppercase">{{ stat }}</div>
               <div class="text-xl font-bold">{{ val }}</div>
             </div>
           </div>

           <div class="space-y-2">
             <div class="flex justify-between items-center bg-red-900/10 p-2 rounded border border-red-900/20">
               <span class="font-cinzel font-bold">{{ $t('characters.hp') }}</span>
               <span class="font-bold text-red-900">{{ character.hp.current }} / {{ character.hp.max }}</span>
             </div>
             <div class="flex justify-between items-center bg-blue-900/10 p-2 rounded border border-blue-900/20">
               <span class="font-cinzel font-bold">{{ $t('characters.ac') }}</span>
               <span class="font-bold text-blue-900">{{ character.ac }}</span>
             </div>
           </div>
         </div>

         <!-- Spells Tab -->
         <div v-if="activeTab === 'Spells'" class="space-y-4">
           <h3 class="font-cinzel text-xl font-bold border-b border-ink-black/20 pb-2">{{ $t('play.grimoire') }}</h3>
           <div v-for="spell in spells" :key="spell.id" class="p-3 bg-white/40 rounded border border-ink-black/10 hover:border-ink-black/30 cursor-pointer transition-colors group">
             <div class="flex justify-between items-start">
               <h4 class="font-bold font-cinzel group-hover:text-indigo-900">{{ spell.name }}</h4>
               <span class="text-xs text-stone-500">{{ spell.level }}</span>
             </div>
             <p class="text-sm text-stone-700 mt-1 line-clamp-2">{{ spell.desc }}</p>
           </div>
         </div>

         <!-- Scene Tab -->
         <div v-if="activeTab === 'Scene'" class="space-y-4">
            <h3 class="font-cinzel text-xl font-bold border-b border-ink-black/20 pb-2">{{ $t('play.currentLocation') }}</h3>
            <div class="p-3 bg-amber-50/50 border border-amber-200 rounded text-sm italic">
              {{ scene.description }}
            </div>
            
            <h4 class="font-cinzel font-bold mt-4">{{ $t('play.entitiesNearby') }}</h4>
            <ul class="space-y-2">
              <li v-for="entity in scene.entities" :key="entity.id" class="flex items-center gap-2 text-sm p-2 hover:bg-black/5 rounded cursor-pointer">
                <span :class="['w-2 h-2 rounded-full', entity.type === 'enemy' ? 'bg-red-500' : 'bg-green-500']"></span>
                <span>{{ entity.name }}</span>
              </li>
            </ul>
         </div>

       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const messagesContainer = ref<HTMLElement | null>(null)
const activeTab = ref('Character')
const isTyping = ref(false)
const newMessage = ref('')

// Mock Data
const messages = ref([
  { id: 1, role: 'ai', content: 'You stand before the ancient stone doors of the Whispering Cave. The air is thick with the scent of damp earth and decay. Faint, indecipherable whispers seem to drift from the cracks in the stone.', timestamp: new Date(Date.now() - 60000) },
  { id: 2, role: 'user', content: 'I check the door for traps.', timestamp: new Date(Date.now() - 40000) },
  { id: 3, role: 'ai', content: 'Roll an Investigation check.', timestamp: new Date(Date.now() - 35000) },
  { id: 4, role: 'user', content: 'I rolled a 14.', timestamp: new Date(Date.now() - 20000) },
  { id: 5, role: 'ai', content: 'The door appears safe, though you notice strange runes etched into the frame that seem to pulse faintly.', timestamp: new Date() }
])

const character = ref({
  name: 'Valerius',
  race: 'Human',
  class: 'Wizard',
  level: 3,
  stats: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 10, CHA: 13 },
  hp: { current: 18, max: 22 },
  ac: 12
})

const spells = ref([
  { id: 1, name: 'Magic Missile', level: '1st Level', desc: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range.' },
  { id: 2, name: 'Mage Hand', level: 'Cantrip', desc: 'A spectral, floating hand appears at a point you choose within range.' },
  { id: 3, name: 'Shield', level: '1st Level', desc: 'An invisible barrier of magical force appears and protects you.' }
])

const scene = ref({
  description: 'The entrance to the Whispering Cave. Stone doors block the way. Moss covers the surrounding rocks.',
  entities: [
    { id: 1, name: 'Stone Door', type: 'object' },
    { id: 2, name: 'Goblin Scout (Hidden)', type: 'enemy' }
  ]
})

const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: newMessage.value,
    timestamp: new Date()
  })
  
  const userText = newMessage.value
  newMessage.value = ''
  
  await nextTick()
  if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  
  // Simulate AI response
  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    messages.value.push({
      id: Date.now(),
      role: 'ai',
      content: `(Simulating logic for: "${userText}") The shadows deepen as you speak...`,
      timestamp: new Date()
    })
    nextTick(() => {
      if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  }, 1500)
}
</script>

<style scoped>
.perspective-book {
  /* Simple depth effect */
  box-shadow: -5px 0 15px rgba(0,0,0,0.1), inset 10px 0 20px rgba(0,0,0,0.05);
}
</style>
