// 新建 IP 获取工具函数
export async function getClientIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('获取IP地址失败:', error)
    return ''
  }
} 