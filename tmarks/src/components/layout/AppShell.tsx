import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  User,
  Layers
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export function AppShell() {
  const { t } = useTranslation('common')
  const { theme, colorTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  // 判断当前是否在标签页组页面
  const isOnTabGroupsPage = location.pathname.startsWith('/tab')

  // 切换按钮点击处理
  const handleToggleView = () => {
    if (isOnTabGroupsPage) {
      navigate('/')
    } else {
      navigate('/tab')
    }
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}} data-theme={theme} data-color-theme={colorTheme}>
      {/* 玻璃磨砂导航栏 */}
      <header className="h-16 sm:h-20 sticky top-0 z-50 backdrop-filter backdrop-blur-xl bg-card/80 border-b border-border/50 shadow-float flex items-center">
        <div className="w-full mx-auto px-3 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-200 focus:outline-none"
            title={t('nav.home')}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-float">
              <BookOpen
                className="w-5 h-5 sm:w-7 sm:h-7"
                style={{color: 'var(--foreground)'}}
              />
            </div>
            <div className="block text-left">
              <h1 className="text-lg sm:text-2xl font-bold" style={{color: 'var(--primary)'}}>
                TMarks
              </h1>
              <p className="text-xs font-medium hidden sm:block" style={{color: 'var(--muted-foreground)'}}>
                {isOnTabGroupsPage ? t('nav.manageTabGroups') : t('nav.smartBookmarkManagement')}
              </p>
            </div>
          </button>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-2">
            {/* 书签/标签页组切换按钮 - 有容器 */}
            <button
              onClick={handleToggleView}
              className="hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 bg-card hover:bg-primary/5 active:scale-95 text-foreground shadow-sm hover:shadow-md"
              title={isOnTabGroupsPage ? t('nav.switchToBookmarks') : t('nav.switchToTabGroups')}
            >
              {isOnTabGroupsPage ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </button>

            {/* 主题切换按钮 - 无容器 */}
            <button
              onClick={() => useThemeStore.getState().toggleTheme()}
              className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 hover:bg-primary/10 text-foreground"
              title={theme === 'light' ? t('nav.toggleDarkMode') : t('nav.toggleLightMode')}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* 颜色主题切换按钮 - 无容器 */}
            <button
              onClick={() => useThemeStore.getState().setColorTheme(colorTheme === 'default' ? 'orange' : 'default')}
              className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 hover:bg-primary/10 text-foreground"
              title={colorTheme === 'default' ? t('nav.switchToOrange') : t('nav.switchToDefault')}
            >
              {colorTheme === 'default' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              )}
            </button>

            {/* 用户按钮 - 有容器 */}
            {user && (
              <button
                onClick={() => navigate('/settings/general')}
                className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 bg-card hover:bg-primary/5 active:scale-95 text-foreground shadow-sm hover:shadow-md"
                title={t('nav.userSettings', { username: user.username })}
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区 - 居中容器 */}
      <main className="w-full pb-16 sm:pb-6 pt-3 sm:pt-6 flex flex-col min-h-0 flex-1 bg-muted/30">
        <div className="mx-auto w-full px-3 sm:px-6" style={{ maxWidth: '1000px' }}>
          <Outlet />
        </div>
      </main>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  )
}
