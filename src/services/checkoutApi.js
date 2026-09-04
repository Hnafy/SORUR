import api from './api';

export const checkoutApi = {
  async getAddresses() {
    const response = await api.get('/ecommerce/addresses', {
      params: {
        page: 1,
        limit: 50,
      },
    });

    return response?.data?.addresses || [];
  },

async createAddress(address) {
  const payload = {
    addressLine1: String(
      address.addressLine1 || ''
    ).trim(),

    city: String(
      address.city || ''
    ).trim(),

    state: String(
      address.state || ''
    ).trim(),

    pincode: String(
      address.pincode || ''
    ).trim(),

    country: String(
      address.country || ''
    ).trim(),
  };

  const addressLine2 = String(
    address.addressLine2 || ''
  ).trim();

  if (addressLine2) {
    payload.addressLine2 = addressLine2;
  }

  if (
    !payload.addressLine1 ||
    !payload.city ||
    !payload.state ||
    !payload.pincode ||
    !payload.country
  ) {
    throw new Error(
      'من فضلك املئي كل بيانات العنوان المطلوبة.'
    );
  }

  const response = await api.post(
    '/ecommerce/addresses',
    payload
  );

  if (!response?.data?._id) {
    throw new Error(
      response?.message ||
        'FreeAPI لم يرجع بيانات العنوان بشكل صحيح.'
    );
  }

  return response.data;
},


  async createRazorpayOrder(addressId) {
    const response = await api.post(
      '/ecommerce/orders/provider/razorpay',
      {
        addressId,
      }
    );

    return response?.data;
  },

  async verifyRazorpayPayment(payload) {
    const response = await api.post(
      '/ecommerce/orders/provider/razorpay/verify-payment',
      payload
    );

    return response?.data;
  },
};

export const createMockPaymentResult = (
  address,
  items
) => {
  return {
    _id: `mock-order-${Date.now()}`,
    status: 'PENDING',
    isPaymentDone: true,
    paymentProvider: 'MOCK',
    paymentId: `mock-payment-${Date.now()}`,
    address,
    items: items.map((item) => ({
      _id: `${item.id}-${item.color || 'default'}`,
      product: item,
      quantity: item.quantity,
    })),
  };
};

export const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const scriptUrl =
      'https://checkout.razorpay.com/v1/checkout.js';

    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
     );

    if (existingScript) {
      existingScript.addEventListener(
        'load',
        () => resolve(true),
        { once: true }
      );

      existingScript.addEventListener(
        'error',
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script = document.createElement('script');

    script.src = scriptUrl;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default checkoutApi;
