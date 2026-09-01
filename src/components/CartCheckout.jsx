import React from 'react';

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
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = Number((subtotal * 0.14).toFixed(2));

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 1000
        ? 0
        : 60;

  const total = subtotal + tax + shipping;

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

              <div className="d-flex justify-content-between fs-5 fw-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>

              <button
                className="btn btn-primary w-100 mt-4"
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
    </section>
  );
}
