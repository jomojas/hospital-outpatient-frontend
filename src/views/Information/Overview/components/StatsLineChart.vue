<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { ECBasicOption } from 'echarts/types/dist/shared'

import './echarts'

type Trend = {
  xAxis: string[]
  series: number[]
}

const props = defineProps<{
  title: string
  data: Trend | null
  unit?: string
  metricLabel?: string
}>()

const option = computed<ECBasicOption>(() => {
  const xAxis = props.data?.xAxis ?? []
  const series = props.data?.series ?? []
  const unit = props.unit ?? ''
  const metricLabel = props.metricLabel ?? props.title

  const numberFormatter = unit
    ? new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : new Intl.NumberFormat('zh-CN', {
        maximumFractionDigits: 0
      })

  const formatValue = (raw: unknown) => {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return numberFormatter.format(raw)
    }
    const n = Number(raw)
    if (Number.isFinite(n)) return numberFormatter.format(n)
    return String(raw ?? '')
  }

  return {
    title: { text: props.title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const arr = Array.isArray(params) ? params : [params]
        const p = (arr[0] ?? {}) as any
        const x = p.axisValueLabel ?? p.axisValue ?? ''
        const v = p.data ?? p.value ?? 0
        const valueText = `${formatValue(v)}${unit}`
        return `${x}<br/>${metricLabel}: ${valueText}`
      }
    },
    grid: { left: 60, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: xAxis },
    yAxis: {
      type: 'value',
      axisLabel: props.unit ? { formatter: `{value}${props.unit}` } : undefined
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: series
      }
    ]
  }
})
</script>

<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<style scoped lang="scss">
.chart {
  height: 280px;
}
</style>
