<template>
  <div class="app-wrapper">
    <el-container class="layout-container">
      <el-header class="header">
        <Header :collapsed="collapsed" @update:collapsed="collapsed = $event" />
      </el-header>
      <el-container class="main-container">
        <el-aside :width="collapsed ? '64px' : '200px'" class="aside">
          <Sidebar :collapsed="collapsed" />
        </el-aside>
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const collapsed = ref(false)
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden; /* 防止外层滚动 */
}

.main-container {
  height: 100vh;
  transition: margin-left 0.3s;
  position: relative;
  overflow: hidden; /* 防止外层滚动 */
  
  .app-main {
    height: calc(100vh - 50px); /* 减去头部高度 */
    overflow: auto; /* 内容区域滚动 */
    padding: 0;
    position: relative;
  }
}

.layout-container {
  height: 100vh;

  .header {
    padding: 0;
    height: 60px;
    background-color: #2c3e50;
    border-bottom: 1px solid #34495e;
  }

  .aside {
    background-color: #34495e;
    transition: width 0.3s;
    overflow: hidden;
  }

  .main {
    background-color: #f5f8fa;
    padding: 20px;
  }
}
</style> 