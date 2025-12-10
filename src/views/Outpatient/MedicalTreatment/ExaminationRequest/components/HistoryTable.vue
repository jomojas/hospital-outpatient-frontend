<script setup lang="ts">
import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/store/Outpatient/MedicalTreatment/OrderStore'
import {
  ApplyStatus,
  ApplyStatusLabels
} from '@/types/Outpatient/MedicalTreatment'

const store = useOrderStore()

// ✅ 新增：专门用于获取状态文本的辅助函数
const getStatusLabel = (status: string) => {
  // 使用 'as ApplyStatus' 断言，告诉 TS 这个字符串是合法的枚举 Key
  return ApplyStatusLabels[status as ApplyStatus] || status
}

// 状态 Tag 样式映射
const getStatusType = (status: string) => {
  switch (status) {
    case ApplyStatus.PENDING_PAYMENT:
      return 'warning'
    case ApplyStatus.FINISHED:
      return 'success'
    case ApplyStatus.REVOKED:
      return 'info'
    case ApplyStatus.CANCELLED:
      return 'info'
    default:
      return ''
  }
}

// 撤销操作
const handleRevoke = (row: any) => {
  ElMessageBox.confirm(
    `确定要作废【${row.itemName}】吗？此操作不可恢复。`,
    '确认作废',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    store.revokeItem(row.applyId)
  })
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <span class="title">已申请历史记录</span>
    </template>

    <el-table
      :data="store.historyList"
      style="width: 100%"
      v-loading="store.loading"
    >
      <el-table-column prop="itemName" label="项目名称" min-width="180">
        <template #default="{ row }">
          <span
            :class="{
              'text-deleted':
                row.status === ApplyStatus.REVOKED ||
                row.status === ApplyStatus.CANCELLED
            }"
          >
            {{ row.itemName }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>

      <el-table-column prop="createTime" label="申请时间" width="180" />

      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <!-- 只有待缴费的项目可以作废 -->
          <el-button
            v-if="row.status === ApplyStatus.PENDING_PAYMENT"
            type="danger"
            link
            size="small"
            @click="handleRevoke(row)"
          >
            作废
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
