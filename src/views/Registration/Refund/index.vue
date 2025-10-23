<script setup lang="ts">
import { onMounted } from 'vue'
import RefundSearchForm from './components/RefundSearchForm.vue'
import RefundTable from './components/RefundTable.vue'
import { useRefundStore } from '@/store/Registration/Refund/RefundStore'

// ✅ 使用 Pinia store
const refundStore = useRefundStore()

// ✅ 初始化数据
onMounted(() => {
  refundStore.fetchRegistrationRecords()
})
</script>

<template>
  <div class="refund-container">
    <!-- 🎯 搜索筛选区域 -->
    <div class="search-section">
      <RefundSearchForm />
    </div>

    <!-- 🎯 表格显示区域 -->
    <div class="table-section">
      <RefundTable />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/semantic' as *;

.refund-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: $padding-base;
  background-color: $background-color-secondary;
  min-height: 100vh;
}

.search-section {
  margin-bottom: $margin-lg;
}

.table-section {
  background-color: $background-color;
  border-radius: $border-radius-base;
  padding: $padding-lg;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>
