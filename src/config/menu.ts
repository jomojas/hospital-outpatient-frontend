// 菜单项类型定义
export interface MenuItem {
  path: string
  name: string
  label: string
  icon: string
  children?: MenuItem[]
}

// 不同科室的菜单配置
export const departmentMenus: Record<string, MenuItem[]> = {
  REGISTRATION: [
    {
      path: '/registration/register',
      name: 'Register',
      label: '挂号',
      icon: 'User'
    },
    {
      path: '/registration/refund',
      name: 'Refund',
      label: '退号',
      icon: 'Delete'
    },
    {
      path: '/registration/charge',
      name: 'Charge',
      label: '收费',
      icon: 'Money'
    },
    {
      path: '/registration/refund-charge',
      name: 'RefundCharge',
      label: '退费',
      icon: 'Minus'
    },
    {
      path: '/registration/fee-record',
      name: 'FeeRecord',
      label: '费用记录查询',
      icon: 'Search'
    }
  ]
  // 其他科室...
}
