<template>
  <el-popover
    placement="bottom"
    :width="300"
    trigger="click"
    popper-class="icon-select-popover"
  >
    <template #reference>
      <el-input
        v-model="selectedIcon"
        placeholder="点击选择图标"
        readonly
        :suffix-icon="selectedIcon ? resolveIcon(selectedIcon) : ''"
      />
    </template>
    
    <div class="icon-list">
      <div
        v-for="icon in iconList"
        :key="icon"
        class="icon-item"
        @click="handleSelect(icon)"
      >
        <el-icon>
          <component :is="icon" />
        </el-icon>
        <span class="icon-name">{{ icon }}</span>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as Icons from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectedIcon = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 获取所有图标
const iconList = Object.keys(Icons)

// 解析图标组件
const resolveIcon = (name: string) => {
  return Icons[name as keyof typeof Icons]
}

// 选择图标
const handleSelect = (icon: string) => {
  selectedIcon.value = icon
}
</script>

<style lang="scss" scoped>
.icon-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  .el-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .icon-name {
    font-size: 12px;
    color: #606266;
    text-align: center;
    word-break: break-all;
  }
}

:deep(.icon-select-popover) {
  padding: 0;
  
  .el-popover__title {
    margin: 0;
    padding: 8px;
    border-bottom: 1px solid #dcdfe6;
  }
}
</style>