import React from 'react';

export default function HeroSection({ onExploreShop, onExploreOffers }) {
  return (
    <>
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container-xl">
          <div className="row align-items-center g-4 min-vh-50">
            
            {/* Text & CTA Column */}
            <div className="col-12 col-lg-5 order-2 order-lg-1 text-center text-lg-end">
              <div className="hero-subtitle animate-fade-in-down anim-delay-1 text-start">تشكيلة الموسم الجديد</div>
              <h1 className="hero-headline animate-fade-in-up anim-delay-2 text-start">
                تصميمات تُصنع <br />
                بحب لتنشر <br />
                <span className="highlight">السعادة</span>
              </h1>
              <p className="hero-desc mx-auto mx-lg-0 animate-fade-in-up anim-delay-3 text-start">
                اكتشف مجموعتنا الحصرية من المنتجات الراقية والمصنوعات اليدوية التي تضفي لمسة من الفخامة والدفء على تفاصيل يومك بأفضل الأسعار بالجنيه المصري.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start animate-fade-in-up anim-delay-4">
                <button 
                  className="btn-sorur-primary"
                  onClick={onExploreShop}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_bag</span>
                  تسوق الآن
                </button>
                <button 
                  className="btn-sorur-secondary"
                  onClick={onExploreOffers}
                >
                  استعرض المجموعات
                </button>
              </div>
            </div>

            {/* Visual Hero Image Column */}
            <div className="col-12 col-lg-7 order-1 order-lg-2">
              <div className="hero-img-container animate-fade-in-scale anim-delay-2">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn6j8jL9WAoMvecB5hOe0Oa-Nz3ApyHHEpB8iIarX3_t3HkOZt_WAZNtZoyHODfksDnCyEchRX8lTA8Tbv5-uAr5g5gaFwY-c3eiCBUpcuSS8r3fiuwyRnOMhjLPzcBf3BawgHH7AzoCCsEi_Md7IbYQJwFB3C9oLtT_umtE0m-kajDHwHwgZOE1AMQTul2G4c_Fg2lEHm7SHnv68-WYtccpqBQ0CzxjBTbSVWpiw6NCheJpIETnPdqg" 
                  alt="تشكيلة سرور الفاخرة" 
                  className="hero-img"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Brand Value Propositions / Features Section */}
      <section className="features-section">
        <div className="container-xl">
          <div className="row g-4">
            
            <div className="col-12 col-md-4 animate-fade-in-up anim-delay-3">
              <div className="feature-box">
                <div className="feature-icon-circle">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>local_shipping</span>
                </div>
                <h3 className="feature-title">شحن سريع وموثوق</h3>
                <p className="feature-desc">توصيل آمن وسريع لجميع محافظات مصر وباب منزلك</p>
              </div>
            </div>

            <div className="col-12 col-md-4 animate-fade-in-up anim-delay-4">
              <div className="feature-box">
                <div className="feature-icon-circle">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>verified</span>
                </div>
                <h3 className="feature-title">جودة استثنائية</h3>
                <p className="feature-desc">خامات طبيعية فاخرة وتفاصيل متقنة الصنع يدوياً</p>
              </div>
            </div>

            <div className="col-12 col-md-4 animate-fade-in-up anim-delay-5">
              <div className="feature-box">
                <div className="feature-icon-circle">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>shield_lock</span>
                </div>
                <h3 className="feature-title">دفع آمن وسهل</h3>
                <p className="feature-desc">خيارات دفع متعددة، كروت بنكية أو الدفع عند الاستلام</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
