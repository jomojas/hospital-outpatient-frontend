<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
import { useOrderStore } from '@/store/Outpatient/MedicalTreatment/OrderStore'

// Components
import ItemSearch from './components/ItemSearch.vue'
import OrderCart from './components/OrderCart.vue'
import HistoryTable from './components/HistoryTable.vue'

const contextStore = useClinicContextStore()
const orderStore = useOrderStore()

const initPageData = async () => {
  const regId = contextStore.registrationId
  const caseId = contextStore.caseId

  if (!regId) return

  // 1. 启动购物车自动保存/恢复
  orderStore.initAutoSave(regId)

  // 2. 拉取历史数据 (如果有病案)
  if (caseId) {
    await orderStore.fetchHistory()
  }
}

onMounted(() => {
  if (contextStore.registrationId) {
    initPageData()
  }
})

// 监听 Context 变化 (防刷新白屏)
watch(
  () => contextStore.registrationId,
  (newVal) => {
    if (newVal) initPageData()
  }
)

onUnmounted(() => {
  orderStore.resetState()
})
</script>

<template>
  <div class="exam-request-page">
    <!-- ✅ 上半部分：只有有权限时才显示 -->
    <!-- 包含 搜索按钮 和 购物车 -->
    <div class="section-new" v-if="contextStore.canRequestItems">
      <ItemSearch class="mb-20" />
      <OrderCart />
    </div>

    <!-- ✅ 下半部分：历史记录永远显示 -->
    <div class="section-history">
      <!-- 可以加一个标题区分 -->
      <div v-if="!contextStore.canRequestItems" class="history-only-header">
        <el-alert
          title="当前为查看模式，仅展示历史申请记录"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <HistoryTable />
    </div>
  </div>
</template>

<style scoped>
.exam-request-page {
  padding-bottom: 20px;
}
.mb-20 {
  margin-bottom: 20px;
}
.section-new {
  margin-bottom: 30px;
}
.history-only-header {
  margin-bottom: 20px;
}
</style>
