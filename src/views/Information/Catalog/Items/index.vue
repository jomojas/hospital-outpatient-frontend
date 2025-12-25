<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useInformationCatalogStore } from '@/store/Information/CatalogStore'
import { useInformationBaseInfoStore } from '@/store/Information/BaseInfoStore'
import type {
  CreateMedicalItemRequest,
  MedicalItemResponse,
  UpdateMedicalItemRequest
} from '@/types/Information/MedicalItem'

import ItemsToolbar from './components/ItemsToolbar.vue'
import ItemsTable from './components/ItemsTable.vue'
import ItemFormDialog from './components/ItemFormDialog.vue'

const store = useInformationCatalogStore()
const baseInfoStore = useInformationBaseInfoStore()

const createDialogVisible = ref(false)
const editDialogVisible = ref(false)

const editingRow = ref<MedicalItemResponse | null>(null)

const actionLoading = ref(false)

onMounted(async () => {
  await Promise.all([
    store.fetchDictionaries(),
    baseInfoStore.fetchAllDepartments(),
    store.fetchMedicalItems()
  ])
})

const onSearch = async () => {
  store.medicalItemsParams.page = 1
  await store.fetchMedicalItems()
}

const openCreate = () => {
  createDialogVisible.value = true
}

const submitCreate = async (
  payload: CreateMedicalItemRequest | UpdateMedicalItemRequest
) => {
  actionLoading.value = true
  try {
    await store.handleCreateMedicalItem(payload as CreateMedicalItemRequest)
    createDialogVisible.value = false
    await store.fetchMedicalItems()
  } finally {
    actionLoading.value = false
  }
}

const openEdit = (row: MedicalItemResponse) => {
  editingRow.value = row
  editDialogVisible.value = true
}

const submitEdit = async (
  payload: CreateMedicalItemRequest | UpdateMedicalItemRequest
) => {
  if (!editingRow.value) return
  actionLoading.value = true
  try {
    await store.handleUpdateMedicalItem(
      editingRow.value.itemId,
      payload as UpdateMedicalItemRequest
    )
    editDialogVisible.value = false
    await store.fetchMedicalItems()
  } finally {
    actionLoading.value = false
  }
}

const toggleStatus = async (row: MedicalItemResponse) => {
  actionLoading.value = true
  try {
    await store.handleToggleMedicalItemStatus(row.itemId)
    await store.fetchMedicalItems()
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="information-page">
    <ItemsToolbar
      :keyword="store.medicalItemsParams.keyword"
      :status="store.medicalItemsParams.status"
      :loading="store.medicalItemsLoading || actionLoading"
      @update:keyword="(v) => (store.medicalItemsParams.keyword = v)"
      @update:status="(v) => (store.medicalItemsParams.status = v)"
      @search="onSearch"
      @refresh="store.fetchMedicalItems()"
      @create="openCreate"
    />

    <el-card>
      <ItemsTable
        :data="store.medicalItems"
        :loading="store.medicalItemsLoading"
        @edit="openEdit"
        @toggle-status="toggleStatus"
      />

      <div class="pagination">
        <el-pagination
          v-model:current-page="store.medicalItemsParams.page"
          v-model:page-size="store.medicalItemsParams.pageSize"
          :total="store.medicalItemsMeta.total"
          layout="total, prev, pager, next"
          @current-change="store.fetchMedicalItems"
        />
      </div>
    </el-card>

    <ItemFormDialog
      v-model="createDialogVisible"
      mode="create"
      :row="null"
      :item-types="store.itemTypes"
      :departments="baseInfoStore.allDepartments"
      :loading="actionLoading"
      @submit="submitCreate"
    />

    <ItemFormDialog
      v-model="editDialogVisible"
      mode="edit"
      :row="editingRow"
      :item-types="store.itemTypes"
      :departments="baseInfoStore.allDepartments"
      :loading="actionLoading"
      @submit="submitEdit"
    />
  </div>
</template>

<style scoped lang="scss">
.information-page {
  padding: $padding-lg;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $padding-base;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: $padding-base;
    flex-wrap: wrap;
  }

  .keyword {
    width: 260px;
  }

  .status {
    width: 140px;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: $padding-base;
}
</style>
