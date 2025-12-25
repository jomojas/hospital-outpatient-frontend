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
}>()

const option = computed<ECBasicOption>(() => {
  const xAxis = props.data?.xAxis ?? []
  const series = props.data?.series ?? []

  return {
    title: { text: props.title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 50, bottom: 30 },
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
