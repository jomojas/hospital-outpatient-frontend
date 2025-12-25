<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'

import { useInformationBaseInfoStore } from '@/store/Information/BaseInfoStore'
import type {
  CreateRegistrationLevelRequest,
  RegistrationLevelResponse,
  SetRegistrationPriceRequest,
  UpdateRegistrationLevelStatusParams
} from '@/types/Information/RegistrationLevel'

import RegistrationLevelTable from './components/RegistrationLevelTable.vue'
import CreateRegistrationLevelDialog from './components/CreateRegistrationLevelDialog.vue'
import EditRegistrationPriceDialog from './components/EditRegistrationPriceDialog.vue'

const store = useInformationBaseInfoStore()

const createDialogVisible = ref(false)
const editPriceDialogVisible = ref(false)
const editingRow = ref<RegistrationLevelResponse | null>(null)

const actionLoading = ref(false)

onMounted(() => {
  store.fetchRegistrationLevels()
})

const openCreate = () => {
  createDialogVisible.value = true
}

const onCreate = async (payload: CreateRegistrationLevelRequest) => {
  actionLoading.value = true
  try {
    await store.handleCreateRegistrationLevel(payload)
    createDialogVisible.value = false
    await store.fetchRegistrationLevels()
  } finally {
    actionLoading.value = false
  }
}

const openEditPrice = (row: RegistrationLevelResponse) => {
  editingRow.value = row
  editPriceDialogVisible.value = true
}

const onEditPrice = async (payload: {
  code: string
  price: number | string
}) => {
  actionLoading.value = true
  try {
    const body: SetRegistrationPriceRequest = {
      prices: [{ code: payload.code, price: payload.price }]
    }
    await store.handleUpdateRegistrationPrices(body)
    editPriceDialogVisible.value = false
    await store.fetchRegistrationLevels()
  } finally {
    actionLoading.value = false
  }
}

const onSetStatus = async (payload: UpdateRegistrationLevelStatusParams) => {
  actionLoading.value = true
  try {
    await store.handleUpdateRegistrationLevelStatus(payload)
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="information-page">
    <div class="toolbar">
      <div class="title">挂号级别管理</div>
      <div class="actions">
        <el-button type="primary" :icon="Plus" @click="openCreate"
          >新增号别</el-button
        >
        <el-button :icon="Refresh" @click="store.fetchRegistrationLevels()"
          >刷新</el-button
        >
      </div>
    </div>

    <el-card>
      <registration-level-table
        :data="store.registrationLevels"
        :loading="store.registrationLevelsLoading"
        @edit-price="openEditPrice"
        @set-status="onSetStatus"
      />
    </el-card>

    <create-registration-level-dialog
      v-model="createDialogVisible"
      :loading="actionLoading"
      @submit="onCreate"
    />

    <edit-registration-price-dialog
      v-model="editPriceDialogVisible"
      :row="editingRow"
      :loading="actionLoading"
      @submit="onEditPrice"
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
  }
}
</style>
