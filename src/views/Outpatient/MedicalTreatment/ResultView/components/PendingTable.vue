<script setup lang="ts">
import { useResultStore } from '@/store/Outpatient/MedicalTreatment/ResultStore'
import {
  ApplyStatus,
  ApplyStatusLabels
} from '@/types/Outpatient/MedicalTreatment'

const store = useResultStore()

// 辅助函数：将单个数字前补零
const padStart = (num: number) => String(num).padStart(2, '0')

/**
 * 格式化 ISO 8601 时间字符串
 * @param {string} isoString - ISO 8601 格式的时间字符串，例如: 2025-12-06T19:07:33
 * @returns {string} 格式化后的时间字符串，例如: 2025-12-06 19:07:33
 */
const formatApplyTime = (isoString: string): string => {
  if (!isoString) return '--' // 检查空值

  // 创建 Date 对象。由于传入的字符串没有时区信息 (Z)，JS 会将其解析为本地时间
  const date = new Date(isoString)

  // 确保时间对象有效
  if (isNaN(date.getTime())) {
    console.error('Invalid date string:', isoString)
    return '--'
  }

  const year = date.getFullYear()
  const month = padStart(date.getMonth() + 1) // 月份从 0 开始，所以需要 +1
  const day = padStart(date.getDate())
  const hours = padStart(date.getHours())
  const minutes = padStart(date.getMinutes())
  const seconds = padStart(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

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
    case ApplyStatus.UNFINISHED:
      return 'primary' // 待做
    case ApplyStatus.REVOKED:
      return 'info'
    case ApplyStatus.CANCELLED:
      return 'info'
    case ApplyStatus.RETURNED:
      return 'info'
    default:
      return ''
  }
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="title"
          >进行中 / 待处理 / 其他 ({{ store.pendingList.length }})</span
        >
      </div>
    </template>

    <el-table
      :data="store.pendingList"
      style="width: 100%"
      size="small"
      empty-text="无相关记录"
    >
      <el-table-column prop="itemName" label="项目名称" min-width="180">
        <template #default="{ row }">
          <span
            :class="{
              'text-gray': [
                ApplyStatus.REVOKED,
                ApplyStatus.CANCELLED
              ].includes(row.status)
            }"
          >
            {{ row.itemName }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="申请时间" width="180">
        <template #default="{ row }">
          {{ formatApplyTime(row.applyTime) }}
        </template>
      </el-table-column>

      <el-table-column label="当前状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="提示信息" min-width="200">
        <template #default="{ row }">
          <span
            v-if="row.status === ApplyStatus.PENDING_PAYMENT"
            class="text-warning"
          >
            请提醒患者前往缴费
          </span>
          <span
            v-else-if="row.status === ApplyStatus.UNFINISHED"
            class="text-primary"
          >
            已缴费，等待检查/结果录入
          </span>
          <span v-else class="text-gray"> -- </span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.title {
  font-weight: bold;
  color: #606266;
  border-left: 4px solid #909399;
  padding-left: 10px;
}
.text-gray {
  color: #909399;
  text-decoration: line-through;
}
.text-warning {
  color: #e6a23c;
  font-size: 12px;
}
.text-primary {
  color: #409eff;
  font-size: 12px;
}
</style>
