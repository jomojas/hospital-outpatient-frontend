<script setup lang="ts">
import { CopyDocument, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useResultStore } from '@/store/Outpatient/MedicalTreatment/ResultStore'

const store = useResultStore()

// 复制功能
const handleCopy = (row: any) => {
  const text = `【${row.itemName}】结果：${row.result || '无'}`
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success('结果已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}
</script>

<template>
  <el-card shadow="never" class="mb-20">
    <template #header>
      <div class="card-header">
        <span class="title">已出结果 ({{ store.finishedList.length }})</span>
      </div>
    </template>

    <el-table
      :data="store.finishedList"
      style="width: 100%"
      empty-text="暂无已完成的检查结果"
    >
      <el-table-column
        prop="itemName"
        label="项目名称"
        width="180"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span style="font-weight: bold">{{ row.itemName }}</span>
        </template>
      </el-table-column>

      <!-- 结果内容列：最重要，给足宽度 -->
      <el-table-column prop="result" label="检查结果" min-width="300">
        <template #default="{ row }">
          <div class="result-text">{{ row.result || '未录入详细结果' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="执行信息" width="220">
        <template #default="{ row }">
          <div class="meta-info">
            <div>
              <el-icon><Timer /></el-icon> {{ row.performTime || '-' }}
            </div>
            <div v-if="row.performerName">执行人: {{ row.performerName }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-tooltip content="复制结果" placement="top">
            <el-button
              type="primary"
              link
              :icon="CopyDocument"
              @click="handleCopy(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.title {
  font-weight: bold;
  color: #303133;
  border-left: 4px solid #67c23a;
  padding-left: 10px;
}
.result-text {
  white-space: pre-wrap;
  line-height: 1.5;
  color: #303133;
}
.meta-info {
  font-size: 12px;
  color: #909399;
}
</style>
