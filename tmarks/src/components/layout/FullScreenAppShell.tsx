import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  User,
  Layers
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ColorThemeSelector } from '@/components/common/ColorThemeSelector'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export function FullScreenAppShell() {
  const { t } = useTranslation('common')
  const { theme, colorTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const isOnTabGroupsPage = location.pathname.startsWith('/tab')

  const handleToggleView = () => {
    if (isOnTabGroupsPage) {
      navigate('/')
    } else {
      navigate('/tab')
    }
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}} data-theme={theme} data-color-theme={colorTheme}>
      <header className="h-16 sm:h-20 sticky top-0 z-50 backdrop-filter backdrop-blur-xl bg-card/80 border-b border-border/50 shadow-float flex items-center">
        <div className="w-full mx-auto px-3 sm:px-6 flex items-center justify-between">
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

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <button
              onClick={handleToggleView}
              className="hidden sm:flex btn btn-sm btn-ghost p-2"
              title={isOnTabGroupsPage ? t('nav.switchToBookmarks') : t('nav.switchToTabGroups')}
            >
              {isOnTabGroupsPage ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <Layers className="w-4 h-4" />
              )}
            </button>

            <ThemeToggle />
            <ColorThemeSelector />

            {user && (
              <button
                onClick={() => navigate('/settings/general')}
                className="btn btn-sm btn-ghost p-2"
                title={t('nav.userSettings', { username: user.username })}
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full pb-16 sm:pb-0 flex flex-col min-h-0 flex-1">
        <Outlet />
      </main>

      <MobileBottomNav />
    </div>
  )
}
