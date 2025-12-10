<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { usePrescriptionStore } from '@/store/Outpatient/MedicalTreatment/PrescriptionStore'
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'

const store = usePrescriptionStore()
const contextStore = useClinicContextStore()
</script>

<template>
  <!-- 同样，只有有权限时显示购物车 -->
  <el-card shadow="never" class="cart-card" v-if="contextStore.canPrescribe">
    <template #header>
      <div class="header">
        <span class="title">待开立处方列表</span>
        <el-button
          type="primary"
          :loading="store.submitting"
          :disabled="store.cartList.length === 0"
          @click="store.submitPrescription"
        >
          提交处方
        </el-button>
      </div>
    </template>

    <el-table
      :data="store.cartList"
      stripe
      style="width: 100%"
      empty-text="请添加药品"
    >
      <el-table-column
        prop="drugInfo.drugName"
        label="药品名称"
        min-width="150"
      />
      <el-table-column prop="drugInfo.specification" label="规格" width="120" />

      <!-- 数量输入：加最大值限制 -->
      <el-table-column label="数量" width="140">
        <template #default="{ row }">
          <el-input-number
            v-model="row.quantity"
            :min="1"
            :max="Number(row.drugInfo.stockQuantity)"
            size="small"
            style="width: 100%"
          />
          <div class="stock-tip">库存: {{ row.drugInfo.stockQuantity }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="drugInfo.unit" label="单位" width="60" />

      <!-- 用法用量输入 -->
      <el-table-column label="用法用量" min-width="200">
        <template #default="{ row }">
          <el-input
            v-model="row.dosage"
            placeholder="例: 口服, 1日3次, 每次1片"
            size="small"
          />
        </template>
      </el-table-column>

      <el-table-column prop="drugInfo.retailPrice" label="单价" width="80">
        <template #default="{ row }">￥{{ row.drugInfo.retailPrice }}</template>
      </el-table-column>

      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button
            type="danger"
            link
            :icon="Delete"
            @click="store.removeFromCart($index)"
          />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-weight: bold;
}
.cart-card {
  margin-bottom: 20px;
  border: 1px solid #dcdfe6;
}
.stock-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
</style>
