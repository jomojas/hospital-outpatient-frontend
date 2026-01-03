<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useChargeStore } from '@/store/Registration/Charge/ChargeStore'
import { useChargeLookupStore } from '@/store/Registration/Charge/LookupStore'
import ChargeSearchForm from './components/ChargeSearchForm.vue'
import ChargeTable from './components/ChargeTable.vue'

// ✅ Store 实例
const chargeStore = useChargeStore()
const lookupStore = useChargeLookupStore()

// ✅ 页面初始化
onMounted(async () => {
  try {
    // 1. 首先初始化下拉框数据（字典数据）
    await lookupStore.initialize()

    // 2. 然后获取缴费项目列表（使用默认参数）
    await chargeStore.refresh()
  } catch (error) {
    console.error('❌ 缴费管理页面初始化失败:', error)
  }
})

// ✅ 页面清理
onUnmounted(() => {
  // 清空选中项目
  chargeStore.clearSelectedItems()

  // 清除错误信息
  chargeStore.clearError()
})
</script>

<template>
  <div class="charge-page">
    <!-- 搜索表单组件 -->
    <ChargeSearchForm />

    <!-- 数据表格组件 -->
    <ChargeTable />

    <!-- 全局错误提示 -->
    <div v-if="chargeStore.error" class="error-banner">
      <el-alert
        :title="chargeStore.error"
        type="error"
        :closable="true"
        @close="chargeStore.clearError"
        show-icon
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.charge-page {
  min-height: 100vh;
  padding: $padding-lg;
  background: linear-gradient(135deg, #f7fbff 0%, #f2f6ff 40%, #ffffff 100%);

  .page-header {
    margin-bottom: $margin-lg;
    padding: $padding-lg;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e3a8a 100%);
    border-radius: $border-radius-base * 2;
    color: $white;
    text-align: center;
    box-shadow: $shadow-soft;

    h2 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .el-icon {
        font-size: 32px;
      }
    }

    .page-description {
      margin: 0;
      font-size: 15px;
      opacity: 0.9;
      font-weight: 500;
    }
  }

  .error-banner {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    width: 90%;
    max-width: 600px;

    :deep(.el-alert) {
      box-shadow: $shadow-soft;
      border-radius: $border-radius-base * 2;
    }
  }
}
</style>
