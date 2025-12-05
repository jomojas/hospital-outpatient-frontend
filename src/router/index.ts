import { createRouter, createWebHistory, RouterView } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'
// import PageHeader from '@/components/PageHeader.vue'

// 引入新布局
import SimpleHeaderLayout from '@/components/SimpleHeaderLayout.vue'
import DoctorWorkspaceLayout from '@/components/DoctorWorkspaceLayout.vue'

const routes = [
  // ✅ 根路径重定向到登录页
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
  // ✅ 挂号科室路由配置（添加meta信息）
  {
    path: '/registration',
    component: MainLayout,
    meta: {
      title: '挂号科室',
      icon: 'Checked',
      requiresAuth: true
    },
    children: [
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
  // ✅ 门诊医生路由配置 (修改部分)
  {
    path: '/outpatient',
    component: RouterView,
    meta: {
      title: '门诊医生',
      icon: 'Stethoscope',
      requiresAuth: true
    },
    redirect: '/outpatient/patient-view',
    children: [
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
  }
  // 其他科室和页面路由...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('token')
//   if (to.meta.requiresAuth) {
//     if (token) {
//       next()
//     } else {
//       next({ path: '/login' })
//     }
//   } else {
//     // 已登录访问登录页时自动跳转到首页
//     if (to.path === '/login' && token) {
//       next({ path: '/dashboard' })
//     } else {
//       next()
//     }
//   }
// })

export default router
