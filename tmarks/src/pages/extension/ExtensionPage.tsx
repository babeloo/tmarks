import { useTranslation } from 'react-i18next'
import { Download, Chrome, CheckCircle, AlertCircle } from 'lucide-react'

export function ExtensionPage() {
  const { t } = useTranslation('info')
  
  const handleDownload = (browser: 'chrome' | 'firefox' | 'edge' | 'opera' | 'brave' | '360' | 'qq' | 'sogou') => {
    const link = document.createElement('a')
    link.href = `/extensions/tmarks-extension-${browser}.zip`
    link.download = `tmarks-extension-${browser}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-float">
          <Chrome className="w-12 h-12" style={{ color: 'var(--foreground)' }} />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          {t('extension.title')}
        </h1>
        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
          {t('extension.subtitle')}
        </p>
      </div>

      {/* 下载按钮 */}
      <div className="card shadow-float mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <h2 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--foreground)' }}>
          {t('extension.download.title')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Chrome */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Chrome</h3>
            <button onClick={() => handleDownload('chrome')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>

          {/* Firefox */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Firefox</h3>
            <button onClick={() => handleDownload('firefox')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>

          {/* Edge */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Edge</h3>
            <button onClick={() => handleDownload('edge')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>

          {/* Opera */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Opera</h3>
            <button onClick={() => handleDownload('opera')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>

          {/* Brave */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Brave</h3>
            <button onClick={() => handleDownload('brave')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>

          {/* 360浏览器 */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>360</h3>
            <button onClick={() => handleDownload('360')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>

          {/* QQ浏览器 */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>QQ</h3>
            <button onClick={() => handleDownload('qq')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>

          {/* 搜狗浏览器 */}
          <div className="text-center p-3 rounded-xl border-2 transition-all hover:border-primary" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
              <Chrome className="w-10 h-10" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Sogou</h3>
            <button onClick={() => handleDownload('sogou')} className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
              <Download className="w-3 h-3" />{t('extension.download.button')}
            </button>
          </div>
        </div>

        {/* 支持的浏览器列表 */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold mb-3 text-center" style={{ color: 'var(--foreground)' }}>
            {t('extension.browsers.title')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">Chrome</div>
              <div className="text-xs opacity-75">88+</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">Edge</div>
              <div className="text-xs opacity-75">88+</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">Firefox</div>
              <div className="text-xs opacity-75">109+</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">Brave</div>
              <div className="text-xs opacity-75">88+</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">Opera</div>
              <div className="text-xs opacity-75">74+</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">360</div>
              <div className="text-xs opacity-75">{t('extension.browsers.speedMode')}</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">QQ</div>
              <div className="text-xs opacity-75">{t('extension.browsers.speedMode')}</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="font-medium">Sogou</div>
              <div className="text-xs opacity-75">{t('extension.browsers.speedMode')}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {t('extension.version', { version: '1.0.0', size: '258 KB', date: '2024-11-19' })}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
            {t('extension.tip')}
          </p>
        </div>
      </div>

      {/* 功能特性 */}
      <div className="card shadow-float mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          {t('extension.features.title')}
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-success" />
            <div>
              <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
                {t('extension.features.saveTabGroups.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.features.saveTabGroups.description')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-success" />
            <div>
              <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
                {t('extension.features.restoreTabs.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.features.restoreTabs.description')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-success" />
            <div>
              <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
                {t('extension.features.autoSync.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.features.autoSync.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 安装步骤 */}
      <div className="card shadow-float mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          {t('extension.install.title')}
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {t('extension.install.step1.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.install.step1.description')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {t('extension.install.step2.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.install.step2.description')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {t('extension.install.step3.title')}
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.install.step3.description')}
              </p>
              <div className="bg-muted/30 rounded-lg p-3 font-mono text-sm">
                <p className="mb-1">Chrome: chrome://extensions/</p>
                <p className="mb-1">Edge: edge://extensions/</p>
                <p>Firefox: about:debugging#/runtime/this-firefox</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">4</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {t('extension.install.step4.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.install.step4.description')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">5</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {t('extension.install.step5.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.install.step5.description')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">6</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {t('extension.install.step6.title')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t('extension.install.step6.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="card shadow-float bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
          <div>
            <h3 className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              {t('extension.tips.title')}
            </h3>
            <ul className="text-sm space-y-1" style={{ color: 'var(--muted-foreground)' }}>
              <li>• {t('extension.tips.tip1')}</li>
              <li>• {t('extension.tips.tip2')}</li>
              <li>• {t('extension.tips.tip3')}</li>
              <li>• {t('extension.tips.tip4')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="card shadow-float">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          {t('extension.faq.title')}
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Q: {t('extension.faq.q1')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              A: {t('extension.faq.a1')}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Q: {t('extension.faq.q2')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              A: {t('extension.faq.a2')}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Q: {t('extension.faq.q3')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              A: {t('extension.faq.a3')}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Q: {t('extension.faq.q4')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              A: {t('extension.faq.a4')}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Q: {t('extension.faq.q5')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              A: {t('extension.faq.a5')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
