<template>
  <div class="settings-view">
    <div class="content-container">
      <header class="page-header">
        <h1>{{ $t('settings.title') }}</h1>
        <p class="subtitle">{{ $t('settings.subtitle') }}</p>
      </header>

      <div class="settings-grid">
         <!-- Language Settings Card -->
        <div class="card parchment-card">
          <div class="card-header">
            <h2>{{ $t('common.language') }}</h2>
            <span class="card-icon">🌐</span>
          </div>
          <div class="card-body">
            <div class="form-group">
               <label>{{ $t('common.selectLanguage') }}</label>
               <select v-model="$i18n.locale">
                 <option value="en" :selected="$i18n.locale === 'en'">{{ $t('common.english') }}</option>
                 <option value="zh" :selected="$i18n.locale === 'zh'">{{ $t('common.chinese') }}</option>
               </select>
            </div>
          </div>
        </div>

        <!-- LLM Connection Card -->
        <div class="card parchment-card">
          <div class="card-header">
            <h2>{{ $t('settings.llmNexus') }}</h2>
            <span class="card-icon">🔮</span>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>{{ $t('settings.provider') }}</label>
              <select v-model="settings.provider">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="azure">Azure OpenAI</option>
                <option value="local">Local (Ollama/vLLM)</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.apiKey') }}</label>
              <input type="password" v-model="settings.apiKey" placeholder="sk-..." />
            </div>

            <div class="form-group">
              <label>{{ $t('settings.modelName') }}</label>
              <input type="text" v-model="settings.model" placeholder="gpt-4-turbo" />
            </div>

            <div class="form-group">
              <label>{{ $t('settings.baseUrl') }}</label>
              <input type="text" v-model="settings.baseUrl" placeholder="https://api.openai.com/v1" />
            </div>
            
            <div class="connection-status">
               <button class="btn-test" @click="testConnection">{{ $t('settings.testConnection') }}</button>
               <span v-if="connectionStatus" :class="connectionStatus.type">{{ connectionStatus.message }}</span>
            </div>
          </div>
        </div>

        <!-- System Parameters Card -->
        <div class="card parchment-card">
          <div class="card-header">
            <h2>{{ $t('settings.cosmicRules') }}</h2>
            <span class="card-icon">📜</span>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>{{ $t('settings.temperature') }} ({{ settings.temperature }})</label>
              <div class="range-container">
                <span>{{ $t('settings.precise') }}</span>
                <input type="range" min="0" max="2" step="0.1" v-model.number="settings.temperature" />
                <span>{{ $t('settings.creative') }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.maxTokens') }}</label>
              <input type="number" v-model.number="settings.maxTokens" />
            </div>

            <div class="form-group">
              <label>{{ $t('settings.globalSystemPrompt') }}</label>
              <textarea v-model="settings.systemPrompt" rows="6" placeholder="You are the Dungeon Master..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-save" @click="saveSettings">{{ $t('settings.saveConfiguration') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

watch(locale, (newLocale) => {
  localStorage.setItem('user-locale', newLocale as string)
})

const settings = reactive({
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o',
  baseUrl: '',
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: 'You are an omniscient Dungeon Master managing a D&D 5e campaign. Your goal is to facilitate an immersive narrative experience.'
})

const connectionStatus = ref<{type: 'success' | 'error' | 'neutral', message: string} | null>(null)

const testConnection = () => {
  connectionStatus.value = { type: 'neutral', message: t('settings.channeling') }
  setTimeout(() => {
    // Mock success
    connectionStatus.value = { type: 'success', message: t('settings.connectionEstablished') }
  }, 1500)
}

const saveSettings = () => {
  // Save to local storage or backend
  console.log('Saving settings:', settings)
  alert(t('settings.configurationSaved'))
}
</script>

<style scoped>
.settings-view {
  height: 100%;
  padding: 2rem;
  overflow-y: auto;
  color: #3e2723; /* Dark brown text */
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 1rem;
}

h1 {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.subtitle {
  font-family: 'Lato', sans-serif;
  font-style: italic;
  color: #5d4037;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.parchment-card {
  background: rgba(255, 252, 240, 0.9);
  border: 1px solid #8d6e63;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), inset 0 0 20px rgba(161, 136, 127, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.parchment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15), inset 0 0 20px rgba(161, 136, 127, 0.2);
}

.card-header {
  background: #5d4037;
  color: #efebe9;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
}

.card-icon {
  font-size: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
}

input[type="text"],
input[type="password"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #8d6e63;
  background: #fff8e1;
  border-radius: 4px;
  font-family: 'Lato', sans-serif;
  color: #3e2723;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #d84315;
  box-shadow: 0 0 5px rgba(216, 67, 21, 0.2);
}

.range-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  font-style: italic;
}

input[type="range"] {
  flex-grow: 1;
}

.actions {
  margin-top: 2rem;
  text-align: center;
}

.btn-save {
  background: #d84315;
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  transition: all 0.2s;
}

.btn-save:hover {
  background: #bf360c;
  transform: translateY(-2px);
}

.btn-test {
  background: #8d6e63;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-family: 'Cinzel', serif;
  cursor: pointer;
  border-radius: 4px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.success { color: #2e7d32; font-weight: bold; }
.error { color: #c62828; font-weight: bold; }
.neutral { color: #5d4037; font-style: italic; }

</style>
