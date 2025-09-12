import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 登录页单独路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { requiresAuth: false }
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
