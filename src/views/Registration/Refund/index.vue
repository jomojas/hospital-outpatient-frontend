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
  padding: $padding-lg;
  background: linear-gradient(135deg, #f7fbff 0%, #f1f5ff 40%, #ffffff 100%);
  min-height: 100vh;
}

.search-section {
  margin-bottom: $margin-lg;
}

.table-section {
  background-color: $background-color;
  border-radius: $border-radius-base * 2;
  padding: $padding-lg;
  box-shadow: $shadow-soft;
  border: 1px solid $border-color-light;
}
</style>
