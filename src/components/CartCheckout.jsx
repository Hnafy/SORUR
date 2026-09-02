import React, { useEffect, useState } from 'react';
import couponApi from '../services/couponApi';

const money = (value) => {
  return `${Number(value).toFixed(2)} EGP`;
};

export default function CartCheckout({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
  busyItem,
  cartError,
}) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsDrawerOpen, setCouponsDrawerOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCoupons = async () => {
      try {
        const coupons = await couponApi.getAvailableCoupons();

        if (active) {
          setAvailableCoupons(coupons);
        }
      } catch (error) {
        if (active) {
          setCouponError(error.message);
        }
      }
    };

    loadCoupons();

    return () => {
      active = false;
    };
  }, []);

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const coupon = await couponApi.applyCoupon(normalizedCode);

      setAppliedCoupon(coupon);
      setCouponCode(coupon.code);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSelectCoupon = async (coupon) => {
    setCouponCode(coupon.code);
    setCouponLoading(true);
    setCouponError('');

    try {
      const applied = await couponApi.applyCoupon(coupon.code);

      setAppliedCoupon(applied);
      setCouponsDrawerOpen(false);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponLoading(true);
    setCouponError('');

    try {
      await couponApi.removeCoupon();

      setAppliedCoupon(null);
      setCouponCode('');
    } catch (error) {
      setCouponError(error.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = appliedCoupon
    ? Number(
        (
          (subtotal * appliedCoupon.discountPercent) /
          100
        ).toFixed(2)
      )
    : 0;

  const discountedSubtotal = Math.max(
    0,
    subtotal - discount
  );

  const tax = Number(
    (discountedSubtotal * 0.14).toFixed(2)
  );

  const shipping =
    discountedSubtotal === 0
      ? 0
      : discountedSubtotal >= 1000
        ? 0
        : 60;

  const total = discountedSubtotal + tax + shipping;

  return (
    <section className="cart-checkout-view container-xl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-secondary fw-semibold mb-1">
            Your selection
          </p>

          <h1 className="fw-bold mb-0">
            Shopping Cart
          </h1>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => onNavigate('shop')}
        >
          Continue Shopping
        </button>
      </div>

      {cartError && (
        <div className="alert alert-danger" role="alert">
          {cartError}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3 border p-5 text-center">
          <h2 className="h5 fw-bold">
            Your cart is empty
          </h2>

          <p className="text-muted">
            Add a product to start your order.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => onNavigate('shop')}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8 bg-white rounded-3 border p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-2">
              <h2 className="h5 fw-bold mb-0">
                Cart Items ({cartItems.length})
              </h2>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={onClearCart}
                disabled={Boolean(busyItem)}
              >
                Clear Cart
              </button>
            </div>

            {cartItems.map((item) => {
              const itemKey = `${item.id}:${item.color}`;
              const busy = busyItem === itemKey;

              return (
                <article
                  className="cart-item-card"
                  key={itemKey}
                >
                  <img
                    className="cart-item-img"
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="flex-grow-1">
                    <h3 className="h6 fw-bold mb-1">
                      {item.name}
                    </h3>

                    <p className="text-muted small mb-2">
                      Color: {item.color}
                    </p>

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                      <div className="quantity-control">
                        <button
                          disabled={
                            busy ||
                            item.quantity <= 1
                          }
                          onClick={() =>
                            onUpdateQuantity(
                              item,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          disabled={
                            busy ||
                            item.quantity >= item.stock
                          }
                          onClick={() =>
                            onUpdateQuantity(
                              item,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <strong>
                        {money(item.price * item.quantity)}
                      </strong>

                      <button
                        className="btn btn-sm btn-link text-danger"
                        disabled={busy}
                        onClick={() => onRemoveItem(item)}
                      >
                        Remove
                      </button>
                    </div>

                    <small className="text-muted">
                      Maximum available: {item.stock}
                    </small>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="col-12 col-lg-4">
            <div className="order-summary-card">
              <h2 className="h5 fw-bold mb-3">
                Price Breakdown
              </h2>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>

              {appliedCoupon && (
                <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                  <span className="badge text-bg-success">
                    Coupon: {appliedCoupon.code}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={handleRemoveCoupon}
                    disabled={couponLoading}
                  >
                    Remove
                  </button>
                </div>
              )}

              {appliedCoupon && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>
                    Discount ({appliedCoupon.discountPercent}%)
                  </span>

                  <strong>
                    -{money(discount)}
                  </strong>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span>Tax (14%)</span>
                <strong>{money(tax)}</strong>
              </div>

              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <span>Shipping</span>

                <strong>
                  {shipping === 0
                    ? 'Free'
                    : money(shipping)}
                </strong>
              </div>

              <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>

              <div className="coupon-section border rounded-3 p-3 mb-3">
                <h3 className="h6 fw-bold mb-3">
                  Apply Coupon
                </h3>

                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(event) =>
                      setCouponCode(event.target.value)
                    }
                    disabled={couponLoading}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={() =>
                    setCouponsDrawerOpen(true)
                  }
                >
                  View Available Coupons
                </button>

                {couponError && (
                  <div
                    className="alert alert-danger py-2 px-3 mt-3 mb-0 small"
                    role="alert"
                  >
                    {couponError}
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary w-100"
                disabled
              >
                Proceed to Checkout
              </button>

              <small className="d-block text-muted text-center mt-2">
                Checkout will be enabled in the next task.
              </small>
            </div>
          </aside>
        </div>
      )}

      {couponsDrawerOpen && (
        <>
          <button
            type="button"
            className="coupon-drawer-backdrop"
            aria-label="Close available coupons"
            onClick={() =>
              setCouponsDrawerOpen(false)
            }
          />

          <aside className="coupon-drawer">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h2 className="h5 fw-bold mb-0">
                Available Coupons
              </h2>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setCouponsDrawerOpen(false)
                }
              >
                ×
              </button>
            </div>

            {availableCoupons.length === 0 ? (
              <p className="text-muted">
                No available coupons found.
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {availableCoupons.map((coupon) => (
                  <div
                    className="border rounded-3 p-3"
                    key={coupon.code}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                      <strong className="text-primary">
                        {coupon.code}
                      </strong>

                      <span className="badge text-bg-success">
                        {coupon.discountPercent}% OFF
                      </span>
                    </div>

                    <p className="small text-muted mb-3">
                      {coupon.label}
                    </p>

                    <button
                      type="button"
                      className="btn btn-sm btn-primary w-100"
                      onClick={() =>
                        handleSelectCoupon(coupon)
                      }
                      disabled={couponLoading}
                    >
                      Apply Coupon
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </>
      )}
    </section>
  );
}
