import { Incident311 } from './types';

// Mock data sampled from the NYC 311 2025 sanitation_set distribution
// (see src/asset/311_2025_sanitation_filtering.ipynb).
// Counts approximate the relative top-30 frequencies; categories grouped per the
// notebook's 5 sub-buckets:
//   A) trash/collection/baskets/sweeping
//   B) sewer/drain/wastewater
//   C) flooding/drainage/infra
//   D) hygiene/pests
//   E) blockage risk/environment

export const mockData311: Incident311[] = [
  // ---------- A) Trash / Collection / Baskets / Sweeping ----------
  { id: '311-001', createdDate: '2025-01-04', complaintType: 'Dirty Condition', descriptor: 'Trash on Sidewalk', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'Closed', location: 'Linden Blvd & E 95 St' },
  { id: '311-002', createdDate: '2025-01-09', complaintType: 'Dirty Condition', descriptor: 'Litter at Curb', borough: 'Bronx', communityBoard: 'BX-04', status: 'Closed', location: 'Grand Concourse & E 161 St' },
  { id: '311-003', createdDate: '2025-01-14', complaintType: 'Dirty Condition', descriptor: 'Overflowing Garbage', borough: 'Queens', communityBoard: 'QN-07', status: 'In Progress', location: 'Roosevelt Ave & 82 St' },
  { id: '311-004', createdDate: '2025-02-02', complaintType: 'Missed Collection', descriptor: 'Recycling Not Collected', borough: 'Manhattan', communityBoard: 'MN-03', status: 'Closed', location: 'E 14 St & 1 Ave' },
  { id: '311-005', createdDate: '2025-02-11', complaintType: 'Missed Collection', descriptor: 'Trash Not Collected', borough: 'Brooklyn', communityBoard: 'BK-02', status: 'Closed', location: 'Atlantic Ave & 4 Ave' },
  { id: '311-006', createdDate: '2025-02-19', complaintType: 'Missed Collection', descriptor: 'Compost Not Collected', borough: 'Queens', communityBoard: 'QN-02', status: 'Closed', location: 'Jackson Ave & 11 St' },
  { id: '311-007', createdDate: '2025-03-05', complaintType: 'Illegal Dumping', descriptor: 'Bulk Items Dumped', borough: 'Bronx', communityBoard: 'BX-03', status: 'Open', location: 'Fordham Rd & Webster Ave' },
  { id: '311-008', createdDate: '2025-03-12', complaintType: 'Illegal Dumping', descriptor: 'Construction Debris', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'In Progress', location: 'Pennsylvania Ave & Stanley Ave' },
  { id: '311-009', createdDate: '2025-03-22', complaintType: 'Illegal Dumping', descriptor: 'Mattress Dumped', borough: 'Queens', communityBoard: 'QN-01', status: 'Closed', location: 'Astoria Blvd & 31 St' },
  { id: '311-010', createdDate: '2025-04-01', complaintType: 'Litter Basket Request', descriptor: 'Request New Basket', borough: 'Manhattan', communityBoard: 'MN-05', status: 'Open', location: 'Times Square & 7 Ave' },
  { id: '311-011', createdDate: '2025-04-08', complaintType: 'Litter Basket Complaint', descriptor: 'Overflowing Basket', borough: 'Manhattan', communityBoard: 'MN-01', status: 'Closed', location: 'Wall St & Broad St' },
  { id: '311-012', createdDate: '2025-04-17', complaintType: 'Recycling Basket Complaint', descriptor: 'Damaged Recycling Bin', borough: 'Brooklyn', communityBoard: 'BK-01', status: 'Closed', location: 'Bedford Ave & N 7 St' },
  { id: '311-013', createdDate: '2025-04-25', complaintType: 'Residential Disposal Complaint', descriptor: 'Improper Setout', borough: 'Queens', communityBoard: 'QN-07', status: 'Closed', location: '37 Ave & 74 St' },
  { id: '311-014', createdDate: '2025-05-03', complaintType: 'Commercial Disposal Complaint', descriptor: 'Restaurant Trash on Street', borough: 'Manhattan', communityBoard: 'MN-05', status: 'In Progress', location: 'Broadway & W 42 St' },
  { id: '311-015', createdDate: '2025-05-12', complaintType: 'Street Sweeping Complaint', descriptor: 'Sweeper Skipped Block', borough: 'Brooklyn', communityBoard: 'BK-02', status: 'Closed', location: '5 Ave & Union St' },
  { id: '311-016', createdDate: '2025-05-20', complaintType: 'Sanitation Worker or Vehicle Complaint', descriptor: 'Truck Leaking Fluid', borough: 'Bronx', communityBoard: 'BX-05', status: 'Closed', location: 'Jerome Ave & E 170 St' },
  { id: '311-017', createdDate: '2025-05-28', complaintType: 'Dumpster Complaint', descriptor: 'Unpermitted Dumpster', borough: 'Queens', communityBoard: 'QN-02', status: 'Open', location: '21 St & 44 Dr' },
  { id: '311-018', createdDate: '2025-06-04', complaintType: 'Transfer Station Complaint', descriptor: 'Odor from Facility', borough: 'Brooklyn', communityBoard: 'BK-01', status: 'In Progress', location: 'Hamilton Ave & 9 St' },
  { id: '311-019', createdDate: '2025-06-11', complaintType: 'Institution Disposal Complaint', descriptor: 'School Trash Issue', borough: 'Bronx', communityBoard: 'BX-03', status: 'Closed', location: 'E 188 St & Crotona Ave' },
  { id: '311-020', createdDate: '2025-06-18', complaintType: 'DSNY Internal', descriptor: 'Internal Routing', borough: 'Manhattan', communityBoard: 'MN-03', status: 'Closed', location: 'E 23 St & 2 Ave' },

  // ---------- B) Sewer / Drain / Wastewater ----------
  { id: '311-021', createdDate: '2025-01-22', complaintType: 'Sewer', descriptor: 'Catch Basin Clogged', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'In Progress', location: 'Flatbush Ave & Church Ave' },
  { id: '311-022', createdDate: '2025-02-05', complaintType: 'Sewer', descriptor: 'Sewer Backup in Street', borough: 'Queens', communityBoard: 'QN-07', status: 'Closed', location: 'Northern Blvd & 102 St' },
  { id: '311-023', createdDate: '2025-02-22', complaintType: 'Sewer', descriptor: 'Manhole Overflow', borough: 'Bronx', communityBoard: 'BX-04', status: 'Closed', location: 'E 149 St & 3 Ave' },
  { id: '311-024', createdDate: '2025-03-08', complaintType: 'Root/Sewer/Sidewalk Condition', descriptor: 'Tree Root Blockage', borough: 'Staten Island', communityBoard: 'SI-02', status: 'In Progress', location: 'Hylan Blvd & New Dorp Ln' },
  { id: '311-025', createdDate: '2025-03-19', complaintType: 'Indoor Sewage', descriptor: 'Basement Sewage Backup', borough: 'Brooklyn', communityBoard: 'BK-02', status: 'Open', location: '4 Ave & Pacific St' },
  { id: '311-026', createdDate: '2025-04-04', complaintType: 'Industrial Waste', descriptor: 'Discharge to Sewer', borough: 'Queens', communityBoard: 'QN-02', status: 'In Progress', location: 'Borden Ave & Review Ave' },
  { id: '311-027', createdDate: '2025-04-15', complaintType: 'WATER LEAK', descriptor: 'Hydrant Leaking', borough: 'Manhattan', communityBoard: 'MN-05', status: 'Closed', location: 'W 34 St & 8 Ave' },
  { id: '311-028', createdDate: '2025-04-29', complaintType: 'WATER LEAK', descriptor: 'Underground Main Leak', borough: 'Bronx', communityBoard: 'BX-03', status: 'In Progress', location: 'Tremont Ave & Webster Ave' },
  { id: '311-029', createdDate: '2025-05-14', complaintType: 'Water System', descriptor: 'No Water Pressure', borough: 'Brooklyn', communityBoard: 'BK-01', status: 'Closed', location: 'Driggs Ave & N 9 St' },
  { id: '311-030', createdDate: '2025-05-27', complaintType: 'Water System', descriptor: 'Discolored Water', borough: 'Queens', communityBoard: 'QN-01', status: 'Closed', location: 'Steinway St & 28 Ave' },

  // ---------- C) Flooding / Drainage / Infrastructure ----------
  { id: '311-031', createdDate: '2025-01-30', complaintType: 'Standing Water', descriptor: 'Pooling After Rain', borough: 'Queens', communityBoard: 'QN-07', status: 'Closed', location: '108 St & 65 Ave' },
  { id: '311-032', createdDate: '2025-02-15', complaintType: 'Standing Water', descriptor: 'Street Flooding', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'In Progress', location: 'Canarsie Pier' },
  { id: '311-033', createdDate: '2025-03-02', complaintType: 'Water Conservation', descriptor: 'Open Hydrant', borough: 'Bronx', communityBoard: 'BX-05', status: 'Closed', location: 'University Ave & W Burnside Ave' },
  { id: '311-034', createdDate: '2025-03-25', complaintType: 'Water Quality', descriptor: 'Cloudy Water', borough: 'Manhattan', communityBoard: 'MN-03', status: 'Closed', location: '1 Ave & E 23 St' },
  { id: '311-035', createdDate: '2025-04-10', complaintType: 'Curb Condition', descriptor: 'Damaged Curb', borough: 'Staten Island', communityBoard: 'SI-01', status: 'Open', location: 'Forest Ave & Broadway' },
  { id: '311-036', createdDate: '2025-04-22', complaintType: 'Street Condition', descriptor: 'Pothole', borough: 'Bronx', communityBoard: 'BX-04', status: 'Closed', location: 'Grand Concourse & E 170 St' },
  { id: '311-037', createdDate: '2025-05-06', complaintType: 'Street Condition', descriptor: 'Street Defect', borough: 'Queens', communityBoard: 'QN-02', status: 'In Progress', location: 'Queens Blvd & 46 St' },
  { id: '311-038', createdDate: '2025-05-19', complaintType: 'Street Condition', descriptor: 'Cave-In', borough: 'Brooklyn', communityBoard: 'BK-02', status: 'Open', location: 'Court St & Atlantic Ave' },
  { id: '311-039', createdDate: '2025-06-02', complaintType: 'Highway Condition', descriptor: 'Pothole on Highway', borough: 'Bronx', communityBoard: 'BX-03', status: 'Closed', location: 'Cross Bronx Expwy & Webster Ave' },
  { id: '311-040', createdDate: '2025-06-12', complaintType: 'DEP Street Condition', descriptor: 'Failed Street Cut', borough: 'Manhattan', communityBoard: 'MN-01', status: 'In Progress', location: 'Broad St & Wall St' },
  { id: '311-041', createdDate: '2025-06-23', complaintType: 'DEP Sidewalk Condition', descriptor: 'Sunken Sidewalk', borough: 'Queens', communityBoard: 'QN-07', status: 'Closed', location: 'Roosevelt Ave & 90 St' },
  { id: '311-042', createdDate: '2025-07-04', complaintType: 'Sidewalk Condition', descriptor: 'Cracked Sidewalk', borough: 'Brooklyn', communityBoard: 'BK-01', status: 'Closed', location: 'Bedford Ave & Metropolitan Ave' },

  // ---------- D) Hygiene / Pests ----------
  { id: '311-043', createdDate: '2025-01-18', complaintType: 'Rodent', descriptor: 'Rat Sighting', borough: 'Manhattan', communityBoard: 'MN-03', status: 'In Progress', location: 'E 14 St & 3 Ave' },
  { id: '311-044', createdDate: '2025-02-08', complaintType: 'Rodent', descriptor: 'Rat Burrow', borough: 'Brooklyn', communityBoard: 'BK-02', status: 'Closed', location: 'Park Slope, 6 Ave' },
  { id: '311-045', createdDate: '2025-03-15', complaintType: 'Mosquitoes', descriptor: 'Standing Water Breeding', borough: 'Queens', communityBoard: 'QN-07', status: 'Closed', location: 'Flushing Meadows Park' },
  { id: '311-046', createdDate: '2025-04-19', complaintType: 'Dead Animal', descriptor: 'Dead Squirrel on Street', borough: 'Bronx', communityBoard: 'BX-04', status: 'Closed', location: 'E 161 St & River Ave' },
  { id: '311-047', createdDate: '2025-05-23', complaintType: 'UNSANITARY CONDITION', descriptor: 'Garbage Accumulation', borough: 'Manhattan', communityBoard: 'MN-05', status: 'In Progress', location: 'W 42 St & 8 Ave' },
  { id: '311-048', createdDate: '2025-06-07', complaintType: 'UNSANITARY CONDITION', descriptor: 'Filth in Building', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'Open', location: 'Linden Blvd' },
  { id: '311-049', createdDate: '2025-06-20', complaintType: 'UNSANITARY CONDITION', descriptor: 'Mold/Pest Conditions', borough: 'Bronx', communityBoard: 'BX-05', status: 'In Progress', location: 'Jerome Ave & W 183 St' },
  { id: '311-050', createdDate: '2025-07-02', complaintType: 'Public Toilet', descriptor: 'Toilet Out of Order', borough: 'Manhattan', communityBoard: 'MN-05', status: 'Closed', location: 'Bryant Park' },
  { id: '311-051', createdDate: '2025-07-15', complaintType: 'Urinating in Public', descriptor: 'Recurring Issue', borough: 'Manhattan', communityBoard: 'MN-01', status: 'Closed', location: 'Stone St' },
  { id: '311-052', createdDate: '2025-07-28', complaintType: 'Unsanitary Pigeon Condition', descriptor: 'Pigeon Droppings', borough: 'Brooklyn', communityBoard: 'BK-01', status: 'Open', location: 'Williamsburg Bridge Plaza' },
  { id: '311-053', createdDate: '2025-08-09', complaintType: 'Unsanitary Animal Pvt Property', descriptor: 'Animal Waste in Yard', borough: 'Queens', communityBoard: 'QN-01', status: 'Closed', location: '30 Ave & Steinway St' },
  { id: '311-054', createdDate: '2025-08-22', complaintType: 'Unsanitary Animal Facility', descriptor: 'Pet Shop Conditions', borough: 'Manhattan', communityBoard: 'MN-03', status: 'In Progress', location: '2 Ave & E 23 St' },

  // ---------- E) Blockage Risk / Environment ----------
  { id: '311-055', createdDate: '2025-02-26', complaintType: 'Overgrown Tree/Branches', descriptor: 'Branches Blocking Sidewalk', borough: 'Queens', communityBoard: 'QN-07', status: 'Closed', location: 'Forest Hills, Queens Blvd' },
  { id: '311-056', createdDate: '2025-03-30', complaintType: 'Overgrown Tree/Branches', descriptor: 'Tree Touching Power Line', borough: 'Staten Island', communityBoard: 'SI-02', status: 'In Progress', location: 'Hylan Blvd & Tysens Ln' },
  { id: '311-057', createdDate: '2025-04-12', complaintType: 'Wood Pile Remaining', descriptor: 'Cut Wood Not Removed', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'Open', location: 'Linden Blvd & E 80 St' },
  { id: '311-058', createdDate: '2025-05-02', complaintType: 'Lot Condition', descriptor: 'Vacant Lot Overgrown', borough: 'Bronx', communityBoard: 'BX-03', status: 'In Progress', location: 'E 188 St & Bathgate Ave' },
  { id: '311-059', createdDate: '2025-05-18', complaintType: 'Obstruction', descriptor: 'Sidewalk Blocked by Materials', borough: 'Manhattan', communityBoard: 'MN-01', status: 'Closed', location: 'Pearl St & Wall St' },
  { id: '311-060', createdDate: '2025-06-05', complaintType: 'Obstruction', descriptor: 'Street Blocked', borough: 'Queens', communityBoard: 'QN-02', status: 'Closed', location: 'Jackson Ave & 23 St' },
  { id: '311-061', createdDate: '2025-06-15', complaintType: 'Abandoned Vehicle', descriptor: 'Vehicle Parked > 30 Days', borough: 'Brooklyn', communityBoard: 'BK-02', status: 'Closed', location: 'Smith St & Carroll St' },
  { id: '311-062', createdDate: '2025-06-28', complaintType: 'Abandoned Vehicle', descriptor: 'No Plates', borough: 'Bronx', communityBoard: 'BX-04', status: 'In Progress', location: 'Grand Concourse & E 149 St' },
  { id: '311-063', createdDate: '2025-07-08', complaintType: 'Abandoned Vehicle', descriptor: 'Stripped Vehicle', borough: 'Queens', communityBoard: 'QN-01', status: 'Open', location: '21 St & 30 Ave' },
  { id: '311-064', createdDate: '2025-07-21', complaintType: 'Derelict Vehicles', descriptor: 'Severely Damaged Vehicle', borough: 'Staten Island', communityBoard: 'SI-01', status: 'Closed', location: 'Forest Ave & Bard Ave' },
  { id: '311-065', createdDate: '2025-08-04', complaintType: 'Derelict Vehicles', descriptor: 'Burned-Out Vehicle', borough: 'Brooklyn', communityBoard: 'BK-05', status: 'In Progress', location: 'Pennsylvania Ave & Belmont Ave' },
];
