<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAppStore } from '@/store/app'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { logout, changePassword } from '@/api/modules/app'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const appStore = useAppStore()
const { loginData } = storeToRefs(appStore)

const staffName = computed(() => loginData.value?.name || '')
const department = computed(() => loginData.value?.departmentName || '')
const lastLoginTime = computed(() => loginData.value?.lastLoginTime || '')

const showChangePwdDialog = ref(false)
const changePwdFormRef = ref<FormInstance>()
const changePwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const changePwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== changePwdForm.newPassword) {
          callback(new Error('两次输入的新密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function resetChangePwdForm() {
  changePwdForm.oldPassword = ''
  changePwdForm.newPassword = ''
  changePwdForm.confirmPassword = ''
  changePwdFormRef.value?.clearValidate()
}

const router = useRouter()

function submitChangePassword() {
  changePwdFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      await changePassword({
        oldPassword: changePwdForm.oldPassword,
        newPassword: changePwdForm.newPassword
      })
      ElMessage.success('密码修改成功，请重新登录')
      showChangePwdDialog.value = false
      appStore.changePassword()
      router.push('/login')
    } catch (e) {
      resetChangePwdForm()
    }
  })
}

const onChangePassword = () => {
  showChangePwdDialog.value = true
}

const onLogout = async () => {
  try {
    // 退出登录后端没有任何操作，前端清空localStorage即可
    await logout()
    ElMessage.success('退出登录成功')
    appStore.logout()
    router.push('/login')
  } catch (e: any) {}
}
</script>

<template>
  <div class="page-header">
    <div class="header-left">
      <span class="system-title">医院门诊系统</span>
    </div>
    <div class="header-right">
      <span class="staff-name">员工：{{ staffName }}</span>
      <span class="department-name">科室：{{ department }}</span>
      <span class="last-login">上次登录：{{ lastLoginTime }}</span>
      <el-dropdown>
        <span class="el-dropdown-link">
          操作 <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="onChangePassword"
              >修改密码</el-dropdown-item
            >
            <el-dropdown-item divided @click="onLogout"
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <!-- 修改密码弹窗 -->
  <el-dialog
    v-model="showChangePwdDialog"
    title="修改密码"
    width="400px"
    :close-on-click-modal="false"
    @close="resetChangePwdForm"
  >
    <el-form
      :model="changePwdForm"
      :rules="changePwdRules"
      ref="changePwdFormRef"
      label-position="top"
      label-width="80px"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="changePwdForm.oldPassword"
          type="password"
          show-password
          placeholder="请输入旧密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="changePwdForm.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="changePwdForm.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showChangePwdDialog = false">取消</el-button>
      <el-button type="primary" @click="submitChangePassword">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.page-header {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 $padding-lg;
  background-color: $background-color;
  border-bottom: 1px solid #e0e0e0;

  .header-left {
    .system-title {
      font-size: 1.2rem;
      font-weight: bold;
      color: $text-color;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $padding-base;

    .staff-name,
    .department-name,
    .last-login {
      color: $text-color-secondary;
    }

    .el-dropdown-link {
      cursor: pointer;
      color: $text-color;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover {
        color: $primary-color;
      }
    }
  }
}
</style>
