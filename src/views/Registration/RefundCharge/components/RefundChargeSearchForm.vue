<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useRefundChargeStore } from '@/store/Registration/RefundCharge/RefundChargeStore'
import { useRefundChargeLookupStore } from '@/store/Registration/RefundCharge/LookupStore'
import type { RefundableItemsQueryParams } from '@/types/Registration/RefundCharge'

// Store
const refundStore = useRefundChargeStore()
const lookupStore = useRefundChargeLookupStore()

// 搜索表单
const searchForm = reactive<Partial<RefundableItemsQueryParams>>({
  type: undefined,
  keyword: '',
  drugCategory: undefined,
  itemType: undefined,
  sortBy: 'chargeTime',
  order: 'desc'
})

// 监听项目类型变化，清空相关字段
watch(
  () => searchForm.type,
  (newType) => {
    if (newType === 'DRUG') {
      searchForm.itemType = undefined
    } else if (newType === 'ITEM') {
      searchForm.drugCategory = undefined
    }
  }
)

// 搜索处理
async function handleSearch() {
  // console.log('🔍 退费搜索，原始表单:', searchForm)

  // 过滤掉空值
  const params = Object.fromEntries(
    Object.entries(searchForm).filter(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        console.log(`过滤掉空值: ${key} = ${value}`)
        return false
      }
      // console.log(`保留有效值: ${key} = ${value}`)
      return true
    })
  )

  // console.log('📋 最终搜索参数:', params)

  // 执行搜索
  await refundStore.search(params)
}

// 重置处理
async function handleReset() {
  // 重置表单
  Object.assign(searchForm, {
    type: undefined,
    keyword: '',
    drugCategory: undefined,
    itemType: undefined,
    sortBy: 'chargeTime',
    order: 'desc'
  })

  // 重置数据
  await refundStore.reset()
}
</script>

<template>
  <div class="refund-search-form">
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
        <!-- 第一行：项目类型 + 关键词 + 药品分类 -->
        <el-row :gutter="20">
          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="项目类型">
              <el-select
                v-model="searchForm.type"
                placeholder="请选择项目类型"
                clearable
                style="width: 180px"
              >
                <el-option label="药品" value="DRUG" />
                <el-option label="医疗项目" value="ITEM" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="患者名/项目名/药品名"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="药品分类">
              <el-select
                v-model="searchForm.drugCategory"
                placeholder="请选择药品分类"
                clearable
                style="width: 180px"
                :loading="lookupStore.loadingDrugCategories"
                :disabled="searchForm.type === 'ITEM'"
              >
                <el-option
                  v-for="option in lookupStore.drugCategoryOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :title="option.description"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：医疗项目 + 排序方式 + 排序方向 -->
        <el-row :gutter="20">
          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="医疗项目">
              <el-select
                v-model="searchForm.itemType"
                placeholder="请选择医疗项目类型"
                clearable
                style="width: 180px"
                :loading="lookupStore.loadingProjectTypes"
                :disabled="searchForm.type === 'DRUG'"
              >
                <el-option
                  v-for="option in lookupStore.projectTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="排序方式">
              <el-select
                v-model="searchForm.sortBy"
                placeholder="请选择排序字段"
                style="width: 180px"
              >
                <el-option label="按金额排序" value="totalAmount" />
                <el-option label="按缴费时间排序" value="chargeTime" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="排序方向">
              <el-select
                v-model="searchForm.order"
                placeholder="请选择排序方向"
                style="width: 180px"
              >
                <el-option label="升序" value="asc" />
                <el-option label="降序" value="desc" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row>
          <el-col :span="24" style="text-align: right">
            <el-form-item style="margin-bottom: 0">
              <el-button
                type="primary"
                @click="handleSearch"
                :loading="refundStore.loading"
              >
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/tokens' as *;

.refund-search-form {
  margin-bottom: $margin-base;

  .search-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: $margin-sm;
      font-weight: 600;
      color: $text-color;
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: $margin-base;

      .el-form-item__label {
        text-align: left !important;
        justify-content: flex-start !important;
        color: $text-color;
      }
    }

    :deep(.el-select) {
      width: 100%;
    }

    :deep(.el-input) {
      width: 100%;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .refund-search-form {
    .search-form {
      :deep(.el-form-item) {
        margin-bottom: $margin-sm;

        .el-form-item__label {
          padding-right: $margin-sm;
        }
      }
    }
  }
}
</style>
