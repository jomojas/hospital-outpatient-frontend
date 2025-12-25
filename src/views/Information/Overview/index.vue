<script setup lang="ts">
import { onMounted } from 'vue'

import { useInformationOverviewStore } from '@/store/Information/OverviewStore'
import type { PeriodType } from '@/types/Information/common'

import OverviewToolbar from './components/OverviewToolbar.vue'
import OverviewDashboard from './components/OverviewDashboard.vue'

const store = useInformationOverviewStore()

onMounted(async () => {
  await store.fetchAll()
})

const onRefresh = async () => {
  await store.fetchAll()
}

const onPeriodChange = async (period: PeriodType) => {
  store.query.period = period
  await store.fetchAll({ period })
}
</script>

<template>
  <div class="information-page" v-loading="store.loading">
    <overview-toolbar
      v-model:period="store.query.period"
      :loading="store.loading"
      @refresh="onRefresh"
      @update:period="onPeriodChange"
    />

    <overview-dashboard
      :registrations-trend="store.registrationsTrend"
      :registrations-type-breakdown="store.registrationsTypeBreakdown"
      :registrations-by-department="store.registrationsByDepartment"
      :registrations-by-doctor="store.registrationsByDoctor"
      :revenue-trend="store.revenueTrend"
      :revenue-by-type="store.revenueByType"
      :revenue-by-department="store.revenueByDepartment"
      :refund-trend="store.refundTrend"
    />
  </div>
</template>

<style scoped lang="scss">
.information-page {
  padding: $padding-lg;
}
</style>
