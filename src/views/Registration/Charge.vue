<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import {
  listChargeItems,
  settleCharges
} from '@/api/modules/Registration/Charge'
import ChargeItemsFilter from './components/ChargeItemsFilter.vue'
import ChargeItemsTable from './components/ChargeItemsTable.vue'

const chargeItems = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const filters = reactive({
  type: null,
  keyword: '',
  itemType: null,
  drugCategory: null,
  sortBy: null,
  order: null
})

// Watch for pagination or filters changes
watch([filters, pagination], async () => {
  console.log('Filters or pagination updated:', filters, pagination)
  const response = await listChargeItems({
    type: filters.type,
    keyword: filters.keyword,
    itemType: filters.itemType,
    drugCategory: filters.drugCategory,
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: filters.sortBy,
    order: filters.order
  })
  console.log('Fetched charge items:', response)

  chargeItems.value = response.data
  pagination.total = response.meta?.total ?? 0
})

onMounted(async () => {
  // Initial data fetch
  const response = await listChargeItems({
    page: pagination.page,
    pageSize: pagination.pageSize
  })

  chargeItems.value = response.data
  pagination.total = response.meta?.total ?? 0
})

// Handle filter updates
const onFiltersUpdate = (newFilters) => {
  console.log('Filters updated:', newFilters)
  Object.assign(filters, newFilters)
  pagination.page = 1 // Reset page to 1 on filter change
}

// Handle pagination updates
const onPaginationUpdate = (newPagination) => {
  Object.assign(pagination, newPagination)
}

// Handle charge action
const handleCharge = async (item) => {}
</script>
<template>
  <charge-items-filter @update:filters="onFiltersUpdate" />
  <charge-items-table
    :tableData="chargeItems"
    :pagination="pagination"
    @update:pagination="onPaginationUpdate"
    @Charge="handleCharge"
  />
</template>

<style scoped></style>
