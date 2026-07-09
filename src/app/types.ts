// src/app/types.ts

export interface Incident311 {
  id: string;
  createdDate: string;
  complaintType: string; // 关键字段：用于匹配 A-E 垃圾/污水等大类 (如 "Dirty Condition")
  descriptor: string;
  borough: string;
  communityBoard: string; // 关键字段：用于 MapSelector 选中和 DensityMap 热力加权 (格式如: "MN-01")
  status: string;
  location: string;
  latitude?: number;  // 可选：未来如果需要精确到点的地图渲染可以使用
  longitude?: number; // 可选：未来如果需要精确到点的地图渲染可以使用
  tags?: string[];    // 离线 LLM 多面向标签（scripts/tagRecords.mjs → 311_data_tagged.json）
  agency?: string;    // 来源机构（tagged 数据集提供，用于 cross-agency 叙事）
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface MainCategory {
  id: string;
  title: string;
  subCategories: SubCategory[];
  color: string;
}

export type FilterState = {
  startDate: string;
  endDate: string;
  boroughs: string[]; // 保留此字段以防旧代码或组件报 TS 错误，但在最新的 Dashboard 逻辑中已弃用其筛选功能
  communityBoards: string[]; // 当前主要的地理空间筛选数组
}