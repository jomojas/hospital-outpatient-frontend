<script setup lang="ts">
import { useRefundStore } from '@/store/Registration/Refund/RefundStore'

// ✅ 使用 Pinia store
const refundStore = useRefundStore()

// ✅ 格式化金额
function formatAmount(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

// ✅ 格式化状态
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    WAITING_FOR_CONSULTATION: '待看诊'
  }
  return statusMap[status] || status
}

// ✅ 状态标签类型
function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    WAITING_FOR_CONSULTATION: 'warning'
  }
  return typeMap[status] || 'info'
}

// ✅ 是否可以退号
function canRefund(status: string): boolean {
  return status === '待看诊' || status === 'WAITING_FOR_CONSULTATION'
}

// ✅ 退号处理
async function handleRefund(registrationId: number) {
  await refundStore.cancelRegistration(registrationId)
}

// ✅ 分页处理
async function handlePageChange(page: number) {
  await refundStore.changePage(page)
}

// ✅ 每页大小变更
async function handleSizeChange(size: number) {
  await refundStore.changePageSize(size)
}

// ✅ 排序处理
async function handleSortChange({
  prop,
  order
}: {
  prop: string
  order: string
}) {
  const sortBy = prop as 'date' | 'patientName' | 'doctorName'
  const sortOrder = order === 'ascending' ? 'asc' : 'desc'
  await refundStore.changeSort(sortBy, sortOrder)
}
</script>

<template>
  <div class="table-container">
    <div class="table-header">
      <h3 class="table-title">挂号记录列表</h3>
      <div class="table-actions">
        <el-button
          size="small"
          @click="refundStore.refresh()"
          :loading="refundStore.loading"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-table
      :data="refundStore.registrationRecords"
      :loading="refundStore.loading"
      style="width: 100%"
      @sort-change="handleSortChange"
      empty-text="暂无数据"
    >
      <el-table-column prop="registrationId" label="挂号ID" width="80" />

      <el-table-column
        prop="patientName"
        label="患者姓名"
        width="120"
        sortable="custom"
      />

      <el-table-column prop="departmentName" label="科室" width="100" />

      <el-table-column
        prop="doctorName"
        label="医生"
        width="100"
        sortable="custom"
      />

      <el-table-column
        prop="visitDate"
        label="挂号日期"
        width="120"
        sortable="custom"
      />

      <el-table-column prop="period" label="时段" width="80" />

      <el-table-column prop="numberType" label="号别" width="80" />

      <el-table-column prop="settlementTypeName" label="结算类型" width="100" />

      <el-table-column prop="paymentMethodName" label="支付方式" width="100" />

      <el-table-column
        prop="payableAmount"
        label="金额"
        width="100"
        align="right"
      >
        <template #default="{ row }">
          <span class="amount">{{ formatAmount(row.payableAmount) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="currentStatus" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.currentStatus)">
            {{ formatStatus(row.currentStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="canRefund(row.currentStatus)"
            type="danger"
            link
            @click="handleRefund(row.registrationId)"
            :loading="refundStore.loading"
          >
            退号
          </el-button>
          <span v-else class="disabled-text">不可退号</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- ✅ 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="refundStore.paginationMeta.page"
        :page-size="refundStore.paginationMeta.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="refundStore.paginationMeta.total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/semantic' as *;

.table-container {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $margin-base;

    .table-title {
      font-size: $font-subtitle;
      font-weight: 600;
      color: $text-color;
      margin: 0;
    }
  }

  .amount {
    font-weight: 600;
    color: $primary-color;
  }

  .disabled-text {
    color: $text-color-disabled;
    font-size: $font-caption;
  }

  .pagination-container {
    margin-top: $margin-lg;
    display: flex;
    justify-content: center;
  }
}
</style>
