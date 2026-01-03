<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { ECBasicOption } from 'echarts/types/dist/shared'

import './echarts'

type Item = { name: string; value: number }

const props = defineProps<{
  title: string
  data: Item[]
  unit?: string
}>()

const option = computed<ECBasicOption>(() => {
  const unit = props.unit ?? ''
  return {
    title: { text: props.title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = (params ?? {}) as any
        const name = p.name ?? ''
        const value = p.value ?? 0
        const percent = p.percent
        const valueText = `${value}${unit}`
        if (
          percent === undefined ||
          percent === null ||
          Number.isNaN(Number(percent))
        ) {
          return `${name}: ${valueText}`
        }
        return `${name}: ${valueText}<br/>占比: ${percent}%`
      }
    },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '45%'],
        data: props.data ?? [],
        label: { formatter: '{b}: {d}%' }
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
