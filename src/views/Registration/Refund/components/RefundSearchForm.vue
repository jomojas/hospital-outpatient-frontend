<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRefundStore } from '@/store/Registration/Refund/RefundStore'
import { useRefundLookupStore } from '@/store/Registration/Refund/LookupStore'

// ✅ 使用 Pinia store
const refundStore = useRefundStore()
const lookupStore = useRefundLookupStore()

// ✅ 本地搜索表单
const searchForm = reactive({
  date: '',
  deptId: undefined as number | undefined,
  doctorId: undefined as number | undefined,
  status: '',
  keyword: ''
})

// 搜索处理
async function handleSearch() {
  const filters = Object.fromEntries(
    Object.entries(searchForm).filter(
      ([_, value]) => value !== undefined && value !== ''
    )
  )

  if (Object.keys(filters).length === 0) {
    // 如果没有任何搜索条件，则重置
    await refundStore.reset()
  } else {
    // 有搜索条件，则执行搜索
    await refundStore.search(filters)
  }
}

// ✅ 重置搜索
async function handleReset() {
  Object.assign(searchForm, {
    date: '',
    deptId: undefined,
    doctorId: undefined,
    status: '',
    keyword: ''
  })

  await refundStore.reset()
}

// 初始化数据
onMounted(async () => {
  await lookupStore.initialize()
})
</script>

<template>
  <el-card class="search-card" shadow="never">
    <div class="search-title">
      挂号记录查询
      <span v-if="refundStore.loading" class="loading-text">正在查询...</span>
    </div>

    <el-form :model="searchForm" :inline="true" label-width="80px">
      <el-form-item label="挂号日期">
        <el-date-picker
          v-model="searchForm.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          clearable
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="科室">
        <el-select
          v-model="searchForm.deptId"
          placeholder="请选择科室"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="option in lookupStore.departmentOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="医生">
        <el-select
          v-model="searchForm.doctorId"
          placeholder="请选择医生"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="option in lookupStore.doctorOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          >
            <span>{{ option.label }}</span>
            <span v-if="option.isExpert" class="expert-tag">专家</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ option.departmentName }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="option in lookupStore.statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="科室名/患者姓名/医生姓名"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="handleSearch"
          :loading="refundStore.loading"
        >
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- ✅ 显示统计信息 -->
    <div v-if="refundStore.hasData" class="search-summary">
      共找到 {{ refundStore.paginationMeta.total }} 条记录
    </div>
  </el-card>
</template>

<style scoped lang="scss">
@use '@/styles/semantic' as *;

.search-card {
  border: 1px solid $border-color-light;
  border-radius: $border-radius-base;
}

.search-title {
  font-size: $font-subtitle;
  font-weight: 600;
  color: $text-color;
  margin-bottom: $margin-base;
  padding-bottom: $padding-sm;
  border-bottom: 1px solid $border-color-light;

  .loading-text {
    font-size: $font-caption;
    color: $primary-color;
    margin-left: $margin-sm;
  }
}

.search-summary {
  margin-top: $margin-base;
  padding: $padding-sm;
  background-color: $background-color-hover;
  border-radius: $border-radius-base;
  font-size: $font-caption;
  color: $text-color-secondary;
}

// ✅ 专家标签样式
.expert-tag {
  display: inline-block;
  padding: 2px 6px;
  margin-left: 4px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  color: $background-color;
  background-color: $warning-color;
  border-radius: 3px;
  transform: scale(0.9);
  vertical-align: middle;

  // 添加渐变效果
  background: linear-gradient(135deg, $warning-color 0%, #ff8c00 100%);

  // 添加阴影
  box-shadow: 0 1px 3px rgba($warning-color, 0.3);

  // 添加过渡动画
  transition: all 0.2s ease;

  // 悬停效果
  &:hover {
    transform: scale(1);
    box-shadow: 0 2px 6px rgba($warning-color, 0.4);
  }
}
</style>
