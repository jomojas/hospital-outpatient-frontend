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
  // 1. 挂号收费科室
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
  ],

  // 2. 门诊医生 (保持为空)
  // 原因：医生使用 SimpleHeaderLayout 和 DoctorWorkspaceLayout，
  // 也就是"大厅"和"诊室"模式，不依赖全局左侧导航栏。
  OUTPATIENT: [],

  // 3. 检查科室 (Exam)
  EXAM: [
    {
      path: '/exam/entry',
      name: 'ExamEntry',
      label: '检查录入',
      icon: 'Edit'
    },
    {
      path: '/exam/record',
      name: 'ExamRecord',
      label: '检查记录',
      icon: 'Clock'
    }
  ],

  // 4. 检验科室 (Lab)
  LAB: [
    {
      path: '/lab/entry',
      name: 'LabEntry',
      label: '检验录入',
      icon: 'Edit'
    },
    {
      path: '/lab/record',
      name: 'LabRecord',
      label: '检验记录',
      icon: 'Clock'
    }
  ],

  // 5. 处置科室 (Disposal)
  DISPOSAL: [
    {
      path: '/disposal/entry',
      name: 'DisposalEntry',
      label: '处置录入',
      icon: 'Edit'
    },
    {
      path: '/disposal/record',
      name: 'DisposalRecord',
      label: '处置记录',
      icon: 'Clock'
    }
  ],

  // ✅ [新增] 药房管理员菜单配置
  PHARMACY: [
    {
      path: '/pharmacy/dispense',
      name: 'PharmacyDispense',
      label: '发药处理',
      icon: 'Box' // 使用 Box 图标代表药品/盒子
    },
    {
      path: '/pharmacy/record',
      name: 'PharmacyRecord',
      label: '发药记录',
      icon: 'Clock'
    }
  ]
}
