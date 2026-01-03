<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useInformationOverviewStore } from '@/store/Information/OverviewStore'
import type { PeriodType } from '@/types/Information/common'

import OverviewToolbar from './components/OverviewToolbar.vue'
import OverviewDashboard from './components/OverviewDashboard.vue'

const store = useInformationOverviewStore()

const dateRange = computed<[string, string] | null>(() => {
  if (store.query.startDate && store.query.endDate) {
    return [store.query.startDate, store.query.endDate]
  }
  return null
})

function formatYmdLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function ensureDefaultAutoRange() {
  if (store.query.startDate && store.query.endDate) return
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)
  store.query.startDate = formatYmdLocal(start)
  store.query.endDate = formatYmdLocal(end)
}

onMounted(async () => {
  await store.fetchAll()
})

const onRefresh = async () => {
  await store.fetchAll()
}

const onPeriodChange = async (period: PeriodType) => {
  store.query.period = period

  if (period === 'auto') {
    ensureDefaultAutoRange()
  } else {
    store.query.startDate = undefined
    store.query.endDate = undefined
  }

  await store.fetchAll({
    period,
    startDate: store.query.startDate,
    endDate: store.query.endDate
  })
}

const onDateRangeChange = async (range: [string, string] | null) => {
  if (!range) {
    store.query.startDate = undefined
    store.query.endDate = undefined
  } else {
    store.query.startDate = range[0]
    store.query.endDate = range[1]
  }

  if (store.query.period === 'auto') {
    await store.fetchAll({
      period: 'auto',
      startDate: store.query.startDate,
      endDate: store.query.endDate
    })
  }
}
</script>

<template>
  <div class="information-page" v-loading="store.loading">
    <overview-toolbar
      v-model:period="store.query.period"
      :date-range="dateRange"
      :loading="store.loading"
      @refresh="onRefresh"
      @update:period="onPeriodChange"
      @update:date-range="onDateRangeChange"
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
