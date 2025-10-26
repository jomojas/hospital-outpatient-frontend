<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useRefundChargeStore } from '@/store/Registration/RefundCharge/RefundChargeStore'
import { useRefundChargeLookupStore } from '@/store/Registration/RefundCharge/LookupStore'
import RefundChargeSearchForm from './components/RefundChargeSearchForm.vue'
import RefundChargeTable from './components/RefundChargeTable.vue'

// ✅ Store 实例
const refundStore = useRefundChargeStore()
const lookupStore = useRefundChargeLookupStore()

// ✅ 页面状态
const isInitializing = ref(true)
const initializationError = ref<string | null>(null)

// ✅ 页面初始化
async function initializePage() {
  isInitializing.value = true
  initializationError.value = null

  try {
    // 1. 首先初始化下拉框数据（字典数据）
    await lookupStore.initialize()

    // 2. 然后获取可退费项目列表（使用默认参数）
    await refundStore.refresh()
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '页面初始化失败'
    console.error('❌ 退费管理页面初始化失败:', error)
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
  // 清空选中项目
  refundStore.clearSelectedItems()

  // 清除错误信息
  refundStore.clearError()
})
</script>

<template>
  <div class="refund-page">
    <!-- 初始化加载状态 -->
    <div v-if="isInitializing" class="loading-container">
      <el-loading-directive
        v-loading="true"
        element-loading-text="正在初始化数据..."
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
      <RefundChargeSearchForm />

      <!-- 数据表格组件 -->
      <RefundChargeTable />
    </template>

    <!-- 全局错误提示 -->
    <div v-if="refundStore.error && !isInitializing" class="error-banner">
      <el-alert
        :title="refundStore.error"
        type="error"
        :closable="true"
        @close="refundStore.clearError"
        show-icon
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.refund-page {
  min-height: 100vh;
  padding: $padding-base;
  background-color: $background-color-secondary;
  font-family: $font-family-body;

  .page-header {
    margin-bottom: $margin-lg;
    padding: $padding-base;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    border-radius: $border-radius-base;
    color: $background-color;
    text-align: center;
    box-shadow: 0 4px 12px rgba(238, 90, 36, 0.15);

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

// ✅ 分离所有深度选择器，避免嵌套冲突

// El-result 组件样式
:deep(.el-result__title) {
  color: $text-color;
  font-family: $font-family-title;
}

:deep(.el-result__subtitle) {
  color: $text-color-secondary;
  font-family: $font-family-body;
}

// El-alert 组件样式
:deep(.el-alert) {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.15);
  border-radius: $border-radius-base;
  border: 1px solid $border-color-light;
  font-family: $font-family-body;
}

:deep(.el-alert__title) {
  color: $error-color;
  font-weight: 600;
}

:deep(.el-alert__description) {
  color: $text-color-secondary;
}

// El-card 组件样式
:deep(.el-card) {
  border-radius: $border-radius-base;
  border: 1px solid $border-color-light;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.el-card__header) {
  background-color: $background-color;
  border-bottom: 1px solid $border-color-light;
  padding: $padding-base;
}

:deep(.el-card__body) {
  padding: $padding-base;
  background-color: $background-color;
}

:deep(.card-header) {
  font-family: $font-family-title;
  color: $text-color;
}

// El-button 组件样式
:deep(.el-button) {
  border-radius: $border-radius-base;
  font-family: $font-family-body;
  font-size: $font-body;
}

:deep(.el-button--primary) {
  background-color: $primary-color;
  border-color: $primary-color;

  &:hover {
    background-color: $primary-hover;
    border-color: $primary-hover;
  }

  &:active {
    background-color: $primary-active;
    border-color: $primary-active;
  }
}

:deep(.el-button--danger) {
  background-color: $error-color;
  border-color: $error-color;

  &:hover {
    background-color: #ff7875;
    border-color: #ff7875;
  }

  &:active {
    background-color: #d9363e;
    border-color: #d9363e;
  }
}

// El-loading 组件样式
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
  .refund-page {
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

  // 移动端卡片样式
  :deep(.el-card__header),
  :deep(.el-card__body) {
    padding: $padding-sm;
  }
}

// 平板设备适配
@media (max-width: 992px) and (min-width: 769px) {
  .refund-page {
    .page-header {
      h2 {
        font-size: 24px;
      }
    }
  }
}
</style>
