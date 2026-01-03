<script setup lang="ts">
import { computed } from 'vue'
import type {
  DailySchedule,
  DoctorScheduleResponse
} from '@/types/Information/Schedule'

const props = defineProps<{
  data: DoctorScheduleResponse[]
  loading: boolean
}>()

const emit = defineEmits<{
  (
    e: 'set-quota',
    payload: { row: DoctorScheduleResponse; day?: DailySchedule }
  ): void
}>()

const today = computed(() => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
})

const isDateAllowed = (dateString: string) => {
  const dayDate = new Date(dateString)
  dayDate.setHours(0, 0, 0, 0)
  return dayDate >= today.value
}
</script>

<template>
  <el-table :data="props.data" v-loading="props.loading" border>
    <el-table-column type="expand">
      <template #default="{ row }">
        <el-table :data="row.schedules" size="small" border>
          <el-table-column prop="date" label="日期" width="140" />
          <el-table-column
            prop="quota"
            label="号源"
            width="120"
            align="center"
          />
          <el-table-column
            prop="used"
            label="已使用"
            width="120"
            align="center"
          />
          <el-table-column label="操作" width="140" align="center">
            <template #default="{ row: day }">
              <el-button
                v-if="isDateAllowed(day.date)"
                link
                type="primary"
                @click="emit('set-quota', { row, day })"
                >设置</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-table-column>
    <el-table-column prop="staffId" label="医生ID" width="100" />
    <el-table-column prop="staffName" label="医生姓名" min-width="140" />
    <el-table-column
      prop="description"
      label="说明"
      min-width="160"
      show-overflow-tooltip
    />
    <el-table-column label="排班天数" width="120">
      <template #default="{ row }">{{ row.schedules?.length ?? 0 }}</template>
    </el-table-column>
  </el-table>
</template>
