import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs' // 引入中文包
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VChart from 'vue-echarts' // 引入 ECharts 组件

// 引入样式系统
import '@/styles/index.scss'

import App from './App.vue'
import router from '@/router'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn }) // 配置中文
app.component('v-chart', VChart) // 注册 ECharts 组件

app.mount('#app')
