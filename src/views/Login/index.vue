<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/modules/app'
import { useAppStore } from '@/store/app'
import { departmentRouteMap } from '@/config/departmentRouteMap'

const router = useRouter()
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
        // 保存登录数据到状态管理或本地存储
        appStore.setLoginData(res)
        // 登录成功后跳转到首页或仪表盘
        const routePath = departmentRouteMap[res.departmentType] || '/404'
        router.push(routePath)
      }
    } catch (e: any) {
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
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onLogin"
            :loading="loading"
            style="width: 100%"
            >登录</el-button
          >
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
</style>
