import api from './api';

const normalizeCode = (code) => {
  return String(code || '')
    .trim()
    .toUpperCase();
};

const getCouponsFromResponse = (response) => {
  return (
    response?.data?.coupons ||
    response?.coupons ||
    []
  );
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
    const normalizedCode = normalizeCode(couponCode);

    if (!normalizedCode) {
      throw new Error('Please enter a coupon code.');
    }

    return api.post(
      '/ecommerce/coupons/c/apply',
      {
        couponCode: normalizedCode,
      }
    );
  },

  async removeCoupon(couponCode) {
    const normalizedCode = normalizeCode(couponCode);

    if (!normalizedCode) {
      throw new Error('No coupon is currently applied.');
    }

    return api.post(
      '/ecommerce/coupons/c/remove',
      {
        couponCode: normalizedCode,
      }
    );
  },
};

export default couponApi;
