<template>
  <div class="app-container">
    <!-- 搜索工具栏 -->
    <div class="toolbar">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item>
          <el-input
            v-model="queryParams.name"
            placeholder="姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select 
            v-model="queryParams.education" 
            placeholder="学历" 
            clearable
            filterable
          >
            <el-option
              v-for="item in educationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select 
            v-model="queryParams.writing_experience" 
            placeholder="写作水平" 
            clearable
            filterable
          >
            <el-option
              v-for="item in experienceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">新增写手</el-button>
        <el-button type="success" @click="handleGenerateQR">写手申请</el-button>
        <el-button 
          type="danger" 
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="writerList"
      @selection-change="handleSelectionChange"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="writer_id" label="写手ID" width="100" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="education" label="学历" width="100" />
      <el-table-column prop="major" label="专业" width="120" />
      <el-table-column prop="writing_experience" label="写作水平" width="120" />
      <el-table-column prop="specialized_content" label="擅长内容" width="200">
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.specialized_content"
            placement="top-start"
            :show-after="100"
          >
            <div class="content-cell">
              {{ row.specialized_content }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="phone_1" label="联系电话" width="120" />
      <el-table-column prop="created_time" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 写手表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="writerForm"
        :rules="rules"
        label-width="100px"
        class="writer-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="writerForm.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="专业" prop="major">
                <el-input v-model="writerForm.major" placeholder="请输入专业" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="学历" prop="education">
                <el-select 
                  v-model="writerForm.education" 
                  placeholder="请选择学历"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in educationOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="写作水平" prop="writing_experience">
                <el-select 
                  v-model="writerForm.writing_experience" 
                  placeholder="请选择写作水平"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in experienceOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="身份证号" prop="id_number">
                <el-input 
                  v-model="writerForm.id_number" 
                  placeholder="请输入身份证号"
                  maxlength="18"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 联系方式 -->
        <div class="form-section">
          <div class="section-title">联系方式</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号1" prop="phone_1">
                <el-input v-model="writerForm.phone_1" placeholder="请输入手机号1" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号2" prop="phone_2">
                <el-input v-model="writerForm.phone_2" placeholder="请输入手机号2" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 支付信息 -->
        <div class="form-section">
          <div class="section-title">支付信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="支付宝姓名" prop="alipay_name">
                <el-input 
                  v-model="writerForm.alipay_name" 
                  placeholder="请输入支付宝姓名"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="支付宝账号" prop="alipay_account">
                <el-input 
                  v-model="writerForm.alipay_account" 
                  placeholder="请输入支付宝账号"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 擅长内容 -->
        <div class="form-section">
          <div class="section-title">擅长内容</div>
          <el-form-item prop="specialized_content" class="specialized-content">
            <div class="tag-container">
              <el-tag
                v-for="item in specializedOptions"
                :key="item.value"
                :type="selectedSpecialized.includes(item.value) ? 'primary' : 'info'"
                class="specialized-tag"
                @click="toggleSpecialized(item.value)"
              >
                {{ item.label }}
              </el-tag>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      title="写手详情"
      v-model="viewDialogVisible"
      width="700px"
    >
      <el-descriptions v-if="viewData" :column="2" border>
        <el-descriptions-item label="写手ID">{{ viewData.writer_id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ viewData.education }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ viewData.major }}</el-descriptions-item>
        <el-descriptions-item label="写作水平">{{ viewData.writing_experience }}</el-descriptions-item>
        <el-descriptions-item label="擅长内容">{{ viewData.specialized_content }}</el-descriptions-item>
        <el-descriptions-item label="手机号1">{{ viewData.phone_1 }}</el-descriptions-item>
        <el-descriptions-item label="手机号2">{{ viewData.phone_2 }}</el-descriptions-item>
        <el-descriptions-item label="支付宝姓名">{{ viewData.alipay_name }}</el-descriptions-item>
        <el-descriptions-item label="支付宝账号">{{ viewData.alipay_account }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ viewData.id_number }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(viewData.created_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ viewData.created_by }}</el-descriptions-item>
        <el-descriptions-item label="最后修改时间">
          {{ formatDate(viewData.last_modified_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后修改人">{{ viewData.last_modified_by }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 添加二维码弹窗 -->
    <el-dialog
      title="写手申请二维码"
      v-model="qrDialogVisible"
      width="400px"
      center
    >
      <div class="qr-container">
        <div ref="qrCodeRef"></div>
        <p class="qr-tip">请写手扫描二维码填写信息</p>
      </div>
      <template #footer>
        <el-button @click="qrDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleSaveQR">保存二维码</el-button>
      </template>
    </el-dialog>

    <!-- 日期范围选择器 -->
    <el-date-picker
      v-model="dateRange"
      type="daterange"
      value-format="YYYY-MM-DD"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  getWriters,
  getWriter, 
  createWriter, 
  updateWriter, 
  deleteWriter,
  batchDeleteWriters,
  generateApplicationToken
} from '@/api/writer'
import type { Writer, WriterForm, WriterQuery } from '@/types/writer'
import { formatDate } from '@/utils/format'
import { getClientIp } from '@/utils/ip'
import QRCode from 'qrcodejs2-fix'
import type { DateModelType } from 'element-plus'
import { formatDateRange } from '@/utils/date'

// 数据加载状态
const loading = ref(false)
const submitting = ref(false)

// 列表数据
const writerList = ref<Writer[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

// 查询参数
const queryParams = ref<WriterQuery>({
  name: '',
  education: '',
  writing_experience: '',
  page: 1,
  pageSize: 10
})

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const viewDialogVisible = ref(false)

// 表单相关
const formRef = ref<FormInstance>()
const writerForm = ref<WriterForm>({
  name: '',
  education: '',
  major: '',
  writing_experience: '',
  specialized_content: '',
  phone_1: '',
  phone_2: '',
  alipay_name: '',
  alipay_account: '',
  id_number: '',
  ip_address: ''
})

// 查看详情数据
const viewData = ref<Writer | null>(null)

// 表单校验规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  education: [
    { required: true, message: '请选择学历', trigger: 'change' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  writing_experience: [
    { required: true, message: '请选择写作水平', trigger: 'change' }
  ],
  id_number: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

// 选项数据
const educationOptions = [
  { value: '专科', label: '专科' },
  { value: '本科', label: '本科' },
  { value: '硕士', label: '硕士' },
  { value: '博士', label: '博士' }
]

const experienceOptions = [
  { value: '大学水平', label: '大学水平' },
  { value: '在职水平', label: '在职水平' },
  { value: '事业单位水平', label: '事业单位水平' },
  { value: '淘宝老手', label: '淘宝老手' },
  { value: '在职老师', label: '在职老师' },
  { value: '期刊报告科研', label: '期刊报告科研' }
]

const specializedOptions = [
  { value: 'ppt制作', label: 'PPT制作' },
  { value: '演讲稿、征文、读后感', label: '演讲稿/征文/读后感' },
  { value: '公文类、对照材料、生活会、讲话稿，公文材料、研讨材料、领导讲话', label: '公文材料/讲话稿' },
  { value: '调查报告、学术报告、期刊、研究性文章', label: '报告/期刊/论文' },
  { value: '广告词、广告语、推文、商业文案', label: '广告/文案' },
  { value: '商业计划书、策划方案、项目可行性研究报告', label: '计划书/方案' },
  { value: '保洁、物业、工程、绿化、采购标书', label: '标书类' },
  { value: '抄写', label: '抄写' }
]

// 在 script setup 中添加
const selectedSpecialized = ref<string[]>([])

// 二维码相关
const qrDialogVisible = ref(false)
const qrCodeRef = ref<HTMLElement>()
let qrcode: InstanceType<typeof QRCode> | null = null

// 日期范围
const dateRange = ref<[DateModelType, DateModelType] | undefined>()

// 监听日期变化
watch(dateRange, (val) => {
  const { startTime, endTime } = formatDateRange(val)
  queryParams.value.startTime = startTime
  queryParams.value.endTime = endTime
})

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getWriters(queryParams.value)
    writerList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取写手列表失败:', error)
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
  queryParams.value = {
    name: '',
    education: '',
    writing_experience: '',
    page: 1,
    pageSize: 10
  }
  getList()
}

// 选择项变化
const handleSelectionChange = (selection: Writer[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增写手'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Writer) => {
  dialogTitle.value = '编辑写手'
  writerForm.value = {
    id: row.id,
    writer_id: row.writer_id,
    name: row.name,
    education: row.education,
    major: row.major,
    writing_experience: row.writing_experience,
    specialized_content: row.specialized_content,
    phone_1: row.phone_1,
    phone_2: row.phone_2,
    alipay_name: row.alipay_name,
    alipay_account: row.alipay_account,
    id_number: row.id_number,
    ip_address: row.ip_address
  }
  selectedSpecialized.value = row.specialized_content ? row.specialized_content.split(';') : []
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row: Writer) => {
  try {
    const res = await getWriter(row.id)
    viewData.value = res.data
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取写手详情失败:', error)
  }
}

// 删除
const handleDelete = async (row: Writer) => {
  try {
    await ElMessageBox.confirm('确认删除该写手吗？', '提示', {
      type: 'warning'
    })
    await deleteWriter(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除写手失败:', error)
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  
  try {
    await ElMessageBox.confirm('确认删除选中的写手吗？', '提示', {
      type: 'warning'
    })
    await batchDeleteWriters(selectedIds.value)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('批量删除写手失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate()
  
  try {
    submitting.value = true
    const ip = await getClientIp()
    const submitData = {
      ...writerForm.value,
      specialized_content: selectedSpecialized.value.join(';'),
      ip_address: ip
    }
    
    if (dialogTitle.value === '编辑写手') {
      if (!submitData.writer_id) {
        ElMessage.error('写手ID不能为空')
        return
      }
      await updateWriter(submitData.id!, submitData)
      ElMessage.success('更新成功')
    } else {
      await createWriter(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('提交写手表单失败:', error)
  } finally {
    submitting.value = false
  }
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

// 重置表单时也需要重置选中的擅长内容
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  writerForm.value = {
    name: '',
    education: '',
    major: '',
    writing_experience: '',
    specialized_content: '',
    phone_1: '',
    phone_2: '',
    alipay_name: '',
    alipay_account: '',
    id_number: '',
    ip_address: ''
  }
  selectedSpecialized.value = []
}

// 切换擅长内容选择
const toggleSpecialized = (value: string) => {
  const index = selectedSpecialized.value.indexOf(value)
  if (index === -1) {
    selectedSpecialized.value.push(value)
  } else {
    selectedSpecialized.value.splice(index, 1)
  }
}

// 生成二维码
const handleGenerateQR = async () => {
  try {
    const res = await generateApplicationToken()
    const url = `${import.meta.env.VITE_LOCAL_URL}/writer-application?token=${res.data.token}`
    
    qrDialogVisible.value = true
    
    // 等待 DOM 更新
    await nextTick()
    
    if (qrCodeRef.value) {
      if (qrcode) {
        qrcode.clear()
      }
      qrcode = new QRCode(qrCodeRef.value, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败')
  }
}

// 保存二维码
const handleSaveQR = () => {
  const canvas = qrCodeRef.value?.querySelector('canvas')
  if (canvas) {
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = '写手申请二维码.png'
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

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
    margin-right: 20px;
  }

  .action-buttons {
    white-space: nowrap;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.content-cell {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.5;
  max-height: 3em;
  word-break: break-all;
  cursor: pointer;
}

.writer-form {
  padding: 0 20px;
  
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

  :deep(.el-form-item__content) {
    .el-input {
      width: 100%;
    }
  }
}

.specialized-content {
  margin-bottom: 0;
  
  .tag-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 8px;
  }
  
  .specialized-tag {
    cursor: pointer;
    user-select: none;
    padding: 8px 16px;
    font-size: 14px;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-dialog__body) {
  padding: 20px 0;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .qr-tip {
    margin-top: 16px;
    color: #666;
    font-size: 14px;
  }
}
</style> 