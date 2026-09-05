import api from './api';

const normalizeCategory = (category) => {
  if (!category) return null;
  return {
    id: category._id || category.id,
    name: category.name || '',
    owner: category.owner?.toString?.() || category.owner || null,
    createdAt: category.createdAt || null,
    updatedAt: category.updatedAt || null,
  };
};

export const categoryApi = {
  // GET /ecommerce/categories -> paginated categories (public)
  async fetchCategories({ page = 1, limit = 50, search = '' } = {}) {
    const params = { page, limit };
    if (search) params.query = search;

    const res = await api.get('/ecommerce/categories', { params });
    const data = res?.data || res || {};

    return {
      categories: (data.categories || []).map(normalizeCategory),
      totalCategories: data.totalCategories || 0,
      totalPages: data.totalPages || 1,
      page: data.page || page,
      limit: data.limit || limit,
      hasNextPage: !!data.hasNextPage,
      hasPrevPage: !!data.hasPrevPage,
    };
  },

  // POST /ecommerce/categories { name } -> Category (admin)
  async createCategory(name) {
    const res = await api.post('/ecommerce/categories', { name });
    return normalizeCategory(res?.data || res || null);
  },

  // PATCH /ecommerce/categories/:id { name } -> Category (admin)
  async updateCategory(id, name) {
    const res = await api.patch(`/ecommerce/categories/${id}`, { name });
    return normalizeCategory(res?.data || res || null);
  },

  // DELETE /ecommerce/categories/:id -> { deletedCategory } (admin)
  async deleteCategory(id) {
    const res = await api.delete(`/ecommerce/categories/${id}`);
    return normalizeCategory(res?.data?.deletedCategory || res?.data || null);
  },
};

export default categoryApi;