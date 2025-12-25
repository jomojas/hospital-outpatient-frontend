<script setup lang="ts">
import { computed } from 'vue'

type Item = { name: string; value: number }

const props = defineProps<{
  title: string
  data: Item[]
  top?: number
}>()

const rows = computed(() => {
  const top = props.top ?? 10
  return [...(props.data ?? [])]
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, top)
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
      <el-table-column prop="value" label="数量" width="120" align="center" />
    </el-table>
  </el-card>
</template>

<style scoped lang="scss">
.header {
  font-weight: 600;
  color: $text-color;
}
</style>
