# TMarks 国际化（i18n）实施方案

## 一、项目背景

TMarks 是一个基于 React 18 + TypeScript 的书签管理 Web 应用，目前所有界面文字均为中文硬编码。为了支持多语言用户，需要引入国际化方案，使应用能够根据用户偏好显示不同语言的界面。

## 二、技术选型

### 推荐方案：react-i18next

选择理由：

1. 生态成熟度高，是 React 生态中使用最广泛的 i18n 解决方案
2. 与 React Hooks 深度集成，提供 useTranslation 等便捷 API
3. 完善的 TypeScript 支持，可实现翻译键的类型检查和自动补全
4. 支持命名空间，便于按模块组织翻译文件
5. 支持语言包懒加载，优化首屏加载性能
6. 内置语言检测插件，可自动识别浏览器语言
7. 支持插值、复数、上下文等高级特性
8. 项目已使用 Zustand 进行状态管理，可方便地实现语言偏好持久化

### 需要安装的依赖

- i18next：核心库
- react-i18next：React 绑定
- i18next-browser-languagedetector：浏览器语言检测


## 三、现有文字分布分析

### 3.1 文字类型分类

经过对项目代码的全面扫描，界面文字可分为以下几类：

**UI 标签类**
- 按钮文字：确定、取消、保存、删除、编辑、添加等
- 导航标签：书签、标签页组、设置、关于等
- 表单标签：用户名、密码、标题、描述等
- 表头文字：名称、创建时间、操作等

**提示信息类**
- 成功提示：操作成功、保存成功、删除成功等
- 错误提示：操作失败、网络错误、验证失败等
- 确认提示：确定要删除吗、确定要退出吗等
- 警告提示：此操作不可撤销等

**占位符类**
- 输入框占位符：请输入用户名、请输入搜索关键词等
- 搜索框提示：搜索书签、搜索标签等

**空状态类**
- 无数据提示：还没有书签、还没有标签页组等
- 搜索无结果：没有找到匹配的内容等

**动态文字类**
- 计数文字：已选 N 个书签、共 N 条记录等
- 操作反馈：成功删除 N 个书签、成功导入 N 条数据等
- 时间相关：N 分钟前、N 天前等

**说明文字类**
- 功能描述：使用浏览器扩展收集标签页等
- 帮助提示：安装浏览器扩展可以快速收集标签页等
- 版权信息：版权所有等

### 3.2 按模块分布

**认证模块 (auth/)**
- 登录页面：欢迎回来、登录到 TMarks、用户名或邮箱、密码、记住我、立即登录、还没有账号、立即注册等
- 注册页面：创建账号、用户名、邮箱、密码、确认密码、立即注册、已有账号、立即登录等

**书签模块 (bookmarks/)**
- 列表页面：书签列表、搜索书签、排序、筛选等
- 表单组件：添加书签、编辑书签、标题、网址、描述、标签等
- 批量操作：已选 N 个书签、置顶、归档、删除、标签、取消等
- 空状态：还没有书签、开始添加您的第一个书签等

**标签页组模块 (tab-groups/)**
- 列表页面：标签页组、搜索、排序等
- 详情页面：标签页列表、添加标签页等
- 分享功能：分享标签页组、分享链接、复制、已复制、删除分享等
- 空状态：还没有标签页组、使用浏览器扩展收集标签页等

**标签模块 (tags/)**
- 标签列表：标签管理、添加标签、编辑标签等
- 标签表单：标签名称、标签颜色等

**设置模块 (settings/)**
- 通用设置：主题、语言、显示偏好等
- 导入导出：导入书签、导出书签、选择格式、选择文件等
- API 密钥：API 密钥管理、创建密钥、删除密钥等
- 分享设置：分享管理、公开分享等

**通用组件 (common/)**
- 确认对话框：确认、确定、取消、警告、错误、成功等
- 提示对话框：提示、知道了等
- 加载状态：加载中、正在处理等
- 分页组件：上一页、下一页、共 N 页等

**导入导出模块 (import-export/)**
- 格式选择：HTML、JSON、浏览器导出的书签文件、TMarks 标准格式等
- 导入选项：跳过重复、创建标签、保留时间、文件夹转标签等
- 进度显示：正在验证文件、正在导入、导入完成等
- 结果显示：成功导入、导入失败、跳过重复、总计处理等
- AI 整理：启用 AI 智能整理、AI 自动生成标签和描述等

**分享模块 (share/)**
- 公开分享页面：分享的标签页组、浏览次数等

**信息页面 (info/)**
- 关于页面：关于 TMarks、版本信息等
- 帮助页面：使用帮助、常见问题等
- 隐私政策：隐私政策内容
- 服务条款：服务条款内容

### 3.3 后端错误消息

在 functions 目录中，API 接口返回的错误消息目前也是中文硬编码，例如：
- 用户名或密码错误
- 登录失败，请稍后重试
- 创建分享链接失败
- 删除失败
- 无法复制到剪贴板

这部分需要特别处理，建议采用错误码机制，由前端根据错误码映射对应语言的错误消息。


## 四、目录结构设计

建议在 src 目录下创建 i18n 目录，采用按语言和命名空间组织的结构：

```
src/
├── i18n/
│   ├── index.ts              # i18n 初始化配置
│   ├── types.ts              # TypeScript 类型定义
│   └── locales/
│       ├── zh-CN/            # 简体中文
│       │   ├── common.json   # 通用文字
│       │   ├── auth.json     # 认证模块
│       │   ├── bookmarks.json # 书签模块
│       │   ├── tabGroups.json # 标签页组模块
│       │   ├── tags.json     # 标签模块
│       │   ├── settings.json # 设置模块
│       │   ├── import.json   # 导入导出模块
│       │   ├── share.json    # 分享模块
│       │   └── errors.json   # 错误消息
│       └── en/               # 英文
│           ├── common.json
│           ├── auth.json
│           ├── bookmarks.json
│           ├── tabGroups.json
│           ├── tags.json
│           ├── settings.json
│           ├── import.json
│           ├── share.json
│           └── errors.json
```

### 命名空间划分说明

- common：通用文字，包括按钮、对话框、加载状态、分页等被多处复用的文字
- auth：登录、注册相关文字
- bookmarks：书签管理相关文字
- tabGroups：标签页组管理相关文字
- tags：标签管理相关文字
- settings：设置页面相关文字
- import：导入导出功能相关文字
- share：分享功能相关文字
- errors：错误消息，与后端错误码对应

## 五、实施步骤

### 第一阶段：基础设施搭建

1. 安装必要的 npm 依赖包
2. 创建 i18n 目录结构和配置文件
3. 在应用入口处初始化 i18n
4. 创建语言切换的 hook 和 UI 组件
5. 实现语言偏好的本地存储持久化
6. 配置 TypeScript 类型支持

### 第二阶段：通用组件迁移

优先迁移 common 目录下的通用组件，因为这些组件被大量复用，迁移后影响面最广：

1. ConfirmDialog 确认对话框
2. AlertDialog 提示对话框
3. Toast 消息提示
4. ErrorDisplay 错误显示
5. ProgressIndicator 进度指示器
6. PaginationFooter 分页组件
7. 其他通用组件

### 第三阶段：认证模块迁移

迁移 auth 目录下的页面，这部分相对独立，便于测试：

1. LoginPage 登录页面
2. RegisterPage 注册页面
3. ProtectedRoute 路由守卫中的提示文字

### 第四阶段：核心功能模块迁移

按以下顺序迁移核心功能模块：

1. 书签模块 (bookmarks/)
   - BookmarkListContainer
   - BookmarkForm
   - BatchActionBar
   - 各种视图组件

2. 标签页组模块 (tab-groups/)
   - TabGroupsPage
   - TabGroupDetailPage
   - ShareDialog
   - EmptyState
   - 其他组件

3. 标签模块 (tags/)
   - TagSidebar
   - TagFormModal
   - TagManageModal

### 第五阶段：设置和其他模块迁移

1. 设置模块 (settings/)
   - GeneralSettingsPage
   - ImportExportPage
   - ApiKeysPage
   - 其他设置页面

2. 导入导出模块 (import-export/)
   - ImportSection
   - ExportSection
   - AiOrganizeStep
   - AiPreviewStep

3. 分享模块 (share/)
   - PublicSharePage

4. 信息页面 (info/)
   - AboutPage
   - HelpPage
   - PrivacyPage
   - TermsPage

### 第六阶段：后端错误消息处理

1. 定义统一的错误码枚举
2. 修改后端 API 返回错误码而非中文消息
3. 在前端 errors.json 中维护错误码与消息的映射
4. 修改前端错误处理逻辑，根据错误码显示对应语言的消息

### 第七阶段：完善和优化

1. 集成 date-fns 的本地化支持，处理日期时间格式
2. 添加语言包懒加载，优化加载性能
3. 添加更多语言支持（如繁体中文、日文等）
4. 编写国际化相关的开发文档
5. 建立翻译文件的维护流程


## 六、翻译键命名规范

为保持翻译文件的一致性和可维护性，建议采用以下命名规范：

### 基本原则

1. 使用小驼峰命名法
2. 按功能或位置分组，使用点号分隔层级
3. 动态内容使用插值变量，变量名使用双花括号包裹
4. 复数形式使用 _one、_other 后缀或 count 插值

### 命名示例

- 按钮：button.confirm、button.cancel、button.save、button.delete
- 标签：label.username、label.password、label.title
- 占位符：placeholder.searchBookmarks、placeholder.enterUsername
- 提示：message.saveSuccess、message.deleteFailed
- 确认：confirm.deleteTitle、confirm.deleteMessage
- 空状态：empty.noBookmarks、empty.noResults
- 动态文字：selected.count（使用 {{count}} 插值）

## 七、注意事项

### 7.1 动态文字处理

对于包含变量的动态文字，需要使用 i18next 的插值功能。例如「已选 5 个书签」应设计为「已选 {{count}} 个书签」，在使用时传入 count 参数。

### 7.2 复数处理

不同语言的复数规则不同。英文有单复数之分，而中文通常不区分。i18next 提供了完善的复数处理机制，需要根据目标语言的特点正确配置。

### 7.3 日期时间格式

项目使用 date-fns 处理日期时间，该库提供了本地化支持。在切换语言时，需要同步切换 date-fns 的 locale 配置，确保日期时间显示格式符合当地习惯。

### 7.4 组件默认值

部分组件的 props 有中文默认值，如 ConfirmDialog 的 title 默认为「确认」。迁移时需要将这些默认值改为翻译键，并在组件内部调用翻译函数。

### 7.5 后端消息

后端 API 返回的错误消息建议改为返回错误码，由前端负责根据错误码和当前语言显示对应的消息。这样可以保持后端的语言无关性，也便于前端统一管理所有用户可见的文字。

### 7.6 SEO 考虑

如果未来需要支持服务端渲染或需要考虑 SEO，需要额外处理语言标签、URL 结构等问题。当前作为 SPA 应用，暂不需要考虑这些。

### 7.7 翻译文件维护

建议建立翻译文件的维护流程：
- 新增功能时同步添加翻译键
- 定期检查未使用的翻译键并清理
- 使用工具检测缺失的翻译
- 考虑引入翻译管理平台（如 Crowdin、Lokalise）便于协作翻译


## 八、工作量估算

根据代码分析，预估各阶段工作量如下：

| 阶段 | 预估工时 | 说明 |
|------|----------|------|
| 基础设施搭建 | 2-3 小时 | 配置简单，主要是目录结构设计 |
| 通用组件迁移 | 3-4 小时 | 组件数量适中，文字相对集中 |
| 认证模块迁移 | 1-2 小时 | 页面较少，文字量不大 |
| 核心功能模块迁移 | 6-8 小时 | 组件较多，文字分散 |
| 设置和其他模块迁移 | 4-5 小时 | 页面较多，但结构相似 |
| 后端错误消息处理 | 2-3 小时 | 需要前后端配合 |
| 完善和优化 | 2-3 小时 | 日期格式、懒加载等 |

总计预估：20-28 小时

## 九、后续扩展

完成基础的中英文支持后，可以考虑以下扩展：

1. 添加更多语言：繁体中文、日文、韩文等
2. 支持 RTL（从右到左）语言：阿拉伯文、希伯来文等
3. 引入翻译管理平台，便于非技术人员参与翻译
4. 添加语言包的版本管理和增量更新机制
5. 支持用户自定义翻译或翻译贡献

## 十、总结

本方案基于 react-i18next 为 TMarks 项目设计了完整的国际化实施路径。通过分阶段、分模块的迁移策略，可以在保证项目稳定性的前提下逐步完成国际化改造。建议从基础设施和通用组件开始，逐步扩展到各业务模块，最终实现完整的多语言支持。


## 十一、实施进度记录

### 已完成模块 ✅

#### 第一阶段：基础设施搭建
- [x] 安装 i18next、react-i18next、i18next-browser-languagedetector 依赖
- [x] 创建 i18n 目录结构和配置文件 (`src/i18n/index.ts`)
- [x] 创建 useLanguage hook (`src/hooks/useLanguage.ts`)
- [x] 创建语言切换组件 (`src/components/common/LanguageSelector.tsx`)
- [x] 创建 9 个命名空间的语言包文件（中英文）

#### 第二阶段：认证模块
- [x] LoginPage 登录页面
- [x] RegisterPage 注册页面

#### 第三阶段：通用组件
- [x] ConfirmDialog 确认对话框
- [x] AlertDialog 提示对话框
- [x] Toast 消息提示
- [x] LanguageSelector 语言选择器

#### 第四阶段：标签页组模块
- [x] TabGroupsPage 标签页组列表
- [x] TabGroupHeader 标签页组头部
- [x] TabGroupCard 标签页组卡片
- [x] TabGroupDetailPage 标签页组详情
- [x] ShareDialog 分享对话框
- [x] EmptyState 空状态组件

#### 第五阶段：标签模块
- [x] TagSidebar 标签侧边栏
- [x] TagFormModal 标签表单模态框
- [x] TagManageModal 标签管理模态框

#### 第六阶段：设置模块
- [x] GeneralSettingsPage 通用设置页面
- [x] LanguageSettingsTab 语言设置标签页

#### 第七阶段：导入导出模块
- [x] ImportSection 导入区块
- [x] ExportSection 导出区块
- [x] AiOrganizeStep AI 整理步骤

#### 第八阶段：信息页面
- [x] AboutPage 关于页面
- [x] HelpPage 帮助页面

#### 第九阶段：书签模块
- [x] BookmarkListContainer 书签列表容器
- [x] BookmarkForm 书签表单
- [x] BookmarkCardView 卡片视图
- [x] BookmarkListView 列表视图
- [x] BookmarkMinimalListView 精简列表视图
- [x] BookmarkTitleView 标题视图
- [x] BatchActionBar 批量操作栏
- [x] SnapshotViewer 快照查看器
- [x] BookmarksPage 书签主页面
- [x] BookmarkTrashPage 书签回收站页面

#### 第十阶段：布局组件
- [x] AppShell 应用外壳
- [x] MobileBottomNav 移动端底部导航

#### 第十一阶段：API 密钥模块
- [x] ApiKeyCard API 密钥卡片
- [x] CreateApiKeyModal 创建 API 密钥模态框
- [x] ApiKeyDetailModal API 密钥详情模态框

#### 语言包扩展
- [x] 添加 extension（扩展页面）翻译键
- [x] 添加 privacy（隐私政策）翻译键
- [x] 添加 terms（服务条款）翻译键
- [x] 添加 share（公开分享）翻译键
- [x] 添加 statistics（书签统计）翻译键
- [x] 添加 trash（书签回收站）翻译键
- [x] 添加 apiKey.detail（API密钥详情）翻译键

### 待完成模块 📋

#### 隐私政策和服务条款页面
- [ ] PrivacyPage 隐私政策页面（语言包已准备）
- [ ] TermsPage 服务条款页面（语言包已准备）

#### 后端错误消息
- [ ] 定义统一的错误码枚举
- [ ] 修改后端 API 返回错误码
- [ ] 前端错误码映射

### 已完成的额外模块 ✅

#### 分享模块
- [x] PublicSharePage 公开分享页面

#### 其他页面
- [x] BookmarkStatisticsPage 书签统计页面
- [x] ExtensionPage 插件页面

### 语言包文件清单

| 命名空间 | 中文文件 | 英文文件 | 状态 |
|---------|---------|---------|------|
| common | zh-CN/common.json | en/common.json | ✅ |
| auth | zh-CN/auth.json | en/auth.json | ✅ |
| bookmarks | zh-CN/bookmarks.json | en/bookmarks.json | ✅ |
| tabGroups | zh-CN/tabGroups.json | en/tabGroups.json | ✅ |
| tags | zh-CN/tags.json | en/tags.json | ✅ |
| settings | zh-CN/settings.json | en/settings.json | ✅ |
| import | zh-CN/import.json | en/import.json | ✅ |
| info | zh-CN/info.json | en/info.json | ✅ |
| errors | zh-CN/errors.json | en/errors.json | ✅ |
| share | zh-CN/share.json | en/share.json | ✅ |

### 更新日期
- 2024-12-26: 完成书签模块、布局组件、API 密钥模块的国际化改造
- 2024-12-26: 完成分享模块、统计页面、回收站页面、扩展页面的国际化改造
- 2024-12-26: 添加 share 命名空间语言包
- 2024-12-26: 完成 BookmarkTrashPage、ApiKeyDetailModal 改造，添加剩余页面的语言包翻译键
- 2024-12-27: 完成 Stores、Hooks、Services、Lib 层的国际化改造
  - dialogStore.ts: 移除硬编码默认值
  - useTabGroupActions.ts: 添加 i18n 支持
  - useBatchActions.ts: 添加 i18n 支持
  - useTabGroupMenu.ts: 添加 i18n 支持
  - useTabGroupsData.ts: 添加 i18n 支持
  - services/share.ts: 使用 i18n 错误消息
  - lib/ai/models.ts: 使用 i18n 错误消息
  - lib/ai/constants.ts: 移除硬编码中文
  - shared/permissions.ts: 重构为使用 i18n key

### 前端 i18n 完成状态 ✅

前端 `tmarks/src` 目录下的所有 TypeScript/TSX 文件已完成国际化改造，不再有硬编码的中文字符串（除了 AI 提示词，这是有意保留的）。

### 待处理：后端 API 中文消息

以下后端文件仍包含中文消息，建议通过错误码机制处理：

| 文件 | 中文内容 |
|------|---------|
| functions/api/v1/change-password.ts | 错误消息、成功消息 |
| functions/api/v1/import.ts | "未分类" 标签名 |
| functions/api/v1/tab-groups/index.ts | "新文件夹" 默认名 |
| functions/api/tab/tab-groups/index.ts | "新文件夹" 默认名 |
| functions/lib/import-export/exporters/html-exporter.ts | "未分类" 文件夹名 |
| functions/lib/import-export/parsers/json-parser.ts | "书签栏"、"其他书签" |
| functions/lib/import-export/parsers/html-parser.ts | "未分类" |
