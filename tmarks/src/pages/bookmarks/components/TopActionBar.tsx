import { 
  CheckCircle,
  CheckSquare,
  LayoutGrid, 
  List, 
  AlignLeft, 
  Type, 
  Eye, 
  Lock, 
  Layers, 
  Calendar, 
  RefreshCw, 
  Bookmark as BookmarkIcon, 
  TrendingUp,
  Tag as TagIcon,
  Search,
  Plus,
  Trash2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ViewMode, VisibilityFilter } from '../hooks/useBookmarksState'
import type { SortOption } from '@/components/common/SortSelector'

function ViewModeIcon({ mode }: { mode: ViewMode }) {
  switch (mode) {
    case 'card':
      return <LayoutGrid className="w-4 h-4" />
    case 'list':
      return <List className="w-4 h-4" />
    case 'minimal':
      return <AlignLeft className="w-4 h-4" />
    case 'title':
      return <Type className="w-4 h-4" />
    default:
      return <LayoutGrid className="w-4 h-4" />
  }
}

function VisibilityIcon({ filter }: { filter: VisibilityFilter }) {
  switch (filter) {
    case 'public':
      return <Eye className="w-4 h-4" />
    case 'private':
      return <Lock className="w-4 h-4" />
    case 'all':
      return <Layers className="w-4 h-4" />
    default:
      return <Layers className="w-4 h-4" />
  }
}

function SortIcon({ sort }: { sort: SortOption }) {
  switch (sort) {
    case 'created':
      return <Calendar className="w-4 h-4" />
    case 'updated':
      return <RefreshCw className="w-4 h-4" />
    case 'pinned':
      return <BookmarkIcon className="w-4 h-4" />
    case 'popular':
      return <TrendingUp className="w-4 h-4" />
    default:
      return <Calendar className="w-4 h-4" />
  }
}

interface TopActionBarProps {
  searchMode: 'bookmark' | 'tag'
  setSearchMode: (mode: 'bookmark' | 'tag') => void
  searchKeyword: string
  setSearchKeyword: (keyword: string) => void
  sortBy: SortOption
  onSortByChange: () => void
  visibilityFilter: VisibilityFilter
  setVisibilityFilter: (filter: VisibilityFilter) => void
  viewMode: ViewMode
  onViewModeChange: () => void
  batchMode: boolean
  setBatchMode: (mode: boolean) => void
  setSelectedIds: (ids: string[]) => void
  onOpenForm: () => void
  setIsTagSidebarOpen: (open: boolean) => void
}

export function TopActionBar({
  searchMode,
  setSearchMode,
  searchKeyword,
  setSearchKeyword,
  sortBy,
  onSortByChange,
  visibilityFilter,
  setVisibilityFilter,
  viewMode,
  onViewModeChange,
  batchMode,
  setBatchMode,
  setSelectedIds,
  onOpenForm,
  setIsTagSidebarOpen,
}: TopActionBarProps) {
  const { t } = useTranslation('bookmarks')
  
  const getViewModeLabel = (mode: ViewMode) => t(`viewMode.${mode}`)
  const getSortLabel = (sort: SortOption) => t(`sort.${sort}`)
  const getVisibilityLabel = (filter: VisibilityFilter) => t(`filter.${filter}`)

  return (
    <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 w-full">
      <div className="p-4 sm:p-5 w-full">
        {/* Mobile: two-row layout */}
        <div className="flex flex-col gap-3 w-full lg:hidden">
          {/* Row 1: Tag drawer button + Search */}
          <div className="flex items-center gap-3 w-full">
            {/* Tag drawer button - mobile only */}
            <button
              onClick={() => setIsTagSidebarOpen(true)}
              className="group w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-card border border-border hover:border-primary/30 hover:bg-primary/5 active:scale-95 text-foreground shadow-sm hover:shadow-md flex-shrink-0"
              title={t('toolbar.openTags')}
              aria-label={t('toolbar.openTags')}
            >
              <TagIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </button>

            {/* Search box */}
            <div className="flex-1 min-w-0">
              <div className="relative w-full">
                {/* Search mode toggle */}
                <button
                  onClick={() => setSearchMode(searchMode === 'bookmark' ? 'tag' : 'bookmark')}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all hover:text-primary hover:scale-110"
                  title={searchMode === 'bookmark' ? t('toolbar.switchToTagSearch') : t('toolbar.switchToBookmarkSearch')}
                  aria-label={searchMode === 'bookmark' ? t('toolbar.switchToTagSearch') : t('toolbar.switchToBookmarkSearch')}
                >
                  {searchMode === 'bookmark' ? (
                    <BookmarkIcon className="w-5 h-5" />
                  ) : (
                    <TagIcon className="w-5 h-5" />
                  )}
                </button>

                {/* Search icon */}
                <Search className="absolute left-10 sm:left-12 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />

                {/* Search input */}
                <input
                  type="text"
                  className="input w-full !pl-16 sm:!pl-[4.5rem] h-11 sm:h-auto text-sm sm:text-base"
                  placeholder={searchMode === 'bookmark' ? t('search.placeholder') : t('search.tagPlaceholder')}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Action buttons - centered on mobile */}
          <div className="flex items-center gap-2 w-full justify-center">
            {/* Sort button */}
            <button
              onClick={onSortByChange}
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={`${getSortLabel(sortBy)} ${t('sort.clickToSwitch')}`}
              aria-label={`${getSortLabel(sortBy)} ${t('sort.clickToSwitch')}`}
              type="button"
            >
              <SortIcon sort={sortBy} />
            </button>

            {/* Visibility filter button */}
            <button
              onClick={() => {
                const nextFilter = visibilityFilter === 'all' 
                  ? 'public' 
                  : visibilityFilter === 'public' 
                    ? 'private' 
                    : 'all'
                setVisibilityFilter(nextFilter)
              }}
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={`${getVisibilityLabel(visibilityFilter)} ${t('filter.clickToSwitch')}`}
              aria-label={`${getVisibilityLabel(visibilityFilter)} ${t('filter.clickToSwitch')}`}
              type="button"
            >
              <VisibilityIcon filter={visibilityFilter} />
            </button>

            {/* View mode button */}
            <button
              onClick={onViewModeChange}
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={`${getViewModeLabel(viewMode)} ${t('viewMode.clickToSwitch')}`}
              aria-label={`${getViewModeLabel(viewMode)} ${t('viewMode.clickToSwitch')}`}
              type="button"
            >
              <ViewModeIcon mode={viewMode} />
            </button>

            {/* Batch mode button */}
            <button
              onClick={() => {
                setBatchMode(!batchMode)
                if (batchMode) {
                  setSelectedIds([])
                }
              }}
              className={`btn btn-sm p-2 flex-shrink-0 ${
                batchMode
                  ? 'btn-primary'
                  : 'btn-ghost'
              }`}
              title={batchMode ? t('toolbar.exitBatchMode') : t('toolbar.batchMode')}
              aria-label={batchMode ? t('toolbar.exitBatchMode') : t('toolbar.batchMode')}
              type="button"
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            {/* Trash button */}
            <Link
              to="/bookmarks/trash"
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={t('toolbar.trash')}
              aria-label={t('toolbar.trash')}
            >
              <Trash2 className="w-4 h-4" />
            </Link>

            {/* Add bookmark button */}
            <button
              onClick={onOpenForm}
              className="btn btn-sm btn-primary p-2 flex-shrink-0"
              title={t('toolbar.addBookmark')}
              aria-label={t('toolbar.addBookmark')}
              type="button"
            >
              <Plus className="w-4 h-4 transition-transform" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* PC: single-row layout */}
        <div className="hidden lg:flex items-center gap-3 w-full">
          {/* Search box */}
          <div className="flex-1 min-w-0">
            <div className="relative w-full">
              {/* Search mode toggle */}
              <button
                onClick={() => setSearchMode(searchMode === 'bookmark' ? 'tag' : 'bookmark')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all hover:text-primary hover:scale-110"
                title={searchMode === 'bookmark' ? t('toolbar.switchToTagSearch') : t('toolbar.switchToBookmarkSearch')}
                aria-label={searchMode === 'bookmark' ? t('toolbar.switchToTagSearch') : t('toolbar.switchToBookmarkSearch')}
              >
                {searchMode === 'bookmark' ? (
                  <BookmarkIcon className="w-5 h-5" />
                ) : (
                  <TagIcon className="w-5 h-5" />
                )}
              </button>

              {/* Search icon */}
              <Search className="absolute left-12 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />

              {/* Search input */}
              <input
                type="text"
                className="input w-full !pl-[4.5rem] text-base"
                placeholder={searchMode === 'bookmark' ? t('search.placeholder') : t('search.tagPlaceholder')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sort button */}
            <button
              onClick={onSortByChange}
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={`${getSortLabel(sortBy)} ${t('sort.clickToSwitch')}`}
              aria-label={`${getSortLabel(sortBy)} ${t('sort.clickToSwitch')}`}
              type="button"
            >
              <SortIcon sort={sortBy} />
            </button>

            {/* Visibility filter button */}
            <button
              onClick={() => setVisibilityFilter(visibilityFilter === 'all' ? 'public' : visibilityFilter === 'public' ? 'private' : 'all')}
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={`${getVisibilityLabel(visibilityFilter)} ${t('filter.clickToSwitch')}`}
              aria-label={`${getVisibilityLabel(visibilityFilter)} ${t('filter.clickToSwitch')}`}
              type="button"
            >
              <VisibilityIcon filter={visibilityFilter} />
            </button>

            {/* View mode button */}
            <button
              onClick={onViewModeChange}
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={`${getViewModeLabel(viewMode)} ${t('viewMode.clickToSwitch')}`}
              aria-label={`${getViewModeLabel(viewMode)} ${t('viewMode.clickToSwitch')}`}
              type="button"
            >
              <ViewModeIcon mode={viewMode} />
            </button>

            {/* Batch mode button */}
            <button
              onClick={() => {
                setBatchMode(!batchMode)
                if (batchMode) {
                  setSelectedIds([])
                }
              }}
              className={`btn btn-sm p-2 flex-shrink-0 ${
                batchMode ? 'btn-primary' : 'btn-ghost'
              }`}
              title={batchMode ? t('toolbar.exitBatchMode') : t('toolbar.batchMode')}
              aria-label={batchMode ? t('toolbar.exitBatchMode') : t('toolbar.batchMode')}
              type="button"
            >
              <CheckSquare className="w-5 h-5" />
            </button>

            {/* Trash button */}
            <Link
              to="/bookmarks/trash"
              className="btn btn-sm btn-ghost p-2 flex-shrink-0"
              title={t('toolbar.trash')}
              aria-label={t('toolbar.trash')}
            >
              <Trash2 className="w-5 h-5" />
            </Link>

            {/* Add bookmark button */}
            <button
              onClick={onOpenForm}
              className="btn btn-sm btn-primary p-2 flex-shrink-0"
              title={t('toolbar.addBookmark')}
              aria-label={t('toolbar.addBookmark')}
              type="button"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
