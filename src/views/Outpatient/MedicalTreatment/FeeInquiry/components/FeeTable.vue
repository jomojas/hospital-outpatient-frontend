<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  type: {
    type: String as PropType<'item' | 'drug'>,
    default: 'item'
  }
})

// 状态映射
const getStatusTag = (status: string) => {
  switch (status) {
    case 'UNPAID':
      return { type: 'warning', label: '待缴费' }
    case 'PAID':
      return { type: 'success', label: '已缴费' }
    case 'REFUNDED':
      return { type: 'info', label: '已退费' }
    // ✅ 新增展示样式
    case 'REVOKED':
      return { type: 'info', label: '已撤销' }
    default:
      return { type: 'info', label: status }
  }
}
</script>

<template>
  <el-table :data="data" style="width: 100%" stripe>
    <el-table-column
      :prop="type === 'item' ? 'itemName' : 'drugName'"
      label="项目/药品名称"
      min-width="180"
    />

    <!-- 药品特有：规格 -->
    <el-table-column
      v-if="type === 'drug'"
      prop="specification"
      label="规格"
      width="120"
    />

    <el-table-column prop="price" label="单价" width="100">
      <template #default="{ row }">￥{{ row.price }}</template>
    </el-table-column>

    <el-table-column
      :prop="type === 'item' ? 'unit' : 'quantity'"
      label="数量"
      width="80"
    />

    <el-table-column prop="amount" label="金额" width="100">
      <template #default="{ row }">
        <span style="font-weight: bold">￥{{ row.amount }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="createTime" label="开立时间" width="160" />

    <el-table-column label="状态" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="getStatusTag(row.status).type" size="small">
          {{ getStatusTag(row.status).label }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>
