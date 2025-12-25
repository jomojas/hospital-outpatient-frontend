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

const revenueTypePie = computed(() => {
  const items = props.revenueByType?.items ?? []
  return items.map((i) => ({ name: i.type, value: Number(i.amount ?? 0) }))
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
        <stats-line-chart title="挂号趋势" :data="registrationsTrend" />
      </el-card>
    </el-col>

    <el-col :xs="24" :md="12">
      <el-card>
        <stats-line-chart title="收入趋势" :data="revenueTrend" unit="" />
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="12" class="row">
    <el-col :xs="24" :md="12">
      <el-card>
        <stats-line-chart title="退款趋势" :data="refundTrend" />
      </el-card>
    </el-col>

    <el-col :xs="24" :md="12">
      <el-card>
        <stats-pie-chart
          title="挂号类型占比"
          :data="registrationsTypeBreakdown"
        />
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
        <stats-pie-chart title="收入类型占比" :data="revenueTypePie" />
      </el-card>
    </el-col>

    <el-col :xs="24" :md="12">
      <stats-rank-table title="科室收入 Top" :data="revenueDepartmentRank" />
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.row {
  margin-top: $padding-base;
}
</style>
