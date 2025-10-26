<script setup lang="ts">
import { List, Money, Refresh, DataAnalysis } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useRefundChargeStore } from '@/store/Registration/RefundCharge/RefundChargeStore'
// import { useRefundChargeLookupStore } from '@/store/Registration/RefundCharge/LookupStore'
import type { RefundableItem } from '@/types/Registration/RefundCharge'

// Store
const refundStore = useRefundChargeStore()
// const lookupStore = useRefundChargeLookupStore()

// 格式化日期时间
function formatDateTime(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取项目类型标签
function getItemTypeLabel(itemType: string): string {
  const typeMap: Record<string, string> = {
    EXAM: '检查',
    LAB: '检验',
    DISPOSAL: '处置'
  }
  return typeMap[itemType] || itemType
}

// 表格选择变化
function handleSelectionChange(selectedRows: RefundableItem[]) {
  refundStore.setSelectedItems(selectedRows)
}

// 批量退费
async function handleBatchRefund() {
  if (!refundStore.hasSelectedItems) return

  const selectedCount = refundStore.selectedStatistics.totalItems
  const selectedAmount = refundStore.selectedStatistics.totalAmount

  try {
    await ElMessageBox.confirm(
      `确认退费 ${selectedCount} 项，总金额 ¥${selectedAmount.toFixed(2)} ？`,
      '确认退费',
      {
        type: 'warning',
        confirmButtonText: '确认退费',
        cancelButtonText: '取消'
      }
    )

    await refundStore.batchRefund([...refundStore.selectedItems])
  } catch {
    // 用户取消操作
  }
}

// 单项退费
async function handleSingleRefund(item: RefundableItem) {
  try {
    await ElMessageBox.confirm(
      `确认退费项目：${item.itemName}，金额 ¥${item.totalAmount.toFixed(2)} ？`,
      '确认退费',
      {
        type: 'warning',
        confirmButtonText: '确认退费',
        cancelButtonText: '取消'
      }
    )

    await refundStore.batchRefund([item])
  } catch {
    // 用户取消操作
  }
}

// 刷新数据
async function handleRefresh() {
  await refundStore.refresh()
}

// 分页大小变化
async function handleSizeChange(pageSize: number) {
  await refundStore.changePage(1, pageSize)
}

// 当前页变化
async function handleCurrentChange(page: number) {
  await refundStore.changePage(page)
}
</script>

<template>
  <div class="refund-table">
    <!-- 表格头部 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <el-icon><List /></el-icon>
            <span>可退费项目列表</span>
            <el-tag v-if="refundStore.hasData" type="info" size="small">
              {{ refundStore.statistics.totalItems }} 项
            </el-tag>
          </div>
          <div class="header-right">
            <el-button
              type="danger"
              :disabled="!refundStore.hasSelectedItems"
              :loading="refundStore.loading"
              @click="handleBatchRefund"
            >
              <el-icon><Money /></el-icon>
              批量退费
              <span v-if="refundStore.hasSelectedItems">
                ({{ refundStore.selectedStatistics.totalItems }}项)
              </span>
            </el-button>
            <el-button
              type="default"
              :loading="refundStore.loading"
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
        v-loading="refundStore.loading"
        :data="refundStore.refundableItems"
        @selection-change="handleSelectionChange"
        empty-text="暂无可退费数据"
        style="width: 100%"
      >
        <!-- 选择列 -->
        <el-table-column type="selection" width="55" />

        <!-- 项目信息 -->
        <el-table-column label="项目信息" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="item-info">
              <div class="item-name">{{ row.itemName }}</div>
              <div class="item-code">编码：{{ row.itemCode }}</div>
              <div v-if="row.description" class="item-description">
                {{ row.description }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 类型 -->
        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'DRUG' ? 'success' : 'primary'"
              size="small"
            >
              {{ row.type === 'DRUG' ? '药品' : '医疗项目' }}
            </el-tag>
            <div v-if="row.itemType" class="item-type-sub">
              <el-tag type="info" size="small">
                {{ getItemTypeLabel(row.itemType) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 患者信息 -->
        <el-table-column label="患者" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="patient-info">
              <div>{{ row.patientName }}</div>
              <div class="patient-id">ID: {{ row.patientId }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 单价 -->
        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 数量 -->
        <el-table-column label="数量" width="80" align="center">
          <template #default="{ row }">
            {{ row.quantity }}
          </template>
        </el-table-column>

        <!-- 总金额 -->
        <el-table-column label="总金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 缴费时间 -->
        <el-table-column label="缴费时间" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.chargeTime) }}
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              :loading="refundStore.loading"
              @click="handleSingleRefund(row)"
            >
              退费
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="refundStore.paginationMeta.page"
          v-model:page-size="refundStore.paginationMeta.size"
          :total="refundStore.paginationMeta.total"
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
        <!-- 全部数据统计 -->
        <el-col :span="12">
          <div class="stat-section">
            <h4>全部数据</h4>
            <el-row :gutter="16">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">总项目</div>
                  <div class="stat-value">
                    {{ refundStore.statistics.totalItems }}
                  </div>
                  <div class="stat-sub">项</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">药品</div>
                  <div class="stat-value">
                    {{ refundStore.statistics.drugCount }}
                  </div>
                  <div class="stat-sub">
                    ¥{{ refundStore.statistics.drugAmount.toFixed(2) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">医疗项目</div>
                  <div class="stat-value">
                    {{ refundStore.statistics.medicalCount }}
                  </div>
                  <div class="stat-sub">
                    ¥{{ refundStore.statistics.medicalAmount.toFixed(2) }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <div class="total-amount">
              <span>总金额：</span>
              <span class="amount-highlight"
                >¥{{ refundStore.statistics.totalAmount.toFixed(2) }}</span
              >
            </div>
          </div>
        </el-col>

        <!-- 选中项目统计 -->
        <el-col :span="12">
          <div class="stat-section">
            <h4>选中项目</h4>
            <el-row :gutter="16">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">总项目</div>
                  <div class="stat-value selected">
                    {{ refundStore.selectedStatistics.totalItems }}
                  </div>
                  <div class="stat-sub">项</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">药品</div>
                  <div class="stat-value selected">
                    {{ refundStore.selectedStatistics.drugCount }}
                  </div>
                  <div class="stat-sub">
                    ¥{{ refundStore.selectedStatistics.drugAmount.toFixed(2) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">医疗项目</div>
                  <div class="stat-value selected">
                    {{ refundStore.selectedStatistics.medicalCount }}
                  </div>
                  <div class="stat-sub">
                    ¥{{
                      refundStore.selectedStatistics.medicalAmount.toFixed(2)
                    }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <div class="total-amount">
              <span>退费金额：</span>
              <span class="amount-highlight selected"
                >¥{{
                  refundStore.selectedStatistics.totalAmount.toFixed(2)
                }}</span
              >
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.refund-table {
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

  .item-info {
    .item-name {
      font-weight: 600;
      margin-bottom: 4px;
      color: $text-color;
      font-size: $font-body;
      font-family: $font-family-body;
    }

    .item-code {
      font-size: $font-caption;
      color: $text-color-secondary;
      margin-bottom: 2px;
      font-family: $font-family-code;
    }

    .item-description {
      font-size: $font-caption;
      color: $text-color-secondary;
      font-family: $font-family-body;
    }
  }

  .patient-info {
    font-family: $font-family-body;

    .patient-id {
      font-size: $font-caption;
      color: $text-color-secondary;
      margin-top: 2px;
    }
  }

  .item-type-sub {
    margin-top: 4px;
  }

  .price-text {
    color: $text-color-secondary;
    font-weight: 500;
    font-size: $font-body;
    font-family: $font-family-body;
  }

  .amount-text {
    color: $error-color;
    font-weight: 600;
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

  .stat-section {
    h4 {
      margin: 0 0 $margin-base 0;
      color: $text-color;
      font-size: $font-subtitle;
      text-align: center;
      font-family: $font-family-title;
      font-weight: 600;
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

        &.selected {
          color: $error-color;
        }
      }

      .stat-sub {
        font-size: $font-caption;
        color: $text-color-secondary;
        margin-top: 2px;
        font-family: $font-family-body;
      }
    }

    .total-amount {
      text-align: center;
      margin-top: $margin-base;
      padding-top: $padding-sm;
      border-top: 1px solid $border-color-light;
      font-size: $font-body;
      color: $text-color;
      font-family: $font-family-body;

      .amount-highlight {
        color: $error-color;
        font-size: $font-subtitle;
        font-weight: 700;
        margin-left: $margin-sm;
        font-family: $font-family-title;

        &.selected {
          color: $error-color;
        }
      }
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
</style>
