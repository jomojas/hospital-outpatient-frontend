<script setup lang="ts">
import { List, Refresh, DataAnalysis } from '@element-plus/icons-vue'
import { useFeeRecordStore } from '@/store/Registration/FeeRecord/FeeRecordStore'

// Store
const feeRecordStore = useFeeRecordStore()

// 格式化日期时间
function formatDateTime(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 刷新数据
async function handleRefresh() {
  await feeRecordStore.refresh()
}

// 分页大小变化
async function handleSizeChange(pageSize: number) {
  await feeRecordStore.changePage(1, pageSize)
}

// 当前页变化
async function handleCurrentChange(page: number) {
  await feeRecordStore.changePage(page)
}
</script>

<template>
  <div class="fee-table">
    <!-- 表格头部 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <el-icon><List /></el-icon>
            <span>费用交易记录</span>
            <el-tag v-if="feeRecordStore.hasData" type="info" size="small">
              {{ feeRecordStore.statistics.totalTransactions }} 条
            </el-tag>
          </div>
          <div class="header-right">
            <el-button
              type="default"
              :loading="feeRecordStore.loading"
              @click="handleRefresh"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="feeRecordStore.loading"
        :data="feeRecordStore.feeTransactions"
        empty-text="暂无费用记录"
        style="width: 100%"
      >
        <!-- 交易ID -->
        <el-table-column label="交易ID" width="100" align="center">
          <template #default="{ row }">
            <span class="transaction-id">#{{ row.transactionId }}</span>
          </template>
        </el-table-column>

        <!-- 患者信息 -->
        <el-table-column label="患者" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="patient-info">
              <div class="patient-name">{{ row.patientName }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 挂号ID -->
        <el-table-column label="挂号ID" width="100" align="center">
          <template #default="{ row }">
            <span class="registration-id">#{{ row.registrationId }}</span>
          </template>
        </el-table-column>

        <!-- 交易状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="feeRecordStore.getTransactionStatusType(row.status)"
              size="small"
            >
              {{ feeRecordStore.getTransactionStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 交易金额 -->
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <span
              class="amount-text"
              :class="{ 'refund-amount': row.status === 'REFUND' }"
            >
              {{ feeRecordStore.formatAmount(row.amount) }}
            </span>
          </template>
        </el-table-column>

        <!-- 交易时间 -->
        <el-table-column label="交易时间" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.transactionTime) }}
          </template>
        </el-table-column>

        <!-- 交易说明 -->
        <el-table-column label="说明" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="remark-text">{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="feeRecordStore.paginationMeta.page"
          v-model:page-size="feeRecordStore.paginationMeta.size"
          :total="feeRecordStore.paginationMeta.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 统计信息卡片 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计信息</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">总交易数</div>
            <div class="stat-value">
              {{ feeRecordStore.statistics.totalTransactions }}
            </div>
            <div class="stat-sub">笔</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">支付交易</div>
            <div class="stat-value success">
              {{ feeRecordStore.statistics.paidCount }}
            </div>
            <div class="stat-sub">
              {{
                feeRecordStore.formatAmount(
                  feeRecordStore.statistics.paidAmount
                )
              }}
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">退费交易</div>
            <div class="stat-value danger">
              {{ feeRecordStore.statistics.refundCount }}
            </div>
            <div class="stat-sub">
              {{
                feeRecordStore.formatAmount(
                  feeRecordStore.statistics.refundAmount
                )
              }}
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">净收入</div>
            <div
              class="stat-value net"
              :class="{ negative: feeRecordStore.statistics.netAmount < 0 }"
            >
              {{
                feeRecordStore.formatAmount(feeRecordStore.statistics.netAmount)
              }}
            </div>
            <div class="stat-sub">收入 - 退费</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.fee-table {
  .table-card {
    margin-bottom: $margin-base;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: $margin-sm;
      font-weight: 600;
      color: $text-color;
      font-family: $font-family-title;
    }

    .header-right {
      display: flex;
      gap: $margin-sm;
    }
  }

  .transaction-id,
  .registration-id {
    font-family: $font-family-code;
    color: $text-color-secondary;
    font-size: $font-caption;
  }

  .patient-info {
    .patient-name {
      font-weight: 600;
      color: $text-color;
      font-size: $font-body;
      font-family: $font-family-body;
    }
  }

  .amount-text {
    color: $success-color;
    font-weight: 600;
    font-size: $font-body;
    font-family: $font-family-body;

    &.refund-amount {
      color: $error-color;
    }
  }

  .remark-text {
    color: $text-color-secondary;
    font-size: $font-body;
    font-family: $font-family-body;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: $margin-lg;
  }
}

.statistics-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: $margin-sm;
    font-weight: 600;
    color: $text-color;
    font-family: $font-family-title;
  }

  .stat-item {
    text-align: center;
    padding: $padding-sm;

    .stat-label {
      font-size: $font-caption;
      color: $text-color-secondary;
      margin-bottom: 4px;
      font-family: $font-family-body;
    }

    .stat-value {
      font-size: $font-title;
      font-weight: 600;
      color: $text-color;
      font-family: $font-family-title;

      &.success {
        color: $success-color;
      }

      &.danger {
        color: $error-color;
      }

      &.net {
        color: $primary-color;

        &.negative {
          color: $error-color;
        }
      }
    }

    .stat-sub {
      font-size: $font-caption;
      color: $text-color-secondary;
      margin-top: 2px;
      font-family: $font-family-body;
    }
  }
}

// 表格样式优化
:deep(.el-table) {
  border-radius: $border-radius-base;
  font-family: $font-family-body;

  .el-table__header {
    background-color: $background-color-secondary;

    th {
      color: $text-color;
      font-weight: 600;
      font-family: $font-family-title;
      border-bottom: 1px solid $border-color;
    }
  }

  .el-table__body {
    td {
      color: $text-color;
      border-bottom: 1px solid $border-color-light;
    }
  }

  .el-table__row:hover {
    background-color: $background-color-hover;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .fee-table {
    .table-header {
      flex-direction: column;
      gap: $margin-sm;
      align-items: stretch;

      .header-left,
      .header-right {
        justify-content: center;
      }
    }

    .pagination-wrapper {
      margin-top: $margin-base;
    }
  }

  .statistics-card {
    .stat-item {
      margin-bottom: $margin-base;

      .stat-value {
        font-size: $font-subtitle;
      }
    }
  }
}
</style>
