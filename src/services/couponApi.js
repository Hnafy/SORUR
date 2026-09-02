import { AVAILABLE_COUPONS } from '../data/mockData';

const simulateRequest = (result) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, 120);
  });
};

const coupons = Object.entries(AVAILABLE_COUPONS).map(
  ([code, coupon]) => ({
    code,
    discountPercent: coupon.discountPercent,
    label: coupon.label,
    expiresAt: '2099-12-31',
    isActive: true,
  })
);

const findCoupon = (couponCode) => {
  const normalizedCode = couponCode.trim().toUpperCase();

  return coupons.find(
    (coupon) => coupon.code === normalizedCode
  );
};

const isCouponExpired = (coupon) => {
  return new Date(coupon.expiresAt) < new Date();
};

export const couponApi = {
  async getAvailableCoupons() {
    return simulateRequest(
      coupons.filter(
        (coupon) =>
          coupon.isActive && !isCouponExpired(coupon)
      )
    );
  },

  async applyCoupon(couponCode) {
    const coupon = findCoupon(couponCode);

    if (!coupon || !coupon.isActive || isCouponExpired(coupon)) {
      throw new Error('This coupon is invalid or expired.');
    }

    return simulateRequest(coupon);
  },

  async removeCoupon() {
    return simulateRequest(null);
  },
};

export default couponApi;
