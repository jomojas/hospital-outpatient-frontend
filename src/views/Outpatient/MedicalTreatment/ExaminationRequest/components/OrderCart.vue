<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { useOrderStore } from '@/store/Outpatient/MedicalTreatment/OrderStore'

const store = useOrderStore()
</script>

<template>
  <el-card shadow="never" class="cart-card">
    <template #header>
      <div class="header">
        <span class="title">本次申请列表 (待提交)</span>
        <el-button
          type="primary"
          :loading="store.submitting"
          :disabled="store.cartList.length === 0"
          @click="store.submitOrder"
        >
          提交申请
        </el-button>
      </div>
    </template>

    <el-table
      :data="store.cartList"
      stripe
      style="width: 100%"
      empty-text="请在上方搜索并添加项目"
    >
      <el-table-column
        prop="itemInfo.itemName"
        label="项目名称"
        min-width="180"
      />
      <el-table-column prop="itemInfo.price" label="单价" width="100">
        <template #default="{ row }">￥{{ row.itemInfo.price }}</template>
      </el-table-column>

      <!-- 输入项 -->
      <el-table-column label="检查部位" width="180">
        <template #default="{ row }">
          <el-input
            v-model="row.applySite"
            placeholder="如: 头部"
            size="small"
          />
        </template>
      </el-table-column>

      <el-table-column label="检查目的" min-width="200">
        <template #default="{ row }">
          <el-input
            v-model="row.applyPurpose"
            placeholder="如: 排查骨折"
            size="small"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="80" align="center">
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
  border: 1px solid #dcdfe6;
  margin-bottom: 20px;
}
</style>
