/**
 * 导入功能组件
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Upload,
  FileText,
  Code,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DragDropUpload } from '../common/DragDropUpload'
import { ProgressIndicator } from '../common/ProgressIndicator'
import { ErrorDisplay } from '../common/ErrorDisplay'
import { useImportState } from './hooks/useImportState'
import { useImportActions, formatFileSize } from './hooks/useImportActions'
import { AiOrganizeStep } from './AiOrganizeStep'
import { AiPreviewStep } from './AiPreviewStep'
import { parseBookmarksFile } from '@/lib/import/html-parser'
import { useAuthStore } from '@/stores/authStore'
import type { ImportFormat, ImportResult, ParsedBookmark } from '@shared/import-export-types'
import type { OrganizeResult, OrganizedBookmark } from '@/lib/ai/organize'

interface ImportSectionProps {
  onImport?: (result: ImportResult) => void
}

type ImportStep = 'upload' | 'ai-organize' | 'ai-preview'

export function ImportSection({ onImport }: ImportSectionProps) {
  const { t } = useTranslation('import')
  const { t: tc } = useTranslation('common')
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [parsedBookmarks, setParsedBookmarks] = useState<ParsedBookmark[]>([])
  const [organizeResult, setOrganizeResult] = useState<OrganizeResult | null>(null)
  const [enableAiOrganize, setEnableAiOrganize] = useState(false)

  const state = useImportState()
  const {
    selectedFormat,
    setSelectedFormat,
    selectedFile,
    isImporting,
    setIsImporting,
    isValidating,
    importProgress,
    setImportProgress,
    importResult,
    setImportResult,
    validationResult,
    options,
    setOptions,
    fileInputRef
  } = state

  const actions = useImportActions({
    selectedFormat,
    setSelectedFile: state.setSelectedFile,
    setImportResult: state.setImportResult,
    setIsValidating: state.setIsValidating,
    setValidationResult: state.setValidationResult,
    setIsImporting: state.setIsImporting,
    setImportProgress: state.setImportProgress,
    fileInputRef,
    options,
    onImport
  })

  const { handleFileSelect, handleImport, handleReset } = actions

  const formatOptions = [
    {
      value: 'html' as ImportFormat,
      label: t('format.html'),
      description: t('format.browserExport'),
      icon: FileText,
      extensions: ['.html', '.htm']
    },
    {
      value: 'json' as ImportFormat,
      label: t('format.json'),
      description: t('format.tmarksFormat'),
      icon: Code,
      extensions: ['.json']
    }
  ]

  useEffect(() => {
    async function parseFile() {
      if (selectedFile && validationResult?.valid) {
        try {
          const content = await selectedFile.text()
          const bookmarks = parseBookmarksFile(content, selectedFormat as 'html' | 'json')
          setParsedBookmarks(bookmarks)
        } catch (err) {
          console.error('Failed to parse bookmarks:', err)
          setParsedBookmarks([])
        }
      } else {
        setParsedBookmarks([])
      }
    }
    parseFile()
  }, [selectedFile, validationResult, selectedFormat])

  const handleAiOrganizeComplete = (result: OrganizeResult) => {
    setOrganizeResult(result)
    setCurrentStep('ai-preview')
  }

  const handleImportWithAiTags = async (bookmarks: OrganizedBookmark[]) => {
    setIsImporting(true)
    setImportProgress({ current: 0, total: 100, status: tc('status.processing') })

    try {
      const importData = {
        format: 'json' as const,
        content: JSON.stringify({
          version: '1.0.0',
          exported_at: new Date().toISOString(),
          bookmarks: bookmarks.map((b) => ({
            title: b.title,
            url: b.url,
            description: b.ai_description || b.description,
            tags: b.ai_tags?.length ? b.ai_tags : b.tags,
            created_at: b.created_at
          })),
          tags: []
        }),
        options
      }

      const token = useAuthStore.getState().accessToken
      const response = await fetch('/api/v1/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(importData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Import failed')
      }

      const result: ImportResult = await response.json()
      setImportResult(result)
      onImport?.(result)
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: 0,
        failed: 1,
        skipped: 0,
        total: 1,
        errors: [
          {
            index: 0,
            item: { title: '', url: '', tags: [] },
            error: error instanceof Error ? error.message : tc('message.operationFailed'),
            code: 'UNKNOWN_ERROR'
          }
        ],
        created_bookmarks: [],
        created_tags: [],
        created_tab_groups: [],
        tab_groups_success: 0,
        tab_groups_failed: 0
      })
    } finally {
      setIsImporting(false)
      setImportProgress(null)
    }
  }

  const handleSkipAiOrganize = () => {
    if (selectedFile) {
      handleImport(selectedFile)
    }
  }

  const handleBackToOrganize = () => {
    setCurrentStep('ai-organize')
  }

  const handleSkipAiResult = () => {
    if (selectedFile) {
      handleImport(selectedFile)
    }
  }

  const handleFullReset = () => {
    handleReset()
    setCurrentStep('upload')
    setParsedBookmarks([])
    setOrganizeResult(null)
    setEnableAiOrganize(false)
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* AI 整理开关 */}
      <div className={`p-4 rounded-lg border ${enableAiOrganize ? 'bg-primary/10 border-primary' : 'bg-primary/5 border-primary/20'}`}>
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enableAiOrganize ? 'bg-primary text-primary-foreground' : 'bg-primary/10'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{t('ai.enableAi')}</div>
              <div className="text-xs text-muted-foreground">
                {selectedFile && validationResult?.valid
                  ? (parsedBookmarks.length > 0 
                      ? t('ai.parsedCount', { count: parsedBookmarks.length })
                      : t('ai.parsing'))
                  : t('ai.disabledHint')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{enableAiOrganize ? t('ai.enabled') : t('ai.disabled')}</span>
            <input
              type="checkbox"
              checked={enableAiOrganize}
              onChange={(e) => setEnableAiOrganize(e.target.checked)}
              className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
            />
          </div>
        </label>
      </div>

      {/* 格式选择 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">{t('import.selectFormat')}</label>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map((format) => {
            const Icon = format.icon
            return (
              <div
                key={format.value}
                className={`relative rounded-lg border p-3 cursor-pointer transition-all touch-manipulation ${
                  selectedFormat === format.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                onClick={() => setSelectedFormat(format.value)}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{format.label}</div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {format.extensions.join(', ')}
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={() => setSelectedFormat(format.value)}
                    className="h-4 w-4 text-primary border-border focus:ring-primary flex-shrink-0"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 文件选择 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">{t('import.selectFile')}</label>

        <DragDropUpload
          onFileSelect={handleFileSelect}
          accept={formatOptions.find((f) => f.value === selectedFormat)?.extensions.join(',')}
          maxSize={50 * 1024 * 1024}
          disabled={isImporting}
        >
          {selectedFile ? (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                {isValidating ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <div>
                      <p className="text-lg font-medium text-foreground">{t('import.validating')}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-lg font-medium text-foreground">{t('import.fileSelected')}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    </div>
                    <button
                      onClick={handleFullReset}
                      className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted"
                    >
                      {t('import.reselect')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </DragDropUpload>
      </div>

      {/* 验证结果 */}
      {validationResult && (
        <ErrorDisplay
          errors={validationResult.errors}
          variant={validationResult.valid ? 'success' : 'error'}
          title={validationResult.valid ? t('import.validationPassed') : t('import.validationFailed')}
          dismissible={false}
          collapsible={true}
          showDetails={true}
        />
      )}

      {/* 导入选项 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">{t('import.options')}</label>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:border-muted-foreground/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={options.skip_duplicates}
              onChange={(e) => setOptions((prev) => ({ ...prev, skip_duplicates: e.target.checked }))}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary flex-shrink-0"
            />
            <span className="text-sm text-foreground">{t('import.skipDuplicates')}</span>
          </label>

          <label className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:border-muted-foreground/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={options.create_missing_tags}
              onChange={(e) => setOptions((prev) => ({ ...prev, create_missing_tags: e.target.checked }))}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary flex-shrink-0"
            />
            <span className="text-sm text-foreground">{t('import.createTags')}</span>
          </label>

          <label className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:border-muted-foreground/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={options.preserve_timestamps}
              onChange={(e) => setOptions((prev) => ({ ...prev, preserve_timestamps: e.target.checked }))}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary flex-shrink-0"
            />
            <span className="text-sm text-foreground">{t('import.preserveTime')}</span>
          </label>

          {selectedFormat === 'html' && (
            <label className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:border-muted-foreground/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={options.folder_as_tag}
                onChange={(e) => setOptions((prev) => ({ ...prev, folder_as_tag: e.target.checked }))}
                className="h-4 w-4 text-primary border-border rounded focus:ring-primary flex-shrink-0"
              />
              <span className="text-sm text-foreground">{t('import.folderAsTag')}</span>
            </label>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      {!importResult && (
        <div className="flex space-x-3">
          {enableAiOrganize ? (
            <button
              onClick={() => setCurrentStep('ai-organize')}
              disabled={!selectedFile || !validationResult?.valid || isImporting || isValidating || parsedBookmarks.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              <Sparkles className="h-4 w-4" />
              <span>{parsedBookmarks.length === 0 ? t('ai.parsing') : t('ai.nextStep', { count: parsedBookmarks.length })}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => selectedFile && handleImport(selectedFile)}
              disabled={!selectedFile || !validationResult?.valid || isImporting || isValidating}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isImporting ? t('import.importing') : t('import.startImport')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )

  const renderAiOrganizeStep = () => (
    <div className="space-y-4">
      <button
        onClick={() => setCurrentStep('upload')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        {tc('button.back')}
      </button>

      <AiOrganizeStep
        bookmarks={parsedBookmarks}
        existingTags={[]}
        onComplete={handleAiOrganizeComplete}
        onSkip={handleSkipAiOrganize}
      />
    </div>
  )

  const renderAiPreviewStep = () => {
    if (!organizeResult) return null

    return (
      <div className="space-y-4">
        <button
          onClick={handleBackToOrganize}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {tc('button.back')}
        </button>

        <AiPreviewStep
          result={organizeResult}
          onConfirm={handleImportWithAiTags}
          onBack={handleBackToOrganize}
          onSkip={handleSkipAiResult}
        />
      </div>
    )
  }

  const renderImportProgress = () => (
    <div className="space-y-6">
      {importProgress && (
        <ProgressIndicator
          progress={{
            current: importProgress.current,
            total: importProgress.total,
            percentage: (importProgress.current / importProgress.total) * 100,
            status: importProgress.status,
            message: `${importProgress.current} / ${importProgress.total}`
          }}
          variant="detailed"
          showSpeed={true}
          showETA={true}
        />
      )}

      {importResult && (
        <div className="bg-muted rounded-lg p-3 sm:p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">{t('result.title')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-xl font-bold text-success">{importResult.success}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{t('result.success')}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-xl font-bold text-destructive">{importResult.failed}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{t('result.failed')}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-xl font-bold text-warning">{importResult.skipped}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{t('result.skipped')}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-xl font-bold text-primary">{importResult.total}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{t('result.total')}</div>
            </div>
          </div>

          {importResult.total > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span className="text-muted-foreground">{t('result.successRate')}</span>
                <span className="font-medium text-foreground">
                  {Math.round((importResult.success / importResult.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(importResult.success / importResult.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {importResult.errors.length > 0 && (
            <div className="mt-4">
              <ErrorDisplay
                errors={importResult.errors.map((error) => ({
                  message: error.error,
                  code: error.code,
                  details: `${error.item.title || error.item.url}`
                }))}
                variant="error"
                title={`${t('result.errors')} (${importResult.errors.length})`}
                dismissible={false}
                collapsible={true}
                maxVisible={2}
              />
            </div>
          )}

          {importResult.success > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/bookmarks')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
              >
                <span>{t('result.viewBookmarks')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleFullReset}
                className="flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
              >
                {t('result.continueImport')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (importResult || importProgress) {
    return renderImportProgress()
  }

  switch (currentStep) {
    case 'ai-organize':
      return renderAiOrganizeStep()
    case 'ai-preview':
      return renderAiPreviewStep()
    case 'upload':
    default:
      return renderUploadStep()
  }
}
