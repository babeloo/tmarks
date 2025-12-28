import { useTranslation } from 'react-i18next'
import { tabGroupsService } from '@/services/tab-groups'
import type { TabGroup } from '@/lib/types'
import { useDialogStore } from '@/stores/dialogStore'

export interface TabGroupMenuActions {
  onOpenInNewWindow: (group: TabGroup) => void
  onOpenInCurrentWindow: (group: TabGroup) => void
  onOpenInIncognito: (group: TabGroup) => void
  onRename: (group: TabGroup) => void
  onShare: (group: TabGroup) => void
  onCopyToClipboard: (group: TabGroup) => void
  onCreateFolderAbove: (group: TabGroup) => void
  onCreateFolderInside: (group: TabGroup) => void
  onCreateFolderBelow: (group: TabGroup) => void
  onPinToTop: (group: TabGroup) => void
  onRemoveDuplicates: (group: TabGroup) => void
  onLock: (group: TabGroup) => void
  onMove: (group: TabGroup) => Promise<void>
  onMoveToTrash: (group: TabGroup) => void
}

interface UseTabGroupMenuProps {
  onRefresh?: () => Promise<void>
  onStartRename: (groupId: string, title: string) => void
  onOpenMoveDialog?: (group: TabGroup) => void
}

export function useTabGroupMenu({ onRefresh, onStartRename, onOpenMoveDialog }: UseTabGroupMenuProps): TabGroupMenuActions {
  const { t } = useTranslation('tabGroups')
  const dialog = useDialogStore.getState()

  // 打开所有标签页
  const openAllTabs = async (group: TabGroup, mode: 'new' | 'current' | 'incognito') => {
    if (!group.items || group.items.length === 0) {
      await dialog.alert({ message: t('message.noTabsToOpen'), type: 'info' })
      return
    }

    const modeText = t(`openMode.${mode === 'new' ? 'newWindow' : mode === 'current' ? 'currentWindow' : 'incognito'}`)
    
    // 确认打开多个标签页
    if (group.items.length > 5) {
      const confirmed = await dialog.confirm({
        title: t('confirm.openMultipleTabs'),
        message: t('confirm.openTabsMessage', { mode: modeText, count: group.items.length }),
        type: 'warning',
      })
      if (!confirmed) {
        return
      }
    }

    // 对于"当前窗口"模式，使用传统方法
    if (mode === 'current' && group.items && group.items.length > 0) {
      const firstItem = group.items[0]
      if (firstItem) {
        window.location.href = firstItem.url
      }
      return
    }

    try {
      // 获取当前主题颜色
    const root = document.documentElement
    const primary = getComputedStyle(root).getPropertyValue('--primary').trim()
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim()
    const card = getComputedStyle(root).getPropertyValue('--card').trim()
    const muted = getComputedStyle(root).getPropertyValue('--muted').trim()
    const success = getComputedStyle(root).getPropertyValue('--success').trim()
    const destructive = getComputedStyle(root).getPropertyValue('--destructive').trim()
    const foreground = getComputedStyle(root).getPropertyValue('--foreground').trim()

    // 获取翻译文本
    const i18nTitle = t('tabOpener.title')
    const i18nHeading = t('tabOpener.heading')
    const i18nPreparing = t('tabOpener.preparing')
    const i18nOpening = t('tabOpener.opening')
    const i18nSuccessPartial = t('tabOpener.successPartial', { opened: 0, failed: 0 }).replace('0', "' + opened + '").replace('0', "' + failed + '")
    const i18nSuccessAll = t('tabOpener.successAll', { count: 0 }).replace('0', "' + opened + '")
    const i18nCloseWindow = t('tabOpener.closeWindow')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${i18nTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
      color: ${foreground};
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: ${card};
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      box-shadow: 0 8px 32px hsl(0 0% 0% / 0.15);
      max-width: 600px;
    }
    h1 { margin: 0 0 1rem 0; font-size: 2rem; }
    .progress {
      margin: 2rem 0;
      font-size: 1.5rem;
      font-weight: bold;
    }
    .status {
      margin: 1rem 0;
      padding: 1rem;
      background: ${muted};
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }
    .links {
      margin-top: 2rem;
      text-align: left;
      max-height: 300px;
      overflow-y: auto;
      padding: 1rem;
      background: ${muted};
      border-radius: 0.5rem;
    }
    .link-item {
      padding: 0.5rem;
      margin: 0.25rem 0;
      background: ${card};
      border-radius: 0.25rem;
      font-size: 0.85rem;
      word-break: break-all;
    }
    .link-item.opened {
      background: color-mix(in srgb, ${success} 30%, transparent);
    }
    .link-item.failed {
      background: color-mix(in srgb, ${destructive} 30%, transparent);
    }
    button {
      margin-top: 1rem;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      background: ${primary};
      color: ${foreground};
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${i18nHeading}</h1>
    <div class="progress">
      <span id="current">0</span> / <span id="total">${group.items.length}</span>
    </div>
    <div class="status" id="status">${i18nPreparing}</div>
    <div class="links" id="links"></div>
    <button onclick="window.close()" style="display:none" id="closeBtn">${i18nCloseWindow}</button>
  </div>
  <script>
    const urls = ${JSON.stringify(group.items.map((item) => ({ url: item.url, title: item.title })))};
    const i18nOpening = '${i18nOpening}';
    let opened = 0;
    let failed = 0;
    
    const linksContainer = document.getElementById('links');
    const statusEl = document.getElementById('status');
    const currentEl = document.getElementById('current');
    const closeBtnEl = document.getElementById('closeBtn');
    
    urls.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'link-item';
      div.id = 'link-' + index;
      div.textContent = (index + 1) + '. ' + item.title;
      linksContainer.appendChild(div);
    });
    
    async function openTabs() {
      for (let i = 0; i < urls.length; i++) {
        const item = urls[i];
        const linkEl = document.getElementById('link-' + i);
        
        try {
          statusEl.textContent = i18nOpening + item.title;
          const newWindow = window.open(item.url, '_blank', 'noopener,noreferrer');
          
          if (newWindow) {
            opened++;
            linkEl.className = 'link-item opened';
          } else {
            failed++;
            linkEl.className = 'link-item failed';
          }
        } catch (error) {
          console.error('Failed to open:', item.url, error);
          failed++;
          linkEl.className = 'link-item failed';
        }
        
        currentEl.textContent = (i + 1);
        
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (failed > 0) {
        statusEl.textContent = '${i18nSuccessPartial}';
        statusEl.style.background = 'var(--warning)';
        statusEl.style.opacity = '0.3';
      } else {
        statusEl.textContent = '${i18nSuccessAll}';
        statusEl.style.background = 'var(--success)';
        statusEl.style.opacity = '0.3';
      }
      
      closeBtnEl.style.display = 'block';
    }
    
    setTimeout(openTabs, 500);
  </script>
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const newWindow = window.open(url, '_blank', 'width=800,height=600')

      if (newWindow) {
        await dialog.alert({ message: t('message.tabManagerOpened', { mode: modeText }), type: 'success' })
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      } else {
        await dialog.alert({ message: t('message.cannotOpenWindow'), type: 'error' })
      }
    } catch (error) {
      console.error('Failed to open tabs:', error)
      await dialog.alert({ message: t('message.openTabsFailed'), type: 'error' })
    }
  }

  const onOpenInNewWindow = (group: TabGroup) => {
    openAllTabs(group, 'new')
  }

  const onOpenInCurrentWindow = (group: TabGroup) => {
    openAllTabs(group, 'current')
  }

  const onOpenInIncognito = (group: TabGroup) => {
    openAllTabs(group, 'incognito')
  }

  const onRename = (group: TabGroup) => {
    onStartRename(group.id, group.title)
  }

  const onShare = async (group: TabGroup) => {
    try {
      const shareData = await tabGroupsService.createShare(group.id, {
        is_public: true,
        expires_in_days: 30
      })

      const shareUrl = shareData.share_url

      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(shareUrl)
        await dialog.alert({
          title: t('share.linkCreated'),
          message: t('share.linkCreatedMessage', { url: shareUrl }),
          type: 'success',
        })
      } catch {
        await dialog.alert({
          title: t('share.linkCreated'),
          message: t('share.linkCreatedManualCopy', { url: shareUrl }),
          type: 'warning',
        })
      }
    } catch (error) {
      console.error('Failed to create share:', error)
      await dialog.alert({ message: t('share.createFailed'), type: 'error' })
    }
  }

  const onCopyToClipboard = async (group: TabGroup) => {
    if (!group.items || group.items.length === 0) {
      await dialog.alert({ message: t('message.noTabsInGroup'), type: 'info' })
      return
    }

    const text = group.items.map(item => `${item.title}\n${item.url}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      await dialog.alert({ message: t('message.copiedToClipboard'), type: 'success' })
    } catch (err) {
      console.error('Failed to copy:', err)
      await dialog.alert({ message: t('message.copyFailed'), type: 'error' })
    }
  }

  const onCreateFolderAbove = async (group: TabGroup) => {
    try {
      await tabGroupsService.createFolder(t('folder.newFolder'), group.parent_id)
      await onRefresh?.()
    } catch (err) {
      console.error('Failed to create folder:', err)
      await dialog.alert({ message: t('message.createFolderFailed'), type: 'error' })
    }
  }

  const onCreateFolderInside = async (group: TabGroup) => {
    if (group.is_folder !== 1) return
    try {
      await tabGroupsService.createFolder(t('folder.newFolder'), group.id)
      await onRefresh?.()
    } catch (err) {
      console.error('Failed to create folder:', err)
      await dialog.alert({ message: t('message.createFolderFailed'), type: 'error' })
    }
  }

  const onCreateFolderBelow = async (group: TabGroup) => {
    try {
      await tabGroupsService.createFolder(t('folder.newFolder'), group.parent_id)
      await onRefresh?.()
    } catch (err) {
      console.error('Failed to create folder:', err)
      await dialog.alert({ message: t('message.createFolderFailed'), type: 'error' })
    }
  }

  const onPinToTop = async (group: TabGroup) => {
    try {
      // 将该项的 position 设置为 -1（最小值），这样排序时会在最前面
      await tabGroupsService.updateTabGroup(group.id, {
        position: -1
      })
      await onRefresh?.()
    } catch (err) {
      console.error('Failed to pin to top:', err)
      await dialog.alert({ message: t('message.pinFailed'), type: 'error' })
    }
  }

  const onRemoveDuplicates = async (group: TabGroup) => {
    if (!group.items || group.items.length === 0) return

    const seen = new Set<string>()
    const duplicates: string[] = []

    group.items.forEach(item => {
      if (seen.has(item.url)) {
        duplicates.push(item.id)
      } else {
        seen.add(item.url)
      }
    })

    if (duplicates.length === 0) {
      await dialog.alert({ message: t('message.noDuplicates'), type: 'info' })
      return
    }

    const confirmed = await dialog.confirm({
      title: t('confirm.removeDuplicates'),
      message: t('confirm.removeDuplicatesMessage', { count: duplicates.length }),
      type: 'warning',
    })

    if (confirmed) {
      try {
        await Promise.all(duplicates.map(id => tabGroupsService.deleteTabGroupItem(id)))
        await onRefresh?.()
        await dialog.alert({ message: t('message.duplicatesRemoved', { count: duplicates.length }), type: 'success' })
      } catch (err) {
        console.error('Failed to remove duplicates:', err)
        await dialog.alert({ message: t('message.deleteFailed'), type: 'error' })
      }
    }
  }

  const onLock = async (group: TabGroup) => {
    // 锁定功能：使用 tags 字段存储锁定状态
    try {
      const currentTags = group.tags || []
      const isLocked = currentTags.includes('__locked__')

      let newTags: string[]
      if (isLocked) {
        // 解锁：移除 __locked__ 标签
        newTags = currentTags.filter(tag => tag !== '__locked__')
      } else {
        // 锁定：添加 __locked__ 标签
        newTags = [...currentTags, '__locked__']
      }

      await tabGroupsService.updateTabGroup(group.id, {
        tags: newTags
      })
      await onRefresh?.()
    } catch (err) {
      console.error('Failed to lock/unlock:', err)
      await dialog.alert({ message: t('message.operationFailed'), type: 'error' })
    }
  }

  const onMove = async (group: TabGroup) => {
    if (onOpenMoveDialog) {
      onOpenMoveDialog(group)
    } else {
      await dialog.alert({ message: t('message.moveFunctionDeveloping'), type: 'info' })
    }
  }

  const onMoveToTrash = async (group: TabGroup) => {
    const confirmed = await dialog.confirm({
      title: t('confirm.deleteGroup'),
      message: t('confirm.deleteGroupMessage', { title: group.title }),
      type: 'warning',
    })
    if (!confirmed) return

    try {
      await tabGroupsService.deleteTabGroup(group.id)
      await onRefresh?.()
    } catch (err) {
      console.error('Failed to delete:', err)
      await dialog.alert({ message: t('message.deleteFailed'), type: 'error' })
    }
  }

  return {
    onOpenInNewWindow,
    onOpenInCurrentWindow,
    onOpenInIncognito,
    onRename,
    onShare,
    onCopyToClipboard,
    onCreateFolderAbove,
    onCreateFolderInside,
    onCreateFolderBelow,
    onPinToTop,
    onRemoveDuplicates,
    onLock,
    onMove,
    onMoveToTrash,
  }
}

