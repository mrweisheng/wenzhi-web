// 问题状态类型
export type IssueStatus = 'pending' | 'processing' | 'completed';

// 问题优先级类型
export type IssuePriority = 'high' | 'medium' | 'low';

// 用户信息
export interface UserInfo {
  id: string;
  name: string;
}

// 处理记录
export interface IssueRecord {
  id: number;
  content: string;
  createTime: string;
  user: UserInfo;
}

// 问题详情
export interface IssueDetail {
  id: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  createTime: string;
  deadline: string;
  description: string;
  assignee: UserInfo;
  creator?: UserInfo;
  records: IssueRecord[];
}

// 问题列表项
export interface IssueItem {
  id: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  createTime: string;
  deadline: string;
  description: string;
  assignee: UserInfo;
  creator: UserInfo;
}

// 问题列表响应
export interface IssueListResponse {
  total: number;
  pageCount: number;
  currentPage: number;
  items: IssueItem[];
}

// 创建问题参数
export interface CreateIssueParams {
  title: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  description?: string;
  deadline?: string;
  assigneeId?: string;
}

// 更新问题参数
export interface UpdateIssueParams {
  title?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  description?: string;
  deadline?: string;
  assigneeId?: string;
}

// 添加处理记录参数
export interface AddRecordParams {
  content: string;
  newStatus?: IssueStatus;
}

// 查询参数接口
export interface IssueQueryParams {
  page: number;
  pageSize: number;
  issue_id?: string;
  status?: IssueStatus;
  startTime?: string;
  endTime?: string;
}

// 状态映射类型
export type StatusMap = {
  [key in IssueStatus]: string;
};

// 状态类型映射
export type StatusTypeMap = {
  [key in IssueStatus]: string;
};