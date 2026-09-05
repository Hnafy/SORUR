import api from './api';

const normalizeCode = (code) => {
  return String(code || '')
    .trim()
    .toUpperCase();
};

const getCouponsFromResponse = (response) => {
  return response?.data?.coupons || [];
};

const normalizeDate = (date) => {
  if (!date) {
    return undefined;
  }

  return new Date(`${date}T23:59:59.000Z`).toISOString();
};

const buildCouponPayload = (coupon) => {
  const payload = {
    name: String(coupon.name || '').trim(),

    couponCode: normalizeCode(
      coupon.couponCode
    ),

    type: 'FLAT',

    discountValue: Number(
      coupon.discountValue
    ),

    minimumCartValue: Number(
      coupon.minimumCartValue || 0
    ),
  };

  const expiryDate = normalizeDate(
    coupon.expiryDate
  );

  if (expiryDate) {
    payload.expiryDate = expiryDate;
  }

  return payload;
};

const couponApi = {
  async getAvailableCoupons() {
    const response = await api.get(
      '/ecommerce/coupons/customer/available',
      {
        params: {
          page: 1,
          limit: 50,
        },
      }
    );

    return getCouponsFromResponse(response);
  },

  async applyCoupon(couponCode) {
    const normalizedCode =
      normalizeCode(couponCode);

    if (!normalizedCode) {
      throw new Error(
        'Please enter a coupon code.'
      );
    }

    return api.post(
      '/ecommerce/coupons/c/apply',
      {
        couponCode: normalizedCode,
      }
    );
  },

  async removeCoupon(couponCode) {
    const normalizedCode =
      normalizeCode(couponCode);

    if (!normalizedCode) {
      throw new Error(
        'No coupon is currently applied.'
      );
    }

    return api.post(
      '/ecommerce/coupons/c/remove',
      {
        couponCode: normalizedCode,
      }
    );
  },

  async getAdminCoupons() {
    const response = await api.get(
      '/ecommerce/coupons',
      {
        params: {
          page: 1,
          limit: 100,
        },
      }
    );

    return getCouponsFromResponse(response);
  },

  async getCouponById(couponId) {
    const response = await api.get(
      `/ecommerce/coupons/${couponId}`
    );

    return response?.data;
  },

  async createCoupon(coupon) {
    const response = await api.post(
      '/ecommerce/coupons',
      buildCouponPayload(coupon)
    );

    return response?.data;
  },

  async updateCoupon(couponId, coupon) {
    const response = await api.patch(
      `/ecommerce/coupons/${couponId}`,
      buildCouponPayload(coupon)
    );

    return response?.data;
  },

  async updateCouponStatus(couponId, isActive) {
    const response = await api.patch(
      `/ecommerce/coupons/status/${couponId}`,
      {
        isActive: Boolean(isActive),
      }
    );

    return response?.data;
  },

  async deleteCoupon(couponId) {
    const response = await api.delete(
      `/ecommerce/coupons/${couponId}`
    );

    return response?.data;
  },
};

export default couponApi;
