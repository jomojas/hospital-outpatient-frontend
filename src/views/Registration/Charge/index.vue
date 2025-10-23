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
  console.log('🚀 缴费管理页面初始化...')

  try {
    // 1. 首先初始化下拉框数据（字典数据）
    console.log('📋 初始化字典数据...')
    await lookupStore.initialize()

    // 2. 然后获取缴费项目列表（使用默认参数）
    console.log('📊 获取缴费项目列表...')
    await chargeStore.refresh()

    console.log('✅ 缴费管理页面初始化完成')
  } catch (error) {
    console.error('❌ 缴费管理页面初始化失败:', error)
  }
})

// ✅ 页面清理
onUnmounted(() => {
  console.log('🧹 缴费管理页面清理...')

  // 清空选中项目
  chargeStore.clearSelectedItems()

  // 清除错误信息
  chargeStore.clearError()

  console.log('✅ 缴费管理页面清理完成')
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
  padding: 20px;
  background-color: #f5f7fa;

  .page-header {
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    color: white;
    text-align: center;

    h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
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
      font-size: 16px;
      opacity: 0.9;
      font-weight: 400;
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
      box-shadow: 0 4px 12px rgba(245, 108, 108, 0.15);
    }
  }
}
</style>
