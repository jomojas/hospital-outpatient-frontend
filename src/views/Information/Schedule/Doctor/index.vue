<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import DoctorToolbar from './components/DoctorToolbar.vue'
import DoctorScheduleTable from './components/DoctorScheduleTable.vue'
import SetQuotaDialog from './components/SetQuotaDialog.vue'
import BatchQuotaDialog from './components/BatchQuotaDialog.vue'
import CopyScheduleDialog from './components/CopyScheduleDialog.vue'

import { useInformationBaseInfoStore } from '@/store/Information/BaseInfoStore'
import { useInformationScheduleStore } from '@/store/Information/ScheduleStore'
import type {
  BatchSetQuotaRequest,
  CopyScheduleRequest,
  DailySchedule,
  DoctorScheduleResponse,
  SetQuotaRequest
} from '@/types/Information/Schedule'

const baseInfoStore = useInformationBaseInfoStore()
const scheduleStore = useInformationScheduleStore()

const dateRange = ref<[string, string] | null>(null)

const setQuotaDialogVisible = ref(false)
const batchDialogVisible = ref(false)
const copyDialogVisible = ref(false)

const setQuotaInitial = ref<SetQuotaRequest | null>(null)
const batchInitial = ref<Pick<
  BatchSetQuotaRequest,
  'staffId' | 'startDate' | 'endDate'
> | null>(null)
const copyInitial = ref<Pick<CopyScheduleRequest, 'departmentId'> | null>(null)

const actionLoading = ref(false)

onMounted(async () => {
  await baseInfoStore.fetchAllDepartments()
})

const ensureQueryParams = () => {
  if (!scheduleStore.query.departmentId) {
    ElMessage.warning('请选择科室')
    return false
  }
  if (!dateRange.value?.[0] || !dateRange.value?.[1]) {
    ElMessage.warning('请选择日期范围')
    return false
  }
  scheduleStore.query.startDate = dateRange.value[0]
  scheduleStore.query.endDate = dateRange.value[1]
  return true
}

const onQuery = async () => {
  if (!ensureQueryParams()) return
  await scheduleStore.fetchSchedules()
}

const onRefresh = async () => {
  await scheduleStore.fetchSchedules()
}

const openSetQuota = (payload?: {
  row: DoctorScheduleResponse
  day?: DailySchedule
}) => {
  if (!ensureQueryParams()) return

  setQuotaInitial.value = {
    staffId: payload?.row.staffId ?? scheduleStore.schedules[0]?.staffId ?? 0,
    date: payload?.day?.date ?? scheduleStore.query.startDate,
    quota: payload?.day?.quota ?? 0
  }
  setQuotaDialogVisible.value = true
}

const submitSetQuota = async (payload: SetQuotaRequest) => {
  actionLoading.value = true
  try {
    await scheduleStore.handleSetQuota(payload)
    setQuotaDialogVisible.value = false
    await scheduleStore.fetchSchedules()
  } finally {
    actionLoading.value = false
  }
}

const openBatch = () => {
  if (!ensureQueryParams()) return
  batchInitial.value = {
    staffId: scheduleStore.schedules[0]?.staffId ?? 0,
    startDate: scheduleStore.query.startDate,
    endDate: scheduleStore.query.endDate
  }
  batchDialogVisible.value = true
}

const submitBatch = async (payload: BatchSetQuotaRequest) => {
  actionLoading.value = true
  try {
    await scheduleStore.handleBatchSetQuota(payload)
    batchDialogVisible.value = false
    await scheduleStore.fetchSchedules()
  } finally {
    actionLoading.value = false
  }
}

const openCopy = () => {
  copyInitial.value = {
    departmentId: scheduleStore.query.departmentId || 0
  }
  copyDialogVisible.value = true
}

const submitCopy = async (payload: CopyScheduleRequest) => {
  actionLoading.value = true
  try {
    await scheduleStore.handleCopySchedule(payload)
    copyDialogVisible.value = false
    if (
      scheduleStore.query.departmentId === Number(payload.departmentId) &&
      dateRange.value
    ) {
      await scheduleStore.fetchSchedules()
    }
  } finally {
    actionLoading.value = false
  }
}

const updateDateRange = (v: [string, string] | null) => {
  dateRange.value = v
}
</script>

<template>
  <div class="information-page">
    <DoctorToolbar
      :department-id="scheduleStore.query.departmentId"
      :date-range="dateRange"
      :departments="baseInfoStore.allDepartments"
      :loading="scheduleStore.loading || actionLoading"
      @update:department-id="(v) => (scheduleStore.query.departmentId = v || 0)"
      @update:date-range="updateDateRange"
      @query="onQuery"
      @refresh="onRefresh"
      @open-set-quota="() => openSetQuota()"
      @open-batch="openBatch"
      @open-copy="openCopy"
    />

    <el-card>
      <DoctorScheduleTable
        :data="scheduleStore.schedules"
        :loading="scheduleStore.loading"
        @set-quota="openSetQuota"
      />
    </el-card>

    <SetQuotaDialog
      v-model="setQuotaDialogVisible"
      :initial-data="setQuotaInitial"
      :schedules="scheduleStore.schedules"
      :loading="actionLoading"
      @submit="submitSetQuota"
    />

    <BatchQuotaDialog
      v-model="batchDialogVisible"
      :initial-data="batchInitial"
      :schedules="scheduleStore.schedules"
      :loading="actionLoading"
      @submit="submitBatch"
    />

    <CopyScheduleDialog
      v-model="copyDialogVisible"
      :initial-data="copyInitial"
      :departments="baseInfoStore.allDepartments"
      :loading="actionLoading"
      @submit="submitCopy"
    />
  </div>
</template>

<style scoped lang="scss">
.information-page {
  padding: $padding-lg;
}
</style>
