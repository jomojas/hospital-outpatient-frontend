<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
import { useResultStore } from '@/store/Outpatient/MedicalTreatment/ResultStore'

// Components
import ResultSummary from './components/ResultSummary.vue'
import FinishedTable from './components/FinishedTable.vue'
import PendingTable from './components/PendingTable.vue'

const contextStore = useClinicContextStore()
const resultStore = useResultStore()
const router = useRouter()

// 加载数据
const loadData = () => {
  if (contextStore.caseId) {
    resultStore.fetchResults(contextStore.caseId)
  }
}

// 监听
onMounted(() => {
  if (contextStore.caseId) {
    loadData()
  }
})

// 防刷新白屏
watch(
  () => contextStore.caseId,
  (newVal) => {
    if (newVal) loadData()
  }
)

onUnmounted(() => {
  resultStore.reset()
})

const handleRefresh = () => {
  loadData()
}

const goToApply = () => {
  // 跳转到上一页（检查申请）
  router.push({
    name: 'ExaminationRequest',
    params: { visitId: contextStore.registrationId }
  })
}
</script>

<template>
  <div class="result-view-page" v-loading="resultStore.loading">
    <!-- 场景1: 未建档或无病案 -->
    <div v-if="!contextStore.caseId" class="empty-state">
      <el-empty description="当前尚未创建病案，无法查看结果">
        <el-button type="primary" @click="router.push({ name: 'CaseHomepage' })"
          >去创建病案</el-button
        >
      </el-empty>
    </div>

    <!-- 场景2: 有病案 -->
    <div v-else>
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <div class="left">
          <!-- 这里可以放一些过滤条件，目前暂时为空 -->
        </div>
        <div class="right">
          <el-button
            :icon="Refresh"
            circle
            @click="handleRefresh"
            title="刷新结果"
          />
          <el-button
            type="primary"
            plain
            @click="goToApply"
            v-if="contextStore.canRequestItems"
            >追加申请</el-button
          >
        </div>
      </div>

      <!-- 概览统计 -->
      <ResultSummary />

      <!-- 如果没有任何申请记录 -->
      <el-empty
        v-if="resultStore.allResults.length === 0"
        description="暂无任何检查申请记录"
      >
        <el-button type="primary" @click="goToApply">去申请项目</el-button>
      </el-empty>

      <div v-else>
        <!-- 已出结果列表 -->
        <FinishedTable />

        <!-- 其他状态列表 -->
        <PendingTable />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.result-view-page {
  padding-bottom: 40px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.empty-state {
  margin-top: 50px;
}
</style>
