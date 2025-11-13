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
  ],

  // ✅ 门诊医生菜单配置
  OUTPATIENT: [
    {
      path: '/outpatient/patient-view',
      name: 'PatientView',
      label: '患者查看',
      icon: 'User'
    },
    {
      path: '/outpatient/medical-treatment',
      name: 'MedicalTreatment',
      label: '医生诊疗',
      icon: 'Stethoscope',
      children: [
        {
          path: '/outpatient/medical-treatment/case-homepage',
          name: 'CaseHomepage',
          label: '病案首页',
          icon: 'Document'
        },
        {
          path: '/outpatient/medical-treatment/examination-request',
          name: 'ExaminationRequest',
          label: '检查申请',
          icon: 'DocumentAdd'
        },
        {
          path: '/outpatient/medical-treatment/result-view',
          name: 'ResultView',
          label: '结果查看',
          icon: 'View'
        },
        {
          path: '/outpatient/medical-treatment/diagnosis-confirm',
          name: 'DiagnosisConfirm',
          label: '门诊确诊',
          icon: 'CircleCheck'
        },
        {
          path: '/outpatient/medical-treatment/prescription',
          name: 'Prescription',
          label: '开设处方',
          icon: 'EditPen'
        },
        {
          path: '/outpatient/medical-treatment/fee-inquiry',
          name: 'FeeInquiry',
          label: '费用查询',
          icon: 'Money'
        }
      ]
    },
    {
      path: '/outpatient/visit-records',
      name: 'VisitRecords',
      label: '看诊记录',
      icon: 'Notebook'
    }
  ]
}
