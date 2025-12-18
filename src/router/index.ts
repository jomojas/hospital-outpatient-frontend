import { createRouter, createWebHistory, RouterView } from 'vue-router'

import MainLayout from '@/components/MainLayout.vue'
// 引入新布局
import SimpleHeaderLayout from '@/components/SimpleHeaderLayout.vue'
import DoctorWorkspaceLayout from '@/components/DoctorWorkspaceLayout.vue'

// 2. 医技通用组件 (复用策略)
const TechEntry = () => import('@/views/Tech/Entry/index.vue')
const TechRecord = () => import('@/views/Tech/Record/index.vue')

const routes = [
  // ... 登录页保持不变 ...
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      title: '用户登录',
      icon: 'Key',
      requiresAuth: false
    }
  },

  // ... 挂号科室保持不变 ...
  {
    path: '/registration',
    component: MainLayout,
    meta: {
      title: '挂号科室',
      icon: 'Checked',
      requiresAuth: true
    },
    children: [
      // ... (原有的挂号子路由) ...
      {
        path: '',
        redirect: '/registration/register'
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/Registration/Register/index.vue'),
        meta: {
          title: '挂号',
          icon: 'User',
          requiresAuth: true
        }
      },
      {
        path: 'refund',
        name: 'Refund',
        component: () => import('@/views/Registration/Refund/index.vue'),
        meta: {
          title: '退号',
          icon: 'Delete',
          requiresAuth: true
        }
      },
      {
        path: 'charge',
        name: 'Charge',
        component: () => import('@/views/Registration/Charge/index.vue'),
        meta: {
          title: '收费',
          icon: 'Money',
          requiresAuth: true
        }
      },
      {
        path: 'refund-charge',
        name: 'RefundCharge',
        component: () => import('@/views/Registration/RefundCharge/index.vue'),
        meta: {
          title: '退费',
          icon: 'Minus',
          requiresAuth: true
        }
      },
      {
        path: 'fee-record',
        name: 'FeeRecord',
        component: () => import('@/views/Registration/FeeRecord/index.vue'),
        meta: {
          title: '费用记录查询',
          icon: 'Search',
          requiresAuth: true
        }
      }
    ]
  },

  // ... 门诊医生保持不变 ...
  {
    path: '/outpatient',
    component: RouterView, // 这里用 RouterView 或自定义 Wrapper
    meta: {
      title: '门诊医生',
      icon: 'Stethoscope',
      requiresAuth: true
    },
    redirect: '/outpatient/patient-view',
    children: [
      // ... (原有的门诊子路由) ...
      // 1. 患者查看 (使用 SimpleHeaderLayout)
      {
        path: 'patient-view',
        // 这里把 Layout 作为路由组件
        component: SimpleHeaderLayout,
        children: [
          {
            path: '', // 默认渲染 index.vue
            name: 'PatientView',
            component: () => import('@/views/Outpatient/PatientView/index.vue'),
            meta: { title: '患者查看', icon: 'User' }
          }
        ]
      },

      // 2. 医生诊疗工作台 (使用 DoctorWorkspaceLayout)
      {
        path: 'workspace/:visitId', // 必须带 visitId
        component: DoctorWorkspaceLayout,
        meta: { title: '诊疗工作台' },
        redirect: { name: 'CaseHomepage' }, // 默认进病案首页
        children: [
          // 2.1 病案首页
          {
            path: 'case-home',
            name: 'CaseHomepage',
            component: () =>
              import(
                '@/views/Outpatient/MedicalTreatment/CaseHomepage/index.vue'
              ),
            meta: { title: '病案首页', icon: 'Document' }
          },
          // 2.2 检查申请
          {
            path: 'examination-request',
            name: 'ExaminationRequest',
            component: () =>
              import(
                '@/views/Outpatient/MedicalTreatment/ExaminationRequest/index.vue'
              ),
            meta: { title: '检查申请', icon: 'DocumentAdd' }
          },
          // 2.3 结果查看
          {
            path: 'result-view',
            name: 'ResultView',
            component: () =>
              import(
                '@/views/Outpatient/MedicalTreatment/ResultView/index.vue'
              ),
            meta: { title: '结果查看', icon: 'View' }
          },
          // 2.4 门诊确诊
          {
            path: 'diagnosis-confirm',
            name: 'DiagnosisConfirm',
            component: () =>
              import(
                '@/views/Outpatient/MedicalTreatment/DiagnosisConfirm/index.vue'
              ),
            meta: { title: '门诊确诊', icon: 'CircleCheck' }
          },
          // 2.5 开设处方
          {
            path: 'prescription',
            name: 'Prescription',
            component: () =>
              import(
                '@/views/Outpatient/MedicalTreatment/Prescription/index.vue'
              ),
            meta: { title: '开设处方', icon: 'EditPen' }
          },
          // 2.6 费用查询
          {
            path: 'fee-inquiry',
            name: 'FeeInquiry',
            component: () =>
              import(
                '@/views/Outpatient/MedicalTreatment/FeeInquiry/index.vue'
              ),
            meta: { title: '费用查询', icon: 'Money' }
          }
        ]
      }
    ]
  },

  // 1. 检查科室 (Exam)
  {
    path: '/exam',
    component: MainLayout,
    meta: { title: '检查工作站', requiresAuth: true },
    children: [
      // ✅ 新增：默认重定向到录入页
      {
        path: '',
        redirect: '/exam/entry'
      },
      {
        path: 'entry',
        name: 'ExamEntry',
        component: TechEntry,
        meta: { title: '检查录入', moduleType: 'EXAM' } // ✅ 标记
      },
      {
        path: 'record',
        name: 'ExamRecord',
        component: TechRecord,
        meta: { title: '检查记录', moduleType: 'EXAM' }
      }
    ]
  },

  // 2. 检验科室 (Lab)
  {
    path: '/lab',
    component: MainLayout,
    meta: { title: '检验工作站', requiresAuth: true },
    children: [
      // ✅ 新增：默认重定向到录入页
      {
        path: '',
        redirect: '/lab/entry'
      },
      {
        path: 'entry',
        name: 'LabEntry',
        component: TechEntry,
        meta: { title: '检验录入', moduleType: 'LAB' } // ✅ 标记
      },
      {
        path: 'record',
        name: 'LabRecord',
        component: TechRecord,
        meta: { title: '检验记录', moduleType: 'LAB' }
      }
    ]
  },

  // 3. 处置室 (Disposal)
  {
    path: '/disposal',
    component: MainLayout,
    meta: { title: '处置工作站', requiresAuth: true },
    children: [
      // ✅ 新增：默认重定向到录入页
      {
        path: '',
        redirect: '/disposal/entry'
      },
      {
        path: 'entry',
        name: 'DisposalEntry',
        component: TechEntry,
        meta: { title: '处置录入', moduleType: 'DISPOSAL' } // ✅ 标记
      },
      {
        path: 'record',
        name: 'DisposalRecord',
        component: TechRecord,
        meta: { title: '处置记录', moduleType: 'DISPOSAL' }
      }
    ]
  },

  // ✅ [新增] 门诊药房路由配置
  {
    path: '/pharmacy',
    component: MainLayout,
    meta: {
      title: '门诊药房',
      icon: 'FirstAidKit', // 使用急救包图标代表药房
      requiresAuth: true
    },
    redirect: '/pharmacy/dispense',
    children: [
      {
        path: 'dispense',
        name: 'PharmacyDispense',
        component: () => import('@/views/Pharmacy/Dispense/index.vue'),
        meta: {
          title: '发药处理',
          icon: 'Box',
          requiresAuth: true
        }
      },
      {
        path: 'record',
        name: 'PharmacyRecord',
        component: () => import('@/views/Pharmacy/Record/index.vue'),
        meta: {
          title: '发药记录',
          icon: 'Clock',
          requiresAuth: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
