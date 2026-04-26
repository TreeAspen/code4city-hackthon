import { Incident311 } from './types';

export const mockData311: Incident311[] = [
  { id: '311-001', createdDate: '2023-10-01', complaintType: 'Street Condition', descriptor: 'Leaves & Twigs', borough: 'Brooklyn', communityBoard: 'BK-01', status: 'Closed', location: '123 Main St' },
  { id: '311-002', createdDate: '2023-10-02', complaintType: 'Sanitation', descriptor: 'Plastic Bags', borough: 'Manhattan', communityBoard: 'MN-03', status: 'Open', location: '45 Broadway' },
  { id: '311-003', createdDate: '2023-10-05', complaintType: 'Street Condition', descriptor: 'Soil / Dirt', borough: 'Queens', communityBoard: 'QN-07', status: 'Closed', location: '88 Queens Blvd' },
  { id: '311-004', createdDate: '2023-10-08', complaintType: 'Sanitation', descriptor: 'Grass Clippings', borough: 'Staten Island', communityBoard: 'SI-01', status: 'In Progress', location: '10 Hylan Blvd' },
  { id: '311-005', createdDate: '2023-10-10', complaintType: 'Sanitation', descriptor: 'Coffee Cups / Bottles', borough: 'Bronx', communityBoard: 'BX-04', status: 'Closed', location: '200 Grand Concourse' },
  { id: '311-006', createdDate: '2023-10-15', complaintType: 'Construction', descriptor: 'Gravel / Sand', borough: 'Brooklyn', communityBoard: 'BK-02', status: 'Open', location: 'Flatbush Ave & Atlantic' },
  { id: '311-007', createdDate: '2023-10-18', complaintType: 'Construction', descriptor: 'Cement Mix', borough: 'Manhattan', communityBoard: 'MN-01', status: 'Closed', location: 'Wall St & Broad St' },
  { id: '311-008', createdDate: '2023-10-20', complaintType: 'Pest Control', descriptor: 'Rat Sighting', borough: 'Bronx', communityBoard: 'BX-03', status: 'In Progress', location: 'Fordham Rd' },
  { id: '311-009', createdDate: '2023-10-22', complaintType: 'Noise', descriptor: 'Noise - Street', borough: 'Manhattan', communityBoard: 'MN-05', status: 'Closed', location: 'Times Square' },
  { id: '311-010', createdDate: '2023-10-25', complaintType: 'Sanitation', descriptor: 'Newspapers', borough: 'Queens', communityBoard: 'QN-02', status: 'Open', location: 'Jackson Ave' },
  { id: '311-011', createdDate: '2023-11-01', complaintType: 'Street Condition', descriptor: 'Leaves & Twigs', borough: 'Staten Island', communityBoard: 'SI-02', status: 'Closed', location: 'Richmond Rd' },
  { id: '311-012', createdDate: '2023-11-05', complaintType: 'Sanitation', descriptor: 'Household Waste', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'In Progress', location: 'Linden Blvd' },
  { id: '311-013', createdDate: '2023-11-10', complaintType: 'Graffiti', descriptor: 'Graffiti', borough: 'Queens', communityBoard: 'QN-01', status: 'Closed', location: 'Astoria Blvd' },
  { id: '311-014', createdDate: '2023-11-15', complaintType: 'Sanitation', descriptor: 'Bulky Items', borough: 'Bronx', communityBoard: 'BX-05', status: 'Open', location: 'Jerome Ave' },
];
