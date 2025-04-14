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

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 订单金额趋势图 -->
      <div class="chart-section">
        <div class="chart-card">
          <h3>最近7天订单金额趋势</h3>
          <div ref="lineChartRef" class="chart-container" v-loading="loading"></div>
        </div>
      </div>
      
      <!-- 渠道订单统计图 -->
      <div class="chart-section">
        <div class="chart-card">
          <h3>各渠道订单统计</h3>
          <div ref="pieChartRef" class="chart-container" v-loading="loading"></div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useUserStore } from '@/stores/user'
import { getStatistics } from '@/api/statistics'
import type { Statistics } from '@/types/statistics'
import { User, Edit, ShoppingCart, UserFilled, Menu } from '@element-plus/icons-vue'

const userStore = useUserStore()
const loading = ref(false)
const statistics = ref<Statistics>({
  userCount: 0,
  menuCount: 0,
  roleCount: 0,
  writerCount: 0,
  orderCount: 0,
  sevenDaysAmount: [],
  channelOrders: {}
})

// 图表引用
const lineChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

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

// 初始化图表
const initCharts = () => {
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
  }
  
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
  }
}

// 更新折线图
const updateLineChart = (data: Statistics['sevenDaysAmount']) => {
  if (!lineChart) return
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br />订单金额：¥{c}'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(2)}`
      }
    },
    series: [
      {
        name: '订单金额',
        type: 'line',
        data: data.map(item => item.amount),
        smooth: true,
        showSymbol: true,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.3)' },
            { offset: 1, color: 'rgba(64,158,255,0.1)' }
          ])
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  
  lineChart.setOption(option)
}

// 更新饼图
const updatePieChart = (data: Statistics['channelOrders']) => {
  if (!pieChart) return
  
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }))
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: Object.keys(data)
    },
    series: [
      {
        name: '渠道订单',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData,
        // 设置不同颜色
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#6C5CE7', '#4ECDC4']
      }
    ]
  }
  
  pieChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    loading.value = true
    const res = await getStatistics()
    if (res.data?.data) {
      statistics.value = res.data.data
      // 更新图表
      updateLineChart(res.data.data.sevenDaysAmount)
      updatePieChart(res.data.data.channelOrders)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initCharts()
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  height: calc(100vh - 60px);  /* 减去头部导航的高度 */
  overflow-y: auto;  /* 添加垂直滚动 */
  padding: 20px;
  box-sizing: border-box;
  
  /* 添加滚动条样式美化 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
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

  // 图表行布局
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
    
    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  }

  .chart-section {
    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      
      h3 {
        margin: 0 0 20px;
        font-size: 16px;
        color: #303133;
      }
      
      .chart-container {
        height: 350px;
        width: 100%;
      }
    }
  }

  .welcome-section {
    margin-top: 20px;
    
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
    padding: 10px;  // 移动端减小内边距
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .charts-row {
      grid-template-columns: 1fr;
    }
    
    .chart-section {
      .chart-card {
        .chart-container {
          height: 300px;
        }
      }
    }
  }
}
</style> 