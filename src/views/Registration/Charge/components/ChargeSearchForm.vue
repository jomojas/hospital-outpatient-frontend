<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useChargeStore } from '@/store/Registration/Charge/ChargeStore'
import { useChargeLookupStore } from '@/store/Registration/Charge/LookupStore'

// Store
const chargeStore = useChargeStore()
const lookupStore = useChargeLookupStore()

// 搜索表单
const searchForm = reactive({
  type: undefined,
  keyword: '',
  drugCategory: undefined,
  itemType: undefined,
  sortBy: 'createTime',
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
  // 过滤掉空值
  const params = Object.fromEntries(
    Object.entries(searchForm).filter(
      ([_, value]) => value !== undefined && value !== ''
    )
  )

  // 无论有没有搜索条件，都执行搜索
  await chargeStore.search(params)
}

// 重置处理
async function handleReset() {
  // 重置表单
  Object.assign(searchForm, {
    type: undefined,
    keyword: '',
    drugCategory: undefined,
    itemType: undefined,
    sortBy: 'createTime',
    order: 'desc'
  })

  // 重置数据（获取默认列表）
  await chargeStore.reset()
}
</script>

<template>
  <div class="charge-search-form">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <el-icon><Search /></el-icon>
          <span>搜索条件</span>
        </div>
      </template>

      <el-form
        :model="searchForm"
        label-width="120px"
        :inline="true"
        @submit.prevent="handleSearch"
        class="search-form"
        label-position="right"
      >
        <!-- 第一行：项目类型 + 关键词 -->
        <el-row :gutter="20">
          <el-col :xl="12" :lg="12" :md="12" :sm="24">
            <el-form-item label="项目类型">
              <el-select
                v-model="searchForm.type"
                placeholder="请选择项目类型"
                clearable
                style="width: 150px"
              >
                <el-option label="药品" value="DRUG" />
                <el-option label="医疗项目" value="ITEM" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="12" :lg="12" :md="12" :sm="24">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="患者名/项目名/药品名"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：药品分类 + 医疗项目 -->
        <el-row :gutter="20">
          <el-col :xl="12" :lg="12" :md="12" :sm="24">
            <el-form-item label="药品分类">
              <el-select
                v-model="searchForm.drugCategory"
                placeholder="请选择药品分类"
                clearable
                style="width: 150px"
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

          <el-col :xl="12" :lg="12" :md="12" :sm="24">
            <el-form-item label="医疗项目">
              <el-select
                v-model="searchForm.itemType"
                placeholder="请选择医疗项目类型"
                clearable
                style="width: 150px"
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
        </el-row>

        <!-- 第三行：排序方式 + 排序方向 -->
        <el-row :gutter="20">
          <el-col :xl="12" :lg="12" :md="12" :sm="24">
            <el-form-item label="排序方式">
              <el-select
                v-model="searchForm.sortBy"
                placeholder="请选择排序字段"
                style="width: 150px"
              >
                <el-option label="按金额排序" value="totalAmount" />
                <el-option label="按时间排序" value="createTime" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="12" :lg="12" :md="12" :sm="24">
            <el-form-item label="排序方向">
              <el-select
                v-model="searchForm.order"
                placeholder="请选择排序方向"
                style="width: 150px"
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
            <el-form-item>
              <el-button
                type="primary"
                @click="handleSearch"
                :loading="chargeStore.loading"
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
.charge-search-form {
  margin-bottom: 20px;

  .search-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
  }
}
</style>
