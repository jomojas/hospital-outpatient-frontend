<script setup lang="ts">
import { computed } from 'vue'

import StatsLineChart from './StatsLineChart.vue'
import StatsPieChart from './StatsPieChart.vue'
import StatsRankTable from './StatsRankTable.vue'

import type {
  RegistrationsByDepartmentItem,
  RegistrationsByDoctorItem,
  RegistrationsTrendResponse,
  RegistrationsTypeBreakdownItem,
  RevenueByDepartmentResponse,
  RevenueByTypeResponse,
  RevenueTrendResponse,
  RefundTrendResponse
} from '@/types/Information/Stats'

const props = defineProps<{
  registrationsTrend: RegistrationsTrendResponse | null
  registrationsTypeBreakdown: RegistrationsTypeBreakdownItem[]
  registrationsByDepartment: RegistrationsByDepartmentItem[]
  registrationsByDoctor: RegistrationsByDoctorItem[]
  revenueTrend: RevenueTrendResponse | null
  revenueByType: RevenueByTypeResponse | null
  revenueByDepartment: RevenueByDepartmentResponse | null
  refundTrend: RefundTrendResponse | null
}>()

function mapRegistrationTypeLabel(name: string): string {
  const key = String(name ?? '').toUpperCase()
  const map: Record<string, string> = {
    GENERAL: '普通号',
    SPECIALIST: '专家号',
    EMERGENCY: '急诊'
  }
  return map[key] ?? name
}

function mapRevenueTypeLabel(type: string): string {
  const key = String(type ?? '').toUpperCase()
  const map: Record<string, string> = {
    REGISTRATION: '挂号费',
    MEDICAL_ITEM: '医疗项目',
    DRUG: '药品'
  }
  return map[key] ?? type
}

const registrationsTypePie = computed(() => {
  const items = props.registrationsTypeBreakdown ?? []
  return items.map((i) => ({
    name: mapRegistrationTypeLabel(i.name),
    value: Number(i.value ?? 0)
  }))
})

const revenueTypePie = computed(() => {
  const items = props.revenueByType?.items ?? []
  return items.map((i) => ({
    name: mapRevenueTypeLabel(i.type),
    value: Number(i.amount ?? 0)
  }))
})

const revenueDepartmentRank = computed(() => {
  const items = props.revenueByDepartment?.items ?? []
  return items.map((i) => ({
    name: i.departmentName,
    value: Number(i.amount ?? 0)
  }))
})
</script>

<template>
  <el-row :gutter="12">
    <el-col :xs="24" :md="12">
      <el-card>
        <stats-line-chart
          title="挂号数量"
          metric-label="挂号数量"
          :data="registrationsTrend"
        />
      </el-card>
    </el-col>

    <el-col :xs="24" :md="12">
      <el-card>
        <stats-line-chart
          title="收入金额"
          metric-label="收入金额"
          :data="revenueTrend"
          unit="元"
        />
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="12" class="row">
    <el-col :xs="24" :md="12">
      <el-card>
        <stats-line-chart
          title="退款金额"
          metric-label="退款金额"
          :data="refundTrend"
          unit="元"
        />
      </el-card>
    </el-col>

    <el-col :xs="24" :md="12">
      <el-card>
        <stats-pie-chart title="挂号类型占比" :data="registrationsTypePie" />
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="12" class="row">
    <el-col :xs="24" :md="12">
      <stats-rank-table
        title="科室挂号 Top"
        :data="registrationsByDepartment"
      />
    </el-col>

    <el-col :xs="24" :md="12">
      <stats-rank-table title="医生挂号 Top" :data="registrationsByDoctor" />
    </el-col>
  </el-row>

  <el-row :gutter="12" class="row">
    <el-col :xs="24" :md="12">
      <el-card>
        <stats-pie-chart
          title="收入类型占比"
          :data="revenueTypePie"
          unit="元"
        />
      </el-card>
    </el-col>

    <el-col :xs="24" :md="12">
      <stats-rank-table
        title="科室收入 Top"
        :data="revenueDepartmentRank"
        value-label="金额"
        unit="元"
      />
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.row {
  margin-top: $padding-base;
}
</style>
