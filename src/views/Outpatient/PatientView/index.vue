<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { User, Refresh } from '@element-plus/icons-vue'
import { usePatientViewStore } from '@/store/Outpatient/PatientView/PatientView'
import PatientSearchForm from './components/PatientSearchForm.vue'
import PatientTable from './components/PatientTable.vue'

// ✅ Store 实例
const patientViewStore = usePatientViewStore()

// ✅ 页面状态
const isInitializing = ref(true)
const initializationError = ref<string | null>(null)

// ✅ 页面初始化
async function initializePage() {
  isInitializing.value = true
  initializationError.value = null

  try {
    // 获取患者列表（使用默认参数）
    await patientViewStore.fetchPatients()
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '页面初始化失败'
    console.error('❌ 患者查看页面初始化失败:', error)
    initializationError.value = errorMessage
  } finally {
    isInitializing.value = false
  }
}

// ✅ 重试初始化
async function handleRetryInitialization() {
  await initializePage()
}

// ✅ 页面挂载
onMounted(async () => {
  await initializePage()
})

// ✅ 页面清理
onUnmounted(() => {
  // 清除错误信息
  patientViewStore.clearError()
})
</script>

<template>
  <div class="patient-view-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>
        <el-icon><User /></el-icon>
        患者查看
      </h2>
      <p class="page-description">
        查看和管理挂号到您的患者信息，支持按状态筛选和搜索
      </p>
    </div>

    <!-- 初始化加载状态 -->
    <div v-if="isInitializing" class="loading-container">
      <el-loading-directive
        v-loading="true"
        element-loading-text="正在加载患者数据..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <div style="height: 200px"></div>
      </el-loading-directive>
    </div>

    <!-- 初始化错误状态 -->
    <div v-else-if="initializationError" class="error-container">
      <el-result
        icon="error"
        title="初始化失败"
        :sub-title="initializationError"
      >
        <template #extra>
          <el-button type="primary" @click="handleRetryInitialization">
            <el-icon><Refresh /></el-icon>
            重试
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 搜索表单组件 -->
      <PatientSearchForm />

      <!-- 数据表格组件 -->
      <PatientTable />
    </template>

    <!-- 全局错误提示 -->
    <div v-if="patientViewStore.error && !isInitializing" class="error-banner">
      <el-alert
        :title="patientViewStore.error"
        type="error"
        :closable="true"
        @close="patientViewStore.clearError"
        show-icon
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.patient-view-page {
  min-height: 100vh;
  padding: $padding-base;
  background-color: $background-color-secondary;
  font-family: $font-family-body;

  .page-header {
    margin-bottom: $margin-lg;
    padding: $padding-base;
    background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
    border-radius: $border-radius-base;
    color: $background-color;
    text-align: center;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);

    h2 {
      margin: 0 0 $margin-sm 0;
      font-size: $font-title;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $margin-sm;
      font-family: $font-family-title;

      .el-icon {
        font-size: 32px;
      }
    }

    .page-description {
      margin: 0;
      font-size: $font-body;
      opacity: 0.9;
      font-weight: 400;
      font-family: $font-family-body;
    }
  }

  .loading-container {
    margin: $margin-lg 0;
    background-color: $background-color;
    border-radius: $border-radius-base;
    border: 1px solid $border-color-light;
  }

  .error-container {
    margin: $margin-lg 0;
    background: $background-color;
    border-radius: $border-radius-base;
    padding: $padding-lg;
    border: 1px solid $border-color-light;
    font-family: $font-family-body;
  }

  .error-banner {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    width: 90%;
    max-width: 600px;
  }
}

// 全局组件样式覆盖
:deep(.el-result__title) {
  color: $text-color;
  font-family: $font-family-title;
}

:deep(.el-result__subtitle) {
  color: $text-color-secondary;
  font-family: $font-family-body;
}

:deep(.el-alert) {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.15);
  border-radius: $border-radius-base;
  border: 1px solid $border-color-light;
  font-family: $font-family-body;
}

:deep(.el-loading-mask) {
  background-color: rgba($background-color, 0.8);
  border-radius: $border-radius-base;
}

:deep(.el-loading-text) {
  color: $text-color;
  font-family: $font-family-body;
  font-size: $font-body;
}

// 响应式设计
@media (max-width: 768px) {
  .patient-view-page {
    padding: $padding-sm;

    .page-header {
      padding: $padding-base;
      margin-bottom: $margin-base;

      h2 {
        font-size: $font-subtitle;

        .el-icon {
          font-size: 28px;
        }
      }

      .page-description {
        font-size: $font-caption;
      }
    }

    .error-container {
      padding: $padding-base;
      margin: $margin-base 0;
    }

    .loading-container {
      margin: $margin-base 0;
    }
  }
}
</style>
