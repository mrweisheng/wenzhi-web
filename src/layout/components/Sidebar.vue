<template>
  <div class="sidebar-container">
    <el-scrollbar>
      <el-menu
        :default-active="route.path"
        :collapse="collapsed"
        :unique-opened="true"
        :collapse-transition="false"
        class="el-menu-vertical"
        background-color="#34495e"
        text-color="#b8c7ce"
        active-text-color="#ffffff"
        router
      >
        <template v-for="menu in userStore.userInfo?.menus" :key="menu.id">
          <el-menu-item :index="menu.path">
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <template #title>
              <span>{{ menu.name }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Menu } from '@/types/user'

interface Props {
  collapsed: boolean
}

defineProps<Props>()

const route = useRoute()
const userStore = useUserStore()
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: #34495e;

  .el-menu-vertical {
    border-right: none;

    &:not(.el-menu--collapse) {
      width: 200px;
    }
  }

  :deep(.el-menu-item) {
    &.is-active {
      background-color: #2c3e50;
    }

    &:hover {
      background-color: #2c3e50;
    }
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}
</style> 