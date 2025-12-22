import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/rulebook'
  },
  {
    path: '/rulebook',
    name: 'Rulebook',
    component: () => import('../views/RulebookView.vue')
  },
  {
    path: '/scripts',
    name: 'Scripts',
    component: () => import('../views/ScriptsView.vue')
  },
  {
    path: '/characters',
    name: 'Characters',
    component: () => import('../views/CharactersView.vue')
  },
  {
    path: '/dm',
    name: 'DM',
    component: () => import('../views/DMView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/memories',
    name: 'Memories',
    component: () => import('../views/MemoriesView.vue')
  },
  {
    path: '/play',
    name: 'Play',
    component: () => import('../views/PlayView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
