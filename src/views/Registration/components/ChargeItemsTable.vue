<script setup lang="ts">
import { computed } from 'vue'
import {
  listSettlementCategories,
  listPaymentMethods
} from '@/api/modules/Registration/Charge'

const props = defineProps({
  tableData: Array, // Data to display in the table
  pagination: Object // Pagination details (page, pageSize, total)
})

const emit = defineEmits(['update:pagination', 'charge'])
const dialogVisible = ref(false)
const settlementCategories = ref([])
const paymentMethods = ref([])

// Handle page size change
const onPageSizeChange = (size) => {
  emit('update:pagination', { pageSize: size })
}

// Handle page change
const onPageChange = (page) => {
  emit('update:pagination', { page })
}

// Handle charge button click
const handleChargeDialog = () => {
  dialogVisible.value = true
}

const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}
</script>
<template>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="itemName" label="项目名称" width="150" />
    <el-table-column prop="patientName" label="患者名称" width="150" />
    <el-table-column prop="type" label="类型" width="100">
      <template #default="{ row }">
        <span>{{ row.type === 'DRUG' ? '药品' : '医疗项目' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="price" label="单价" width="100" />
    <el-table-column prop="quantity" label="数量" width="100" />
    <el-table-column prop="totalAmount" label="总金额" width="120" />
    <el-table-column prop="createTime" label="创建时间" width="180" />
    <el-table-column prop="description" label="描述" />
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default="{ row }">
        <!-- Pass the row's data to handleCharge -->
        <el-button link type="primary" @click="handleChargeDialog"
          >缴费</el-button
        >
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    @size-change="onPageSizeChange"
    @current-change="onPageChange"
    :current-page="pagination.page"
    :page-size="pagination.pageSize"
    :total="pagination.total"
    layout="total, sizes, prev, pager, next, jumper"
  />

  <!-- Dialog for selecting charge type and settlement method -->
  <el-dialog
    title="选择收费类型和结算方式"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    width="30%"
  >
    <el-form label-width="100px">
      <el-form-item label="收费类型">
        <el-select v-model="selectedChargeType" placeholder="请选择收费类型">
          <el-option
            v-for="option in settlementCategories"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="结算方式">
        <el-select
          v-model="selectedSettlementMethod"
          placeholder="请选择结算方式"
        >
          <el-option
            v-for="option in paymentMethods"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="dialog-footer" style="text-align: right">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<style scoped></style>
