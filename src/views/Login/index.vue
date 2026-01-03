<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/modules/app'
import { useAppStore } from '@/store/app'
import { departmentRouteMap } from '@/config/departmentRouteMap'
import { setFaviconByDepartment, updatePageTitle } from '@/utils/favicon'
import { ElMessage } from 'element-plus' // ✅ 添加消息提示

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
        // ✅ 保存登录数据到 sessionStorage
        appStore.setLoginData(res)

        const targetPath = departmentRouteMap[res.departmentType] || '/404'

        // ✅ 根据部门类型设置favicon和页面标题
        setFaviconByDepartment(res.departmentType)
        updatePageTitle(res.departmentType, res.departmentName)

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
  <div class="login-shell">
    <div class="brand-panel">
      <div class="brand-overlay">
        <h1>医院门诊系统</h1>
        <p>守护每一位患者的健康</p>
      </div>
    </div>
    <div class="form-panel">
      <div class="form-card">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">请使用账号登录工作台</p>
        <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-position="top"
          label-width="80px"
        >
          <el-form-item label="账号" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入账号"
              @keyup.enter="onLogin"
              size="large"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keyup.enter="onLogin"
              size="large"
            />
          </el-form-item>
          <el-button
            class="login-btn"
            type="primary"
            @click="onLogin"
            :loading="loading"
            size="large"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: linear-gradient(135deg, #f7fbff 0%, #eef3ff 30%, #ffffff 100%);
}

.brand-panel {
  position: relative;
  background: url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80')
    center/cover no-repeat;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
}

.brand-overlay {
  width: 100%;
  padding: 48px;
  background: linear-gradient(
    180deg,
    rgba(12, 35, 64, 0.15) 0%,
    rgba(12, 35, 64, 0.65) 100%
  );
  color: #f7fbff;

  h1 {
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
  }
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 64px;
}

.form-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
  padding: 32px 32px 36px;
  border: 1px solid #eef1f6;
}

.login-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0d2f62;
}

.login-subtitle {
  margin: 8px 0 24px;
  color: #4b5563;
  font-size: 14px;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(13, 47, 98, 0.05);
}

.login-btn {
  width: 100%;
  margin-top: 6px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 12px 30px rgba(15, 94, 247, 0.25);
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 40vh;
  }

  .form-panel {
    padding: 32px 24px;
  }
}
</style>
