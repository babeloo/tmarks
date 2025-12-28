/**
 * AI 整理预览对比组件
 * 显示原始数据 vs AI 整理后数据的对比
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, Edit2, Tag, FileText, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import type { OrganizedBookmark, OrganizeResult } from '@/lib/ai/organize'

interface AiPreviewStepProps {
  result: OrganizeResult
  onConfirm: (bookmarks: OrganizedBookmark[]) => void
  onBack: () => void
  onSkip: () => void
}

export function AiPreviewStep({
  result,
  onConfirm,
  onBack,
  onSkip
}: AiPreviewStepProps) {
  const { t } = useTranslation('import')
  const [editedBookmarks, setEditedBookmarks] = useState<OrganizedBookmark[]>(result.bookmarks)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTags, setEditingTags] = useState<string>('')

  const totalBookmarks = editedBookmarks.length
  const bookmarksWithAiTags = editedBookmarks.filter(b => b.ai_tags && b.ai_tags.length > 0).length
  const totalNewTags = result.newTags.length

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const startEditTags = (index: number) => {
    const bookmark = editedBookmarks[index]
    if (!bookmark) return
    const tags = bookmark.ai_tags?.length ? bookmark.ai_tags : bookmark.tags
    setEditingIndex(index)
    setEditingTags(tags.join(', '))
  }

  const saveEditTags = () => {
    if (editingIndex === null) return
    
    const newTags = editingTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    
    setEditedBookmarks(prev => prev.map((b, i) => 
      i === editingIndex ? { ...b, ai_tags: newTags } : b
    ))
    
    setEditingIndex(null)
    setEditingTags('')
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingTags('')
  }

  const useOriginalTags = (index: number) => {
    setEditedBookmarks(prev => prev.map((b, i) => 
      i === index ? { ...b, ai_tags: b.original_tags || b.tags } : b
    ))
  }

  const handleConfirm = () => {
    const finalBookmarks = editedBookmarks.map(b => ({
      ...b,
      tags: b.ai_tags?.length ? b.ai_tags : b.tags
    }))
    onConfirm(finalBookmarks)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
          <Check className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('ai.preview.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('ai.preview.description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <div className="text-xl font-bold text-foreground">{totalBookmarks}</div>
          <div className="text-xs text-muted-foreground">{t('ai.preview.totalBookmarks')}</div>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <div className="text-xl font-bold text-success">{bookmarksWithAiTags}</div>
          <div className="text-xs text-muted-foreground">{t('ai.preview.tagsGenerated')}</div>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <div className="text-xl font-bold text-primary">{totalNewTags}</div>
          <div className="text-xs text-muted-foreground">{t('ai.preview.newTags')}</div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('ai.preview.tokenUsage')}</span>
          <span className="font-medium text-foreground">
            {t('ai.preview.tokensUsed', { count: result.tokensUsed })}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {editedBookmarks.slice(0, 50).map((bookmark, index) => {
          const isExpanded = expandedItems.has(index)
          const isEditing = editingIndex === index
          const hasAiTags = bookmark.ai_tags && bookmark.ai_tags.length > 0
          const originalTags = bookmark.original_tags || bookmark.tags || []
          const currentTags = bookmark.ai_tags?.length ? bookmark.ai_tags : bookmark.tags

          return (
            <div
              key={index}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {bookmark.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {bookmark.url}
                  </div>
                </div>
                
                {hasAiTags && (
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                )}
                
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      {t('ai.preview.originalTags')}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {originalTags.length > 0 ? (
                        originalTags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">{t('ai.preview.none')}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="w-3 h-3" />
                      {t('ai.preview.aiGeneratedTags')}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingTags}
                          onChange={(e) => setEditingTags(e.target.value)}
                          className="input w-full text-sm"
                          placeholder={t('ai.preview.editPlaceholder')}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEditTags}
                            className="btn btn-primary btn-sm flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            {t('ai.preview.save')}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn btn-ghost btn-sm flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            {t('ai.preview.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1 flex-1">
                          {currentTags.length > 0 ? (
                            currentTags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">{t('ai.preview.none')}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditTags(index)
                          }}
                          className="p-1 hover:bg-muted rounded"
                          title={t('ai.preview.editTags')}
                        >
                          <Edit2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    )}
                  </div>

                  {bookmark.ai_description && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        {t('ai.preview.aiGeneratedDesc')}
                      </div>
                      <p className="text-xs text-foreground bg-muted/30 p-2 rounded">
                        {bookmark.ai_description}
                      </p>
                    </div>
                  )}

                  {hasAiTags && originalTags.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        useOriginalTags(index)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t('ai.preview.useOriginalTags')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {editedBookmarks.length > 50 && (
          <div className="text-center text-sm text-muted-foreground py-2">
            {t('ai.preview.moreNotShown', { count: editedBookmarks.length - 50 })}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={onBack}
          className="btn btn-ghost"
        >
          {t('ai.preview.back')}
        </button>
        <button
          onClick={onSkip}
          className="btn btn-ghost"
        >
          {t('ai.preview.discard')}
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 btn btn-primary flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {t('ai.preview.confirmImport', { count: totalBookmarks })}
        </button>
      </div>
    </div>
  )
}
