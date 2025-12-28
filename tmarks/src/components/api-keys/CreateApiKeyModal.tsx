/**
 * 创建 API Key 模态框
 * 多步骤流程：基本信息 → 权限设置 → 过期设置 → 显示 Key
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateApiKey } from '@/hooks/useApiKeys'
import { AlertDialog } from '@/components/common/AlertDialog'
import {
  PERMISSION_TEMPLATES,
  getPermissionLabel,
  type PermissionTemplate,
} from '@shared/permissions'
import type { ApiKeyWithKey, CreateApiKeyRequest } from '@/services/api-keys'
import { Z_INDEX } from '@/lib/constants/z-index'

interface CreateApiKeyModalProps {
  onClose: () => void
}

type Step = 'basic' | 'permissions' | 'expiration' | 'success'

export function CreateApiKeyModal({ onClose }: CreateApiKeyModalProps) {
  const { t } = useTranslation('settings')
  const createApiKey = useCreateApiKey()

  const [step, setStep] = useState<Step>('basic')
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    name: '',
    description: '',
    template: 'BASIC',
    permissions: [],
    expires_at: null,
  })
  const [createdKey, setCreatedKey] = useState<ApiKeyWithKey | null>(null)
  const [copied, setCopied] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)

  const handleNext = () => {
    if (step === 'basic') setStep('permissions')
    else if (step === 'permissions') setStep('expiration')
    else if (step === 'expiration') handleCreate()
  }

  const handleBack = () => {
    if (step === 'permissions') setStep('basic')
    else if (step === 'expiration') setStep('permissions')
  }

  const handleCreate = async () => {
    try {
      const result = await createApiKey.mutateAsync(formData)
      setCreatedKey(result)
      setStep('success')
    } catch {
      setShowErrorAlert(true)
    }
  }

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const canProceed = () => {
    if (step === 'basic') return formData.name.trim().length > 0
    if (step === 'permissions') {
      const perms =
        formData.template
          ? PERMISSION_TEMPLATES[formData.template].permissions
          : formData.permissions
      return perms && perms.length > 0
    }
    return true
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: Z_INDEX.API_KEY_MODAL }}>
      <AlertDialog
        isOpen={showErrorAlert}
        title={t('apiKey.create.failed')}
        message={t('apiKey.create.failedMessage')}
        type="error"
        onConfirm={() => setShowErrorAlert(false)}
      />

      <div className="card rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--card)' }}>
        {/* 步骤 1: 基本信息 */}
        {step === 'basic' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {t('apiKey.create.title')} - {t('apiKey.create.step', { current: 1, total: 3 })}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('apiKey.create.nameRequired')}
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder={t('apiKey.create.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('apiKey.create.nameHint')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('apiKey.create.description')}
                </label>
                <textarea
                  className="input w-full h-20 resize-none"
                  placeholder={t('apiKey.create.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button className="btn" onClick={onClose}>
                {t('apiKey.create.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {t('apiKey.create.next')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤 2: 权限设置 */}
        {step === 'permissions' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {t('apiKey.create.title')} - {t('apiKey.create.step', { current: 2, total: 3 })}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  {t('apiKey.create.quickSelect')}
                </label>
                <div className="space-y-2">
                  {(Object.keys(PERMISSION_TEMPLATES) as PermissionTemplate[]).map(
                    (template) => (
                      <label
                        key={template}
                        className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30"
                      >
                        <input
                          type="radio"
                          name="template"
                          checked={formData.template === template}
                          onChange={() =>
                            setFormData({ ...formData, template })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {t(PERMISSION_TEMPLATES[template].nameKey)}
                            {template === 'BASIC' && (
                              <span className="ml-2 text-xs bg-primary text-primary-content px-2 py-0.5 rounded">
                                {t('apiKey.create.recommended')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t(PERMISSION_TEMPLATES[template].descriptionKey)}
                          </div>
                        </div>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* 预览权限 */}
              <div className="p-4 bg-muted/30 border border-border rounded-lg">
                <div className="text-sm font-medium text-foreground mb-2">
                  {t('apiKey.create.includedPermissions')}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {(formData.template
                    ? PERMISSION_TEMPLATES[formData.template].permissions
                    : formData.permissions || []
                  ).map((perm: string) => (
                    <div key={perm} className="flex items-center gap-2">
                      <span>✓</span>
                      <span className="font-medium">{getPermissionLabel(perm)}</span>
                      <span className="text-muted-foreground/60">({perm})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button className="btn" onClick={handleBack}>
                {t('apiKey.create.prev')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {t('apiKey.create.next')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤 3: 过期设置 */}
        {step === 'expiration' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {t('apiKey.create.title')} - {t('apiKey.create.step', { current: 3, total: 3 })}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  {t('apiKey.create.expiration')}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input
                      type="radio"
                      name="expires"
                      checked={formData.expires_at === null}
                      onChange={() =>
                        setFormData({ ...formData, expires_at: null })
                      }
                    />
                    <span className="text-foreground">{t('apiKey.create.neverExpire')}</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input
                      type="radio"
                      name="expires"
                      checked={formData.expires_at === '30d'}
                      onChange={() =>
                        setFormData({ ...formData, expires_at: '30d' })
                      }
                    />
                    <span className="text-foreground">{t('apiKey.create.expireIn30Days')}</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input
                      type="radio"
                      name="expires"
                      checked={formData.expires_at === '90d'}
                      onChange={() =>
                        setFormData({ ...formData, expires_at: '90d' })
                      }
                    />
                    <span className="text-foreground">{t('apiKey.create.expireIn90Days')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button className="btn" onClick={handleBack}>
                {t('apiKey.create.prev')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={createApiKey.isPending}
              >
                {createApiKey.isPending ? t('apiKey.create.creating') : t('apiKey.create.createButton')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤 4: 成功显示 Key */}
        {step === 'success' && createdKey && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('apiKey.success.title')}
              </h2>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('apiKey.success.yourKey')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1 font-mono text-sm"
                  value={createdKey.key}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
                <button className="btn" onClick={handleCopy}>
                  {copied ? t('apiKey.success.copied') : t('apiKey.success.copy')}
                </button>
              </div>
            </div>

            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg mb-6">
              <h4 className="font-medium text-warning mb-2">{t('apiKey.success.warning')}</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t('apiKey.success.warningList.showOnce')}</li>
                <li>{t('apiKey.success.warningList.saveNow')}</li>
                <li>{t('apiKey.success.warningList.prefixOnly', { prefix: createdKey.key_prefix })}</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <button className="btn btn-primary" onClick={onClose}>
                {t('apiKey.success.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
