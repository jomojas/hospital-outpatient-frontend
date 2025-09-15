<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import {
  listDrugCategories,
  listItemTypes
} from '@/api/modules/Registration/Charge'

const filters = reactive({
  type: null,
  keyword: '',
  cascaderSelection: [], // Cascader selected value [type, sub-type]
  sortBy: null,
  order: null
})

const drugCategories = reactive([])
const itemTypes = reactive([])

onMounted(async () => {
  // Fetch drug categories
  const drugResponse = await listDrugCategories()
  drugCategories.push(...drugResponse)

  // Fetch item types
  const itemResponse = await listItemTypes()
  itemTypes.push(...itemResponse)
})

// Computed cascader options
const cascaderOptions = computed(() => [
  {
    value: 'DRUG',
    label: '药品',
    children: drugCategories.map((category) => ({
      value: category.categoryId,
      label: category.categoryName
    }))
  },
  {
    value: 'ITEM',
    label: '医疗项目',
    children: itemTypes.map((item) => ({
      value: item.code,
      label: item.name
    }))
  }
])

const emit = defineEmits(['update:filters'])

// Apply filters
const applyFilters = () => {
  if (filters.cascaderSelection.length > 0) {
    // Update filters with cascader selection
    filters.type = filters.cascaderSelection[0] // First level selection
    filters.itemType =
      filters.type === 'ITEM' ? filters.cascaderSelection[1] : null // Second level for ITEM
    filters.drugCategory =
      filters.type === 'DRUG' ? filters.cascaderSelection[1] : null // Second level for DRUG
  } else {
    // Reset type, itemType, and drugCategory if cascaderSelection is empty
    filters.type = null
    filters.itemType = null
    filters.drugCategory = null
  }

  emit('update:filters', { ...filters })
}

// Reset filters
const resetFilters = () => {
  Object.keys(filters).forEach((key) => (filters[key] = null))
  filters.keyword = ''
  filters.cascaderSelection = [] // Reset cascaderSelection to empty array
  emit('update:filters', { ...filters })
}
</script>
<template>
  <el-form inline>
    <el-form-item label="类型和类别">
      <el-cascader
        v-model="filters.cascaderSelection"
        :options="cascaderOptions"
        placeholder="请选择类型和类别"
      />
    </el-form-item>
    <el-form-item label="关键字">
      <el-input v-model="filters.keyword" placeholder="请输入关键字" />
    </el-form-item>
    <el-form-item label="排序">
      <el-select v-model="filters.sortBy" placeholder="请选择排序字段">
        <el-option value="totalAmount" label="总金额"></el-option>
        <el-option value="createTime" label="创建时间"></el-option>
      </el-select>
      <el-select v-model="filters.order" placeholder="请选择排序方式">
        <el-option value="asc" label="升序"></el-option>
        <el-option value="desc" label="降序"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="applyFilters">筛选</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped></style>
