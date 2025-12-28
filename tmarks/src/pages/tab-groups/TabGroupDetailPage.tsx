import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { logger } from '@/lib/logger'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Layers,
} from 'lucide-react'
import { tabGroupsService } from '@/services/tab-groups'
import type { TabGroup, TabGroupItem } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useToastStore } from '@/stores/toastStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export function TabGroupDetailPage() {
  const { t, i18n: _i18n } = useTranslation('tabGroups')
  const { t: tc } = useTranslation('common')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useToastStore()
  const [tabGroup, setTabGroup] = useState<TabGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  
  // Item editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemTitle, setEditingItemTitle] = useState('')

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  useEffect(() => {
    if (id) {
      loadTabGroup(id)
    }
  }, [id])

  const loadTabGroup = async (groupId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const group = await tabGroupsService.getTabGroup(groupId)
      setTabGroup(group)
      setEditedTitle(group.title)
    } catch (err) {
      logger.error('Failed to load tab group:', err)
      setError(t('page.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTitle = async () => {
    if (!tabGroup || !editedTitle.trim()) return

    try {
      setIsSavingTitle(true)
      const updated = await tabGroupsService.updateTabGroup(tabGroup.id, {
        title: editedTitle.trim(),
      })
      setTabGroup(updated)
      setIsEditingTitle(false)
      success(t('detail.titleUpdateSuccess'))
    } catch (err) {
      logger.error('Failed to update title:', err)
      showError(t('detail.titleUpdateFailed'))
    } finally {
      setIsSavingTitle(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedTitle(tabGroup?.title || '')
    setIsEditingTitle(false)
  }

  const handleEditItem = (item: TabGroupItem) => {
    setEditingItemId(item.id)
    setEditingItemTitle(item.title)
  }

  const handleSaveItemEdit = async (itemId: string) => {
    if (!editingItemTitle.trim()) {
      showError(t('message.titleRequired'))
      return
    }

    try {
      await tabGroupsService.updateTabGroupItem(itemId, { title: editingItemTitle.trim() })
      
      // Update local state
      if (tabGroup) {
        const updatedItems = tabGroup.items?.map(item =>
          item.id === itemId ? { ...item, title: editingItemTitle.trim() } : item
        )
        setTabGroup({ ...tabGroup, items: updatedItems })
      }
      
      setEditingItemId(null)
      setEditingItemTitle('')
      success(t('detail.updateSuccess'))
    } catch (err) {
      logger.error('Failed to update item:', err)
      showError(t('detail.updateFailed'))
    }
  }

  const handleCancelItemEdit = () => {
    setEditingItemId(null)
    setEditingItemTitle('')
  }

  const handleDelete = () => {
    if (!tabGroup) return

    setConfirmDialog({
      isOpen: true,
      title: t('confirm.deleteGroup'),
      message: t('confirm.deleteGroupMessage', { title: tabGroup.title }),
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false })
        try {
          await tabGroupsService.deleteTabGroup(tabGroup.id)
          success(t('message.deleteSuccess'))
          navigate('/tab')
        } catch (err) {
          logger.error('Failed to delete tab group:', err)
          showError(t('message.deleteFailed'))
        }
      },
    })
  }

  const handleRestoreAll = () => {
    if (!tabGroup || !tabGroup.items) return

    const items = tabGroup.items
    const itemCount = items.length

    // 超过 10 个标签时提供更详细的提示
    const message = itemCount > 10
      ? t('detail.openAllWarning', { count: itemCount })
      : t('detail.openAllMessage', { count: itemCount })

    setConfirmDialog({
      isOpen: true,
      title: t('detail.openAllTabs'),
      message,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false })
        
        const BATCH_SIZE = 10
        const BATCH_DELAY = 1000
        const totalBatches = Math.ceil(itemCount / BATCH_SIZE)
        
        logger.log(`Opening ${itemCount} tabs in ${totalBatches} batches`)
        
        // 分批打开标签页
        for (let i = 0; i < itemCount; i += BATCH_SIZE) {
          const currentBatch = Math.floor(i / BATCH_SIZE) + 1
          const batch = items.slice(i, i + BATCH_SIZE)
          
          // 显示进度提示（仅当有多批时）
          if (totalBatches > 1) {
            success(t('detail.openingBatch', { current: currentBatch, total: totalBatches }))
          }
          
          // 打开当前批次的标签页
          batch.forEach((item, index) => {
            setTimeout(() => {
              window.open(item.url, '_blank', 'noopener,noreferrer')
            }, index * 100)
          })
          
          // 等待下一批（如果还有）
          if (i + BATCH_SIZE < itemCount) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
          }
        }
        
        success(t('detail.allOpened', { count: itemCount }))
      },
    })
  }

  const handleOpenTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: zhCN,
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {t('page.loading')}
          </p>
        </div>
      </div>
    )
  }

  if (error || !tabGroup) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || t('detail.groupNotFound')}</p>
          <button
            onClick={() => navigate('/tab')}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            {t('detail.backToList')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tab')}
          className="flex items-center gap-2 mb-4 text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('detail.backToList')}
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-lg font-semibold"
                  style={{ color: 'var(--foreground)' }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                />
                <button
                  onClick={handleSaveTitle}
                  disabled={isSavingTitle || !editedTitle.trim()}
                  className="p-2 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingTitle}
                  className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {tabGroup.title}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                  title={t('detail.editTitle')}
                >
                  <Edit2 className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(tabGroup.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4" />
                <span>{t('header.tabCount', { count: tabGroup.items?.length || 0 })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/50 transition-colors flex items-center gap-2"
              title={t('confirm.deleteGroup')}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">{t('action.delete')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Items List */}
      <div className="space-y-3">
        {tabGroup.items && tabGroup.items.length > 0 ? (
          <>
            {/* Summary Card */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {t('detail.totalTabs', { count: tabGroup.items.length })}
                  </span>
                </div>
                <button
                  onClick={handleRestoreAll}
                  className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-medium hover:shadow-lg hover:bg-success/90 transition-all duration-200 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('detail.restoreAll')}
                </button>
              </div>
            </div>

            {/* Tab Items */}
            {tabGroup.items.map((item, index) => {
              const isEditing = editingItemId === item.id
              
              return (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-success/50 hover:shadow-md transition-all duration-200"
                >
                  {/* Index Badge */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-success/20 to-success/10 flex-shrink-0">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* Favicon */}
                  {item.favicon && (
                    <img src={item.favicon} alt="" className="w-5 h-5 rounded flex-shrink-0" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingItemTitle}
                        onChange={(e) => setEditingItemTitle(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-border bg-card text-sm font-medium mb-1"
                        style={{ color: 'var(--foreground)' }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveItemEdit(item.id)
                          if (e.key === 'Escape') handleCancelItemEdit()
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 
                        className="font-medium truncate mb-0.5 cursor-pointer hover:text-primary transition-colors" 
                        style={{ color: 'var(--foreground)' }}
                        onClick={() => handleOpenTab(item.url)}
                      >
                        {item.title}
                      </h3>
                    )}
                    <p className="text-sm truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {item.url}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveItemEdit(item.id)}
                          className="p-1.5 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-colors"
                          title={tc('button.save')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelItemEdit}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          title={tc('button.cancel')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditItem(item)
                          }}
                          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                          title={tc('button.edit')}
                        >
                          <Edit2 className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenTab(item.url)
                          }}
                          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                          title={t('action.open')}
                        >
                          <ExternalLink className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-border bg-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <ExternalLink className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p className="text-lg font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              {t('detail.noTabs')}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {t('detail.tabsCleared')}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  )
}

