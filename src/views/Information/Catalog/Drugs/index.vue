<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useInformationCatalogStore } from '@/store/Information/CatalogStore'
import type {
  CreateDrugRequest,
  DrugDetailResponse,
  UpdateDrugRequest
} from '@/types/Information/DrugCatalog'

import DrugsToolbar from './components/DrugsToolbar.vue'
import DrugsTable from './components/DrugsTable.vue'
import DrugFormDialog from './components/DrugFormDialog.vue'

const store = useInformationCatalogStore()

const createDialogVisible = ref(false)
const editDialogVisible = ref(false)

const editingRow = ref<DrugDetailResponse | null>(null)

const actionLoading = ref(false)

onMounted(async () => {
  await store.fetchDictionaries()
  await store.fetchDrugCatalog()
})

const onSearch = async () => {
  store.drugCatalogParams.page = 1
  await store.fetchDrugCatalog()
}

const openCreate = () => {
  createDialogVisible.value = true
}

const submitCreate = async (payload: CreateDrugRequest | UpdateDrugRequest) => {
  actionLoading.value = true
  try {
    await store.handleCreateDrug(payload as CreateDrugRequest)
    createDialogVisible.value = false
    await store.fetchDrugCatalog()
  } finally {
    actionLoading.value = false
  }
}

const openEdit = (row: DrugDetailResponse) => {
  editingRow.value = row
  editDialogVisible.value = true
}

const submitEdit = async (payload: CreateDrugRequest | UpdateDrugRequest) => {
  if (!editingRow.value) return
  actionLoading.value = true
  try {
    await store.handleUpdateDrug(
      editingRow.value.drugId,
      payload as UpdateDrugRequest
    )
    editDialogVisible.value = false
    await store.fetchDrugCatalog()
  } finally {
    actionLoading.value = false
  }
}

const toggleStatus = async (row: DrugDetailResponse) => {
  actionLoading.value = true
  try {
    await store.handleToggleDrugStatus(row.drugId)
    await store.fetchDrugCatalog()
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="information-page">
    <DrugsToolbar
      :keyword="store.drugCatalogParams.keyword"
      :category-id="store.drugCatalogParams.categoryId"
      :categories="store.drugCategories"
      :loading="store.drugCatalogLoading || actionLoading"
      @update:keyword="(v) => (store.drugCatalogParams.keyword = v)"
      @update:category-id="(v) => (store.drugCatalogParams.categoryId = v)"
      @search="onSearch"
      @refresh="store.fetchDrugCatalog()"
      @create="openCreate"
    />

    <el-card>
      <DrugsTable
        :data="store.drugCatalog"
        :loading="store.drugCatalogLoading"
        @edit="openEdit"
        @toggle-status="toggleStatus"
      />

      <div class="pagination">
        <el-pagination
          v-model:current-page="store.drugCatalogParams.page"
          v-model:page-size="store.drugCatalogParams.pageSize"
          :total="store.drugCatalogMeta.total"
          layout="total, prev, pager, next"
          @current-change="store.fetchDrugCatalog"
        />
      </div>
    </el-card>

    <DrugFormDialog
      v-model="createDialogVisible"
      mode="create"
      :row="null"
      :categories="store.drugCategories"
      :units="store.drugUnits"
      :loading="actionLoading"
      @submit="submitCreate"
    />

    <DrugFormDialog
      v-model="editDialogVisible"
      mode="edit"
      :row="editingRow"
      :categories="store.drugCategories"
      :units="store.drugUnits"
      :loading="actionLoading"
      @submit="submitEdit"
    />
  </div>
</template>

<style scoped lang="scss">
.information-page {
  padding: $padding-lg;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: $padding-base;
}
</style>
