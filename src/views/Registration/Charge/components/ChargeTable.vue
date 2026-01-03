<script setup lang="ts">
import { computed } from 'vue'
import {
  List,
  CreditCard,
  Refresh,
  DataAnalysis
} from '@element-plus/icons-vue'
import { useChargeStore } from '@/store/Registration/Charge/ChargeStore'
import { usePaymentDialogStore } from '@/store/Registration/Charge/PaymentDialogStore'
import ChargePaymentSelector from './ChargePaymentSelector.vue'
import type { ChargeItem } from '@/types/Registration/Charge'

// Store
const chargeStore = useChargeStore()
const paymentDialogStore = usePaymentDialogStore()

// 分页数据
const currentPage = computed({
  get: () => chargeStore.paginationMeta.page,
  set: (value) => value
})

const pageSize = computed({
  get: () => chargeStore.paginationMeta.size,
  set: (value) => value
})

// 选择变化处理
function handleSelectionChange(selection: ChargeItem[]) {
  chargeStore.setSelectedItems(selection)
}

// 单个缴费 - 直接打开弹窗
function handleSingleCharge(item: ChargeItem) {
  paymentDialogStore.openDialog([item])
}

// 批量缴费 - 直接使用 Store 中的选中项目
function handleBatchCharge() {
  if (chargeStore.selectedItems.length === 0) {
    return
  }
  paymentDialogStore.openDialog(chargeStore.selectedItems)
}

// 刷新数据
async function handleRefresh() {
  await chargeStore.refresh()
}

// 分页大小变化
async function handleSizeChange(size: number) {
  await chargeStore.changePage(1, size)
}

// 当前页变化
async function handleCurrentChange(page: number) {
  await chargeStore.changePage(page)
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

// 格式化日期时间
function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="charge-table">
    <el-card>
      <!-- 表格工具栏 -->
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <el-icon><List /></el-icon>
            <span>缴费项目列表</span>
            <el-tag v-if="chargeStore.hasData" type="info" size="small">
              共 {{ chargeStore.paginationMeta.total }} 条
            </el-tag>
          </div>
          <div class="header-right">
            <el-button
              type="primary"
              :disabled="!chargeStore.hasSelectedItems"
              @click="handleBatchCharge"
            >
              <el-icon><CreditCard /></el-icon>
              批量缴费 ({{ chargeStore.selectedItems.length }})
            </el-button>
            <el-button @click="handleRefresh" :loading="chargeStore.loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        :data="chargeStore.chargeItems"
        :loading="chargeStore.loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        empty-text="暂无待缴费项目"
      >
        <!-- 多选列 -->
        <el-table-column type="selection" width="55" align="center" />

        <!-- 患者信息 -->
        <el-table-column prop="patientName" label="患者姓名" width="120" />

        <!-- 项目信息 -->
        <el-table-column label="项目信息" min-width="200">
          <template #default="{ row }">
            <div class="item-info">
              <div class="item-name">{{ row.itemName }}</div>
              <div class="item-code">编码: {{ row.itemCode }}</div>
              <div class="item-description" v-if="row.description">
                {{ row.description }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 项目类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'DRUG' ? 'success' : 'primary'"
              size="small"
            >
              {{ row.type === 'DRUG' ? '药品' : '医疗项目' }}
            </el-tag>
            <div v-if="row.itemType" class="item-type-sub">
              <el-tag type="warning" size="small">
                {{ getItemTypeLabel(row.itemType) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 数量和单价 -->
        <el-table-column label="数量" width="80" align="center">
          <template #default="{ row }">
            {{ row.quantity }}
          </template>
        </el-table-column>

        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 总金额 -->
        <el-table-column label="总金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleSingleCharge(row)"
            >
              缴费
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="chargeStore.paginationMeta.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 统计信息 -->
    <el-card class="statistics-card" v-if="chargeStore.hasData">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计信息</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">总项目数</div>
            <div class="stat-value">
              {{ chargeStore.statistics.totalItems }}
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">总金额</div>
            <div class="stat-value amount">
              ¥{{ chargeStore.statistics.totalAmount.toFixed(2) }}
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">药品项目</div>
            <div class="stat-value">
              {{ chargeStore.statistics.drugCount }} 项
            </div>
            <div class="stat-sub">
              ¥{{ chargeStore.statistics.drugAmount.toFixed(2) }}
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">医疗项目</div>
            <div class="stat-value">
              {{ chargeStore.statistics.medicalCount }} 项
            </div>
            <div class="stat-sub">
              ¥{{ chargeStore.statistics.medicalAmount.toFixed(2) }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 缴费弹窗 -->
    <ChargePaymentSelector />
  </div>
</template>

<style scoped lang="scss">
.charge-table {
  :deep(.el-card) {
    border-radius: $border-radius-base * 2;
    box-shadow: $shadow-soft;
    border: 1px solid $border-color-light;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $padding-sm $padding-base;
    background: linear-gradient(
      90deg,
      rgba(63, 131, 248, 0.08),
      rgba(37, 99, 235, 0.04)
    );
    border-radius: $border-radius-base * 2;

    .header-left {
      display: flex;
      align-items: center;
      gap: $margin-sm;
      font-weight: 700;
      color: $text-color;
    }

    .header-right {
      display: flex;
      gap: $margin-sm;

      :deep(.el-button) {
        border-radius: $border-radius-base * 2;
      }
    }
  }

  .item-info {
    .item-name {
      font-weight: 600;
      margin-bottom: 4px;
      color: $text-color;
      font-size: $font-body;
    }

    .item-code {
      font-size: $font-caption;
      color: $text-color-secondary;
      margin-bottom: 2px;
    }

    .item-description {
      font-size: $font-caption;
      color: $text-color-secondary;
    }
  }

  .item-type-sub {
    margin-top: 4px;
  }

  .price-text {
    color: $text-color-secondary;
    font-weight: 500;
    font-size: $font-body;
  }

  .amount-text {
    color: $warning-color;
    font-weight: 600;
    font-size: $font-body;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: $margin-lg;
  }
}

.statistics-card {
  margin-top: $margin-base;
  border-radius: $border-radius-base * 2;
  box-shadow: $shadow-soft;
  border: 1px solid $border-color-light;

  .card-header {
    display: flex;
    align-items: center;
    gap: $margin-sm;
    font-weight: 600;
    color: $text-color;
  }

  .stat-item {
    text-align: center;
    padding: $padding-base;
    border-right: 1px solid $border-color-light;

    &:last-child {
      border-right: none;
    }

    .stat-label {
      font-size: $font-body;
      color: $text-color-secondary;
      margin-bottom: $margin-sm;
    }

    .stat-value {
      font-size: $font-title;
      font-weight: 600;
      color: $text-color;

      &.amount {
        color: $warning-color;
      }
    }

    .stat-sub {
      font-size: $font-caption;
      color: $text-color-secondary;
      margin-top: 4px;
    }
  }
}
</style>
