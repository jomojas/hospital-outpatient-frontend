import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import {
  batchSetDoctorQuota,
  copyDoctorSchedule,
  listDoctorSchedules,
  setDoctorQuota
} from '@/api/modules/Information/Schedule'

import type {
  BatchSetQuotaRequest,
  CopyScheduleRequest,
  DoctorScheduleResponse,
  ScheduleQueryDTO,
  SetQuotaRequest
} from '@/types/Information/Schedule'

export const useInformationScheduleStore = defineStore(
  'informationScheduleStore',
  () => {
    const loading = ref(false)
    const schedules = ref<DoctorScheduleResponse[]>([])

    const query = reactive<ScheduleQueryDTO>({
      departmentId: 0,
      startDate: '',
      endDate: ''
    })

    async function fetchSchedules(params?: Partial<ScheduleQueryDTO>) {
      loading.value = true
      try {
        const realParams: ScheduleQueryDTO = {
          departmentId: params?.departmentId ?? query.departmentId,
          startDate: params?.startDate ?? query.startDate,
          endDate: params?.endDate ?? query.endDate
        }
        schedules.value = await listDoctorSchedules(realParams)
      } finally {
        loading.value = false
      }
    }

    async function handleSetQuota(data: SetQuotaRequest) {
      await setDoctorQuota(data)
      ElMessage.success('号源已更新')
    }

    async function handleBatchSetQuota(data: BatchSetQuotaRequest) {
      await batchSetDoctorQuota(data)
      ElMessage.success('批量号源已更新')
    }

    async function handleCopySchedule(data: CopyScheduleRequest) {
      await copyDoctorSchedule(data)
      ElMessage.success('排班复制成功')
    }

    function resetQuery() {
      query.departmentId = 0
      query.startDate = ''
      query.endDate = ''
    }

    return {
      loading,
      schedules,
      query,
      fetchSchedules,
      handleSetQuota,
      handleBatchSetQuota,
      handleCopySchedule,
      resetQuery
    }
  }
)
