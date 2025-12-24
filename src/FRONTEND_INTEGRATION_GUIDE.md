# StoryMaster 前端集成指南

本指南为前端工程师提供与StoryMaster后端API集成的详细说明和最佳实践。

## 快速开始

### 1. 环境准备

#### 后端启动
```bash
# 1. 进入后端目录
cd StoryMaster

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息

# 4. 验证项目
python validate.py

# 5. 启动后端服务
python run.py
```

#### 前端配置

在前端项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_NAME=StoryMaster Frontend
```

### 2. 验证连接

访问以下URL确认服务正常运行：

- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/v1/health

## API客户端设置

### 1. Axios配置

创建 `src/api/client.ts`：

```typescript
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求ID
    config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function handleApiError(error: any): void {
  if (error.response?.status === 401) {
    // 清除无效token
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    
    // 重定向到登录页
    window.location.href = '/login';
    return;
  }
  
  // 记录错误日志
  console.error('API Error:', error.response?.data || error.message);
}

export default apiClient;
```

### 2. 类型定义

创建 `src/types/api.ts`，使用后端提供的数据模式：

```typescript
// 导入API文档中定义的类型
export interface StoryMasterAPI {
  auth: {
    login: (data: LoginRequest) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    refresh: () => Promise<AuthResponse>;
    logout: () => Promise<void>;
  };
  
  characters: {
    list: (params?: CharacterListParams) => Promise<PaginatedResponse<Character>>;
    get: (id: string) => Promise<SuccessResponse<Character>>;
    create: (data: CreateCharacterRequest) => Promise<SuccessResponse<Character>>;
    update: (id: string, data: UpdateCharacterRequest) => Promise<SuccessResponse<Character>>;
    delete: (id: string) => Promise<void>;
  };
  
  sessions: {
    list: (params?: SessionListParams) => Promise<PaginatedResponse<GameSession>>;
    get: (id: string) => Promise<SuccessResponse<GameSession>>;
    create: (data: CreateSessionRequest) => Promise<SuccessResponse<GameSession>>;
    join: (id: string, data: JoinSessionRequest) => Promise<void>;
    leave: (id: string) => Promise<void>;
  };
}

export const api: StoryMasterAPI = {
  auth: {
    login: (data: LoginRequest) => 
      apiClient.post('/auth/login', data),
    register: (data: RegisterRequest) => 
      apiClient.post('/auth/register', data),
    refresh: () => 
      apiClient.post('/auth/refresh'),
    logout: () => 
      apiClient.post('/auth/logout'),
  },
  
  characters: {
    list: (params) => 
      apiClient.get('/characters', { params }),
    get: (id: string) => 
      apiClient.get(`/characters/${id}`),
    create: (data: CreateCharacterRequest) => 
      apiClient.post('/characters', data),
    update: (id: string, data: UpdateCharacterRequest) => 
      apiClient.put(`/characters/${id}`, data),
    delete: (id: string) => 
      apiClient.delete(`/characters/${id}`),
  },
  
  sessions: {
    list: (params) => 
      apiClient.get('/sessions', { params }),
    get: (id: string) => 
      apiClient.get(`/sessions/${id}`),
    create: (data: CreateSessionRequest) => 
      apiClient.post('/sessions', data),
    join: (id: string, data: JoinSessionRequest) => 
      apiClient.post(`/sessions/${id}/join`, data),
    leave: (id: string) => 
      apiClient.post(`/sessions/${id}/leave`),
  },
};
```

## 状态管理

### 1. Pinia Store结构

创建 `src/stores/auth.ts`：

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, AuthResponse } from '@/types/api';
import { api } from '@/api/client';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userInitials = computed(() => {
    if (!user.value) return '';
    const names = user.value.name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  });
  
  // 方法
  async function login(credentials: LoginRequest) {
    isLoading.value = true;
    try {
      const response = await api.auth.login(credentials);
      const { access_token, user: userData } = response.data;
      
      // 保存认证信息
      token.value = access_token;
      user.value = userData;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_info', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  function logout() {
    user.value = null;
    token.value = null;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    
    // 调用后端登出
    api.auth.logout().catch(console.error);
  }
  
  // 初始化
  function init() {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_info');
    
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
    }
  }
  
  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    userInitials,
    login,
    logout,
    init,
  };
});
```

### 2. 角色管理Store

创建 `src/stores/characters.ts`：

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Character, CreateCharacterRequest } from '@/types/api';
import { api } from '@/api/client';

export const useCharacterStore = defineStore('characters', () => {
  // 状态
  const characters = ref<Character[]>([]);
  const currentCharacter = ref<Character | null>(null);
  const isLoading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  
  // 计算属性
  const charactersByClass = computed(() => {
    const grouped: Record<string, Character[]> = {};
    characters.value.forEach(char => {
      if (!grouped[char.class]) {
        grouped[char.class] = [];
      }
      grouped[char.class].push(char);
    });
    return grouped;
  });
  
  // 方法
  async function fetchCharacters(params = {}) {
    isLoading.value = true;
    try {
      const response = await api.characters.list(params);
      characters.value = response.data.items;
      pagination.value = response.data.pagination;
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  async function createCharacter(data: CreateCharacterRequest) {
    isLoading.value = true;
    try {
      const response = await api.characters.create(data);
      characters.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create character:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteCharacter(id: string) {
    isLoading.value = true;
    try {
      await api.characters.delete(id);
      characters.value = characters.value.filter(char => char.id !== id);
      if (currentCharacter.value?.id === id) {
        currentCharacter.value = null;
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    characters,
    currentCharacter,
    isLoading,
    pagination,
    charactersByClass,
    fetchCharacters,
    createCharacter,
    deleteCharacter,
  };
});
```

## WebSocket集成

### 1. WebSocket服务

创建 `src/services/websocket.ts`：

```typescript
import { useAuthStore } from '@/stores/auth';

class GameWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(private sessionId: string) {}
  
  async connect(token: string): Promise<void> {
    const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/sessions/${this.sessionId}?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
      
      // 等待连接建立
      return new Promise((resolve, reject) => {
        this.ws!.onopen = () => resolve();
        this.ws!.onerror = (error) => reject(error);
        
        // 超时处理
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      throw error;
    }
  }
  
  private setupEventListeners(): void {
    if (!this.ws) return;
    
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }
  
  private handleOpen(event: Event): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    
    // 发送加入游戏消息
    this.sendMessage({
      type: 'join_session',
      data: { timestamp: new Date().toISOString() }
    });
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }
  
  private processMessage(message: any): void {
    const authStore = useAuthStore();
    
    switch (message.type) {
      case 'chat':
        this.handleChatMessage(message);
        break;
      case 'dice_roll':
        this.handleDiceRoll(message);
        break;
      case 'character_update':
        this.handleCharacterUpdate(message);
        break;
      case 'session_update':
        this.handleSessionUpdate(message);
        break;
      case 'system':
        this.handleSystemMessage(message);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  private handleChatMessage(message: any): void {
    // 发送到聊天store或组件
    console.log('Chat message:', message);
  }
  
  private handleDiceRoll(message: any): void {
    // 处理骰子投掷结果
    console.log('Dice roll:', message);
  }
  
  private handleCharacterUpdate(message: any): void {
    // 更新角色状态
    const characterStore = useCharacterStore();
    characterStore.updateCharacter(message.data);
  }
  
  private handleSessionUpdate(message: any): void {
    // 更新会话状态
    console.log('Session update:', message);
  }
  
  private handleSystemMessage(message: any): void {
    // 显示系统消息
    console.log('System message:', message);
  }
  
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event);
    
    // 尝试重连
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }
  
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
  }
  
  private async reconnect(): Promise<void> {
    const authStore = useAuthStore();
    
    try {
      this.reconnectAttempts++;
      await this.connect(authStore.token!);
    } catch (error) {
      console.error('Reconnect failed:', error);
    }
  }
  
  sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default GameWebSocket;
```

## Vue组件集成

### 1. API服务封装

创建 `src/composables/useApi.ts`：

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export function useApi<T>(
  apiCall: () => Promise<T>,
  immediate = false
) {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const isLoading = ref(false);
  
  const execute = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      data.value = await apiCall();
    } catch (err) {
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  };
  
  if (immediate) {
    onMounted(execute);
  }
  
  return {
    data,
    error,
    isLoading,
    execute,
    reset: () => {
      data.value = null;
      error.value = null;
      isLoading.value = false;
    }
  };
}
```

### 2. 错误处理组件

创建 `src/components/ApiErrorHandler.vue`：

```vue
<template>
  <div v-if="error" class="error-handler">
    <div class="error-icon">⚠️</div>
    <div class="error-content">
      <h3>{{ errorTitle }}</h3>
      <p>{{ errorMessage }}</p>
      <div v-if="errorDetails" class="error-details">
        <details>
          <summary>详细信息</summary>
          <pre>{{ JSON.stringify(errorDetails, null, 2) }}</pre>
        </details>
      </div>
      <button @click="retry" class="retry-button">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ErrorResponse } from '@/types/api';

interface Props {
  error: ErrorResponse | null;
  retry?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  retry: undefined,
});

const errorTitle = computed(() => {
  if (!props.error) return '';
  
  const statusCode = props.error.error.status_code;
  switch (statusCode) {
    case 400: return '请求错误';
    case 401: return '认证失败';
    case 403: return '权限不足';
    case 404: return '资源不存在';
    case 500: return '服务器错误';
    default: return '未知错误';
  }
});

const errorMessage = computed(() => {
  return props.error?.error.message || '发生了未知错误';
});

const errorDetails = computed(() => {
  return props.error?.error.details || null;
});
</script>

<style scoped>
.error-handler {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  margin: 16px 0;
}

.error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-content h3 {
  margin: 0 0 8px 0;
  color: #d97706;
}

.error-content p {
  margin: 0 0 12px 0;
  color: #92400e;
}

.error-details {
  margin-top: 12px;
}

.error-details pre {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.retry-button:hover {
  background: #2563eb;
}
</style>
```

## 路由配置

### 1. 路由守卫

创建 `src/router/guards.ts`：

```typescript
import { useAuthStore } from '@/stores/auth';

export function requireAuth(to: any, from: any, next: any) {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated) {
    // 保存目标路由，登录后重定向
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
    return false;
  }
  
  next();
  return true;
}

export function requireGuest(to: any, from: any, next: any) {
  const authStore = useAuthStore();
  
  if (authStore.isAuthenticated) {
    // 已登录用户不能访问登录/注册页
    next('/');
    return false;
  }
  
  next();
  return true;
}
```

### 2. 路由配置

更新 `src/router/index.ts`：

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { requireAuth, requireGuest } from './guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      beforeEnter: requireGuest,
    },
    {
      path: '/characters',
      name: 'Characters',
      component: () => import('@/views/CharactersView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/game/:sessionId',
      name: 'GameSession',
      component: () => import('@/views/GameView.vue'),
      beforeEnter: requireAuth,
      props: true,
    },
  ],
});

// 全局后置守卫
router.afterEach((to) => {
  const authStore = useAuthStore();
  
  // 更新页面标题
  document.title = `${to.meta.title || 'StoryMaster'} - D&D AI跑团`;
  
  // 恢复登录后的重定向
  if (to.query.redirect && authStore.isAuthenticated) {
    router.replace(to.query.redirect as string);
  }
});

export default router;
```

## 开发工具

### 1. 开发环境配置

创建 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_ENABLE_MOCK_API=false
VITE_ENABLE_DEBUG=true
```

### 2. Mock数据

创建 `src/mocks/index.ts`：

```typescript
import type { Character, GameSession } from '@/types/api';

export const mockCharacters: Character[] = [
  {
    id: 'mock-char-1',
    name: '艾登·风暴使者',
    class: 'fighter',
    level: 5,
    race: 'human',
    background: '士兵',
    alignment: '守序善良',
    // ... 其他属性
  },
];

export const mockSessions: GameSession[] = [
  {
    id: 'mock-session-1',
    name: '地下城探索',
    description: '探索古老地下城的冒险',
    dungeon_master_id: 'mock-dm-1',
    max_players: 4,
    current_players: 2,
    status: 'waiting',
    setting: '被遗忘的国度',
    // ... 其他属性
  },
];
```

## 部署配置

### 1. 生产环境变量

创建 `.env.production`：

```env
VITE_API_BASE_URL=https://api.storymaster.ai
VITE_WS_URL=wss://api.storymaster.ai
VITE_ENABLE_MOCK_API=false
VITE_ENABLE_DEBUG=false
```

### 2. 构建配置

更新 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:8000',
          ws: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            api: ['./src/api'],
          },
        },
      },
    },
  };
});
```

## 最佳实践

### 1. 错误处理

- 始终使用try-catch包装API调用
- 提供用户友好的错误消息
- 实现自动重试机制
- 记录错误日志用于调试

### 2. 性能优化

- 使用Vue的computed属性进行数据计算
- 实现虚拟滚动处理大列表
- 使用防抖处理搜索输入
- 合理使用缓存策略

### 3. 用户体验

- 提供加载状态指示
- 实现表单验证
- 添加操作确认对话框
- 保持响应式设计

### 4. 安全考虑

- 妥善存储认证token
- 实现自动登出机制
- 验证API响应数据
- 防止XSS攻击

## 故障排除

### 常见问题

1. **CORS错误**
   - 确保后端CORS配置正确
   - 检查前端请求头设置

2. **WebSocket连接失败**
   - 检查防火墙设置
   - 验证WebSocket URL正确性

3. **认证失败**
   - 确认token格式正确
   - 检查token是否过期

4. **数据格式错误**
   - 验证TypeScript类型定义
   - 检查API响应结构

### 调试工具

- Vue DevTools
- 浏览器开发者工具
- 网络请求监控
- Console日志分析

这个集成指南为前端工程师提供了完整的后端对接方案，确保开发过程顺利进行。