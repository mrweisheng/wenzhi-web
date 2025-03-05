<template>
  <div class="dashboard-container">
    <!-- 数据卡片 -->
    <div class="stats-grid">
      <div class="stats-card users" v-loading="loading">
        <div class="icon-wrapper">
          <el-icon><User /></el-icon>
        </div>
        <div class="content">
          <div class="number">{{ statistics.userCount }}</div>
          <div class="label">用户总数</div>
        </div>
        <div class="bg-icon">
          <el-icon><User /></el-icon>
        </div>
      </div>

      <div class="stats-card writers" v-loading="loading">
        <div class="icon-wrapper">
          <el-icon><Edit /></el-icon>
        </div>
        <div class="content">
          <div class="number">{{ statistics.writerCount }}</div>
          <div class="label">写手总数</div>
        </div>
        <div class="bg-icon">
          <el-icon><Edit /></el-icon>
        </div>
      </div>

      <div class="stats-card orders" v-loading="loading">
        <div class="icon-wrapper">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="content">
          <div class="number">{{ statistics.orderCount }}</div>
          <div class="label">订单总数</div>
        </div>
        <div class="bg-icon">
          <el-icon><ShoppingCart /></el-icon>
        </div>
      </div>

      <div class="stats-card roles" v-loading="loading">
        <div class="icon-wrapper">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="content">
          <div class="number">{{ statistics.roleCount }}</div>
          <div class="label">角色总数</div>
        </div>
        <div class="bg-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
      </div>

      <div class="stats-card menus" v-loading="loading">
        <div class="icon-wrapper">
          <el-icon><Menu /></el-icon>
        </div>
        <div class="content">
          <div class="number">{{ statistics.menuCount }}</div>
          <div class="label">菜单总数</div>
        </div>
        <div class="bg-icon">
          <el-icon><Menu /></el-icon>
        </div>
      </div>
    </div>

    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-content">
          <h2>欢迎回来, {{ userStore.userInfo?.username }}!</h2>
          <p>今天是 {{ currentDate }}, {{ getGreeting() }}</p>
        </div>
        <div class="decoration"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getStatistics } from '@/api/statistics'
import { User, Edit, ShoppingCart, UserFilled, Menu } from '@element-plus/icons-vue'

const userStore = useUserStore()
const loading = ref(false)
const statistics = ref({
  userCount: 0,
  menuCount: 0,
  roleCount: 0,
  writerCount: 0,
  orderCount: 0
})

// 获取当前日期
const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

// 根据时间获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    loading.value = true
    const res = await getStatistics()
    if (res.data && res.data.data) {
      statistics.value = res.data.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stats-card {
      position: relative;
      padding: 24px;
      border-radius: 12px;
      overflow: hidden;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .icon-wrapper {
        position: relative;
        z-index: 2;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        .el-icon {
          font-size: 24px;
          color: white;
        }
      }

      .content {
        position: relative;
        z-index: 2;

        .number {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 8px;
          background: linear-gradient(45deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .label {
          font-size: 16px;
          color: #666;
        }
      }

      .bg-icon {
        position: absolute;
        right: -20px;
        bottom: -20px;
        font-size: 120px;
        opacity: 0.1;
        transform: rotate(-15deg);
      }

      &.users .icon-wrapper { background: linear-gradient(135deg, #FF6B6B, #FF8E8E); }
      &.writers .icon-wrapper { background: linear-gradient(135deg, #4ECDC4, #45B7AF); }
      &.orders .icon-wrapper { background: linear-gradient(135deg, #FFD93D, #FFE566); }
      &.roles .icon-wrapper { background: linear-gradient(135deg, #6C5CE7, #8983F3); }
      &.menus .icon-wrapper { background: linear-gradient(135deg, #A8E6CF, #DCEDC1); }
    }
  }

  .welcome-section {
    .welcome-card {
      position: relative;
      padding: 30px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;

      .welcome-content {
        position: relative;
        z-index: 2;

        h2 {
          margin: 0 0 12px;
          font-size: 24px;
          background: linear-gradient(45deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          margin: 0;
          color: #666;
          font-size: 16px;
        }
      }

      .decoration {
        position: absolute;
        top: 0;
        right: 0;
        width: 200px;
        height: 200px;
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(44, 62, 80, 0.1));
        border-radius: 50%;
        transform: translate(30%, -30%);
      }
    }
  }
}

// 响应式调整
@media screen and (max-width: 768px) {
  .dashboard-container {
    padding: 10px;

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style> 