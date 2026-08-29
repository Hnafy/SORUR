// Mock addresses mirroring FreeAPI Address schema.
// { _id, __v, addressLine1, addressLine2, city, country, owner, pincode, state, createdAt, updatedAt }

export const seedAddresses = () => [
  {
    _id: 'addr-001',
    __v: 0,
    addressLine1: 'شارع التحرير، الدقي',
    addressLine2: 'عمارة 12، الدور الثالث',
    city: 'الجيزة',
    country: 'مصر',
    owner: 'u-cust-001',
    pincode: '12613',
    state: 'الجيزة',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'addr-002',
    __v: 0,
    addressLine1: 'شارع النيل، المعادي',
    addressLine2: '',
    city: 'القاهرة',
    country: 'مصر',
    owner: 'u-cust-001',
    pincode: '11511',
    state: 'القاهرة',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
