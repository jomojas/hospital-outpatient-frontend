<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router' // ✅ 添加 useRoute
import { login } from '@/api/modules/app'
import { useAppStore } from '@/store/app'
import { departmentRouteMap } from '@/config/departmentRouteMap'
import { ElMessage } from 'element-plus' // ✅ 添加消息提示

const router = useRouter()
const route = useRoute() // ✅ 获取当前路由信息
const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const appStore = useAppStore()

const onLogin = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await login({
        username: form.username,
        password: form.password
      })

      if (res && res.token) {
        // ✅ 保存登录数据到 sessionStorage
        appStore.setLoginData(res)

        // ✅ 智能重定向逻辑
        const redirectPath = route.query.redirect as string
        let targetPath: string

        if (redirectPath) {
          // 如果有重定向路径，优先跳转到重定向路径
          targetPath = redirectPath
        } else {
          // 没有重定向路径，根据用户科室类型跳转到对应首页
          targetPath = departmentRouteMap[res.departmentType] || '/404'
        }

        // ✅ 显示登录成功消息
        ElMessage.success(`欢迎回来，${res.name}！`)

        // ✅ 跳转到目标页面
        router.replace(targetPath) // 使用 replace 避免用户按返回键回到登录页

        // ✅ 重置表单
        form.username = ''
        form.password = ''
        loading.value = false
      } else {
        // ✅ 登录响应数据异常
        ElMessage.error('登录响应数据异常，请联系管理员')
        form.password = ''
        loading.value = false
      }
    } catch (e: any) {
      console.error('❌ 登录失败:', e)

      // ✅ 更详细的错误处理
      const errorMessage =
        e.response?.data?.message || e.message || '登录失败，请稍后重试'
      ElMessage.error(errorMessage)

      // ✅ 清空密码输入框
      form.password = ''
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">医院门诊系统登录</h2>

      <!-- ✅ 添加重定向提示 -->
      <div v-if="route.query.redirect" class="redirect-tip">
        <el-alert
          title="登录后将返回到之前访问的页面"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        />
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            @keyup.enter="onLogin"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="onLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onLogin"
            :loading="loading"
            style="width: 100%"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6fa;
}

.login-card {
  width: 360px;
  padding: 32px 24px;
}

.login-title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 2px;
}

// ✅ 新增重定向提示样式
.redirect-tip {
  margin-bottom: 16px;
}
</style>
