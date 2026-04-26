export interface Incident311 {
  id: string;
  createdDate: string;
  complaintType: string;
  descriptor: string;
  borough: string;
  communityBoard: string;
  status: string;
  location: string;
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
  boroughs: string[];
  communityBoards: string[];
}
