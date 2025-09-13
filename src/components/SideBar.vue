<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { departmentMenus, type MenuItem } from '@/config/menu'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { useAppStore } from '@/store/app'

type DepartmentType =
  | 'REGISTRATION'
  | 'OUTPATIENT'
  | 'EXAM'
  | 'LAB'
  | 'DISPOSAL'
  | 'PHARMACY'
  | 'INFORMATION'

const appStore = useAppStore()

const currentDepartmentType = computed<DepartmentType>(() => {
  return appStore.loginData?.departmentType as DepartmentType
})

// 动态获取图标组件
const getIconComponent = (iconName: string) => {
  return (ElementPlusIcons as any)[iconName] || ElementPlusIcons.Document
}

const menus: MenuItem[] = departmentMenus[currentDepartmentType.value]

const route = useRoute()
const router = useRouter()

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

const handleMenu = (item: MenuItem) => {
  appStore.setCurrentMenu(item)
  router.push(item.path)
}
</script>

<template>
  <el-menu :default-active="activeMenu" class="sidebar-menu">
    <el-menu-item
      v-for="item in menus"
      :key="item.path"
      :index="item.path"
      @click="handleMenu(item)"
    >
      <el-icon><component :is="getIconComponent(item.icon)" /></el-icon>
      <span>{{ item.label }}</span>
    </el-menu-item>
  </el-menu>
</template>

<style scoped lang="scss">
.sidebar-menu {
  border: none;
  background: $background-color;
  height: 100%;
  .el-menu-item {
    font-size: $font-title;
    font-family: $font-family-title;
    font-weight: $font-weight-regular;
    color: $text-color-secondary;
    &:hover {
      background: $background-color-hover;
      color: $primary-color;
    }
    &.el-menu-item.is-active {
      background: $background-color-active;
      color: $text-color;
      font-weight: 600;
      border-right: 4px solid $primary-color;
      box-sizing: border-box;
    }
    .el-icon {
      margin-right: 10px;
      font-size: 16px;
      vertical-align: middle;
    }
  }
}
</style>
