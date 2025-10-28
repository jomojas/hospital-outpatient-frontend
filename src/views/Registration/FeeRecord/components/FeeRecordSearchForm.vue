<template>
  <div class="fee-search-form">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <el-icon><Search /></el-icon>
          <span>搜索条件</span>
        </div>
      </template>

      <el-form
        :model="searchForm"
        label-width="100px"
        label-position="left"
        :inline="true"
        @submit.prevent="handleSearch"
        class="search-form"
      >
        <!-- 第一行：患者姓名 + 交易状态 + 快捷时间选择 -->
        <el-row :gutter="20">
          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="患者姓名">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入患者姓名"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="交易状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择交易状态"
                clearable
                style="width: 180px"
              >
                <el-option
                  v-for="option in TRANSACTION_STATUS_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="快捷时间">
              <el-select
                v-model="selectedTimeRange"
                placeholder="选择时间范围"
                clearable
                style="width: 180px"
                @change="onTimeRangeChange"
              >
                <el-option
                  v-for="(opt, idx) in TIME_RANGE_OPTIONS"
                  :key="opt.label"
                  :label="opt.label"
                  :value="idx"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：起始时间 + 结束时间 + 排序方式 -->
        <el-row :gutter="20">
          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="起始时间">
              <el-date-picker
                v-model="searchForm.startTime"
                type="datetime"
                placeholder="选择起始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                clearable
                style="width: 200px"
                @change="onDateChange"
              />
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="searchForm.endTime"
                type="datetime"
                placeholder="选择结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                clearable
                style="width: 200px"
                @change="onDateChange"
              />
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="排序方式">
              <el-select
                v-model="searchForm.sortBy"
                placeholder="请选择排序字段"
                style="width: 180px"
              >
                <el-option
                  v-for="option in SORT_BY_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：排序方向 + 操作按钮 -->
        <el-row :gutter="20">
          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="排序方向">
              <el-select
                v-model="searchForm.order"
                placeholder="请选择排序方向"
                style="width: 180px"
              >
                <el-option
                  v-for="option in ORDER_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="16" :lg="16" :md="12" :sm="24">
            <el-form-item style="margin-bottom: 0">
              <div style="text-align: right; width: 100%">
                <el-button
                  type="primary"
                  @click="handleSearch"
                  :loading="feeRecordStore.loading"
                >
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useFeeRecordStore } from '@/store/Registration/FeeRecord/FeeRecordStore'
import {
  TRANSACTION_STATUS_OPTIONS,
  SORT_BY_OPTIONS,
  ORDER_OPTIONS,
  TIME_RANGE_OPTIONS
} from '@/types/Registration/FeeRecord'
import type { FeeTransactionQueryParams } from '@/types/Registration/FeeRecord'

// Store
const feeRecordStore = useFeeRecordStore()

// 搜索表单
const searchForm = reactive<Partial<FeeTransactionQueryParams>>({
  name: '',
  status: undefined,
  startTime: '',
  endTime: '',
  sortBy: 'transactionTime',
  order: 'desc'
})

// 选中的快捷时间索引（null 表示未选择）
const selectedTimeRange = ref<number | null>(null)

// 当选择快捷时间时应用到表单
function onTimeRangeChange(index: number | null) {
  if (index === null || index === undefined) {
    // 清除快捷选择
    searchForm.startTime = ''
    searchForm.endTime = ''
    return
  }

  const pair = TIME_RANGE_OPTIONS[index]?.value?.()
  if (!pair || !pair.length) return

  // 把 "YYYY-MM-DDTHH:MM:SS" -> "YYYY-MM-DD HH:MM:SS"
  const start = pair[0].replace('T', ' ')
  const end = pair[1].replace('T', ' ')

  searchForm.startTime = start
  searchForm.endTime = end
}

// 用户手动在 date-picker 修改时间时，清除快捷选中状态
function onDateChange() {
  selectedTimeRange.value = null
}

// 搜索处理
async function handleSearch() {
  // console.log('🔍 费用记录搜索，原始表单:', searchForm)

  // 过滤掉空值
  const params = Object.fromEntries(
    Object.entries(searchForm).filter(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        // console.log(`过滤掉空值: ${key} = ${value}`)
        return false
      }
      console.log(`保留有效值: ${key} = ${value}`)
      return true
    })
  )

  // console.log('📋 最终搜索参数:', params)

  // 执行搜索
  await feeRecordStore.search(params)
}

// 重置处理
async function handleReset() {
  // 重置表单
  Object.assign(searchForm, {
    name: '',
    status: undefined,
    startTime: '',
    endTime: '',
    sortBy: 'transactionTime',
    order: 'desc'
  })

  selectedTimeRange.value = null

  // 重置数据
  await feeRecordStore.reset()
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.fee-search-form {
  margin-bottom: $margin-base;

  .search-card {
    border-radius: $border-radius-base;
    border: 1px solid $border-color-light;

    .card-header {
      display: flex;
      align-items: center;
      gap: $margin-sm;
      font-weight: 600;
      color: $text-color;
      font-family: $font-family-title;
      font-size: $font-subtitle;
    }
  }

  .search-form {
    font-family: $font-family-body;

    // ✅ 增加行间距
    .el-row {
      margin-bottom: $margin-lg; // 增加行与行之间的间距

      &:last-child {
        margin-bottom: 0; // 最后一行不需要下边距
      }
    }

    :deep(.el-form-item) {
      margin-bottom: $margin-base; // 保持表单项自身的下边距
      margin-right: 0;

      .el-form-item__label {
        text-align: left !important;
        justify-content: flex-start !important;
        font-weight: 500;
        color: $text-color;
        font-family: $font-family-body;
        font-size: $font-body;
        padding-right: $padding-sm;
        line-height: 1.4; // 增加行高
      }

      .el-form-item__content {
        flex: 1;

        .el-select,
        .el-input,
        .el-date-editor {
          font-family: $font-family-body;

          .el-input__inner {
            border-radius: $border-radius-base;
            border-color: $border-color;
            color: $text-color;
            font-size: $font-body;
            height: 40px; // 统一输入框高度

            &:hover {
              border-color: $primary-hover;
            }

            &:focus {
              border-color: $primary-color;
            }
          }

          .el-input__inner::placeholder {
            color: $text-color-disabled;
            font-size: $font-body;
          }
        }

        // ✅ 特别调整日期选择器高度
        .el-date-editor {
          height: 40px;

          .el-input__inner {
            height: 38px;
            line-height: 38px;
          }
        }

        // ✅ 特别调整选择框高度
        .el-select {
          .el-input {
            height: 40px;

            .el-input__inner {
              height: 38px;
              line-height: 38px;
            }
          }
        }
      }
    }

    // ✅ 最后一个表单项（包含按钮的那个）特殊处理
    .el-form-item:last-child {
      margin-bottom: 0;

      .el-form-item__content {
        display: flex;
        align-items: center;
        min-height: 40px; // 确保与其他输入框高度一致
      }
    }
  }
}

// 按钮样式
:deep(.el-button) {
  margin-left: $margin-sm;
  border-radius: $border-radius-base;
  font-family: $font-family-body;
  font-size: $font-body;
  height: 40px; // 统一按钮高度
  padding: 0 $padding-base;

  &:first-child {
    margin-left: 0;
  }
}

:deep(.el-button--primary) {
  background-color: $primary-color;
  border-color: $primary-color;

  &:hover {
    background-color: $primary-hover;
    border-color: $primary-hover;
  }

  &:active {
    background-color: $primary-active;
    border-color: $primary-active;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .fee-search-form {
    margin-bottom: $margin-sm;

    .search-card {
      .card-header {
        font-size: $font-body;
      }
    }

    .search-form {
      // ✅ 移动端减少行间距
      .el-row {
        margin-bottom: $margin-base;
      }

      :deep(.el-form-item) {
        margin-bottom: $margin-sm;

        .el-form-item__label {
          padding-right: $padding-sm;
          font-size: $font-caption;
        }

        .el-form-item__content {
          .el-select,
          .el-input,
          .el-date-editor {
            .el-input__inner {
              height: 36px; // 移动端稍微小一点
            }
          }
        }
      }
    }
  }

  :deep(.el-button) {
    font-size: $font-caption;
    height: 36px;
    padding: 0 $padding-sm;
  }
}
</style>
