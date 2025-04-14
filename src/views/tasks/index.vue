<template>
  <div class="app-container">
    <div class="toolbar">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="订单编号">
          <el-input
            v-model="queryParams.order_id"
            placeholder="请输入订单编号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="是否定稿">
          <el-select 
            v-model="queryParams.is_fixed" 
            placeholder="请选择" 
            clearable
          >
            <el-option :value="0" label="未定稿" />
            <el-option :value="1" label="已定稿" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">新增订单</el-button>
        <el-button type="success" @click="handleSyncOrders" :loading="syncing">
          <el-icon class="mr-1"><Refresh /></el-icon>同步订单
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="orderList"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="order_id" label="订单编号" width="150" />
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column label="是否定稿" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_fixed === 1 ? 'success' : 'warning'">
            {{ row.is_fixed === 1 ? '已定稿' : '未定稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="customer_service_name" label="客服" width="120" />
      <el-table-column prop="writer_name" label="写手" width="120" />
      <el-table-column prop="word_count" label="字数" width="100" />
      <el-table-column label="稿费" width="100">
        <template #default="{ row }">
          ¥{{ row.fee }}
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="120">
        <template #default="{ row }">
          ¥{{ row.order_amount }}
        </template>
      </el-table-column>
      <el-table-column prop="payment_channel" label="付款渠道" width="120" />
      <el-table-column prop="store_name" label="店铺/客户" width="150" />
      <el-table-column prop="customer_name" label="客户名称" width="150" />
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
        </template>
      </el-table-column>
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

    <!-- 订单表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="80%"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="order-dialog"
    >
      <el-form
        ref="formRef"
        :model="orderForm"
        :rules="rules"
        label-width="120px"
        class="order-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon class="section-icon"><Document /></el-icon>
            <div class="section-title">基本信息</div>
          </div>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="订单编号" prop="order_id">
                <el-input 
                  v-model="orderForm.order_id" 
                  placeholder="请输入订单编号"
                  prefix-icon="Ticket"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="日期" prop="date">
                <el-date-picker
                  v-model="orderForm.date"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否定稿" prop="is_fixed">
                <el-select v-model="orderForm.is_fixed" placeholder="请选择" style="width: 100%">
                  <el-option :value="0" label="未定稿">
                    <div class="option-with-icon">
                      <el-icon><MoreFilled /></el-icon>
                      <span>未定稿</span>
                    </div>
                  </el-option>
                  <el-option :value="1" label="已定稿">
                    <div class="option-with-icon">
                      <el-icon><Select /></el-icon>
                      <span>已定稿</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="写手" prop="writer_id">
                <el-select
                  v-model="orderForm.writer_id"
                  placeholder="请选择写手"
                  filterable
                  clearable
                  style="width: 100%"
                  :loading="loadingWriters"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                  <el-option
                    v-for="item in writerList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <div class="writer-option">
                      <span>{{ item.name }}</span>
                      <span v-if="item.writer_id" class="writer-id">({{ item.writer_id }})</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="交稿时间" prop="exchange_time">
                <el-date-picker
                  v-model="orderForm.exchange_time"
                  type="datetime"
                  placeholder="选择交稿时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否新客户" prop="new_customer">
                <el-select v-model="orderForm.new_customer" placeholder="请选择" style="width: 100%">
                  <el-option :value="0" label="否">
                    <div class="option-with-icon">
                      <el-icon><Close /></el-icon>
                      <span>否</span>
                    </div>
                  </el-option>
                  <el-option :value="1" label="是">
                    <div class="option-with-icon">
                      <el-icon><Check /></el-icon>
                      <span>是</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="付款渠道" prop="payment_channel">
                <el-input 
                  v-model="orderForm.payment_channel" 
                  placeholder="请输入付款渠道"
                  prefix-icon="Money"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="店铺/客户" prop="store_name">
                <el-input 
                  v-model="orderForm.store_name" 
                  placeholder="请输入店铺名或客户线下"
                  prefix-icon="Shop" 
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户名称" prop="customer_name">
                <el-input 
                  v-model="orderForm.customer_name" 
                  placeholder="请输入客户名称"
                  prefix-icon="Avatar" 
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 稿件信息 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon class="section-icon"><Document /></el-icon>
            <div class="section-title">稿件信息</div>
          </div>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="稿件字数" prop="word_count">
                <el-input-number
                  v-model="orderForm.word_count"
                  :min="0"
                  controls-position="right"
                  style="width: 100%"
                  placeholder="请输入稿件字数"
                >
                  <template #prefix>
                    <el-icon><Reading /></el-icon>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="稿费" prop="fee">
                <el-input-number
                  v-model="orderForm.fee"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  controls-position="right"
                  style="width: 100%"
                  placeholder="请输入稿费"
                >
                  <template #prefix>
                    <el-icon><Money /></el-icon>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="稿件内容" prop="order_content">
                <el-input
                  v-model="orderForm.order_content"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入稿件内容信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 支付信息 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon class="section-icon"><Wallet /></el-icon>
            <div class="section-title">支付信息</div>
          </div>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="订单金额" prop="order_amount">
                <el-input-number
                  v-model="orderForm.order_amount"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  controls-position="right"
                  style="width: 100%"
                  placeholder="请输入订单金额"
                >
                  <template #prefix>
                    <el-icon><Money /></el-icon>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="退款金额" prop="refund_amount">
                <el-input-number
                  v-model="orderForm.refund_amount"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  controls-position="right"
                  style="width: 100%"
                  placeholder="请输入退款金额"
                >
                  <template #prefix>
                    <el-icon><TurnOff /></el-icon>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="特殊情况" prop="special_situation">
                <el-input
                  v-model="orderForm.special_situation"
                  placeholder="请输入特殊情况(不结算)"
                  prefix-icon="Warning"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            <el-icon><Close /></el-icon>
            <span>取消</span>
          </el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            <el-icon><Check /></el-icon>
            <span>确认</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getWriterList } from '@/api/writer'
import { createCustomerOrder, getCustomerOrders, mergeCustomerOrders } from '@/api/customerOrder'
import type { CustomerOrderItem, CustomerOrderQuery } from '@/types/customerOrder'
import { Refresh, Document, User, Money, Shop, Avatar, Reading, Wallet, TurnOff, Warning, MoreFilled, Select, Close, Check } from '@element-plus/icons-vue'

const userStore = useUserStore()

// 表单引用
const formRef = ref<FormInstance>()

// 状态变量
const loading = ref(false)
const submitting = ref(false)
const syncing = ref(false)
const loadingWriters = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增订单')
const dateRange = ref<[string, string] | null>(null)

// 查询参数
const queryParams = reactive<CustomerOrderQuery>({
  page: 1,
  pageSize: 10
})

// 订单列表数据
const orderList = ref<CustomerOrderItem[]>([])
const total = ref(0)
const writerList = ref([])

// 扩展CustomerOrder接口，添加customer_name字段
interface CustomerOrder {
  id?: number
  order_id: string
  date: string
  is_fixed: number
  order_content?: string
  word_count?: number
  fee?: number
  customer_id?: number
  writer_id?: number
  exchange_time?: string
  payment_channel?: string
  store_name?: string
  customer_name?: string
  order_amount?: number
  refund_amount?: number
  new_customer?: number
  special_situation?: string
}

// 订单表单
const orderForm = ref<CustomerOrder>({
  order_id: '',
  date: new Date().toISOString().split('T')[0],
  is_fixed: 0,
  new_customer: 0,
  customer_id: userStore.userInfo?.id
})

// 表单验证规则
const rules = reactive<FormRules>({
  order_id: [
    { required: true, message: '请输入订单编号', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  is_fixed: [
    { required: true, message: '请选择是否定稿', trigger: 'change' }
  ],
  writer_id: [
    { required: true, message: '请选择写手', trigger: 'change' }
  ]
})

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    queryParams.date_start = newVal[0]
    queryParams.date_end = newVal[1]
  } else {
    queryParams.date_start = undefined
    queryParams.date_end = undefined
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取订单列表
const getOrderList = async () => {
  try {
    loading.value = true
    const { data } = await getCustomerOrders(queryParams)
    if (data.data) {
      orderList.value = data.data.list || []
      total.value = data.data.total || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取写手列表
const fetchWriterList = async () => {
  try {
    loadingWriters.value = true
    const { data } = await getWriterList()
    writerList.value = data.data || []
  } catch (error) {
    console.error('获取写手列表失败:', error)
    ElMessage.error('获取写手列表失败')
  } finally {
    loadingWriters.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  getOrderList()
}

// 重置查询
const resetQuery = () => {
  queryParams.order_id = undefined
  queryParams.is_fixed = undefined
  dateRange.value = null
  queryParams.date_start = undefined
  queryParams.date_end = undefined
  queryParams.page = 1
  getOrderList()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  queryParams.page = page
  getOrderList()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  getOrderList()
}

// 新增订单
const handleAdd = () => {
  dialogTitle.value = '新增订单'
  resetForm()
  dialogVisible.value = true
}

// 编辑订单
const handleEdit = (row: CustomerOrderItem) => {
  dialogTitle.value = '编辑订单'
  // 确保数值类型正确
  orderForm.value = {
    ...row,
    is_fixed: Number(row.is_fixed),
    new_customer: Number(row.new_customer || 0),
    writer_id: row.writer_id || undefined
  }
  dialogVisible.value = true
}

// 查看订单
const handleView = (row: CustomerOrderItem) => {
  dialogTitle.value = '查看订单'
  // 确保数值类型正确
  orderForm.value = {
    ...row,
    is_fixed: Number(row.is_fixed),
    new_customer: Number(row.new_customer || 0),
    writer_id: row.writer_id || undefined
  }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    await createCustomerOrder(orderForm.value)
    
    ElMessage.success('订单提交成功')
    dialogVisible.value = false
    getOrderList()
    
    // 提交成功后调用合并API，将客服订单同步到总表
    try {
      const mergeRes = await mergeCustomerOrders()
      if (mergeRes.data.code === 0) {
        ElMessage.success('订单已同步到总表')
      } else {
        console.warn('订单同步返回信息:', mergeRes.data.message)
      }
    } catch (mergeError) {
      console.error('同步订单到总表失败:', mergeError)
      ElMessage.warning('订单已创建，但同步到总表失败，请稍后手动同步')
    }
  } catch (error: any) {
    console.error('提交订单失败:', error)
    ElMessage.error(error.response?.data?.message || '提交订单失败')
  } finally {
    submitting.value = false
  }
}

// 手动同步订单到总表
const handleSyncOrders = async () => {
  try {
    syncing.value = true
    const res = await mergeCustomerOrders()
    
    if (res.data.code === 0) {
      ElMessage.success(`同步成功，共处理 ${res.data.data.total} 条订单`)
      getOrderList() // 刷新订单列表
    } else {
      ElMessage.info(res.data.message || '没有需要同步的订单')
    }
  } catch (error: any) {
    console.error('同步订单失败:', error)
    ElMessage.error(error.response?.data?.message || '同步订单失败')
  } finally {
    syncing.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置为默认值
  orderForm.value = {
    order_id: '',
    date: new Date().toISOString().split('T')[0],
    is_fixed: 0,
    new_customer: 0,
    customer_id: userStore.userInfo?.id,
    writer_id: undefined // 确保写手ID被重置
  }
}

onMounted(() => {
  getOrderList()
  fetchWriterList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  
  .search-form {
    flex: 1;
  }
  
  .action-buttons {
    margin-left: 16px;
    display: flex;
    align-items: center;
    height: 32px; /* 与表单项高度一致 */
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-form {
  .form-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 4px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #1f2f3d;
      margin-bottom: 16px;
      padding-left: 8px;
      border-left: 3px solid #409eff;
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

/* 只对下拉框应用固定宽度 */
:deep(.el-select) {
  width: 100px !important;
}

/* 确保表单项标签对齐 */
:deep(.el-form--inline) {
  .el-form-item {
    margin-right: 16px;
    margin-bottom: 16px;
    
    .el-form-item__label {
      width: auto;
      padding-right: 8px;
    }
  }
}

/* 确保按钮不重叠 */
:deep(.el-form-item:last-child) {
  .el-form-item__content {
    display: flex;
    gap: 8px;
    
    .el-button {
      margin-left: 0;
    }
  }
}

.order-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #e9e9e9;
    background-color: #f8f9fa;
    padding: 16px 24px;
    margin-right: 0;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2f3d;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 24px;
  }

  .form-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #e9e9e9;
      padding-bottom: 12px;

      .section-icon {
        font-size: 18px;
        margin-right: 8px;
        color: #409eff;
      }

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: #1f2f3d;
      }
    }
  }
  
  .writer-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .writer-id {
      color: #999; 
      font-size: 13px;
      margin-left: 8px;
    }
  }
  
  .option-with-icon {
    display: flex;
    align-items: center;
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9e9e9;

  .el-button {
    margin-left: 12px;
    padding: 8px 20px;
    
    .el-icon {
      margin-right: 4px;
    }
  }
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  
  &:hover {
    box-shadow: 0 0 0 1px #c0c4cc inset;
  }
  
  &.is-focus {
    box-shadow: 0 0 0 1px #409eff inset;
  }
}

/* 数字输入框样式 */
:deep(.el-input-number) {
  .el-input__wrapper {
    padding-right: 0;
  }
  
  .el-input-number__decrease, 
  .el-input-number__increase {
    border-left: 1px solid #dcdfe6;
    background-color: #f5f7fa;
    
    &:hover {
      color: #409eff;
    }
  }
}
</style> 