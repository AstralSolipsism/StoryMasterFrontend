<template>
  <div class="memories-view">
    <header class="page-header">
      <h1>{{ $t('memories.title') }}</h1>
      <p class="subtitle">{{ $t('memories.subtitle') }}</p>
    </header>

    <div class="memories-container">
      <!-- Campaign List (Sidebar) -->
      <aside class="campaign-list">
        <h2>{{ $t('memories.chronicles') }}</h2>
        <div
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="campaign-card"
          :class="{ active: selectedCampaign?.id === campaign.id, finished: campaign.status === 'finished' }"
          @click="selectCampaign(campaign)"
        >
          <div class="campaign-status" :class="campaign.status">
            {{ campaign.status === 'active' ? $t('memories.active') : $t('memories.finished') }}
          </div>
          <h3>{{ campaign.title }}</h3>
          <p class="campaign-meta">{{ campaign.sessions }} {{ $t('memories.sessions') }} • {{ campaign.date }}</p>
        </div>
      </aside>

      <!-- Details & Visualization (Main) -->
      <main class="campaign-details" v-if="selectedCampaign">
        <div class="details-header">
          <h2>{{ selectedCampaign.title }}</h2>
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-value">{{ selectedCampaign.partyLevel }}</span>
              <span class="stat-label">{{ $t('memories.partyLevel') }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ selectedCampaign.playTime }}h</span>
              <span class="stat-label">{{ $t('memories.playTime') }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ selectedCampaign.encounters }}</span>
              <span class="stat-label">{{ $t('memories.encounters') }}</span>
            </div>
          </div>
        </div>

        <!-- Visual Timeline -->
        <div class="timeline-container">
          <h3 class="timeline-title">{{ $t('memories.timelineTitle') }}</h3>
          <div class="timeline">
            <div
              v-for="(event, index) in selectedCampaign.timeline"
              :key="index"
              class="timeline-item"
            >
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <span class="event-date">{{ $t('memories.timelineSession') }} {{ event.session }}</span>
                <h4>{{ event.title }}</h4>
                <p>{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div class="empty-state" v-else>
        <p>{{ $t('memories.noCampaignSelected') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TimelineEvent {
  session: number;
  title: string;
  description: string;
}

interface Campaign {
  id: number;
  title: string;
  status: 'active' | 'finished';
  date: string;
  sessions: number;
  partyLevel: number;
  playTime: number;
  encounters: number;
  timeline: TimelineEvent[];
}

const campaigns = ref<Campaign[]>([
  {
    id: 1,
    title: "The Curse of Strahd",
    status: 'active',
    date: '2023 - Present',
    sessions: 12,
    partyLevel: 5,
    playTime: 48,
    encounters: 24,
    timeline: [
      { session: 1, title: "Into the Mists", description: "The party was drawn into Barovia by mysterious mists." },
      { session: 4, title: "Death House", description: "Narrowly escaped the haunted Durst Manor." },
      { session: 8, title: "Madam Eva's Reading", description: "Received the Tarokka reading revealing the artifacts' locations." },
      { session: 12, title: "Festival of the Blazing Sun", description: "Chaos erupted in Vallaki during the festival." }
    ]
  },
  {
    id: 2,
    title: "Lost Mine of Phandelver",
    status: 'finished',
    date: '2022',
    sessions: 20,
    partyLevel: 4,
    playTime: 60,
    encounters: 35,
    timeline: [
      { session: 1, title: "Goblin Ambush", description: "Survived the initial ambush on the Triboar Trail." },
      { session: 10, title: "The Redbrands", description: "Liberated Phandalin from the Redbrand ruffians." },
      { session: 20, title: "Wave Echo Cave", description: "Defeated the Black Spider and reclaimed the Forge of Spells." }
    ]
  }
])

const selectedCampaign = ref<Campaign | null>(campaigns.value[0] || null)

const selectCampaign = (campaign: Campaign) => {
  selectedCampaign.value = campaign
}
</script>

<style scoped>
.memories-view {
  height: 100%;
  padding: 1rem 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  flex-shrink: 0;
}

h1 {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  margin: 0;
  color: #3e2723;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.subtitle {
  font-family: 'Lato', sans-serif;
  font-style: italic;
  color: #5d4037;
}

.memories-container {
  display: flex;
  gap: 2rem;
  flex-grow: 1;
  overflow: hidden;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Sidebar */
.campaign-list {
  width: 300px;
  background: rgba(255, 252, 240, 0.6);
  border: 1px solid #8d6e63;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
  flex-shrink: 0;
}

.campaign-list h2 {
  font-family: 'Cinzel', serif;
  color: #3e2723;
  border-bottom: 2px solid #8d6e63;
  padding-bottom: 0.5rem;
  margin-top: 0;
}

.campaign-card {
  background: #fff8e1;
  border: 1px solid #d7ccc8;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.campaign-card:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  border-color: #8d6e63;
}

.campaign-card.active {
  background: #efebe9;
  border-left: 5px solid #d84315;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.campaign-card.finished {
  opacity: 0.8;
  filter: grayscale(0.5);
}
.campaign-card.finished.active {
  opacity: 1;
  filter: none;
}

.campaign-status {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
}

.campaign-status.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.campaign-status.finished {
  background: #eceff1;
  color: #455a64;
}

.campaign-card h3 {
  margin: 0.5rem 0;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  color: #3e2723;
}

.campaign-meta {
  font-size: 0.8rem;
  color: #5d4037;
  margin: 0;
}

/* Main Content */
.campaign-details {
  flex-grow: 1;
  background: rgba(255, 252, 240, 0.9);
  border: 1px solid #8d6e63;
  border-radius: 8px;
  padding: 2rem;
  overflow-y: auto;
  box-shadow: inset 0 0 40px rgba(161, 136, 127, 0.2);
  display: flex;
  flex-direction: column;
}

.details-header {
  margin-bottom: 2rem;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 1rem;
}

.details-header h2 {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  color: #3e2723;
  margin-top: 0;
}

.stats-row {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-box {
  background: #5d4037;
  color: #efebe9;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.stat-value {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  opacity: 0.8;
}

/* Timeline */
.timeline-container {
  flex-grow: 1;
}

.timeline-title {
  font-family: 'Cinzel', serif;
  color: #5d4037;
  margin-bottom: 1.5rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #8d6e63;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 1.5rem;
}

.timeline-marker {
  position: absolute;
  left: -2.05rem; /* Adjust based on padding + line position */
  width: 16px;
  height: 16px;
  background: #d84315;
  border: 2px solid #fff8e1;
  border-radius: 50%;
  top: 0.3rem;
  z-index: 1;
  box-shadow: 0 0 0 2px #d84315;
}

.timeline-content {
  background: #fff8e1;
  border: 1px solid #d7ccc8;
  padding: 1rem;
  border-radius: 4px;
  position: relative;
}

.timeline-content::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0.8rem;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #d7ccc8;
}

.event-date {
  font-size: 0.8rem;
  font-weight: bold;
  color: #d84315;
  text-transform: uppercase;
}

.timeline-content h4 {
  margin: 0.5rem 0;
  font-family: 'Cinzel', serif;
  color: #3e2723;
}

.timeline-content p {
  margin: 0;
  color: #4e342e;
  line-height: 1.5;
}

.empty-state {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  color: #8d6e63;
  border: 2px dashed #8d6e63;
  border-radius: 8px;
  background: rgba(255, 252, 240, 0.5);
}
</style>
