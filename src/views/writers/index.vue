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
      border
      stripe
      :header-cell-style="{background:'#f5f7fa', color:'#606266', fontWeight: '600'}"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="writer_id" label="写手ID" width="110" show-overflow-tooltip align="center" />
      <el-table-column prop="name" label="姓名" width="100" show-overflow-tooltip align="center" />
      <el-table-column prop="education" label="学历" width="90" show-overflow-tooltip align="center" />
      <el-table-column prop="major" label="专业" width="120" show-overflow-tooltip />
      <el-table-column prop="writing_experience" label="写作水平" width="110" show-overflow-tooltip />
      <el-table-column prop="specialized_content" label="擅长内容" min-width="180" show-overflow-tooltip>
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
      <el-table-column prop="phone_1" label="联系电话" width="120" show-overflow-tooltip align="center" />
      <el-table-column prop="created_time" label="创建时间" width="160" align="center">
        <template #default="{ row }">
          {{ formatDate(row.created_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <div class="operation-btns">
            <div class="btn-group">
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><EditPen /></el-icon>编辑
              </el-button>
              <el-button type="info" link @click="handleView(row)">
                <el-icon><View /></el-icon>查看
              </el-button>
            </div>
            
            <div class="btn-group">
              <template v-if="row.is_activated === 1">
                <el-tag size="small" type="success" effect="plain">已开通</el-tag>
              </template>
              <template v-else>
                <el-button type="success" link @click="handleCreateUser(row)">
                  <el-icon><UserFilled /></el-icon>开通
                </el-button>
              </template>
              <el-button type="warning" link @click="handleRate(row)">
                <el-icon><StarFilled /></el-icon>评分
              </el-button>
              <el-button type="info" link @click="showRatingHistory(row)">
                <el-icon><InfoFilled /></el-icon>历史
              </el-button>
            </div>
            
            <div class="btn-group">
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>
          </div>
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
              <el-form-item label="支付宝姓名" prop="alipay_name" required>
                <el-input 
                  v-model="writerForm.alipay_name" 
                  placeholder="请输入支付宝姓名"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="支付宝账号" prop="alipay_account" required>
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
      v-model="viewDialogVisible"
      :title="'写手详情 - ' + (viewData?.name || '')"
      width="800px"
      :close-on-click-modal="false"
      class="writer-detail-dialog"
      @closed="handleViewDialogClosed"
    >
      <div v-if="viewData" class="writer-detail-container">
        <div class="detail-header-card">
          <div class="writer-base-info">
            <div class="writer-avatar">
              <el-avatar 
                :size="80" 
                :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewData.name}`"
              ></el-avatar>
            </div>
            <div class="writer-title-info">
              <div class="writer-name-row">
                <div class="writer-name">{{ viewData.name }}</div>
                <div class="writer-id">{{ viewData.writer_id }}</div>
              </div>
              <div class="writer-tags">
                <el-tag size="medium" effect="plain">{{ viewData.education }}</el-tag>
                <el-tag size="medium" type="warning" effect="plain">{{ viewData.writing_experience }}</el-tag>
                <el-tag size="medium" type="success" effect="plain" v-if="viewData.is_activated === 1">已开通账号</el-tag>
                <el-tag size="medium" type="info" effect="plain" v-else>未开通账号</el-tag>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 最新评分信息 -->
        <div v-if="viewData?.latest_rating" class="latest-rating-section">
          <div class="rating-header">
            <div class="rating-title">
              <el-icon><Medal /></el-icon>
              <span>最新评分信息</span>
            </div>
            <div class="rating-date">{{ viewData.latest_rating.date }}</div>
          </div>
          
          <div class="rating-content">
            <div class="rating-score-section">
              <div class="score-display">
                <span class="score-value">{{ typeof viewData.latest_rating.score === 'string' ? parseFloat(viewData.latest_rating.score).toFixed(1) : viewData.latest_rating.score.toFixed(1) }}</span>
                <div class="score-label">综合评分</div>
              </div>
              <div class="score-stars">
                <el-rate
                  :model-value="viewData.latest_rating ? Number(viewData.latest_rating.score) : 0"
                  disabled
                  show-score
                  :colors="rateColors"
                  :max="10"
                  :allow-half="true"
                  text-color="#ff9900"
                ></el-rate>
              </div>
            </div>
            
            <div class="rating-comment-section">
              <div class="comment-header">
                <div class="comment-title">评价内容</div>
                <div class="inspector-info" v-if="viewData.latest_rating?.quality_inspector">
                  <el-avatar :size="24" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewData.latest_rating.quality_inspector?.name || 'default'}`"></el-avatar>
                  <span>{{ viewData.latest_rating.quality_inspector?.name }}</span>
                </div>
              </div>
              <div class="comment-content">
                {{ viewData.latest_rating.comment }}
              </div>
              <div class="rating-time">
                评分时间: {{ formatDateTime(viewData.latest_rating.created_at) }}
                <span v-if="viewData.latest_rating.updated_at !== viewData.latest_rating.created_at">
                  (更新于: {{ formatDateTime(viewData.latest_rating.updated_at) }})
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-info-container">
          <el-descriptions :column="2" border>
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><UserFilled /></el-icon>
                  <span>姓名</span>
                </div>
              </template>
              {{ viewData.name }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><User /></el-icon>
                  <span>专业</span>
                </div>
              </template>
              {{ viewData.major }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><School /></el-icon>
                  <span>学历</span>
                </div>
              </template>
              {{ viewData.education }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Reading /></el-icon>
                  <span>主修方向</span>
                </div>
              </template>
              {{ viewData.major }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Medal /></el-icon>
                  <span>写作水平</span>
                </div>
              </template>
              {{ viewData.writing_experience }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Iphone /></el-icon>
                  <span>手机号1</span>
                </div>
              </template>
              {{ viewData.phone_1 }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Cellphone /></el-icon>
                  <span>手机号2</span>
                </div>
              </template>
              {{ viewData.phone_2 || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Avatar /></el-icon>
                  <span>支付宝姓名</span>
                </div>
              </template>
              {{ viewData.alipay_name }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Wallet /></el-icon>
                  <span>支付宝账号</span>
                </div>
              </template>
              {{ viewData.alipay_account }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>身份证号</span>
                </div>
              </template>
              {{ viewData.id_number }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Location /></el-icon>
                  <span>IP地址</span>
                </div>
              </template>
              {{ viewData.ip_address || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Calendar /></el-icon>
                  <span>创建时间</span>
                </div>
              </template>
              {{ viewData.created_time ? formatDate(viewData.created_time) : '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><User /></el-icon>
                  <span>创建人</span>
                </div>
              </template>
              {{ viewData.created_by || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><Timer /></el-icon>
                  <span>最后修改时间</span>
                </div>
              </template>
              {{ viewData.last_modified_time ? formatDate(viewData.last_modified_time) : '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label-class-name="detail-label" content-class-name="detail-content">
              <template #label>
                <div class="label-with-icon">
                  <el-icon><EditPen /></el-icon>
                  <span>最后修改人</span>
                </div>
              </template>
              {{ viewData.last_modified_by || '无' }}
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 单独显示擅长内容 -->
          <div class="specialized-content-section">
            <div class="label-with-icon">
              <el-icon><Collection /></el-icon>
              <span>擅长内容</span>
            </div>
            <div class="specialized-tags-container">
              <el-tag v-for="(item, index) in viewData.specialized_content?.split(';')" 
                      :key="index" 
                      class="specialized-tag" 
                      size="small"
                      effect="plain">
                {{ item }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 写手申请二维码对话框 -->
    <el-dialog
      title="写手申请二维码"
      v-model="qrDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      class="qr-dialog"
      @closed="handleQrDialogClosed"
    >
      <div class="qr-container">
        <div ref="qrCodeRef" class="qr-code"></div>
        <p class="qr-tip">扫描二维码进入写手申请页面</p>
        <el-button type="primary" @click="handleSaveQR">保存二维码</el-button>
      </div>
    </el-dialog>

    <!-- 评分对话框 -->
    <el-dialog
      v-model="ratingDialogVisible"
      title="写手评分"
      width="550px"
      :close-on-click-modal="false"
      custom-class="writer-rating-dialog"
      @closed="handleRatingDialogClosed"
    >
      <!-- 顶部信息区域 -->
      <div class="rating-header">
        <div class="writer-avatar">
          <el-avatar :size="60" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentWriter?.name || 'default'}`"></el-avatar>
        </div>
        <div class="writer-info">
          <div class="writer-name-row">
            <h2 class="writer-name">{{ currentWriter?.name }}</h2>
            <div class="writer-id">{{ currentWriter?.writer_id }}</div>
          </div>
          <div class="writer-tags">
            <el-tag size="small" effect="plain" type="success">{{ currentWriter?.education }}</el-tag>
            <el-tag size="small" effect="plain" type="warning">{{ currentWriter?.writing_experience }}</el-tag>
          </div>
        </div>
      </div>
      
      <!-- 评分表单 -->
      <div class="rating-body">
        <el-form
          ref="ratingFormRef"
          :model="ratingForm"
          :rules="ratingRules"
          label-position="top"
          class="rating-form"
        >
          <!-- 星级评分部分 -->
          <div class="score-section" :class="{'has-rating': existingRating}">
            <div class="score-label">
              <span class="required-asterisk">*</span>
              <span>评分 (1-10分)</span>
            </div>
            <div class="score-content">
              <el-rate
                v-model="ratingValue"
                :colors="rateColors"
                :allow-half="true"
                :max="10"
                :texts="rateTexts"
                :show-text="true"
                @change="handleRateChange"
                class="star-rate"
              />
            </div>
            <div class="score-input-row">
              <span class="score-value">{{ typeof ratingForm.score === 'number' ? ratingForm.score.toFixed(1) : ratingForm.score }}</span>
              <el-input-number
                v-model="ratingForm.score"
                :min="1"
                :max="10"
                :step="0.1"
                :precision="1"
                controls-position="right"
                class="score-input"
              />
            </div>
          </div>
          
          <!-- 评分提示 -->
          <div class="rating-tips" :class="{'rating-updated': existingRating}">
            <el-icon><InfoFilled /></el-icon>
            <span v-if="existingRating">该写手今日已有评分，您可以查看或更新评分。评分时间: {{ formatDateTime(existingRating.created_at) }}</span>
            <span v-else>评分范围: 1-10分，支持小数点后一位，每日仅能添加一次</span>
          </div>
          
          <!-- 评论内容 -->
          <el-form-item label="评价内容" prop="comment" class="comment-item">
            <el-input
              v-model="ratingForm.comment"
              type="textarea"
              :rows="5"
              placeholder="请输入对写手的详细评价内容，如写作质量、响应速度、配合度等..."
              resize="none"
              class="comment-input"
              :class="{'has-existing-content': existingRating}"
            />
          </el-form-item>
          
          <!-- 如果已有评分，显示质检员信息 -->
          <div v-if="existingRating && existingRating.quality_inspector" class="rating-inspector-info">
            <div class="inspector-label">评分人员</div>
            <div class="inspector-content">
              <el-avatar :size="28" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${existingRating.quality_inspector?.name || 'default'}`" class="inspector-avatar"></el-avatar>
              <span class="inspector-name">{{ existingRating.quality_inspector?.name }}</span>
            </div>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ratingDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitRating" :loading="ratingSubmitting" class="submit-btn">
            提交评分
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 评分历史对话框 -->
    <el-dialog
      v-model="ratingHistoryVisible"
      :title="`评分历史 - ${currentWriter?.name || ''}`"
      width="700px"
      :close-on-click-modal="false"
      custom-class="rating-history-dialog"
      @closed="handleRatingHistoryClosed"
    >
      <div v-if="!ratingHistoryLoading && (!ratingHistory || ratingHistory.length === 0)" class="empty-history">
        <el-empty description="暂无评分历史记录" />
      </div>
      
      <div v-else-if="ratingHistoryLoading" class="loading-history">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else class="rating-history-container">
        <div class="history-header">
          <div class="writer-info">
            <el-avatar :size="50" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentWriter?.name || 'default'}`"></el-avatar>
            <div class="writer-detail">
              <div class="writer-name">{{ currentWriter?.name }}</div>
              <div class="writer-id">{{ currentWriter?.writer_id }}</div>
            </div>
          </div>
          
          <!-- 日期选择器 -->
          <div class="date-filter">
            <el-date-picker
              v-model="ratingHistoryDate"
              type="monthrange"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              value-format="YYYY-MM"
              @change="handleDateRangeChange"
            />
          </div>
        </div>
        
        <!-- 评分历史列表 -->
        <el-table
          :data="ratingHistory"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{background:'#f5f7fa', color:'#606266', fontWeight: '600'}"
        >
          <el-table-column prop="date" label="日期" width="120" align="center">
            <template #default="{ row }">
              {{ formatDate(row.created_at || row.date) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="score" label="评分" width="80" align="center">
            <template #default="{ row }">
              <span class="history-score" :class="getScoreClass(row.score)">{{ typeof row.score === 'number' ? row.score.toFixed(1) : row.score }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="comment" label="评价内容" min-width="200">
            <template #default="{ row }">
              <div class="comment-cell">{{ row.comment }}</div>
            </template>
          </el-table-column>
          
          <el-table-column prop="inspector" label="评分人" width="120" align="center">
            <template #default="{ row }">
              <div class="inspector-cell" v-if="row.quality_inspector">
                <el-avatar :size="24" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.quality_inspector?.name || 'default'}`"></el-avatar>
                <span>{{ row.quality_inspector?.name }}</span>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="history-pagination">
          <el-pagination
            v-model:current-page="ratingHistoryPage"
            v-model:page-size="ratingHistoryPageSize"
            :page-sizes="[5, 10, 20]"
            :total="ratingHistoryTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="handleRatingHistorySizeChange"
            @current-change="handleRatingHistoryPageChange"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  getWriters,
  getWriter, 
  createWriter, 
  updateWriter, 
  deleteWriter,
  batchDeleteWriters,
  generateApplicationToken,
  rateWriter,
  getDailyWriterRatings,
  getWriterTodayRating,
  getWriterRatingHistory
} from '@/api/writer'
import { createUser } from '@/api/user'
import type { Writer, WriterForm, WriterQuery } from '@/types/writer'
import type { UserForm } from '@/types/user'
import { formatDate } from '@/utils/format'
import { getClientIp } from '@/utils/ip'
import QRCode from 'qrcodejs2-fix'
import type { DateModelType } from 'element-plus'
import { formatDateRange } from '@/utils/date'
import { 
  User, UserFilled, School, Reading, Medal, Collection, 
  Iphone, Cellphone, Avatar, Wallet, DocumentCopy, 
  Location, Calendar, Timer, EditPen, InfoFilled, StarFilled, Delete, View 
} from '@element-plus/icons-vue'

// 数据加载状态
const loading = ref(false)
const submitting = ref(false)

// 列表数据
const writerList = ref<Writer[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

// 查询参数
const queryParams = ref<WriterQuery>({
  page: 1,
  pageSize: 10,
  writer_id: '',
  name: '',
  education: '',
  writing_experience: '',
  startTime: '',
  endTime: ''
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
  ],
  phone_1: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  specialized_content: [
    { required: true, message: '请选择擅长内容', trigger: 'change' }
  ],
  // 添加支付宝相关的必填验证
  alipay_name: [
    { required: true, message: '请输入支付宝姓名', trigger: 'blur' }
  ],
  alipay_account: [
    { required: true, message: '请输入支付宝账号', trigger: 'blur' }
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
const qrCodeRef = ref()
const qrDialogVisible = ref(false)
let qrCode = null // 保存 QRCode 实例

// 日期范围
const dateRange = ref<[DateModelType, DateModelType] | undefined>()

// 监听日期变化
watch(dateRange, (val) => {
  const { startTime, endTime } = formatDateRange(val)
  queryParams.value.startTime = startTime
  queryParams.value.endTime = endTime
})

// 评分相关
const ratingDialogVisible = ref(false)
const ratingFormRef = ref<FormInstance>()
const currentWriter = ref<Writer | null>(null)
const ratingForm = ref({
  score: 0,
  comment: ''
})
const ratingValue = ref(0)
const ratingSubmitting = ref(false)
const existingRating = ref<any>(null) // 当前写手的已有评分

// 评分规则
const ratingRules = {
  score: [
    { required: true, message: '请输入评分', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '评分必须在1到10之间', trigger: 'blur' }
  ],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' }
  ]
}

// 评分颜色和文字
const rateColors = ['#c6d1de', '#e6a23c', '#67c23a']
const rateTexts = ['较差', '一般', '优秀']

// 评分历史相关
const ratingHistoryVisible = ref(false)
const ratingHistoryLoading = ref(false)
const ratingHistory = ref<any[]>([])
const ratingHistoryTotal = ref(0)
const ratingHistoryPage = ref(1)
const ratingHistoryPageSize = ref(10)
const ratingHistoryDate = ref<[string, string] | null>(null)

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getWriters(queryParams.value)
    if (res.data && res.data.data) {
      writerList.value = res.data.data.list || []
      total.value = res.data.data.total || 0
      console.log('写手列表数据:', writerList.value)
    }
  } catch (error) {
    console.error('获取写手列表失败:', error)
    ElMessage.error('获取写手列表失败')
    writerList.value = []
    total.value = 0
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
    page: 1,
    pageSize: 10,
    writer_id: '',
    name: '',
    education: '',
    writing_experience: '',
    startTime: '',
    endTime: ''
  }
  dateRange.value = undefined
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
    id_number: row.id_number || '',
    ip_address: row.ip_address
  }
  selectedSpecialized.value = row.specialized_content?.split(';') || []
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row: Writer) => {
  try {
    const res = await getWriter(row.id)
    console.log('获取写手详情成功:', res.data)
    if (res.data && res.data.code === 0) {
      viewData.value = res.data.data
    } else {
      viewData.value = null
      ElMessage.error(res.data?.message || '获取写手详情失败')
    }
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取写手详情失败:', error)
    ElMessage.error('获取写手详情失败')
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

// 处理生成二维码
const handleGenerateQR = async () => {
  qrDialogVisible.value = true
  
  await nextTick()
  
  if (qrCode) return
  
  // 直接使用申请页面的URL，不需要token
  const applicationUrl = `${import.meta.env.VITE_APP_URL}/writer-application`
  
  console.log('二维码URL:', applicationUrl)
  
  qrCode = new QRCode(qrCodeRef.value, {
    text: applicationUrl,
    width: 256,
    height: 256,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  })
}

// 保存二维码
const handleSaveQR = () => {
  const canvas = qrCodeRef.value.querySelector('canvas')
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

// 监听对话框关闭
watch(qrDialogVisible, (val) => {
  if (!val) {
    // 不清除 qrCode 实例，保持二维码不变
    // qrCodeRef.value.innerHTML = ''
    // qrCode = null
  }
})

// 角色ID，当管理员点击"开通登录"按钮时使用
const WRITER_ROLE_ID = 6 // 写手角色ID为6

// 处理创建用户
const handleCreateUser = async (row: Writer) => {
  try {
    await ElMessageBox.confirm(`确认为 ${row.name} 开通登录权限吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const userData: UserForm = {
      username: row.writer_id, // 使用写手ID作为用户名
      password: '123456', // 默认密码
      real_name: row.name, // 使用写手姓名
      role_id: WRITER_ROLE_ID, // 写手角色ID
      email: '', // 可选，如果有写手邮箱可以添加
      status: 1 // 启用状态
    }
    
    const res = await createUser(userData)
    
    if (res.data && res.data.code === 0) {
      ElMessage.success(`已成功为 ${row.name} 开通登录权限，账号: ${row.writer_id}，密码: 123456`)
    } else {
      ElMessage.error(res.data?.message || '开通登录权限失败')
    }
  } catch (error: any) {
    if (error.toString().includes('cancel')) return
    
    if (error.response && error.response.data) {
      const message = error.response.data.message
      if (message && message.includes('username')) {
        ElMessage.error('该写手ID已经开通过登录权限')
      } else {
        ElMessage.error('开通登录权限失败: ' + message)
      }
    } else {
      console.error('开通登录权限失败:', error)
      ElMessage.error('开通登录权限失败')
    }
  }
}

// 打开评分对话框
const handleRate = async (row: Writer) => {
  currentWriter.value = row
  
  // 重置表单
  ratingForm.value = {
    score: 0,
    comment: ''
  }
  ratingValue.value = 0
  
  // 先获取当前写手今日的评分数据
  try {
    ratingSubmitting.value = true
    const res = await getWriterTodayRating(row.id)
    
    if (res.data && res.data.code === 0) {
      // 如果存在评分，设置表单值为已有评分
      if (res.data.data) {
        existingRating.value = res.data.data
        ratingForm.value = {
          // 确保score始终是数字类型
          score: typeof res.data.data.score === 'string' ? parseFloat(res.data.data.score) : res.data.data.score,
          comment: existingRating.value.comment
        }
        ratingValue.value = typeof ratingForm.value.score === 'number' ? ratingForm.value.score : parseFloat(String(ratingForm.value.score))
        
        // 显示提示消息
        ElMessage({
          type: 'info',
          message: '该写手今日已有评分，您可以查看或更新评分'
        })
      } else {
        // 没有评分数据
        existingRating.value = null
      }
    }
  } catch (error) {
    console.error('获取写手今日评分失败:', error)
    existingRating.value = null
  } finally {
    ratingSubmitting.value = false
    // 请求完成后再显示对话框，避免对话框中的内容闪烁
    ratingDialogVisible.value = true
  }
}

// 提交评分
const submitRating = async () => {
  if (!ratingFormRef.value) return
  
  try {
    await ratingFormRef.value.validate()
    
    if (!currentWriter.value?.id) {
      ElMessage.error('写手ID不存在')
      return
    }
    
    ratingSubmitting.value = true
    
    const res = await rateWriter(currentWriter.value.id, {
      score: ratingForm.value.score,
      comment: ratingForm.value.comment
    })
    
    // 更新成功后，更新本地存储的评分数据
    const newRating = {
      id: res.data.data?.id || Date.now(),
      writer: {
        id: currentWriter.value.id,
        writer_id: currentWriter.value.writer_id,
        name: currentWriter.value.name
      },
      score: ratingForm.value.score,
      comment: ratingForm.value.comment,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    // 更新本地缓存
    existingRating.value = newRating
    
    ElMessage.success(res.data.message || '评分提交成功')
    ratingDialogVisible.value = false
  } catch (error: any) {
    console.error('提交评分失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('提交评分失败')
    }
  } finally {
    ratingSubmitting.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '无';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}



// 获取评分历史
const fetchRatingHistory = async () => {
  if (!currentWriter.value?.id) return
  
  ratingHistoryLoading.value = true
  
  try {
    // 构建请求参数
    const params: any = {
      page: ratingHistoryPage.value,
      pageSize: ratingHistoryPageSize.value
    }
    
    // 如果选择了日期范围，添加到请求参数
    if (ratingHistoryDate.value && ratingHistoryDate.value.length === 2) {
      params.start_date = ratingHistoryDate.value[0] + '-01'
      // 计算月份的最后一天
      const lastDay = new Date(
        parseInt(ratingHistoryDate.value[1].split('-')[0]), 
        parseInt(ratingHistoryDate.value[1].split('-')[1]), 
        0
      ).getDate()
      params.end_date = ratingHistoryDate.value[1] + '-' + lastDay
    }
    
    // 调用API获取评分历史
    const res = await getWriterRatingHistory(currentWriter.value.id, params)
    
    if (res.data && res.data.code === 0) {
      ratingHistory.value = res.data.data.list || []
      ratingHistoryTotal.value = res.data.data.total || 0
    } else {
      ElMessage.warning(res.data?.message || '获取评分历史数据失败')
      ratingHistory.value = []
      ratingHistoryTotal.value = 0
    }
  } catch (error) {
    console.error('获取评分历史失败:', error)
    ElMessage.error('获取评分历史失败')
    ratingHistory.value = []
    ratingHistoryTotal.value = 0
  } finally {
    ratingHistoryLoading.value = false
  }
}

// 日期范围变化处理
const handleDateRangeChange = () => {
  ratingHistoryPage.value = 1
  fetchRatingHistory()
}

// 评分历史分页变化
const handleRatingHistorySizeChange = (val: number) => {
  ratingHistoryPageSize.value = val
  fetchRatingHistory()
}

const handleRatingHistoryPageChange = (val: number) => {
  ratingHistoryPage.value = val
  fetchRatingHistory()
}

// 根据评分获取样式类
const getScoreClass = (score: number) => {
  if (score >= 9) return 'score-excellent'
  if (score >= 8) return 'score-good'
  if (score >= 6) return 'score-average'
  if (score >= 4) return 'score-below-average'
  return 'score-poor'
}

// Rate组件值变化时同步到数字输入框
const handleRateChange = (val: number) => {
  ratingForm.value.score = Number(val.toFixed(1))
}

onMounted(() => {
  getList()
})

// 显示评分历史
const showRatingHistory = (row: Writer) => {
  currentWriter.value = row
  ratingHistoryVisible.value = true
  ratingHistoryPage.value = 1
  fetchRatingHistory()
}

// 评分历史对话框关闭处理
const handleRatingHistoryClosed = () => {
  // 清空评分历史数据和当前写手
  ratingHistory.value = []
  ratingHistoryTotal.value = 0
  // 不重置currentWriter，因为可能在其他地方被引用
}

// 查看详情对话框关闭处理
const handleViewDialogClosed = () => {
  // 清空详情数据，避免内存泄漏和引用错误
  viewData.value = null
}

// 评分对话框关闭处理
const handleRatingDialogClosed = () => {
  // 清空评分表单数据，避免脏数据影响下次打开
  ratingForm.value = {
    score: 0,
    comment: ''
  }
  ratingValue.value = 0
  existingRating.value = null
}

// 二维码对话框关闭处理
const handleQrDialogClosed = () => {
  // 清理QRCode实例，避免内存泄漏
  if (qrCode) {
    qrCode = null
  }
}
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

:deep(.el-dialog) {
  margin: 0 auto !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;  /* 设置最大高度为视口高度的90% */
  display: flex;
  flex-direction: column;
  
  .el-dialog__body {
    overflow-y: auto;  /* 内容过多时显示滚动条 */
    flex: 1;           /* 让内容区域自适应高度 */
    padding: 20px;
  }
  
  .el-dialog__header {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #e4e7ed;
  }
}

/* 确保对话框容器不会导致页面滚动 */
:deep(.el-overlay) {
  position: fixed;
  overflow: hidden;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .qr-code {
    width: 280px;  /* 固定二维码容器宽度 */
    height: 280px; /* 固定二维码容器高度 */
    display: flex;
    justify-content: center;
    align-items: center;
    
    /* 确保生成的canvas保持正方形 */
    :deep(canvas) {
      width: 100% !important;
      height: 100% !important;
    }
  }
  
  .qr-tip {
    margin: 20px 0;
    color: #666;
    font-size: 14px;
  }
  
  .el-button {
    margin-top: 10px;
  }
}

.qr-dialog {
  :deep(.el-dialog__body) {
    padding: 30px 20px;
  }
}

/* 写手详情弹窗样式 */
.writer-detail-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.writer-detail-container {
  .detail-header-card {
    background: linear-gradient(135deg, #409eff 0%, #64b5f6 100%);
    padding: 28px;
    border-radius: 4px 4px 0 0;
    color: white;
    
    .writer-base-info {
      display: flex;
      align-items: center;
      
      .writer-avatar {
        margin-right: 24px;
        
        .el-avatar {
          border: 3px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
      }
      
      .writer-title-info {
        flex: 1;
        
        .writer-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          
          .writer-name {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          }
          
          .writer-id {
            font-size: 24px;
            font-weight: 500;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 0 12px;
            border-radius: 4px;
            color: white;
          }
        }
        
        .writer-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          
          .el-tag {
            backdrop-filter: blur(8px);
            background-color: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0 12px;
            font-size: 13px;
          }
        }
      }
    }
  }
  
  .detail-info-container {
    padding: 24px;
    
    :deep(.el-descriptions) {
      .el-descriptions__body {
        .el-descriptions__table {
          .el-descriptions__cell {
            padding: 16px 12px;
            
            &.is-bordered-label {
              background-color: #f5f7fa;
              width: 120px;
            }
          }
        }
      }
    }
    
    .label-with-icon {
      display: flex;
      align-items: center;
      color: #606266;
      font-weight: 500;
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #409eff;
      }
    }
    
    .detail-content {
      color: #303133;
      line-height: 1.6;
    }
    
    .specialized-content-section {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
      
      .label-with-icon {
        font-size: 15px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e4e7ed;
      }
      
      .specialized-tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .specialized-tag {
        margin: 0;
        background-color: #f0f9ff;
        padding: 4px 10px;
      }
    }
  }
}

/* 操作按钮样式优化 */
.operation-btns {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  
  .btn-group {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px;
    
    &:not(:last-child) {
      border-right: 1px solid #ebeef5;
    }
    
    .el-button {
      padding: 4px 6px;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      
      .el-icon {
        margin-right: 4px;
        font-size: 14px;
      }
    }
    
    .el-tag {
      margin: 0;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 60px;
    }
  }
}

/* 评分对话框样式 - 优化版 */
.writer-rating-dialog {
  :deep(.el-dialog__header) {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
  }
  
  :deep(.el-dialog__footer) {
    padding-top: 10px;
  }
}

.rating-header {
  background: linear-gradient(135deg, #ff9d2f 0%, #ff6126 100%);
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  
  .writer-avatar {
    margin-right: 20px;
    
    .el-avatar {
      border: 3px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  }
  
  .writer-info {
    flex: 1;
    
    .writer-name-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      
      .writer-name {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }
      
      .writer-id {
        font-size: 16px;
        font-weight: 500;
        background-color: rgba(255, 255, 255, 0.2);
        padding: 0 10px;
        border-radius: 4px;
      }
    }
    
    .writer-tags {
      display: flex;
      gap: 8px;
      
      .el-tag {
        backdrop-filter: blur(8px);
        background-color: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
      }
    }
  }
}

.rating-body {
  padding: 24px 30px;
  
  .rating-form {
    .score-section {
      margin-bottom: 20px;
      position: relative;
      
      // 已有评分标记
      &.has-rating:before {
        content: '已评分';
        position: absolute;
        right: 0;
        top: 0;
        background-color: #f56c6c;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .score-label {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 12px;
        color: #303133;
        
        .required-asterisk {
          color: #f56c6c;
          margin-right: 4px;
        }
      }
      
      .score-content {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 6px;
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
        
        .star-rate {
          :deep(.el-rate__icon) {
            font-size: 24px;
            margin-right: 4px;
          }
          
          :deep(.el-rate__text) {
            font-size: 16px;
            margin-left: 12px;
            font-weight: 500;
          }
        }
      }
      
      .score-input-row {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        
        .score-value {
          font-size: 32px;
          font-weight: 700;
          color: #ff6126;
          margin-right: 15px;
        }
        
        .score-input {
          width: 130px;
        }
      }
    }
    
    .rating-tips {
      display: flex;
      align-items: center;
      background-color: #f0f9ff;
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      color: #409eff;
      
      &.rating-updated {
        background-color: #fff8e6;
        color: #e6a23c;
        border-left: 3px solid #e6a23c;
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
      
      span {
        font-size: 13px;
      }
    }
    
    .comment-item {
      margin-bottom: 0;
      
      :deep(.el-form-item__label) {
        font-weight: 500;
        padding-bottom: 10px;
        
        &::before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
      }
      
      .comment-input {
        :deep(.el-textarea__inner) {
          border-color: #dcdfe6;
          transition: all 0.2s;
          
          &:focus {
            border-color: #ff6126;
            box-shadow: 0 0 0 2px rgba(255, 97, 38, 0.2);
          }
        }
      }
    }
  }
}

.dialog-footer {
  padding: 10px 30px 20px;
  display: flex;
  justify-content: flex-end;
  
  .cancel-btn, .submit-btn {
    padding: 9px 20px;
  }
  
  .submit-btn {
    background-color: #ff6126;
    border-color: #ff6126;
    
    &:hover {
      background-color: #ff7c4a;
      border-color: #ff7c4a;
    }
  }
}

.rating-inspector-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 6px;
  
  .inspector-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .inspector-content {
    display: flex;
    align-items: center;
    
    .inspector-avatar {
      margin-right: 8px;
      border: 1px solid #ebeef5;
    }
    
    .inspector-name {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}

/* 评分历史对话框样式 */
.rating-history-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.rating-history-container {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: linear-gradient(135deg, #64b5f6 0%, #1976d2 100%);
    color: white;
    
    .writer-info {
      display: flex;
      align-items: center;
      
      .el-avatar {
        border: 3px solid rgba(255, 255, 255, 0.7);
        margin-right: 16px;
      }
      
      .writer-detail {
        .writer-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .writer-id {
          font-size: 14px;
          opacity: 0.8;
        }
      }
    }
    
    .date-filter {
      .el-date-editor {
        width: 280px;
        --el-date-editor-width: 280px;
        
        :deep(.el-input__wrapper) {
          background-color: rgba(255, 255, 255, 0.15);
          border: none;
          box-shadow: none;
          
          input {
            color: white;
            
            &::placeholder {
              color: rgba(255, 255, 255, 0.7);
            }
          }
          
          .el-input__icon {
            color: white;
          }
        }
      }
    }
  }
  
  .history-score {
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    
    &.score-excellent {
      color: #0bbd87;
      background-color: rgba(11, 189, 135, 0.1);
    }
    
    &.score-good {
      color: #409eff;
      background-color: rgba(64, 158, 255, 0.1);
    }
    
    &.score-average {
      color: #e6a23c;
      background-color: rgba(230, 162, 60, 0.1);
    }
    
    &.score-below-average {
      color: #f56c6c;
      background-color: rgba(245, 108, 108, 0.1);
    }
    
    &.score-poor {
      color: #ff4949;
      background-color: rgba(255, 73, 73, 0.1);
    }
  }
  
  .comment-cell {
    line-height: 1.5;
    padding: 4px 0;
    word-break: break-all;
  }
  
  .inspector-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    
    .el-avatar {
      border: 1px solid #ebeef5;
    }
    
    span {
      font-size: 13px;
    }
  }
  
  .history-pagination {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
    background-color: #f5f7fa;
    border-top: 1px solid #ebeef5;
  }
}

.empty-history, .loading-history {
  padding: 40px 20px;
}

.comment-input {
  &.has-existing-content {
    :deep(.el-textarea__inner) {
      background-color: #fffbf5;
      border-color: #e6a23c;
    }
  }
}

/* 最新评分信息样式 */
.latest-rating-section {
  background-color: #fff;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  
  .rating-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #f8fafc;
    border-bottom: 1px solid #ebeef5;
    
    .rating-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      
      .el-icon {
        margin-right: 8px;
        font-size: 20px;
        color: #f59e0b;
      }
    }
    
    .rating-date {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }
  
  .rating-content {
    padding: 24px;
    
    .rating-score-section {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      
      .score-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 24px;
        margin-right: 24px;
        border-right: 1px solid #ebeef5;
        
        .score-value {
          font-size: 32px;
          font-weight: 700;
          color: #f59e0b;
          line-height: 1.2;
        }
        
        .score-label {
          font-size: 14px;
          color: #606266;
          margin-top: 4px;
        }
      }
      
      .score-stars {
        flex: 1;
        
        :deep(.el-rate__icon) {
          font-size: 20px;
          margin-right: 4px;
        }
        
        :deep(.el-rate__text) {
          font-size: 14px;
          font-weight: 600;
          margin-left: 8px;
        }
      }
    }
    
    .rating-comment-section {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 16px;
      
      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .comment-title {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }
        
        .inspector-info {
          display: flex;
          align-items: center;
          
          .el-avatar {
            margin-right: 6px;
            border: 1px solid #fff;
          }
          
          span {
            font-size: 13px;
            color: #606266;
          }
        }
      }
      
      .comment-content {
        font-size: 14px;
        line-height: 1.6;
        color: #303133;
        padding: 8px 0;
        border-bottom: 1px dashed #ebeef5;
        margin-bottom: 8px;
      }
      
      .rating-time {
        font-size: 12px;
        color: #909399;
        text-align: right;
      }
    }
  }
}
</style> 