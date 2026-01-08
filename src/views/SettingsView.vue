<template>
  <div class="settings-view">
    <div class="content-container paper-card backdrop-card glass-panel-md">
      <header class="page-header">
        <h1>{{ $t('settings.title') }}</h1>
        <p class="subtitle">{{ $t('settings.subtitle') }}</p>
      </header>

      <div class="settings-grid">
         <!-- Language Settings Card -->
        <div class="card parchment-card glass-panel-sm glass-hover">
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
        <div class="card parchment-card glass-panel-sm glass-hover">
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
              <div class="api-key-field">
                <input
                  :type="isApiKeyVisible ? 'text' : 'password'"
                  v-model="settings.apiKey"
                  placeholder="sk-..."
                  autocomplete="off"
                  spellcheck="false"
                />
                <button
                  type="button"
                  class="btn-key-toggle"
                  @click="isApiKeyVisible = !isApiKeyVisible"
                  :aria-label="isApiKeyVisible ? $t('settings.hideApiKey') : $t('settings.showApiKey')"
                  :aria-pressed="isApiKeyVisible"
                  :title="isApiKeyVisible ? $t('settings.hideApiKey') : $t('settings.showApiKey')"
                >
                  <i :class="isApiKeyVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
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
        <div class="card parchment-card glass-panel-sm glass-hover">
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

const isApiKeyVisible = ref(false)

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

.paper-card.glass-panel-sm,
.paper-card.glass-panel-md,
.paper-card.glass-panel-lg,
.paper-card.glass-panel-dark {
  background: var(--_glass-bg, var(--glass-bg-light));
  border: 1px solid var(--_glass-border, var(--glass-border-light));
  box-shadow: var(--glass-shadow);
  border-radius: 12px;
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

.backdrop-card {
  --_glass-bg: rgba(255, 248, 240, 0.35);
  border-radius: 12px;
  padding: 3rem;
}

.parchment-card {
  overflow: hidden;
}

.card-header {
  background: rgba(30, 20, 15, 0.55);
  backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturation));
  -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturation));
  border-bottom: 1px solid var(--glass-border-dark);
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
  border: 1px solid var(--glass-border-light);
  background: rgba(255, 248, 240, 0.6);
  backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturation));
  -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturation));
  border-radius: 10px;
  font-family: 'Lato', sans-serif;
  color: #3e2723;
  transition: border-color 0.2s;
}

.api-key-field {
  position: relative;
}

.api-key-field input {
  padding-right: 3.2rem;
}

.btn-key-toggle {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2.2rem;
  height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(93, 64, 55, 0.35);
  background: rgba(255, 248, 240, 0.25);
  color: #5d4037;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
}

.btn-key-toggle:hover {
  background: rgba(255, 248, 240, 0.45);
  border-color: rgba(93, 64, 55, 0.55);
  color: #3e2723;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.btn-key-toggle:focus-visible {
  outline: 2px solid #d84315;
  outline-offset: 2px;
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
  background: #5d4037;
  color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0.55rem 1rem;
  font-family: 'Cinzel', serif;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.22);
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.btn-test:hover {
  background: #4e342e;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.btn-test:active {
  transform: translateY(0);
}

.btn-test:focus-visible {
  outline: 2px solid #d84315;
  outline-offset: 2px;
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
