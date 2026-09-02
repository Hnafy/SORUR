import React from 'react';

const money = (value) => `${Number(value).toFixed(2)} EGP`;

export default function CartDrawer({
  open,
  items,
  subtotal,
  tax,
  shipping,
  total,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onViewCart,
  busyItem,
}) {
  if (!open) return null;

  return (
    <>
      <button
        className="cart-drawer-backdrop"
        aria-label="Close cart"
        onClick={onClose}
      />

      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h2 className="h5 fw-bold mb-0">Shopping Cart</h2>

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-muted py-5">
            <span
              className="material-symbols-outlined d-block mb-2"
              style={{ fontSize: '42px' }}
            >
              shopping_cart
            </span>

            <p className="mb-0">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => {
                const itemKey = `${item.id}:${item.color}`;
                const busy = busyItem === itemKey;

                return (
                  <div
                    className="cart-drawer-item"
                    key={`${item.id}-${item.color}`}
                  >
                    <img src={item.image} alt={item.name} />

                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-semibold text-truncate">
                        {item.name}
                      </div>

                      <small className="text-muted">
                        {item.color}
                      </small>

                      <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                        <div
                          className="quantity-control"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            disabled={busy || item.quantity <= 1}
                            onClick={() =>
                              onUpdateQuantity(item, item.quantity - 1)
                            }
                          >
                            -
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            disabled={busy || item.quantity >= item.stock}
                            onClick={() =>
                              onUpdateQuantity(item, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <strong>
                          {money(item.price * item.quantity)}
                        </strong>
                      </div>
                    </div>

                    <button
                      className="btn btn-sm text-danger p-0"
                      disabled={busy}
                      onClick={() => onRemoveItem(item)}
                      aria-label={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-top pt-3 mt-3">
              <div className="d-flex justify-content-between small mb-1">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>

              <div className="d-flex justify-content-between small mb-1">
                <span>Tax</span>
                <strong>{money(tax)}</strong>
              </div>

              <div className="d-flex justify-content-between small mb-3">
                <span>Shipping</span>
                <strong>
                  {shipping === 0 ? 'Free' : money(shipping)}
                </strong>
              </div>

              <div className="d-flex justify-content-between fw-bold mb-3">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={onViewCart}
              >
                View Cart
              </button>

              <button
                className="btn btn-outline-danger w-100"
                onClick={onClearCart}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
