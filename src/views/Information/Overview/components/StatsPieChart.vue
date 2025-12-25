<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { ECBasicOption } from 'echarts/types/dist/shared'

import './echarts'

type Item = { name: string; value: number }

const props = defineProps<{
  title: string
  data: Item[]
}>()

const option = computed<ECBasicOption>(() => {
  return {
    title: { text: props.title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
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
