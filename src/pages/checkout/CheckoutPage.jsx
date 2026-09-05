import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import checkoutApi, {
  createMockPaymentResult,
  loadRazorpayScript,
} from '../../services/checkoutApi';

const EMPTY_ADDRESS = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  country: 'Egypt',
  pincode: '',
  state: '',
};

const money = (value) => {
  return `${Number(value || 0).toFixed(2)} EGP`;
};

export default function CheckoutPage({
  cartItems,
  onClearCart,
  onShowToast,
}) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState('');
  const [newAddress, setNewAddress] =
    useState(EMPTY_ADDRESS);
  const [showAddressForm, setShowAddressForm] =
    useState(false);
  const [loadingAddresses, setLoadingAddresses] =
    useState(true);
  const [savingAddress, setSavingAddress] =
    useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price) * Number(item.quantity),
      0
    );
  }, [cartItems]);

  const tax = Number(
    (subtotal * 0.14).toFixed(2)
  );

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 1000
        ? 0
        : 60;

  const total = subtotal + tax + shipping;

  const selectedAddress = addresses.find(
    (address) =>
      address._id === selectedAddressId
  );

  useEffect(() => {
    let active = true;

    const loadAddresses = async () => {
      try {
        const result =
          await checkoutApi.getAddresses();

        if (!active) return;

        setAddresses(result);

        if (result[0]?._id) {
          setSelectedAddressId(result[0]._id);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'تعذر تحميل العناوين.'
          );
        }
      } finally {
        if (active) {
          setLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      active = false;
    };
  }, []);

  const updateAddressField = (
    field,
    value
  ) => {
    setNewAddress((currentAddress) => ({
      ...currentAddress,
      [field]: value,
    }));
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    setError('');

    try {
      const createdAddress =
        await checkoutApi.createAddress(
          newAddress
        );

      setAddresses((currentAddresses) => [
        ...currentAddresses,
        createdAddress,
      ]);

      setSelectedAddressId(
        createdAddress._id
      );

      setNewAddress(EMPTY_ADDRESS);
      setShowAddressForm(false);
    } catch (requestError) {
      setError(
        requestError.message ||
          'تعذر حفظ العنوان.'
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const finishOrder = (order) => {
    sessionStorage.setItem(
      'sorur_last_order',
      JSON.stringify(order)
    );

    onClearCart();
    navigate('/order-confirmation', {
      replace: true,
    });
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      setError('اختاري عنوان التوصيل أولًا.');
      setStep(1);
      return;
    }

    setPaying(true);
    setError('');

    try {
      const razorpayOrder =
        await checkoutApi.createRazorpayOrder(
          selectedAddress._id
        );

      const scriptLoaded =
        await loadRazorpayScript();

      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (
        !scriptLoaded ||
        !window.Razorpay ||
        !razorpayKey
      ) {
        const mockOrder =
          createMockPaymentResult(
            selectedAddress,
            cartItems
          );

        onShowToast?.(
          'تم استخدام Mock Payment للتجربة'
        );

        finishOrder(mockOrder);
        return;
      }

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency:
          razorpayOrder.currency || 'INR',
        name: 'SORUR',
        description: 'SORUR Test Payment',
        order_id: razorpayOrder.id,

        handler: async (response) => {
          try {
            const verifiedOrder =
              await checkoutApi.verifyRazorpayPayment(
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }
              );

            finishOrder(verifiedOrder);
          } catch (verifyError) {
            setError(
              verifyError.message ||
                'فشل التحقق من الدفع.'
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },

        theme: {
          color: '#6b4eff',
        },
      });

      razorpay.on(
        'payment.failed',
        (response) => {
          setError(
            response.error?.description ||
              'فشلت عملية الدفع.'
          );
          setPaying(false);
        }
      );

      razorpay.open();
    } catch (requestError) {
      const mockOrder =
        createMockPaymentResult(
          selectedAddress,
          cartItems
        );

      onShowToast?.(
        'تعذر تشغيل Razorpay، تم استخدام Mock Payment'
      );

      finishOrder(mockOrder);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="container-xl py-5 text-center">
        <h2>السلة فارغة</h2>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/shop')}
        >
          العودة للمتجر
        </button>
      </div>
    );
  }

  return (
    <section className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold text-primary mb-0">
          إتمام الطلب
        </h1>

        <span className="text-muted">
          الخطوة {step} من 3
        </span>
      </div>

      <div
        className="progress mb-4"
        style={{ height: '6px' }}
      >
        <div
          className="progress-bar"
          style={{
            width: `${step * 33.333}%`,
          }}
        />
      </div>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-3 border p-4">
          <h2 className="h5 fw-bold mb-3">
            1. عنوان التوصيل
          </h2>

          {loadingAddresses ? (
            <p className="text-muted">
              جاري تحميل العناوين...
            </p>
          ) : addresses.length === 0 ? (
            <p className="text-muted">
              لا يوجد عنوان محفوظ. أضيفي عنوانًا جديدًا.
            </p>
          ) : (
            addresses.map((address) => (
              <label
                key={address._id}
                className={`d-block border rounded-3 p-3 mb-2 ${
                  selectedAddressId === address._id
                    ? 'border-primary'
                    : ''
                }`}
              >
                <input
                  className="form-check-input me-2"
                  type="radio"
                  checked={
                    selectedAddressId ===
                    address._id
                  }
                  onChange={() =>
                    setSelectedAddressId(
                      address._id
                    )
                  }
                />

                <strong>
                  {address.addressLine1}
                </strong>

                <div className="text-muted small">
                  {address.city}، {address.state} —{' '}
                  {address.country}{' '}
                  {address.pincode}
                </div>
              </label>
            ))
          )}

          <button
            className="btn btn-outline-primary mb-3"
            onClick={() =>
              setShowAddressForm(
                (isOpen) => !isOpen
              )
            }
          >
            {showAddressForm
              ? 'إلغاء'
              : 'إضافة عنوان جديد'}
          </button>

          {showAddressForm && (
            <form
              onSubmit={handleSaveAddress}
              className="border rounded-3 p-3 mb-3"
            >
              {Object.entries(newAddress).map(
                ([field, value]) => (
                  <input
                    key={field}
                    className="form-control mb-2"
                    placeholder={field}
                    value={value}
                    required={
                      field !== 'addressLine2'
                    }
                    onChange={(event) =>
                      updateAddressField(
                        field,
                        event.target.value
                      )
                    }
                  />
                )
              )}

              <button
                className="btn btn-primary"
                disabled={savingAddress}
              >
                {savingAddress
                  ? 'جاري الحفظ...'
                  : 'حفظ العنوان'}
              </button>
            </form>
          )}

          <button
            className="btn btn-primary"
            disabled={!selectedAddressId}
            onClick={() => setStep(2)}
          >
            التالي: مراجعة الطلب
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-3 border p-4">
          <h2 className="h5 fw-bold mb-3">
            2. مراجعة الطلب
          </h2>

          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.color}`}
              className="d-flex justify-content-between border-bottom py-2"
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                {money(
                  item.price * item.quantity
                )}
              </strong>
            </div>
          ))}

          <div className="mt-3">
            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>Tax</span>
              <span>{money(tax)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>Shipping</span>
              <span>
                {shipping
                  ? money(shipping)
                  : 'Free'}
              </span>
            </div>

            <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setStep(1)}
            >
              رجوع
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setStep(3)}
            >
              التالي: الدفع
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-3 border p-4">
          <h2 className="h5 fw-bold mb-3">
            3. الدفع
          </h2>

          <p className="text-muted">
            سيتم فتح Razorpay في Test Mode، أو استخدام
            Mock Payment إذا لم يتم إعداد Razorpay.
          </p>

          <div className="alert alert-info">
            المبلغ المستحق:{' '}
            <strong>{money(total)}</strong>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setStep(2)}
              disabled={paying}
            >
              رجوع
            </button>

            <button
              className="btn btn-success"
              onClick={handlePayment}
              disabled={paying}
            >
              {paying
                ? 'جاري تجهيز الدفع...'
                : 'الدفع الآن'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
