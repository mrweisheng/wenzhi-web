<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 原有的搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <!-- 将日期选择器移到单独的 div 中 -->
        <div class="form-item-group">
          <el-form-item label="订单编号">
            <el-input
              v-model="queryParams.order_id"
              placeholder="请输入"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="支付单号">
            <el-input
              v-model="queryParams.payment_id"
              placeholder="请输入"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="订单渠道">
            <el-select 
              v-model="queryParams.channel" 
              placeholder="请选择" 
              clearable
              filterable
            >
              <el-option
                v-for="item in channelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
        
        <div class="form-item-group">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetQuery">重置</el-button>
            <el-button type="success" @click="handleUpdateOrders">更新订单</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="orderList"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="order_id" label="订单编号" width="180" />
      <el-table-column prop="payment_id" label="支付单号" width="180" />
      <el-table-column prop="amount" label="买家实付金额" width="120">
        <template #default="{ row }">
          ¥{{ parseFloat(row.amount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="channel" label="订单渠道" width="100">
        <template #default="{ row }">
          {{ getChannelLabel(row.channel) }}
        </template>
      </el-table-column>
      <el-table-column prop="refund_amount" label="退款金额" width="120">
        <template #default="{ row }">
          ¥{{ parseFloat(row.refund_amount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="fee" label="手续费" width="120">
        <template #default="{ row }">
          ¥{{ parseFloat(row.fee).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="merchant_payment" label="打款商家金额" width="120">
        <template #default="{ row }">
          ¥{{ parseFloat(row.merchant_payment).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="confirm_time" label="确认收货时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.confirm_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="merchant_remark" label="商家备注" min-width="200" />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 更新订单对话框 -->
    <el-dialog
      title="更新订单"
      v-model="updateDialogVisible"
      width="800px"
      :close-on-click-modal="false"
      class="update-dialog"
    >
      <div class="update-dialog-content">
        <!-- 左侧渠道选择 -->
        <div class="channel-select">
          <h3>选择渠道</h3>
          <div class="channel-buttons">
            <div 
              v-for="channel in channels" 
              :key="channel"
              class="channel-button"
              :class="{ active: selectedChannel === channel }"
              @click="selectedChannel = channel"
            >
              <span class="channel-icon">
                <el-icon><Money /></el-icon>
              </span>
              <span class="channel-name">{{ channel }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧文件上传 -->
        <div class="file-upload">
          <h3>上传文件</h3>
          
          <!-- 支付宝和企业微信的单文件上传 -->
          <template v-if="['支付宝', '企业微信'].includes(selectedChannel)">
            <el-upload
              ref="uploadRef"
              class="upload-area"
              action="#"
              :auto-upload="false"
              :limit="1"
              :on-change="handleOrderFileChange"
            >
              <template #trigger>
                <el-button type="primary">选择订单文件</el-button>
              </template>
              <template #tip>
                <div class="el-upload__tip">
                  请选择 Excel 格式的订单文件
                </div>
              </template>
            </el-upload>
          </template>

          <!-- 慧辞和匠易艺的双文件上传 -->
          <template v-else-if="['慧辞', '匠易艺'].includes(selectedChannel)">
            <div class="multi-upload">
              <el-upload
                ref="uploadRef"
                class="upload-area"
                action="#"
                :auto-upload="false"
                :limit="1"
                :on-change="handleOrderFileChange"
              >
                <template #trigger>
                  <el-button type="primary">选择订单文件</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">
                    请选择 Excel 格式的订单文件
                  </div>
                </template>
              </el-upload>

              <el-upload
                class="upload-area"
                action="#"
                :auto-upload="false"
                :limit="1"
                :on-change="handleRefundFileChange"
              >
                <template #trigger>
                  <el-button type="primary">选择退款文件</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">
                    请选择 Excel 格式的退款文件
                  </div>
                </template>
              </el-upload>
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmitUpdate" 
          :loading="updating"
          :disabled="!canSubmit"
        >
          确定更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { getOrders, processOrder } from '@/api/order'
import type { Order, OrderQuery } from '@/types/order'
import type { ApiResponse, ApiPageResponse } from '@/types/response'
import { formatDate } from '@/utils/format'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { UploadFile, UploadFiles, UploadRawFile } from 'element-plus'

// 数据加载状态
const loading = ref(false)
const orderList = ref<Order[]>([])
const total = ref(0)

// 查询参数
const queryParams = ref<OrderQuery>({
  page: 1,
  pageSize: 10,
  order_id: '',
  payment_id: '',
  channel: '',
  startTime: '',
  endTime: ''
})

// 日期范围
const dateRange = ref<[Date, Date] | null>(null)

// 渠道选项
const channelOptions = [
  { value: '', label: '全部' },
  { value: '支付宝', label: '支付宝' },
  { value: '企业微信', label: '企业微信' },
  { value: '匠易艺', label: '匠易艺' },
  { value: '慧辞', label: '慧辞' }
]

// 获取状态标签类型
const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    paid: 'success',
    pending: 'warning',
    cancelled: 'danger',
    refunded: 'info',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    refunded: '已退款',
    cancelled: '已取消'
  }
  return map[status] || status
}

// 获取渠道标签文本
const getChannelLabel = (channel: string) => {
  const map: Record<string, string> = {
    '': '全部',
    '支付宝': '支付宝',
    '企业微信': '企业微信',
    '匠易艺': '匠易艺',
    '慧辞': '慧辞'
  }
  return map[channel] || channel
}

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getOrders(queryParams.value) as ApiPageResponse<Order>
    orderList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.value.page = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  // 重置查询参数
  queryParams.value = {
    page: 1,
    pageSize: 10,
    order_id: '',
    payment_id: '',
    channel: '',
    startTime: '',
    endTime: ''
  }
  // 重置日期范围
  dateRange.value = null
  // 重新查询
  getList()
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.value.pageSize = val
  getList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  queryParams.value.page = val
  getList()
}

// 更新订单相关的状态
const updateDialogVisible = ref(false)
const selectedChannel = ref('')
const orderFile = ref<File | null>(null)
const refundFile = ref<File | null>(null)
const updating = ref(false)

// 打开更新订单对话框
const handleUpdateOrders = () => {
  updateDialogVisible.value = true
  selectedChannel.value = ''
  orderFile.value = null
  refundFile.value = null
}

// 文件上传相关
const handleOrderFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  orderFile.value = uploadFile.raw as File
}

const handleRefundFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  refundFile.value = uploadFile.raw as File
}

// 判断是否可以提交
const canSubmit = computed(() => {
  if (!selectedChannel.value) return false
  
  if (['支付宝', '企业微信'].includes(selectedChannel.value)) {
    return !!orderFile.value
  }
  
  if (['慧辞', '匠易艺'].includes(selectedChannel.value)) {
    return !!orderFile.value && !!refundFile.value
  }
  
  return false
})

// 监听渠道变化
watch(selectedChannel, () => {
  // 清空已选择的文件
  orderFile.value = null
  refundFile.value = null
  // 重置上传组件
  const uploadRefs = document.querySelectorAll('.el-upload__input')
  uploadRefs.forEach((input: any) => {
    input.value = ''
  })
})

// 提交更新
const handleSubmitUpdate = async () => {
  if (!canSubmit.value) return
  
  try {
    updating.value = true
    
    if (!orderFile.value) {
      ElMessage.error('请选择订单文件')
      return
    }
    
    if (['慧辞', '匠易艺'].includes(selectedChannel.value) && !refundFile.value) {
      ElMessage.error('请选择退款文件')
      return
    }
    
    const formData = new FormData()
    formData.append('channel', selectedChannel.value)
    formData.append('order_file', orderFile.value)
    if (refundFile.value) {
      formData.append('refund_file', refundFile.value)
    }

    const { data } = await processOrder(formData)
    ElMessage.success('处理成功')
    updateDialogVisible.value = false
    getList()
  } catch (error: any) {
    console.error('处理订单失败:', error)
    const errorMsg = error.response?.data?.message || '处理失败，请稍后重试'
    ElMessage.error(errorMsg)
  } finally {
    updating.value = false
  }
}

// 定义渠道列表
const channels = ['支付宝', '企业微信', '慧辞', '匠易艺']

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  
  .search-form {
    flex: 1;
    margin-left: 20px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-table) {
  .content-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 优化日期选择器在移动端的显示
:deep(.el-date-editor) {
  width: 240px;
}

.update-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #EBEEF5;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.update-dialog-content {
  display: flex;
  gap: 40px;

  .channel-select {
    flex: 0 0 240px;
    
    h3 {
      margin: 0 0 20px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .channel-buttons {
      display: grid;
      gap: 16px;
      
      .channel-button {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #F5F7FA;
        border: 1px solid #E4E7ED;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: #EBEEF5;
        }
        
        &.active {
          background: #ecf5ff;
          border-color: #409EFF;
          color: #409EFF;
          
          .channel-icon {
            background: #409EFF;
            color: white;
          }
        }
        
        .channel-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #909399;
          color: white;
          border-radius: 6px;
          
          .el-icon {
            font-size: 18px;
          }
        }
        
        .channel-name {
          font-size: 15px;
          font-weight: 500;
        }
      }
    }
  }

  .file-upload {
    flex: 1;
    padding-left: 40px;
    border-left: 1px solid #EBEEF5;
    
    h3 {
      margin: 0 0 24px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .upload-area {
      margin-bottom: 24px;
      
      :deep(.el-upload) {
        width: 100%;
        
        .el-button {
          width: 100%;
          height: 40px;
        }
      }
      
      :deep(.el-upload__tip) {
        margin-top: 8px;
        color: #909399;
      }
    }
  }
}
</style>



