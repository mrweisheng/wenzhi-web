<template>
  <div class="application-container">
    <div class="form-card" v-show="formVisible">
      <h2>写手申请</h2>
      <el-form
        ref="formRef"
        :model="applicationForm"
        :rules="rules"
        label-position="top"
        class="application-form"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="applicationForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="学历" prop="education">
          <el-select v-model="applicationForm.education" placeholder="请选择学历" style="width: 100%">
            <el-option
              v-for="item in educationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="专业" prop="major">
          <el-input v-model="applicationForm.major" placeholder="请输入专业" />
        </el-form-item>

        <el-form-item label="写作水平" prop="writing_experience">
          <el-select v-model="applicationForm.writing_experience" placeholder="请选择写作水平" style="width: 100%">
            <el-option
              v-for="item in experienceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="身份证号" prop="id_number">
          <el-input 
            v-model="applicationForm.id_number" 
            placeholder="请输入身份证号"
            maxlength="18"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="手机号码1" prop="phone_1">
          <el-input v-model="applicationForm.phone_1" placeholder="请输入手机号码" />
        </el-form-item>

        <el-form-item label="手机号码2" prop="phone_2">
          <el-input v-model="applicationForm.phone_2" placeholder="请输入备用手机号码" />
        </el-form-item>

        <el-form-item label="支付宝姓名" prop="alipay_name">
          <el-input v-model="applicationForm.alipay_name" placeholder="请输入支付宝姓名" />
        </el-form-item>

        <el-form-item label="支付宝账号" prop="alipay_account">
          <el-input v-model="applicationForm.alipay_account" placeholder="请输入支付宝账号" />
        </el-form-item>

        <el-form-item label="擅长内容" prop="specialized_content">
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

        <el-form-item label="申请日期" prop="apply_date">
          <el-date-picker
            v-model="applyDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="handleSubmit" :loading="submitting">
            提交申请
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 提交成功弹窗 -->
    <el-dialog
      title="申请提交成功"
      v-model="successDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="success-info">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <h3>您的写手ID：{{ submittedWriterId }}</h3>
        <p>请截图保存此信息</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleClose">我已保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { createWriter } from '@/api/writer'
import type { FormInstance, FormRules } from 'element-plus'
import type { WriterForm } from '@/types/writer'
import { getClientIp } from '@/utils/ip'
import type { DateModelType } from 'element-plus'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const successDialogVisible = ref(false)
const submittedWriterId = ref('')
const formVisible = ref(false)
const selectedSpecialized = ref<string[]>([])
const applyDate = ref<DateModelType | undefined>()

// 验证 token
onMounted(() => {
  const token = route.query.token as string
  
  // 简单验证 token 格式
  if (!token || !token.startsWith('apply_')) {
    ElMessage.error('无效的申请链接')
    return
  }
  
  // token 验证通过，显示表单
  formVisible.value = true
})

// 表单数据
const applicationForm = ref<WriterForm>({
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
  ip_address: '',
  apply_date: ''
})

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
  ],
  phone_1: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  specialized_content: [
    { required: true, message: '请选择擅长内容', trigger: 'change' }
  ],
  apply_date: [
    { required: true, message: '请选择申请日期', trigger: 'change' }
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

// 切换擅长内容选择
const toggleSpecialized = (value: string) => {
  const index = selectedSpecialized.value.indexOf(value)
  if (index === -1) {
    selectedSpecialized.value.push(value)
  } else {
    selectedSpecialized.value.splice(index, 1)
  }
  // 更新表单的 specialized_content 字段
  applicationForm.value.specialized_content = selectedSpecialized.value.join(';')
}

// 监听日期变化
watch(applyDate, (val) => {
  applicationForm.value.apply_date = formatDate(val)
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    const ip = await getClientIp()
    const submitData: WriterForm = {
      ...applicationForm.value,
      specialized_content: selectedSpecialized.value.join(';'),
      ip_address: ip,
      apply_date: applicationForm.value.apply_date
    }
    const res = await createWriter(submitData)
    submittedWriterId.value = res.data.writer_id
    successDialogVisible.value = true
  } catch (error) {
    console.error('提交申请失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 关闭成功弹窗
const handleClose = () => {
  successDialogVisible.value = false
  // 可以跳转到一个静态页面或关闭窗口
  window.close()
}
</script>

<style lang="scss" scoped>
.application-container {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 16px;
  
  .form-card {
    max-width: 100%;
    margin: 0 auto;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    @media screen and (min-width: 768px) {
      max-width: 600px;
      padding: 30px;
    }

    h2 {
      text-align: center;
      margin-bottom: 24px;
      color: #303133;
      font-size: 20px;
    }
  }
}

.application-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
    
    .el-form-item__label {
      padding-bottom: 8px;
      font-size: 15px;
    }
    
    .el-input, .el-select {
      width: 100%;
    }
  }
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .specialized-tag {
    margin: 0;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    
    &:active {
      opacity: 0.8;
    }
  }
}

.submit-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px 0;
  font-size: 16px;
}

// 优化成功弹窗在移动端的显示
:deep(.el-dialog) {
  width: 90% !important;
  max-width: 400px;
  
  .success-info {
    padding: 16px 0;
    
    .success-icon {
      font-size: 40px;
    }
    
    h3 {
      font-size: 16px;
      margin: 12px 0;
    }
    
    p {
      font-size: 14px;
    }
  }
}
</style> 