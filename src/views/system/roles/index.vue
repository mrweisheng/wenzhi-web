<script setup>
import { ref, onMounted } from 'vue'
import { getRoles, createRole, updateRole, deleteRole } from '@/api/role'
import { getMenus } from '@/api/menu'
import { ElMessageBox, ElMessage } from 'element-plus'

// 定义菜单选项
const menuOptions = ref([])
const roleList = ref([])

// 获取菜单列表
const fetchMenus = async () => {
  try {
    const response = await getMenus()
    menuOptions.value = response.data
  } catch (error) {
    console.error('获取菜单列表失败:', error)
  }
}

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await getRoles()
    // 确保response.data存在且是数组
    if (response && response.data && Array.isArray(response.data)) {
      roleList.value = response.data
    } else {
      console.error('角色数据格式错误:', response)
      roleList.value = [] // 设置为空数组防止错误
      ElMessage.error('获取角色数据格式错误')
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
    roleList.value = [] // 设置为空数组防止错误
  }
}

onMounted(() => {
  fetchRoles()
  fetchMenus()
})

// ... 其他代码保持不变
</script>
