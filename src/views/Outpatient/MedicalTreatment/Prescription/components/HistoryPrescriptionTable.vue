<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { usePrescriptionStore } from '@/store/Outpatient/MedicalTreatment/PrescriptionStore'
import {
  ApplyStatus,
  ApplyStatusLabels
} from '@/types/Outpatient/MedicalTreatment'

const store = usePrescriptionStore()

// ✅ 新增：专门用于获取状态文本的辅助函数
const getStatusLabel = (status: string) => {
  return ApplyStatusLabels[status as ApplyStatus] || status
}

const getStatusType = (status: string) => {
  switch (status) {
    case ApplyStatus.PENDING_PAYMENT:
      return 'warning'
    case ApplyStatus.FINISHED:
      return 'success' // 已发药
    case ApplyStatus.UNFINISHED:
      return 'primary' // 已缴费待发药
    case ApplyStatus.REVOKED:
      return 'info'
    default:
      return 'info'
  }
}

const handleRevoke = (row: any) => {
  ElMessageBox.confirm(
    `确定要撤销【${row.drugName}】吗？库存将自动释放。`,
    '确认撤销',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    store.revokeItem(row.prescriptionId)
  })
}
</script>

<template>
  <el-card shadow="never">
    <template #header><span class="title">已开立处方记录</span></template>

    <el-table
      :data="store.historyList"
      style="width: 100%"
      v-loading="store.loading"
    >
      <el-table-column prop="drugName" label="药品名称" min-width="150">
        <template #default="{ row }">
          <span
            :class="{ 'text-deleted': row.status === ApplyStatus.REVOKED }"
            >{{ row.drugName }}</span
          >
        </template>
      </el-table-column>

      <el-table-column prop="specification" label="规格" width="120" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="unit" label="单位" width="60" />
      <el-table-column prop="usage" label="用法用量" min-width="180" />
      <el-table-column prop="price" label="单价" width="80" />

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="80" align="center">
        <template #default="{ row }">
          <!-- 只有待缴费可撤销 -->
          <el-button
            v-if="row.status === ApplyStatus.PENDING_PAYMENT"
            type="danger"
            link
            size="small"
            @click="handleRevoke(row)"
          >
            撤销
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.title {
  font-weight: bold;
  color: #606266;
}
.text-deleted {
  text-decoration: line-through;
  color: #909399;
}
</style>
