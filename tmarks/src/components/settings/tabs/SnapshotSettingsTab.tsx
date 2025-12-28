/**
 * 快照设置标签页
 * 简化版本：保留策略、自动化选项
 */

import { useTranslation } from 'react-i18next'
import { Camera, Copy, CheckCircle, Trash2, Info } from 'lucide-react'
import { Toggle } from '@/components/common/Toggle'
import { SettingsSection, SettingsItem, SettingsDivider } from '../SettingsSection'
import { InfoBox } from '../InfoBox'

interface SnapshotSettingsTabProps {
  retentionCount: number
  autoCreate: boolean
  autoDedupe: boolean
  autoCleanupDays: number
  onRetentionCountChange: (count: number) => void
  onAutoCreateChange: (enabled: boolean) => void
  onAutoDedupeChange: (enabled: boolean) => void
  onAutoCleanupDaysChange: (days: number) => void
}

export function SnapshotSettingsTab({
  retentionCount,
  autoCreate,
  autoDedupe,
  autoCleanupDays,
  onRetentionCountChange,
  onAutoCreateChange,
  onAutoDedupeChange,
  onAutoCleanupDaysChange,
}: SnapshotSettingsTabProps) {
  const { t } = useTranslation('settings')

  return (
    <div className="space-y-6">
      {/* 保留策略 */}
      <SettingsSection icon={Camera} title={t('snapshot.retention.title')} description={t('snapshot.retention.description')}>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* 保留数量 */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('snapshot.retention.count')}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={retentionCount}
                  onChange={(e) => onRetentionCountChange(parseInt(e.target.value) || 0)}
                  min="-1"
                  max="100"
                  className="input w-16 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">{t('snapshot.retention.unit')}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t('snapshot.retention.tip')}</p>
          </div>

          {/* 自动清理天数 */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('snapshot.autoClean.days')}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={autoCleanupDays}
                  onChange={(e) => onAutoCleanupDaysChange(parseInt(e.target.value) || 0)}
                  min="0"
                  max="365"
                  className="input w-16 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">{t('snapshot.autoClean.unit')}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t('snapshot.autoClean.daysHint')}</p>
          </div>
        </div>
      </SettingsSection>

      <SettingsDivider />

      {/* 自动化选项 */}
      <SettingsSection icon={Copy} title={t('snapshot.automation.title')} description={t('snapshot.automation.description')}>
        <div className="space-y-3">
          <SettingsItem
            icon={Copy}
            title={t('snapshot.autoCreate.enable')}
            description={t('snapshot.autoCreate.enableHint')}
            action={<Toggle checked={autoCreate} onChange={onAutoCreateChange} />}
          />
          <SettingsItem
            icon={CheckCircle}
            iconColor="text-success"
            title={t('snapshot.dedup.enable')}
            description={t('snapshot.dedup.tip1')}
            action={<Toggle checked={autoDedupe} onChange={onAutoDedupeChange} />}
          />
        </div>
      </SettingsSection>

      <SettingsDivider />

      {/* 警告提示 */}
      {autoCleanupDays > 0 && autoCleanupDays < 30 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-2">
            <Trash2 className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning">{t('snapshot.autoClean.warning')}</p>
          </div>
        </div>
      )}

      <InfoBox icon={Info} title={t('snapshot.infoBox.title')} variant="info">
        <ul className="space-y-1 text-xs">
          <li>• {t('snapshot.infoBox.tip1')}</li>
          <li>• {t('snapshot.infoBox.tip2')}</li>
        </ul>
      </InfoBox>
    </div>
  )
}
