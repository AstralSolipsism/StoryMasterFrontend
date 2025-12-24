<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation / Header -->
    <header class="bg-ink-black text-parchment-light p-4 shadow-md z-10">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold tracking-wider">{{ $t('nav.title') }}</h1>
        <nav>
          <ul class="flex space-x-6">
            <li><router-link to="/rulebook" class="hover:text-amber-500 transition-colors" active-class="text-amber-500 font-bold">{{ $t('nav.rulebook') }}</router-link></li>
            <li><router-link to="/scripts" class="hover:text-amber-500 transition-colors" active-class="text-amber-500 font-bold">{{ $t('nav.scripts') }}</router-link></li>
            <li><router-link to="/characters" class="hover:text-amber-500 transition-colors" active-class="text-amber-500 font-bold">{{ $t('nav.characters') }}</router-link></li>
            <li><router-link to="/dm" class="hover:text-amber-500 transition-colors" active-class="text-amber-500 font-bold">{{ $t('nav.dm') }}</router-link></li>
            <li><router-link to="/memories" class="hover:text-amber-500 transition-colors" active-class="text-amber-500 font-bold">{{ $t('nav.memories') }}</router-link></li>
            <li><router-link to="/settings" class="hover:text-amber-500 transition-colors" active-class="text-amber-500 font-bold">{{ $t('nav.settings') }}</router-link></li>
            <li><router-link to="/play" class="hover:text-amber-500 transition-colors" active-class="text-amber-500 font-bold border border-amber-500 px-2 py-1 rounded">{{ $t('nav.play') }}</router-link></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Main Content Area -->
    <main
      class="flex-grow relative"
      :class="isRulebookRoute ? 'w-full max-w-none mx-0 p-0' : 'container mx-auto p-6'"
    >
      <!-- The router view will render the active page -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <DynamicBackground ref="bgRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DynamicBackground from './components/DynamicBackground.vue'

const bgRef = ref<InstanceType<typeof DynamicBackground> | null>(null)
const router = useRouter()
const route = useRoute()

/** 仅规则书页移除“居中定宽壳”，避免宽屏两侧永远留白 */
const isRulebookRoute = computed(() => route.path === '/rulebook')

let navCount = 0

router.afterEach(() => {
  navCount++
  // Every 5 navigations, switch the background
  if (navCount > 0 && navCount % 5 === 0) {
    bgRef.value?.switchBackground()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
