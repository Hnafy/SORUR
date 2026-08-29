// Mock categories mirroring FreeAPI Category schema.
// { _id, name, owner, __v, createdAt, updatedAt }

export const seedCategories = () => [
  { _id: 'cat-001', name: 'ديكور منزلي', owner: 'u-admin-001', __v: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'cat-002', name: 'عطور ومنزل', owner: 'u-admin-001', __v: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'cat-003', name: 'ضيافة ونحاسيات', owner: 'u-admin-001', __v: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'cat-004', name: 'قرطاسية', owner: 'u-admin-001', __v: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'cat-005', name: 'أكواب وفخاريات', owner: 'u-admin-001', __v: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'cat-006', name: 'إكسسوارات', owner: 'u-admin-001', __v: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'cat-007', name: 'مجموعة هدايا', owner: 'u-admin-001', __v: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const SORUR_CATEGORY_ID_BY_NAME = {
  'ديكور منزلي': 'cat-001',
  'عطور ومنزل': 'cat-002',
  'ضيافة ونحاسيات': 'cat-003',
  'قرطاسية': 'cat-004',
  'أكواب وفخاريات': 'cat-005',
  'إكسسوارات': 'cat-006',
  'مجموعة هدايا': 'cat-007',
};
