# StoryMaster API 文档

## 概述

StoryMaster D&D AI跑团应用后端API，为前端提供完整的数据访问和功能支持。

### 基础信息

- **Base URL**: `http://localhost:8000`
- **API版本**: `v1`
- **API前缀**: `/api/v1`
- **认证方式**: JWT Bearer Token（即将实现）
- **数据格式**: JSON
- **字符编码**: UTF-8

### API设计原则

- RESTful API设计
- 统一响应格式
- 标准HTTP状态码
- 版本控制支持
- 完整错误处理

## 通用信息

### 请求头

所有API请求应包含以下请求头：

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>  # 认证端点不需要
```

### 响应格式

#### 成功响应

```json
{
  "data": {
    // 具体数据内容
  },
  "message": "操作成功",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 错误响应

```json
{
  "error": {
    "message": "错误描述",
    "code": "ERROR_CODE",
    "status_code": 400,
    "details": {
      // 额外错误信息
    }
  },
  "request_id": "uuid-request-id"
}
```

### 状态码

| 状态码 | 说明 |
|---------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

## 已实现端点

### 系统信息

#### 获取应用信息

```http
GET /
```

**响应示例：**
```json
{
  "message": "StoryMaster API is running",
  "version": "0.1.0",
  "environment": "development",
  "docs": "/docs",
  "health": "/api/v1/health",
  "openapi": "/openapi.json"
}
```

### 健康检查

#### 详细健康检查

```http
GET /api/v1/health
```

**响应示例：**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "0.1.0",
  "environment": "development",
  "uptime": 3600.5,
  "system": {
    "platform": "Windows-10-10.0.19045-SP0",
    "python_version": "3.9.7",
    "cpu": {
      "percent": 15.2,
      "count": 8
    },
    "memory": {
      "percent": 45.8,
      "total_mb": 16384.0,
      "available_mb": 8875.2
    },
    "disk": {
      "percent": 65.3,
      "total_gb": 500.0,
      "free_gb": 173.5
    }
  },
  "database": {
    "neo4j": {
      "status": "healthy",
      "message": "连接正常"
    },
    "redis": {
      "status": "healthy",
      "message": "连接正常"
    }
  },
  "services": {
    "openai": {
      "status": "disabled",
      "message": "未配置API密钥"
    },
    "ollama": {
      "status": "healthy",
      "message": "发现2个模型",
      "models": ["llama2", "mistral"]
    }
  }
}
```

#### 简单健康检查

```http
GET /api/v1/health/simple
```

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "0.1.0"
}
```

#### 数据库健康检查

```http
GET /api/v1/health/database
```

**响应示例：**
```json
{
  "neo4j": {
    "status": "healthy",
    "message": "连接正常"
  },
  "redis": {
    "status": "healthy",
    "message": "连接正常"
  }
}
```

## 即将实现的端点

### 认证模块

#### 用户注册

```http
POST /api/v1/auth/register
```

**请求体：**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**响应示例：**
```json
{
  "data": {
    "user": {
      "id": "user-uuid",
      "username": "user123",
      "email": "user@example.com",
      "created_at": "2024-01-01T12:00:00Z"
    }
  },
  "message": "用户注册成功",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 用户登录

```http
POST /api/v1/auth/login
```

**请求体：**
```json
{
  "username": "user123",
  "password": "securepassword123"
}
```

**响应示例：**
```json
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "user-uuid",
      "username": "user123",
      "email": "user@example.com"
    }
  },
  "message": "登录成功",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 刷新令牌

```http
POST /api/v1/auth/refresh
```

**请求头：**
```http
Authorization: Bearer <current_token>
```

**响应示例：**
```json
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 1800
  },
  "message": "令牌刷新成功",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 角色管理

#### 获取角色列表

```http
GET /api/v1/characters
```

**查询参数：**
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20，最大：100）
- `search`: 搜索关键词（可选）
- `class_filter`: 职业筛选（可选）

**响应示例：**
```json
{
  "data": {
    "characters": [
      {
        "id": "char-uuid-1",
        "name": "艾登·风暴使者",
        "class": "战士",
        "level": 5,
        "race": "人类",
        "created_at": "2024-01-01T12:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  },
  "message": "角色列表获取成功",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 创建角色

```http
POST /api/v1/characters
```

**请求体：**
```json
{
  "name": "艾登·风暴使者",
  "class": "战士",
  "level": 5,
  "race": "人类",
  "background": "士兵",
  "alignment": "守序善良",
  "abilities": {
    "strength": 16,
    "dexterity": 14,
    "constitution": 15,
    "intelligence": 12,
    "wisdom": 13,
    "charisma": 14
  },
  "equipment": [
    {
      "name": "长剑",
      "type": "weapon",
      "damage": "1d8+2"
    }
  ]
}
```

#### 获取角色详情

```http
GET /api/v1/characters/{character_id}
```

**响应示例：**
```json
{
  "data": {
    "character": {
      "id": "char-uuid-1",
      "name": "艾登·风暴使者",
      "class": "战士",
      "level": 5,
      "race": "人类",
      "background": "士兵",
      "alignment": "守序善良",
      "abilities": {
        "strength": 16,
        "dexterity": 14,
        "constitution": 15,
        "intelligence": 12,
        "wisdom": 13,
        "charisma": 14
      },
      "equipment": [
        {
          "id": "equip-uuid-1",
          "name": "长剑",
          "type": "weapon",
          "damage": "1d8+2",
          "description": "一把精工锻造的长剑"
        }
      ],
      "skills": [
        {
          "name": " athletics",
          "proficiency": true,
          "bonus": 3
        }
      ],
      "spells": [],
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  },
  "message": "角色详情获取成功",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 游戏会话

#### 创建会话

```http
POST /api/v1/sessions
```

**请求体：**
```json
{
  "name": "地下城探索",
  "description": "探索古老地下城的冒险",
  "dungeon_master_id": "dm-uuid",
  "max_players": 4,
  "setting": "被遗忘的国度",
  "campaign_id": "campaign-uuid"
}
```

#### 加入会话

```http
POST /api/v1/sessions/{session_id}/join
```

**请求体：**
```json
{
  "character_id": "char-uuid-1"
}
```

#### 获取会话详情

```http
GET /api/v1/sessions/{session_id}
```

### 剧本管理

#### 获取剧本列表

```http
GET /api/v1/scripts
```

**查询参数：**
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20）
- `difficulty`: 难度筛选（可选）
- `duration`: 游戏时长筛选（可选）

#### 创建剧本

```http
POST /api/v1/scripts
```

**请求体：**
```json
{
  "title": "失落的神庙",
  "description": "玩家需要探索一座失落的古老神庙",
  "difficulty": "中等",
  "estimated_duration": "4-6小时",
  "min_players": 2,
  "max_players": 5,
  "recommended_level": 5,
  "tags": ["探索", "解谜", "战斗"],
  "content": {
    "introduction": "你们站在一座古老神庙的入口...",
    "scenes": [
      {
        "id": "scene-1",
        "title": "神庙入口",
        "description": "神庙的入口被藤蔓覆盖...",
        "encounters": []
      }
    ]
  }
}
```

### 规则书

#### 获取规则书章节

```http
GET /api/v1/rulebook/{chapter}
```

**可用章节：**
- `basics` - 基础规则
- `combat` - 战斗规则
- `magic` - 魔法系统
- `equipment` - 装备规则
- `characters` - 角色创建
- `spells` - 法术列表

#### 搜索规则

```http
GET /api/v1/rulebook/search
```

**查询参数：**
- `q`: 搜索关键词
- `category`: 规则分类（可选）
- `page`: 页码（默认：1）

## WebSocket 实时通信

### 连接端点

```
ws://localhost:8000/ws/sessions/{session_id}
```

### 认证

WebSocket连接需要在查询参数中提供JWT令牌：
```
ws://localhost:8000/ws/sessions/{session_id}?token=<jwt_token>
```

### 消息格式

#### 客户端发送消息

```json
{
  "type": "message_type",
  "data": {
    // 消息内容
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**消息类型：**
- `chat`: 聊天消息
- `action`: 玩家动作
- `dice`: 骰子投掷
- `character_update`: 角色状态更新

#### 服务器推送消息

```json
{
  "type": "message_type",
  "data": {
    // 消息内容
  },
  "sender": {
    "id": "sender-uuid",
    "name": "发送者名称",
    "type": "player|dm|system"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 错误代码

### 通用错误码

| 错误码 | 说明 |
|---------|------|
| `VALIDATION_ERROR` | 数据验证失败 |
| `AUTHENTICATION_ERROR` | 认证失败 |
| `AUTHORIZATION_ERROR` | 权限不足 |
| `NOT_FOUND` | 资源不存在 |
| `CONFLICT` | 资源冲突 |
| `DATABASE_ERROR` | 数据库操作错误 |
| `EXTERNAL_SERVICE_ERROR` | 外部服务错误 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 |
| `INTERNAL_SERVER_ERROR` | 服务器内部错误 |

### 认证错误

| 错误码 | 说明 |
|---------|------|
| `INVALID_CREDENTIALS` | 用户名或密码错误 |
| `ACCOUNT_LOCKED` | 账户被锁定 |
| `TOKEN_EXPIRED` | 令牌已过期 |
| `TOKEN_INVALID` | 令牌无效 |

### 业务错误

| 错误码 | 说明 |
|---------|------|
| `CHARACTER_NOT_FOUND` | 角色不存在 |
| `SESSION_FULL` | 游戏会话已满 |
| `SESSION_NOT_ACTIVE` | 会话未激活 |
| `INSUFFICIENT_PERMISSIONS` | 权限不足 |

## 前端集成指南

### 1. 环境配置

前端需要配置以下环境变量：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### 2. API客户端配置

```javascript
// API客户端配置
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 处理认证失败
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. WebSocket客户端配置

```javascript
class GameWebSocket {
  constructor(sessionId, token) {
    this.ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws/sessions/${sessionId}?token=${token}`
    );
    
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }
  
  handleOpen(event) {
    console.log('WebSocket连接已建立');
    // 发送加入游戏消息
    this.sendMessage({
      type: 'join_session',
      data: { character_id: this.characterId }
    });
  }
  
  handleMessage(event) {
    const message = JSON.parse(event.data);
    this.handleGameMessage(message);
  }
  
  sendMessage(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    }
  }
}
```

### 4. 状态管理

```javascript
// Pinia store 示例
export const useGameStore = defineStore('game', {
  state: () => ({
    session: null,
    characters: [],
    messages: [],
    isConnected: false
  }),
  
  actions: {
    async fetchCharacters() {
      try {
        const response = await apiClient.get('/characters');
        this.characters = response.data.data.characters;
      } catch (error) {
        console.error('获取角色列表失败:', error);
      }
    },
    
    async createCharacter(characterData) {
      try {
        const response = await apiClient.post('/characters', characterData);
        this.characters.push(response.data.data.character);
        return response.data.data.character;
      } catch (error) {
        throw error;
      }
    }
  }
});
```

## 开发和测试

### 1. 本地开发

1. 启动后端服务器：
```bash
cd StoryMaster
python run.py
```

2. 启动前端开发服务器：
```bash
cd StoryMasterFrontend
npm run dev
```

### 2. API测试

使用提供的API文档进行测试：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. 健康检查

```bash
# 检查API状态
curl http://localhost:8000/api/v1/health

# 检查数据库状态
curl http://localhost:8000/api/v1/health/database
```

## 更新日志

API更新将记录在 [CHANGELOG.md](CHANGELOG.md) 中，包含：
- 新增端点
- 破坏性变更
- 功能改进
- 错误修复

## 支持和反馈

如有API相关问题或建议，请：
1. 查看 [API文档](http://localhost:8000/docs)
2. 检查 [常见问题](./FAQ.md)
3. 提交 [Issue](https://github.com/storymaster/storymaster/issues)