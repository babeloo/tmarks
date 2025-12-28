/**
 * Import/Export Settings Page
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Download, Upload, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ExportSection } from '../../components/import-export/ExportSection'
import { ImportSection } from '../../components/import-export/ImportSection'
import { BOOKMARKS_QUERY_KEY } from '../../hooks/useBookmarks'
import { TAGS_QUERY_KEY } from '../../hooks/useTags'
import type { ExportFormat, ExportOptions, ImportResult } from '@shared/import-export-types'

export function ImportExportPage() {
  const { t } = useTranslation('import')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [lastOperation, setLastOperation] = useState<{
    type: 'export' | 'import'
    timestamp: string
    details: string
  } | null>(null)

  const handleExportComplete = (format: ExportFormat, options: ExportOptions) => {
    const tags = options.include_tags ? t('page.withTags') : ''
    const metadata = options.include_metadata ? t('page.withMetadata') : ''
    setLastOperation({
      type: 'export',
      timestamp: new Date().toLocaleString(),
      details: t('page.exportDetails', { format: format.toUpperCase(), tags, metadata })
    })
  }

  const handleImportComplete = (result: ImportResult) => {
    const failed = result.failed > 0 ? t('page.failedCount', { count: result.failed }) : ''
    setLastOperation({
      type: 'import',
      timestamp: new Date().toLocaleString(),
      details: t('page.importDetails', { success: result.success, tags: result.created_tags.length, failed })
    })

    queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] })
  }

  const tabs = [
    {
      id: 'export' as const,
      label: t('page.exportTab'),
      icon: Download,
      description: t('page.exportDesc')
    },
    {
      id: 'import' as const,
      label: t('page.importTab'),
      icon: Upload,
      description: t('page.importDesc')
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted touch-manipulation transition-colors"
              >
                <ArrowLeft className="h-5 w-5 sm:h-5 sm:w-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                  {t('page.title')}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  {t('page.description')}
                </p>
              </div>
            </div>

            {lastOperation && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>
                  {t('page.recentOperation')}: {lastOperation.type === 'export' ? t('page.exportOperation') : t('page.importOperation')}
                  ({lastOperation.timestamp})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 选项卡导航 */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-2 sm:space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-3 sm:py-4 px-3 sm:px-2 md:px-1 border-b-2 font-medium whitespace-nowrap touch-manipulation transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`} />
                    <span className="text-sm sm:text-base font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* 选项卡描述 */}
          <div className="mt-2 sm:mt-3 md:mt-4 px-1">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="card shadow-float">
          <div className="p-4 sm:p-6">
            {activeTab === 'export' && (
              <ExportSection onExport={handleExportComplete} />
            )}

            {activeTab === 'import' && (
              <ImportSection onImport={handleImportComplete} />
            )}
          </div>
        </div>

        {/* Recent operation history */}
        {lastOperation && (
          <div className="mt-6 sm:mt-8 card shadow-float">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">
                {t('page.recentOperation')}
              </h3>
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  lastOperation.type === 'export'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-success/10 text-success'
                }`}>
                  {lastOperation.type === 'export' ? (
                    <Download className="h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <span className="font-medium text-foreground text-sm sm:text-base">
                      {lastOperation.type === 'export' ? t('page.dataExport') : t('page.dataImport')}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0">
                      {lastOperation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {lastOperation.details}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help info */}
        <div className="mt-4 sm:mt-6 md:mt-8 bg-primary/5 rounded-lg border border-primary/20">
          <div className="p-3 sm:p-4 md:p-6">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-3 sm:mb-4">
              {t('help.title')}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                  {t('help.exportTitle')}
                </h4>
                <div className="ml-4 space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.exportTip1')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.exportTip2')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.exportTip3')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.exportTip4')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center">
                  <span className="w-2 h-2 bg-success rounded-full mr-2 flex-shrink-0"></span>
                  {t('help.importTitle')}
                </h4>
                <div className="ml-4 space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.importTip1')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.importTip2')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.importTip3')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.importTip4')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-success rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.importTip5')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center">
                  <span className="w-2 h-2 bg-warning rounded-full mr-2 flex-shrink-0"></span>
                  {t('help.notesTitle')}
                </h4>
                <div className="ml-4 space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-warning rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.notesTip1')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-warning rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.notesTip2')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-warning rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.notesTip3')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-warning rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('help.notesTip4')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
