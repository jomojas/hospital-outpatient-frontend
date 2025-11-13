<!-- filepath: c:\Users\Jomo\Desktop\HospitalOutpatient\Hospital-Outpatient\src\components\SideBar.vue -->
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

const menus: MenuItem[] = departmentMenus[currentDepartmentType.value] || []

const route = useRoute()
const router = useRouter()

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// ✅ 获取默认展开的子菜单
const defaultOpeneds = computed(() => {
  const openedMenus: string[] = []

  menus.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      // 检查当前路由是否在该子菜单下
      const isCurrentInSubMenu = menu.children.some((child) =>
        route.path.startsWith(child.path)
      )
      if (isCurrentInSubMenu) {
        openedMenus.push(menu.path)
      }
    }
  })

  return openedMenus
})

// ✅ 处理菜单点击
const handleMenu = (item: MenuItem) => {
  // 如果有子菜单，不执行跳转
  if (item.children && item.children.length > 0) {
    return
  }

  appStore.setCurrentMenu(item)
  router.push(item.path)
}
</script>

<template>
  <el-menu
    :default-active="activeMenu"
    :default-openeds="defaultOpeneds"
    class="sidebar-menu"
    :collapse="false"
    :unique-opened="true"
  >
    <template v-for="item in menus" :key="item.path">
      <!-- ✅ 有子菜单的情况 -->
      <el-sub-menu
        v-if="item.children && item.children.length > 0"
        :index="item.path"
      >
        <template #title>
          <el-icon><component :is="getIconComponent(item.icon)" /></el-icon>
          <span>{{ item.label }}</span>
        </template>

        <!-- 子菜单项 -->
        <el-menu-item
          v-for="child in item.children"
          :key="child.path"
          :index="child.path"
          @click="handleMenu(child)"
        >
          <el-icon><component :is="getIconComponent(child.icon)" /></el-icon>
          <span>{{ child.label }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- ✅ 没有子菜单的情况 -->
      <el-menu-item v-else :index="item.path" @click="handleMenu(item)">
        <el-icon><component :is="getIconComponent(item.icon)" /></el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<style scoped lang="scss">
.sidebar-menu {
  border: none;
  background: $background-color;
  height: 100%;
  font-family: $font-family-body;

  // ✅ 一级菜单样式
  .el-menu-item {
    font-size: $font-body;
    font-family: $font-family-body;
    font-weight: $font-weight-regular;
    color: $text-color-secondary;
    padding: $padding-base $padding-lg !important;
    margin: $margin-sm;
    border-radius: $border-radius-base;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    position: relative;

    &:hover {
      background: $background-color-hover;
      color: $text-color;
      border-color: $border-color-light;
      transform: translateX(4px);

      .el-icon {
        color: $primary-color;
        transform: scale(1.1);
      }
    }

    &.is-active {
      background: linear-gradient(
        135deg,
        $background-color-hover 0%,
        $blue-100 100%
      );
      color: $primary-color;
      font-weight: $font-weight-medium;
      border-color: $primary-color;
      box-shadow: 0 2px 8px rgba($blue-600, 0.15);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 60%;
        background: linear-gradient(
          180deg,
          $primary-color 0%,
          $primary-hover 100%
        );
        border-radius: 0 $border-radius-base $border-radius-base 0;
      }

      .el-icon {
        color: $primary-color;
      }
    }

    .el-icon {
      margin-right: $margin-sm;
      font-size: 18px;
      color: $text-color-disabled;
      transition: all 0.3s ease;
    }

    span {
      font-weight: inherit;
      letter-spacing: 0.3px;
    }
  }

  // ✅ 子菜单容器样式
  .el-sub-menu {
    margin: $margin-sm;
    border-radius: $border-radius-base;
    overflow: hidden;

    .el-sub-menu__title {
      font-size: $font-body;
      font-family: $font-family-title;
      font-weight: $font-weight-medium;
      color: $text-color;
      padding: $padding-base $padding-lg !important;
      transition: all 0.3s ease;
      border: 1px solid transparent;
      border-radius: $border-radius-base;

      &:hover {
        background: $background-color-hover;
        color: $primary-color;
        border-color: $border-color-light;
        transform: translateX(2px);

        .el-icon {
          color: $primary-color;
          transform: scale(1.05);
        }
      }

      .el-icon {
        margin-right: $margin-sm;
        font-size: 20px;
        color: $text-color-secondary;
        transition: all 0.3s ease;
      }

      span {
        letter-spacing: 0.5px;
      }
    }

    // ✅ 子菜单项样式
    .el-menu-item {
      font-size: $font-caption;
      padding: $padding-sm $padding-base !important;
      margin: $margin-sm $padding-base;
      background: $background-color-secondary;
      color: $text-color-secondary;
      border: 1px solid $border-color-light;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: -$padding-sm;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 0;
        background: $primary-color;
        transition: height 0.3s ease;
        border-radius: $border-radius-base;
      }

      &:hover {
        background: $background-color-hover;
        color: $text-color;
        border-color: $primary-color;
        transform: translateX(2px);

        &::before {
          height: 60%;
        }

        .el-icon {
          color: $primary-color;
          transform: scale(1.1);
        }
      }

      &.is-active {
        background: linear-gradient(
          135deg,
          $primary-color 0%,
          $primary-hover 100%
        );
        color: $background-color;
        font-weight: $font-weight-medium;
        border-color: $primary-hover;
        box-shadow: 0 4px 12px rgba($blue-600, 0.25);

        &::before {
          height: 80%;
          background: $background-color;
        }

        .el-icon {
          color: $background-color;
        }
      }

      .el-icon {
        margin-right: $margin-sm;
        font-size: 14px;
        color: $text-color-disabled;
        transition: all 0.3s ease;
      }
    }
  }

  // ✅ 展开的子菜单样式
  .el-sub-menu.is-opened {
    background: $background-color-secondary;
    border: 1px solid $border-color-light;

    > .el-sub-menu__title {
      background: linear-gradient(
        135deg,
        $background-color-hover 0%,
        $blue-100 100%
      );
      color: $primary-color;
      border-bottom: 1px solid $border-color-light;

      .el-icon {
        color: $primary-color;
      }
    }
  }
}

// ✅ 深度样式覆盖
:deep(.el-sub-menu__icon-arrow) {
  color: $text-color-disabled;
  font-size: 12px;
  transition: all 0.3s ease;
  margin-left: auto;
}

:deep(.el-sub-menu.is-opened .el-sub-menu__icon-arrow) {
  transform: rotateZ(180deg);
  color: $primary-color;
}

:deep(.el-menu--vertical .el-sub-menu .el-sub-menu__title) {
  padding-right: $padding-lg !important;
}

// ✅ 滚动条美化
.sidebar-menu {
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $background-color-secondary;
    border-radius: $border-radius-base;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: $border-radius-base;
    transition: background 0.3s ease;

    &:hover {
      background: $text-color-disabled;
    }
  }
}

// ✅ 响应式设计
@media (max-width: 768px) {
  .sidebar-menu {
    .el-menu-item,
    .el-sub-menu .el-sub-menu__title {
      font-size: $font-caption;
      padding: $padding-sm $padding-base !important;
      margin: $margin-sm;
    }

    .el-sub-menu .el-menu-item {
      padding: $padding-sm $padding-base !important;
      margin: $margin-sm;
      font-size: 11px;
    }

    .el-icon {
      font-size: 16px !important;
    }

    .el-sub-menu .el-menu-item .el-icon {
      font-size: 12px !important;
    }
  }
}
</style>
