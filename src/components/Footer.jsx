import React, { useState } from 'react';

export default function Footer({ onNavigate, onShowToast }) {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      onShowToast?.('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    onShowToast?.('شكراً لاشتراكك في نشرة سرور البريدية!');
    setEmail('');
  };

  return (
    <footer className="sorur-footer">
      <div className="container-xl">
        <div className="row g-4 mb-4">
          
          {/* Brand Info */}
          <div className="col-12 col-md-4">
            <h3 className="footer-brand-title">سرور</h3>
            <p className="text-secondary-fixed-dim opacity-75 mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              نصنع السعادة في كل تفصيلة. منتجات فاخرة وتصميمات فريدة تجمع بين الأصالة والرقي لتلبي ذوقك الرفيع في مصر والعالم العربي.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1.05rem' }}>روابط سريعة</h5>
            <ul className="list-unstyled">
              <li>
                <button className="footer-link border-0 bg-transparent p-0 text-end" onClick={() => onNavigate?.('home')}>
                  الرئيسية
                </button>
              </li>
              <li>
                <button className="footer-link border-0 bg-transparent p-0 text-end" onClick={() => onNavigate?.('shop')}>
                  المتجر
                </button>
              </li>
              <li>
                <button className="footer-link border-0 bg-transparent p-0 text-end" onClick={() => onNavigate?.('offers')}>
                  العروض
                </button>
              </li>
              <li>
                <button className="footer-link border-0 bg-transparent p-0 text-end" onClick={() => onNavigate?.('cart')}>
                  سلة التسوق
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-6 col-md-3">
            <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1.05rem' }}>خدمة العملاء</h5>
            <ul className="list-unstyled">
              <li><span className="footer-link cursor-pointer">سياسة الخصوصية</span></li>
              <li><span className="footer-link cursor-pointer">الشروط والأحكام</span></li>
              <li><span className="footer-link cursor-pointer">سياسة الاسترجاع والاستبدال</span></li>
              <li><span className="footer-link cursor-pointer">الشحن والتوصيل في مصر</span></li>
            </ul>
          </div>

          {/* Footer Image */}
          <div className="col-12 col-md-3 d-flex align-items-center justify-content-center">
            <img
              src="/image 1.jpeg"
              alt="سرور لتصميمات السعادة"
              className="footer-image"
            />
          </div>

        </div>

        {/* Copyright divider */}
        <div className="pt-3 mt-4 border-top border-secondary border-opacity-25 text-center text-secondary-fixed-dim opacity-75 small">
          <p className="mb-0">
            © {new Date().getFullYear()} سرور لتصميمات السعادة. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
