import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue')
  },
  {
    path: '/registration',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/registration/register'
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/Registration/Register.vue')
      },
      {
        path: 'refund',
        name: 'Refund',
        component: () => import('@/views/Registration/Refund.vue')
      },
      {
        path: 'charge',
        name: 'Charge',
        component: () => import('@/views/Registration/Charge.vue')
      },
      {
        path: 'refund-charge',
        name: 'RefundCharge',
        component: () => import('@/views/Registration/RefundCharge.vue')
      },
      {
        path: 'fee-record',
        name: 'FeeRecord',
        component: () => import('@/views/Registration/FeeRecord.vue')
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
