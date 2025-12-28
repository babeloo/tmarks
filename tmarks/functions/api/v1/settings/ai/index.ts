/**
 * AI 设置 API
 * 管理用户的 AI 服务配置
 */

import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env, RouteParams } from '../../../../lib/types'
import { success, badRequest, internalError } from '../../../../lib/response'
import { requireAuth, AuthContext } from '../../../../middleware/auth'

// AI 服务商类型
type AIProvider = 'openai' | 'claude' | 'deepseek' | 'zhipu' | 'modelscope' | 'siliconflow' | 'iflow' | 'custom'

// 数据库行类型
interface AISettingsRow {
  id: string
  user_id: string
  provider: AIProvider
  api_keys_encrypted: string | null
  api_urls: string | null
  model: string | null
  custom_prompt: string | null
  enable_custom_prompt: number
  enabled: number
  created_at: string
  updated_at: string
}

// API 请求类型
interface UpdateAISettingsRequest {
  provider?: AIProvider
  api_keys?: Record<string, string>
  api_urls?: Record<string, string>
  model?: string
  custom_prompt?: string
  enable_custom_prompt?: boolean
  enabled?: boolean
}

// 有效的服务商列表
const VALID_PROVIDERS: AIProvider[] = ['openai', 'claude', 'deepseek', 'zhipu', 'modelscope', 'siliconflow', 'iflow', 'custom']

/**
 * 简单的 API Key 加密（使用 AES-GCM）
 */
async function encryptApiKeys(
  apiKeys: Record<string, string>,
  encryptionKey: string
): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(apiKeys))
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    data
  )
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  
  return btoa(String.fromCharCode(...combined))
}

/**
 * 解密 API Keys
 */
async function decryptApiKeys(
  encryptedData: string,
  encryptionKey: string
): Promise<Record<string, string>> {
  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encrypted
    )
    
    return JSON.parse(decoder.decode(decrypted))
  } catch {
    return {}
  }
}

/**
 * 脱敏 API Key
 */
function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '***'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

/**
 * 检查 ai_settings 表是否存在
 */
async function hasAISettingsTable(db: D1Database): Promise<boolean> {
  try {
    await db.prepare('SELECT 1 FROM ai_settings LIMIT 1').first()
    return true
  } catch (error) {
    if (error instanceof Error && /no such table/i.test(error.message)) {
      return false
    }
    throw error
  }
}

// GET /api/v1/settings/ai - 获取 AI 设置
export const onRequestGet: PagesFunction<Env, RouteParams, AuthContext>[] = [
  requireAuth,
  async (context) => {
    try {
      const userId = context.data.user_id
      const encryptionKey = context.env.ENCRYPTION_KEY || 'default-key-change-me'
      
      const tableExists = await hasAISettingsTable(context.env.DB)
      if (!tableExists) {
        return success({
          ai_settings: {
            provider: 'openai',
            api_keys: {},
            api_urls: {},
            model: null,
            custom_prompt: null,
            enable_custom_prompt: false,
            enabled: false
          }
        })
      }
      
      const settings = await context.env.DB.prepare(
        'SELECT * FROM ai_settings WHERE user_id = ?'
      )
        .bind(userId)
        .first<AISettingsRow>()
      
      if (!settings) {
        return success({
          ai_settings: {
            provider: 'openai',
            api_keys: {},
            api_urls: {},
            model: null,
            custom_prompt: null,
            enable_custom_prompt: false,
            enabled: false
          }
        })
      }
      
      let maskedApiKeys: Record<string, string | null> = {}
      if (settings.api_keys_encrypted) {
        const decrypted = await decryptApiKeys(settings.api_keys_encrypted, encryptionKey)
        for (const [provider, key] of Object.entries(decrypted)) {
          maskedApiKeys[provider] = key ? maskApiKey(key) : null
        }
      }
      
      let apiUrls: Record<string, string> = {}
      if (settings.api_urls) {
        try {
          apiUrls = JSON.parse(settings.api_urls)
        } catch {
          apiUrls = {}
        }
      }
      
      return success({
        ai_settings: {
          provider: settings.provider,
          api_keys: maskedApiKeys,
          api_urls: apiUrls,
          model: settings.model,
          custom_prompt: settings.custom_prompt,
          enable_custom_prompt: settings.enable_custom_prompt === 1,
          enabled: settings.enabled === 1
        }
      })
    } catch (error) {
      console.error('Get AI settings error:', error)
      return internalError('Failed to get AI settings')
    }
  }
]

// PUT /api/v1/settings/ai - 更新 AI 设置
export const onRequestPut: PagesFunction<Env, RouteParams, AuthContext>[] = [
  requireAuth,
  async (context) => {
    try {
      const userId = context.data.user_id
      const encryptionKey = context.env.ENCRYPTION_KEY || 'default-key-change-me'
      const body = await context.request.json() as UpdateAISettingsRequest
      
      const tableExists = await hasAISettingsTable(context.env.DB)
      if (!tableExists) {
        return badRequest('AI settings feature not available. Please run database migrations.')
      }
      
      if (body.provider && !VALID_PROVIDERS.includes(body.provider)) {
        return badRequest(`Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}`)
      }
      
      const existing = await context.env.DB.prepare(
        'SELECT * FROM ai_settings WHERE user_id = ?'
      )
        .bind(userId)
        .first<AISettingsRow>()
      
      const now = new Date().toISOString()
      
      let apiKeysEncrypted: string | null = existing?.api_keys_encrypted || null
      if (body.api_keys) {
        let existingKeys: Record<string, string> = {}
        if (existing?.api_keys_encrypted) {
          existingKeys = await decryptApiKeys(existing.api_keys_encrypted, encryptionKey)
        }
        
        for (const [provider, key] of Object.entries(body.api_keys)) {
          if (key === null || key === '') {
            delete existingKeys[provider]
          } else {
            existingKeys[provider] = key
          }
        }
        
        if (Object.keys(existingKeys).length > 0) {
          apiKeysEncrypted = await encryptApiKeys(existingKeys, encryptionKey)
        } else {
          apiKeysEncrypted = null
        }
      }
      
      let apiUrlsJson: string | null = existing?.api_urls || null
      if (body.api_urls) {
        let existingUrls: Record<string, string> = {}
        if (existing?.api_urls) {
          try {
            existingUrls = JSON.parse(existing.api_urls)
          } catch {
            existingUrls = {}
          }
        }
        
        for (const [provider, url] of Object.entries(body.api_urls)) {
          if (url === null || url === '') {
            delete existingUrls[provider]
          } else {
            existingUrls[provider] = url
          }
        }
        
        apiUrlsJson = Object.keys(existingUrls).length > 0 ? JSON.stringify(existingUrls) : null
      }
      
      if (existing) {
        await context.env.DB.prepare(`
          UPDATE ai_settings SET
            provider = ?,
            api_keys_encrypted = ?,
            api_urls = ?,
            model = ?,
            custom_prompt = ?,
            enable_custom_prompt = ?,
            enabled = ?,
            updated_at = ?
          WHERE user_id = ?
        `).bind(
          body.provider ?? existing.provider,
          apiKeysEncrypted,
          apiUrlsJson,
          body.model !== undefined ? body.model : existing.model,
          body.custom_prompt !== undefined ? body.custom_prompt : existing.custom_prompt,
          body.enable_custom_prompt !== undefined ? (body.enable_custom_prompt ? 1 : 0) : existing.enable_custom_prompt,
          body.enabled !== undefined ? (body.enabled ? 1 : 0) : existing.enabled,
          now,
          userId
        ).run()
      } else {
        const id = crypto.randomUUID()
        await context.env.DB.prepare(`
          INSERT INTO ai_settings (
            id, user_id, provider, api_keys_encrypted, api_urls, model,
            custom_prompt, enable_custom_prompt, enabled, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          userId,
          body.provider ?? 'openai',
          apiKeysEncrypted,
          apiUrlsJson,
          body.model ?? null,
          body.custom_prompt ?? null,
          body.enable_custom_prompt ? 1 : 0,
          body.enabled ? 1 : 0,
          now,
          now
        ).run()
      }
      
      return success({
        message: 'AI settings updated successfully'
      })
    } catch (error) {
      console.error('Update AI settings error:', error)
      return internalError('Failed to update AI settings')
    }
  }
]
