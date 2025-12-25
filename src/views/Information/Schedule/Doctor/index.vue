<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { CopyDocument, Edit, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

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

const setQuotaFormRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const copyFormRef = ref<FormInstance>()

const setQuotaForm = reactive<SetQuotaRequest>({
  staffId: 0,
  date: '',
  quota: 0
})

const batchForm = reactive<BatchSetQuotaRequest>({
  staffId: 0,
  startDate: '',
  endDate: '',
  quota: 0,
  weekDays: []
})

const copyForm = reactive<CopyScheduleRequest>({
  departmentId: 0,
  sourceStartDate: '',
  targetStartDate: ''
})

const setQuotaRules: FormRules = {
  staffId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  quota: [{ required: true, message: '请输入号源', trigger: 'blur' }]
}

const batchRules: FormRules = {
  staffId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  quota: [{ required: true, message: '请输入号源', trigger: 'blur' }]
}

const copyRules: FormRules = {
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  sourceStartDate: [
    { required: true, message: '请选择源周开始日期', trigger: 'change' }
  ],
  targetStartDate: [
    { required: true, message: '请选择目标周开始日期', trigger: 'change' }
  ]
}

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

const openSetQuota = (row?: DoctorScheduleResponse, day?: DailySchedule) => {
  if (!ensureQueryParams()) return

  setQuotaForm.staffId =
    row?.staffId ?? scheduleStore.schedules[0]?.staffId ?? 0
  setQuotaForm.date = day?.date ?? scheduleStore.query.startDate
  setQuotaForm.quota = day?.quota ?? 0
  setQuotaDialogVisible.value = true
}

const submitSetQuota = async () => {
  const valid = await setQuotaFormRef.value?.validate().catch(() => false)
  if (!valid) return
  await scheduleStore.handleSetQuota({
    staffId: Number(setQuotaForm.staffId),
    date: setQuotaForm.date,
    quota: Number(setQuotaForm.quota)
  })
  setQuotaDialogVisible.value = false
  await scheduleStore.fetchSchedules()
}

const openBatch = () => {
  if (!ensureQueryParams()) return
  batchForm.staffId = scheduleStore.schedules[0]?.staffId ?? 0
  batchForm.startDate = scheduleStore.query.startDate
  batchForm.endDate = scheduleStore.query.endDate
  batchForm.quota = 0
  batchForm.weekDays = []
  batchDialogVisible.value = true
}

const submitBatch = async () => {
  const valid = await batchFormRef.value?.validate().catch(() => false)
  if (!valid) return
  await scheduleStore.handleBatchSetQuota({
    staffId: Number(batchForm.staffId),
    startDate: batchForm.startDate,
    endDate: batchForm.endDate,
    quota: Number(batchForm.quota),
    weekDays: batchForm.weekDays?.length ? batchForm.weekDays : undefined
  })
  batchDialogVisible.value = false
  await scheduleStore.fetchSchedules()
}

const openCopy = () => {
  copyForm.departmentId = scheduleStore.query.departmentId || 0
  copyForm.sourceStartDate = ''
  copyForm.targetStartDate = ''
  copyDialogVisible.value = true
}

const submitCopy = async () => {
  const valid = await copyFormRef.value?.validate().catch(() => false)
  if (!valid) return
  await scheduleStore.handleCopySchedule({
    departmentId: Number(copyForm.departmentId),
    sourceStartDate: copyForm.sourceStartDate,
    targetStartDate: copyForm.targetStartDate
  })
  copyDialogVisible.value = false
  if (
    scheduleStore.query.departmentId === Number(copyForm.departmentId) &&
    dateRange.value
  ) {
    await scheduleStore.fetchSchedules()
  }
}
</script>

<template>
  <div class="information-page">
    <div class="toolbar">
      <div class="title">医生排班设置</div>
      <div class="actions">
        <el-select
          v-model="scheduleStore.query.departmentId"
          placeholder="选择科室"
          class="dept"
          filterable
          clearable
        >
          <el-option
            v-for="d in baseInfoStore.allDepartments"
            :key="d.departmentId"
            :label="d.departmentName"
            :value="d.departmentId"
          />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />

        <el-button type="primary" :icon="Search" @click="onQuery"
          >查询</el-button
        >
        <el-button :icon="Refresh" @click="scheduleStore.fetchSchedules()"
          >刷新</el-button
        >

        <el-button :icon="Edit" @click="openSetQuota()">设置号源</el-button>
        <el-button :icon="Edit" @click="openBatch()">批量设置</el-button>
        <el-button :icon="CopyDocument" @click="openCopy">复制排班</el-button>
      </div>
    </div>

    <el-card>
      <el-table
        :data="scheduleStore.schedules"
        v-loading="scheduleStore.loading"
        border
      >
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
                  <el-button link type="primary" @click="openSetQuota(row, day)"
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
          <template #default="{ row }">{{
            row.schedules?.length ?? 0
          }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 设置号源 -->
    <el-dialog
      v-model="setQuotaDialogVisible"
      title="设置号源"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="setQuotaFormRef"
        :model="setQuotaForm"
        :rules="setQuotaRules"
        label-width="90px"
      >
        <el-form-item label="医生" prop="staffId">
          <el-select v-model="setQuotaForm.staffId" filterable>
            <el-option
              v-for="d in scheduleStore.schedules"
              :key="d.staffId"
              :label="d.staffName"
              :value="d.staffId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="setQuotaForm.date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="号源" prop="quota">
          <el-input v-model="setQuotaForm.quota" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="setQuotaDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSetQuota">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量设置号源"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="batchFormRef"
        :model="batchForm"
        :rules="batchRules"
        label-width="110px"
      >
        <el-form-item label="医生" prop="staffId">
          <el-select v-model="batchForm.staffId" filterable>
            <el-option
              v-for="d in scheduleStore.schedules"
              :key="d.staffId"
              :label="d.staffName"
              :value="d.staffId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="batchForm.startDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="batchForm.endDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="号源" prop="quota">
          <el-input v-model="batchForm.quota" />
        </el-form-item>
        <el-form-item label="周几(可选)">
          <el-checkbox-group v-model="batchForm.weekDays">
            <el-checkbox :label="1">周一</el-checkbox>
            <el-checkbox :label="2">周二</el-checkbox>
            <el-checkbox :label="3">周三</el-checkbox>
            <el-checkbox :label="4">周四</el-checkbox>
            <el-checkbox :label="5">周五</el-checkbox>
            <el-checkbox :label="6">周六</el-checkbox>
            <el-checkbox :label="7">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatch">保存</el-button>
      </template>
    </el-dialog>

    <!-- 复制排班 -->
    <el-dialog
      v-model="copyDialogVisible"
      title="复制排班"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="copyFormRef"
        :model="copyForm"
        :rules="copyRules"
        label-width="120px"
      >
        <el-form-item label="科室" prop="departmentId">
          <el-select v-model="copyForm.departmentId" filterable>
            <el-option
              v-for="d in baseInfoStore.allDepartments"
              :key="d.departmentId"
              :label="d.departmentName"
              :value="d.departmentId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="源周开始日期" prop="sourceStartDate">
          <el-date-picker
            v-model="copyForm.sourceStartDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="目标周开始日期" prop="targetStartDate">
          <el-date-picker
            v-model="copyForm.targetStartDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="copyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCopy">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.information-page {
  padding: $padding-lg;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $padding-base;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
    line-height: 32px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: $padding-base;
    flex-wrap: wrap;
  }

  .dept {
    width: 220px;
  }
}
</style>
