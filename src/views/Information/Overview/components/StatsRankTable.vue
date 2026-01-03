<script setup lang="ts">
import { computed } from 'vue'

type Item = { name: string; value: number }

const props = defineProps<{
  title: string
  data: Item[]
  top?: number
  valueLabel?: string
  unit?: string
}>()

const rows = computed(() => {
  const top = props.top ?? 10
  return [...(props.data ?? [])]
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, top)
})

const valueColumnLabel = computed(() => {
  const base = props.valueLabel ?? '数量'
  return props.unit ? `${base}(${props.unit})` : base
})

const valueFormatter = computed(() => {
  if (!props.unit) {
    const nf = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 })
    return (v: unknown) => nf.format(Number(v ?? 0))
  }
  const nf = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return (v: unknown) => nf.format(Number(v ?? 0))
})
</script>

<template>
  <el-card>
    <template #header>
      <div class="header">{{ title }}</div>
    </template>

    <el-table :data="rows" size="small" border>
      <el-table-column type="index" label="#" width="60" align="center" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column
        prop="value"
        :label="valueColumnLabel"
        width="140"
        align="center"
      >
        <template #default="scope">
          {{ valueFormatter(scope.row.value) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped lang="scss">
.header {
  font-weight: 600;
  color: $text-color;
}
</style>
