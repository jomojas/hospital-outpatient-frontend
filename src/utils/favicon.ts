/**
 * Favicon 管理工具
 * 根据用户角色/部门动态切换浏览器标签页的图标
 */

// 角色到favicon的映射
const faviconMap: Record<string, string> = {
  REGISTRATION: '/icons/registration.svg',
  OUTPATIENT: '/icons/outpatient.svg',
  PHARMACY: '/icons/pharmacy.svg',
  EXAM: '/icons/exam.svg',
  LAB: '/icons/lab.svg',
  DISPOSAL: '/icons/disposal.svg',
  INFORMATION: '/icons/information.svg',
  ADMIN: '/icons/admin.svg',
  LOGIN: '/icons/login.svg',
  DEFAULT: '/icons/login.svg'
}

/**
 * 获取指定角色的favicon路径
 */
export function getFaviconPath(departmentType: string): string {
  return faviconMap[departmentType] || faviconMap.DEFAULT
}

/**
 * 设置favicon
 */
export function setFavicon(faviconPath: string): void {
  // 查找现有的favicon link标签
  let faviconLink = document.querySelector(
    'link[rel="icon"]'
  ) as HTMLLinkElement

  if (!faviconLink) {
    // 如果不存在，创建新的link标签
    faviconLink = document.createElement('link')
    faviconLink.rel = 'icon'
    faviconLink.type = 'image/svg+xml'
    document.head.appendChild(faviconLink)
  }

  // 更新href，添加时间戳以确保浏览器刷新缓存
  const timestamp = new Date().getTime()
  faviconLink.href = `${faviconPath}?t=${timestamp}`
}

/**
 * 根据用户部门类型设置favicon
 */
export function setFaviconByDepartment(departmentType: string): void {
  const faviconPath = getFaviconPath(departmentType)
  setFavicon(faviconPath)
}

/**
 * 设置登录页的favicon
 */
export function setLoginFavicon(): void {
  setFavicon(faviconMap.LOGIN)
  // 同时更新document title
  document.title = '医院门诊 - 登录'
}

/**
 * 更新document title（显示用户部门信息）
 */
export function updatePageTitle(
  departmentType: string,
  departmentName: string
): void {
  const departmentDisplayMap: Record<string, string> = {
    REGISTRATION: '挂号收费',
    OUTPATIENT: '门诊医生',
    PHARMACY: '药房管理',
    EXAM: '体检科',
    LAB: '检验科',
    DISPOSAL: '处置科',
    INFORMATION: '患者信息',
    ADMIN: '系统管理'
  }

  const displayName = departmentDisplayMap[departmentType] || departmentName
  document.title = `医院门诊 - ${displayName}`
}
