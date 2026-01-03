# 动态 Favicon 管理系统

## 功能说明

本系统为不同角色/部门提供自定义的浏览器标签页图标（Favicon）和页面标题。当用户登录后，系统会自动根据其部门类型切换对应的图标，在用户进行多标签页操作时能清晰地识别当前窗口的功能角色。

## 支持的角色/部门

| 部门类型     | 中文名称 | Favicon     | 颜色主题   |
| ------------ | -------- | ----------- | ---------- |
| REGISTRATION | 挂号收费 | 🎟️ 票据     | 蓝色渐变   |
| OUTPATIENT   | 门诊医生 | 👨‍⚕️ 医生     | 绿色渐变   |
| PHARMACY     | 药房管理 | 💊 药物     | 橙色渐变   |
| EXAM         | 体检科   | 🔬 仪器     | 灰色渐变   |
| LAB          | 检验科   | 🧪 试管     | 紫色渐变   |
| DISPOSAL     | 处置科   | 🏥 医疗工具 | 红色渐变   |
| INFORMATION  | 患者信息 | 📄 文件     | 青蓝色渐变 |
| ADMIN        | 系统管理 | ⚙️ 齿轮     | 紫色渐变   |
| LOGIN        | 登录页面 | 🔐 用户/锁  | 蓝色渐变   |

## 文件结构

```
src/
├── utils/
│   └── favicon.ts              # Favicon 管理工具函数
├── router/
│   └── index.ts                # 路由守卫集成
├── views/
│   └── Login/
│       └── index.vue           # 登录页面集成
├── App.vue                     # 应用初始化集成
└── main.ts                     # 主入口文件集成

public/
└── icons/
    ├── registration.svg        # 挂号收费图标
    ├── outpatient.svg          # 门诊医生图标
    ├── pharmacy.svg            # 药房管理图标
    ├── exam.svg                # 体检科图标
    ├── lab.svg                 # 检验科图标
    ├── disposal.svg            # 处置科图标
    ├── information.svg         # 患者信息图标
    ├── admin.svg               # 系统管理图标
    └── login.svg               # 登录页面图标
```

## API 文档

### `setFavicon(faviconPath: string): void`

设置指定路径的 favicon。

```typescript
import { setFavicon } from '@/utils/favicon'

// 设置登录页图标
setFavicon('/icons/login.svg')
```

**参数：**

- `faviconPath` - favicon 文件的相对路径

### `setFaviconByDepartment(departmentType: string): void`

根据部门类型设置 favicon（推荐使用）。

```typescript
import { setFaviconByDepartment } from '@/utils/favicon'

// 根据用户部门设置favicon
setFaviconByDepartment('OUTPATIENT') // 设置门诊医生图标
setFaviconByDepartment('PHARMACY') // 设置药房管理图标
```

**参数：**

- `departmentType` - 部门类型（REGISTRATION、OUTPATIENT、PHARMACY 等）

### `setLoginFavicon(): void`

设置登录页 favicon 和标题。

```typescript
import { setLoginFavicon } from '@/utils/favicon'

// 进入登录页时调用
setLoginFavicon()
```

### `updatePageTitle(departmentType: string, departmentName: string): void`

更新浏览器页面标题（显示在浏览器标签页中）。

```typescript
import { updatePageTitle } from '@/utils/favicon'

// 更新页面标题
updatePageTitle('OUTPATIENT', '门诊科室')
```

**参数：**

- `departmentType` - 部门类型
- `departmentName` - 部门名称（来自登录响应）

### `getFaviconPath(departmentType: string): string`

获取指定部门类型的 favicon 路径。

```typescript
import { getFaviconPath } from '@/utils/favicon'

const path = getFaviconPath('OUTPATIENT')
// 返回: '/icons/outpatient.svg'
```

## 集成说明

### 1. 登录时自动切换

用户登录成功后，[src/views/Login/index.vue](src/views/Login/index.vue) 会自动调用：

```typescript
setFaviconByDepartment(res.departmentType)
updatePageTitle(res.departmentType, res.departmentName)
```

### 2. 页面刷新时恢复

[src/App.vue](src/App.vue) 的 `onMounted` 钩子会检测登录状态，并恢复对应的 favicon：

```typescript
if (appStore.isLoggedIn() && appStore.loginData) {
  setFaviconByDepartment(appStore.loginData.departmentType)
  updatePageTitle(
    appStore.loginData.departmentType,
    appStore.loginData.departmentName
  )
} else {
  setLoginFavicon()
}
```

### 3. 路由切换时同步

[src/router/index.ts](src/router/index.ts) 的前置守卫会在路由变化时同步 favicon：

```typescript
router.beforeEach((to, _from, next) => {
  if (to.path === '/login') {
    setLoginFavicon()
  } else if (isLoggedIn && appStore.loginData) {
    setFaviconByDepartment(appStore.loginData.departmentType)
    updatePageTitle(
      appStore.loginData.departmentType,
      appStore.loginData.departmentName
    )
  }
  next()
})
```

## 自定义图标

如需修改或添加新的图标，只需：

1. 在 `public/icons/` 目录下添加新的 SVG 文件
2. 在 [src/utils/favicon.ts](src/utils/favicon.ts) 中的 `faviconMap` 添加映射：

```typescript
const faviconMap: Record<string, string> = {
  // ... 现有映射 ...
  YOUR_NEW_DEPARTMENT: '/icons/your-icon.svg'
}
```

## 样式指南

所有 Favicon 都采用 SVG 格式，具有以下特点：

- **尺寸：** 100x100 viewBox（浏览器会自动缩放）
- **设计：** 简洁、易于识别的图标
- **配色：** 与部门功能相关的渐变色
- **边距：** 保留一定的安全区域

建议使用在线 SVG 编辑工具（如 Figma、Inkscape）进行编辑。

## 浏览器兼容性

| 浏览器  | 支持             |
| ------- | ---------------- |
| Chrome  | ✅ 完全支持      |
| Firefox | ✅ 完全支持      |
| Safari  | ✅ 完全支持      |
| Edge    | ✅ 完全支持      |
| IE 11   | ⚠️ 需要 polyfill |

## 注意事项

1. **缓存问题：** 为了避免浏览器缓存旧 favicon，每次设置时会添加时间戳查询参数
2. **安全性：** Favicon 路径应相对于网站根目录（`/` 开头）
3. **性能：** SVG favicon 体积小，加载快，不会影响应用性能

## 测试

开发时可以通过以下方式测试：

1. 启动开发服务器：`npm run dev`
2. 访问登录页面，观察浏览器标签页图标是否为登录页图标
3. 使用不同部门的账号登录，验证图标是否正确切换
4. 刷新页面，确认图标保持一致
5. 打开多个标签页，快速切换验证图标清晰可辨

## 故障排查

### 图标不显示

1. 检查 `public/icons/` 目录下的 SVG 文件是否存在
2. 检查 [src/utils/favicon.ts](src/utils/favicon.ts) 中的路径映射是否正确
3. 清除浏览器缓存或使用隐私/无痕浏览模式测试

### 图标不切换

1. 检查登录是否成功，确认 `appStore.loginData` 包含 `departmentType`
2. 查看浏览器控制台是否有错误信息
3. 检查路由守卫是否正常运行

### 页面刷新后图标恢复不正确

1. 确认 sessionStorage 中的登录数据完整
2. 检查 [src/App.vue](src/App.vue) 中的 `onMounted` 钩子是否执行
3. 清除 sessionStorage 重新登录测试
