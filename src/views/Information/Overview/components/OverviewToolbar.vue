<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import type { PeriodType } from '@/types/Information/common'

const props = defineProps<{
  period: PeriodType
  dateRange?: [string, string] | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:period', v: PeriodType): void
  (e: 'update:dateRange', v: [string, string] | null): void
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="toolbar">
    <div class="title">首页概览</div>
    <div class="actions">
      <el-select
        :model-value="props.period"
        class="period"
        @update:model-value="(v: unknown) => emit('update:period', v as PeriodType)"
      >
        <el-option label="本月" value="month" />
        <el-option label="本季度" value="season" />
        <el-option label="本年" value="year" />
        <el-option label="全部" value="all" />
        <el-option label="自定义" value="auto" />
      </el-select>

      <el-date-picker
        v-if="props.period === 'auto'"
        :model-value="props.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        unlink-panels
        clearable
        class="range"
        @update:model-value="(v: unknown) => emit('update:dateRange', (v as [string, string]) ?? null)"
      />

      <el-button :icon="Refresh" :loading="loading" @click="emit('refresh')"
        >刷新</el-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $padding-base;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
    line-height: 32px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: $padding-base;
  }

  .period {
    width: 140px;
  }

  .range {
    width: 260px;
  }
}
</style>
