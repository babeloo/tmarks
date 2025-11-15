import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { preferencesService } from '@/services/preferences'
import type { UpdatePreferencesRequest, UserPreferences } from '@/lib/types'
import { ApiError } from '@/lib/api-client'

export const PREFERENCES_QUERY_KEY = 'preferences'

// 默认偏好设置
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  page_size: 30,
  view_mode: 'list',
  density: 'normal',
  tag_layout: 'grid',
  sort_by: 'popular',
  updated_at: new Date().toISOString(),
}

/**
 * 获取用户偏好设置
 */
export function usePreferences() {
  return useQuery({
    queryKey: [PREFERENCES_QUERY_KEY],
    queryFn: async () => {
      try {
        return await preferencesService.getPreferences()
      } catch (error) {
        // 如果接口返回 404,使用默认偏好设置
        if (error instanceof ApiError && error.status === 404) {
          console.warn('Preferences API not found, using default preferences')
          return DEFAULT_PREFERENCES
        }
        throw error
      }
    },
    // 减少重试次数,避免频繁请求不存在的接口
    retry: (failureCount, error) => {
      // 404 错误不重试
      if (error instanceof ApiError && error.status === 404) {
        return false
      }
      // 其他错误最多重试 2 次
      return failureCount < 2
    },
    // 增加缓存时间,减少请求频率
    staleTime: 5 * 60 * 1000, // 5 分钟
    gcTime: 10 * 60 * 1000, // 10 分钟
  })
}

/**
 * 更新用户偏好设置
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => preferencesService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PREFERENCES_QUERY_KEY] })
    },
  })
}
