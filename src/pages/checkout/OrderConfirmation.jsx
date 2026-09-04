import React from 'react';
import { useNavigate } from 'react-router-dom';

const money = (value) => {
  return `${Number(value || 0).toFixed(2)} EGP`;
};

export default function OrderConfirmation() {
  const navigate = useNavigate();

  let order = null;

  try {
    order = JSON.parse(
      sessionStorage.getItem('sorur_last_order') || 'null'
    );
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <div className="container-xl py-5 text-center">
        <h2>لا يوجد طلب حديث</h2>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/shop')}
        >
          العودة للمتجر
        </button>
      </div>
    );
  }

  const items = order.items || [];
  const orderNumber =
    order._id ||
    order.id ||
    order.paymentId ||
    'غير متاح';

  return (
    <section className="container-xl py-5">
      <div className="bg-white border rounded-3 p-4 p-md-5 text-center">
        <div className="text-success fs-1 mb-2">
          ✓
        </div>

        <h1 className="h3 fw-bold">
          تم تأكيد طلبك بنجاح
        </h1>

        <p className="text-muted">
          رقم الطلب:{' '}
          <strong className="text-dark">
            {orderNumber}
          </strong>
        </p>

        <div
          className="text-start mx-auto mt-4"
          style={{ maxWidth: '600px' }}
        >
          <h2 className="h5 fw-bold">
            ملخص المنتجات
          </h2>

          {items.map((item) => {
            const product = item.product || item;
            const itemId =
              item._id ||
              product.id ||
              product._id;

            return (
              <div
                key={itemId}
                className="d-flex justify-content-between border-bottom py-2"
              >
                <span>
                  {product.name} × {item.quantity}
                </span>

                <strong>
                  {money(
                    Number(product.price) *
                      Number(item.quantity)
                  )}
                </strong>
              </div>
            );
          })}
        </div>

        <div className="d-flex gap-2 justify-content-center mt-4">
          <button
            className="btn btn-primary"
            onClick={() =>
              navigate('/customer/orders')
            }
          >
            طلباتي
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/shop')}
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    </section>
  );
}
