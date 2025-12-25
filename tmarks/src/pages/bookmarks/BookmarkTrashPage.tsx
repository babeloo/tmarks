import { useState, useEffect, useCallback } from 'react'
import { Archive, RotateCcw, Trash2, Calendar, Link2, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { bookmarksService } from '@/services/bookmarks'
import type { Bookmark } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useToastStore } from '@/stores/toastStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { logger } from '@/lib/logger'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { MobileHeader } from '@/components/common/MobileHeader'

export function BookmarkTrashPage() {
  const isMobile = useIsMobile()
  const { success, error: showError } = useToastStore()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    isDanger?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false,
  })

  const loadTrash = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await bookmarksService.getTrash({ page_size: 100 })
      setBookmarks(response.bookmarks)
    } catch (err) {
      logger.error('Failed to load bookmark trash:', err)
      setError('加载回收站失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTrash()
  }, [loadTrash])

  const handleRestore = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '恢复书签',
      message: `确定要恢复"${title}"吗？`,
      isDanger: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        try {
          await bookmarksService.restoreFromTrash(id)
          setBookmarks(prev => prev.filter(b => b.id !== id))
          success('书签已恢复')
        } catch (err) {
          logger.error('Failed to restore bookmark:', err)
          showError('恢复失败，请重试')
        }
      },
    })
  }

  const handlePermanentDelete = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '永久删除',
      message: `确定要永久删除"${title}"吗？此操作不可撤销！`,
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        try {
          await bookmarksService.permanentDelete(id)
          setBookmarks(prev => prev.filter(b => b.id !== id))
          success('书签已永久删除')
        } catch (err) {
          logger.error('Failed to permanently delete bookmark:', err)
          showError('删除失败，请重试')
        }
      },
    })
  }

  const handleEmptyTrash = () => {
    if (bookmarks.length === 0) return

    setConfirmDialog({
      isOpen: true,
      title: '清空回收站',
      message: `确定要永久删除回收站中的 ${bookmarks.length} 个书签吗？此操作不可撤销！`,
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        try {
          const result = await bookmarksService.emptyTrash()
          setBookmarks([])
          success(`已清空回收站，删除了 ${result.count} 个书签`)
        } catch (err) {
          logger.error('Failed to empty trash:', err)
          showError('清空回收站失败，请重试')
        }
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={loadTrash}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex flex-col bg-background ${isMobile ? 'overflow-hidden' : ''}`}>
      {/* 移动端顶部工具栏 */}
      {isMobile && (
        <MobileHeader
          title="书签回收站"
          showMenu={false}
          showSearch={false}
          showMore={false}
        />
      )}

      <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20 min-h-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header - 桌面端显示 */}
          {!isMobile && (
            <div className="mb-8">
              <Link
                to="/bookmarks"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回书签</span>
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Archive className="w-8 h-8 text-muted-foreground" />
                    <h1 className="text-3xl font-bold text-foreground">书签回收站</h1>
                  </div>
                  <p className="text-muted-foreground">已删除的书签将保留在这里，可以恢复或永久删除</p>
                </div>
                {bookmarks.length > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空回收站
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 移动端清空按钮 */}
          {isMobile && bookmarks.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleEmptyTrash}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          )}

          {/* Empty State */}
          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <Archive className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">回收站是空的</h3>
              <p className="text-muted-foreground">没有已删除的书签</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 提示信息 */}
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>回收站中的书签将在 30 天后自动永久删除。</p>
                </div>
              </div>

              {/* 书签列表 */}
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="card p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        {bookmark.favicon ? (
                          <img
                            src={bookmark.favicon}
                            alt=""
                            className="w-6 h-6 rounded flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <Link2 className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                            {bookmark.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate mb-2">
                            {bookmark.url}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                删除于{' '}
                                {bookmark.deleted_at
                                  ? formatDistanceToNow(new Date(bookmark.deleted_at), {
                                      addSuffix: true,
                                      locale: zhCN,
                                    })
                                  : '未知'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestore(bookmark.id, bookmark.title)}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors text-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        恢复
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(bookmark.id, bookmark.title)}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            confirmText={confirmDialog.isDanger ? '确认删除' : '确认'}
            cancelText="取消"
          />
        </div>
      </div>
    </div>
  )
}
