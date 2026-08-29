// Mock data for Sorur (سرور - لتصميمات السعادة) in Egyptian Pounds (ج.م)

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'مبخرة خشبية فاخرة',
    category: 'ديكور منزلي',
    price: 245,
    originalPrice: 300,
    rating: 4.8,
    reviewsCount: 120,
    badge: 'حصري',
    isBestSeller: true,
    stock: 5,
    description: 'مبخرة خشبية مصنوعة يدوياً بحرفية عالية، تجمع بين الأصالة واللمسة العصرية. مصممة لتضفي جوًا من الدفء والسرور على مساحتك الخاصة. الخشب المستخدم منتقى بعناية لضمان الجودة والمتانة، مع تفاصيل نحاسية دقيقة تزيد من فخامتها.',
    colors: [
      { name: 'بني غامق', hex: '#5d3a1a', label: 'Dark Brown' },
      { name: 'بني فاتح', hex: '#cba483', label: 'Light Brown' },
      { name: 'أسود فاحم', hex: '#2d2c29', label: 'Charcoal Black' },
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIiEnHiqho3zyi42-Fe0B5bZMa2QQQ1MqWdBMdMUzOLaF5ZFicTSImkrtnlCMfMOI5T7hsR2MF3INAl2b-8kA4ZAwQHlISTXcqyydRTF9zv-lZpIqxDC21cXu4133ZH2BX8LyomN29qU4y2HUpzLLCfdkH_pMJeyqLePu1qWRd9ejs5hSNr3miwBgDSj2eYdyz81KZPyISq8wBtFPKFLV1oUdvflTQeFhy0g06E2JXq-I25a8JKm6-g',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIiEnHiqho3zyi42-Fe0B5bZMa2QQQ1MqWdBMdMUzOLaF5ZFicTSImkrtnlCMfMOI5T7hsR2MF3INAl2b-8kA4ZAwQHlISTXcqyydRTF9zv-lZpIqxDC21cXu4133ZH2BX8LyomN29qU4y2HUpzLLCfdkH_pMJeyqLePu1qWRd9ejs5hSNr3miwBgDSj2eYdyz81KZPyISq8wBtFPKFLV1oUdvflTQeFhy0g06E2JXq-I25a8JKm6-g',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1Xv9vutMRSflS9X41guxklTeRmrs5AYUvhs8hiq9OY7tfVeRuFzAYrMQ5LTHb4HR32C4cWuf9hn3ILfjR86bQaV2M54hA0MQ8BB-bjsPytnxR2ebkrhlqyY7_WxT8l4_dVo1eqPdwtcQgeDC15qGpL2qxUgmNU-5eklaSF62_oXhk-BWwE7VMNev_BqKFLNaSQtaxKdi_Mvj1atdU2raXKNnvORrKBOPEOa35ZJYJkQIdV0yX_WidHg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwgZSgcYkIXJu8nMlLvXWnbz12bFOGnAA6XQipPiVAkaRhVMGjvzdFe_oCvtgqHj7kYGD5FpbiwSEmc5u8f7Ag7AtVVcPMrKULBVqi2wrZZgYliaJVHlqT_E3byl5MDgVc99RGm9su7ldn5imgnUgIuDSlL5-6vYCJBuRi8s18e0EEGuxX7hH_wPLPuOgR8EjOdzupmML2LXuFJrPGIyoMxaxZsoR90LYIP8iyunERD7-PS1lKTyerwg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBuaiNOZm4ZEIiS8ks7_5IrgK9fFgkkCzkfbrY9R-pu1Npo6pn78BnoDOy5EVvwqbHwC0szm7S2wPR3Se_YTFtc7HTDuUCjUrlcT94OPKvto4a0MA1x9afrypsfsMBjdBIkgU_tATF-4CNHiVRh2ubKiPwHQUPmAD6vRzbY_Xl7ldhn21dlZ_HNh1_uZiywEysgSwrobOpRe_XLV1kZVrMl6qP3sn7jZlqzXIW4YkVOzj1B-1GP-3RruQ',
    ],
  },
  {
    id: 'prod-002',
    name: 'تحفة فنية سيراميك (مزهرية يدوية)',
    category: 'ديكور منزلي',
    price: 245,
    originalPrice: 290,
    rating: 4.9,
    reviewsCount: 88,
    badge: 'الأكثر طلباً',
    isBestSeller: true,
    stock: 12,
    description: 'مزهرية سيراميك يدوية الصنع بلون فخاري دافئ وملمس مات طبيعي يضفي رونقاً مميزاً على كل ركن.',
    colors: [
      { name: 'ترابي دافئ', hex: '#b35d38', label: 'Terracotta' },
      { name: 'بيج رملي', hex: '#d9c7b2', label: 'Sandy Sand' },
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbuSIGYwxNffyRhaYaQQ8xeF0cFGcFaveJQ1I9OKXb4JFyOUsRsIFZff7kMJWL_8zqD2o90z2Y2l61ULgcHI2mb8dMqll8by9OWiSk8YReNCefpIRXAeltQM4sqEV_UVo99VbsCEkjt3oy3D6Vb3k93lvi8xqvSwqTNS-GF61RaFDb4vFHQBUHlbiulU4rqivIG8Dzv0xJMxEm3VTQZLVX3rNopmTs06QEVNLF0oFiFjtcjooDqhz6YQ',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbuSIGYwxNffyRhaYaQQ8xeF0cFGcFaveJQ1I9OKXb4JFyOUsRsIFZff7kMJWL_8zqD2o90z2Y2l61ULgcHI2mb8dMqll8by9OWiSk8YReNCefpIRXAeltQM4sqEV_UVo99VbsCEkjt3oy3D6Vb3k93lvi8xqvSwqTNS-GF61RaFDb4vFHQBUHlbiulU4rqivIG8Dzv0xJMxEm3VTQZLVX3rNopmTs06QEVNLF0oFiFjtcjooDqhz6YQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSMoE9Io71Y7TKf5wvdPgNobjnpPFiFbnv6g_oYfhHb2qneuto2gvYc4ETrQSVAuokGtscNX4H2axbrnYBnMlm8HJ36Tn9SvDdOQaD4vzX5LFbKmKqUGuFN36N3Ibx_wxQImfZE6thAJZHa00vedBoUld-5vccMsv30YRLTEckVbbHyN8AsT_E6fa_gDDjs_h3GJD9-uCQNvYQGip2ygX6mLP3ysYP_s_tfamFHVYOBO3WNbAkth7bSA',
    ],
  },
  {
    id: 'prod-003',
    name: 'مجموعة العناية الفاخرة',
    category: 'مجموعة هدايا',
    price: 180,
    originalPrice: 220,
    rating: 4.7,
    reviewsCount: 65,
    badge: 'طقم هدايا',
    isBestSeller: true,
    stock: 8,
    description: 'مجموعة متكاملة من الصابون العضوي الطبيعي ومستحضرات الاسترخاء في صندوق هدايا أنيق بتغليف راقي.',
    colors: [
      { name: 'كريمي طبيعي', hex: '#eee7de', label: 'Natural Cream' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKEs6ADJMuz8PAQnSMOfBsaihHTLB03Dg8K98rEkv-k1c-Znfjea5FvmZCgpj0JCoP8Jb5noOb2vdKqLWXw6tmu0nYKDMroeX-BbN6jpXw5zlDB1iuCQlkRNJ22X_K7GymBlk6jjr6AZRYrsnDYj1CxJ9asLLhRGVHQORhll_TtVICDNIK5JgV3Wm2QNmOBqn-DKNiQ-COHAbIr_FVsoBOIgorsVWRS1cJ-uzBTbqoeupxbt57oXjBXQ',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKEs6ADJMuz8PAQnSMOfBsaihHTLB03Dg8K98rEkv-k1c-Znfjea5FvmZCgpj0JCoP8Jb5noOb2vdKqLWXw6tmu0nYKDMroeX-BbN6jpXw5zlDB1iuCQlkRNJ22X_K7GymBlk6jjr6AZRYrsnDYj1CxJ9asLLhRGVHQORhll_TtVICDNIK5JgV3Wm2QNmOBqn-DKNiQ-COHAbIr_FVsoBOIgorsVWRS1cJ-uzBTbqoeupxbt57oXjBXQ'
    ],
  },
  {
    id: 'prod-004',
    name: 'مفكرة جلدية كلاسيكية',
    category: 'قرطاسية',
    price: 120,
    originalPrice: 150,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'جلد طبيعي',
    isBestSeller: true,
    stock: 15,
    description: 'دفتر ملاحظات جلدي فاخر مصنوع من جلد طبيعي عالي الجودة مع قفل كلاسيكي وأوراق قطنية معتقة.',
    colors: [
      { name: 'بني كلاسيكي', hex: '#63391b', label: 'Classic Brown' },
      { name: 'بني عسلي', hex: '#9d6332', label: 'Tan Honey' },
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEDjM7xwy3p_5Xoixz1bbymaHzDWInWcMGU_72kFeaGNfTgrzNFTz3eHlZk5aD-04rtaNUIBraSxZs8Fm7Gr9Bf2xq_-D_u7zqNf-aNQxprRjhcZPbx9FcP7XV9v6YiimwqKTDkuB8mnaWec7gwklCSr_Tn7zGBuZMmIkjAATWefCGU2RSE6HtKspqSGWygxZXcTZVs5QDuDrihLYon7nNAmksTGoq3XsRNPIDvdU9uu_U0LODsKn1WA',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEDjM7xwy3p_5Xoixz1bbymaHzDWInWcMGU_72kFeaGNfTgrzNFTz3eHlZk5aD-04rtaNUIBraSxZs8Fm7Gr9Bf2xq_-D_u7zqNf-aNQxprRjhcZPbx9FcP7XV9v6YiimwqKTDkuB8mnaWec7gwklCSr_Tn7zGBuZMmIkjAATWefCGU2RSE6HtKspqSGWygxZXcTZVs5QDuDrihLYon7nNAmksTGoq3XsRNPIDvdU9uu_U0LODsKn1WA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCwMV5f_Ug8cbYmfrsg3KF3f1jFxuZB_6YzDUGCCGFwFd3E82UE9J4V57vTHc1Uh-j4WgnsnsMe-m6ghSTX0IJhfGkQ5u1SPH9RYPZiAxZc5pGiB5aX_YyGHoK2gklLwQo81rXoP_1BD9ut2hyc92q5CnH-QeSVroZW55D8MT6P50uJII5EEJqA3J8vxGY9z2XRE3tjdtIVrLKdZt4wYOhaEYMMJLxfgDc4sDu3ORZBEE6IQQH6SLIWw'
    ],
  },
  {
    id: 'prod-005',
    name: 'قلادة ذهبية ناعمة',
    category: 'إكسسوارات',
    price: 350,
    originalPrice: 420,
    rating: 5.0,
    reviewsCount: 47,
    badge: 'تصميم يدوي',
    isBestSeller: true,
    stock: 7,
    description: 'قلادة بتصميم شرقي ناعم مطلية بالذهب عيار 18 مع حجر كحلي أنيق يمنحك لمسة راقية وجذابة.',
    colors: [
      { name: 'ذهبي مع كحلي', hex: '#d4af37', label: 'Gold / Blue' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8mTsdIgDPyneH5H5-PW-8cuRA1uvkdxEQ_EJL6xUG7ereSP68g4WReYpPjinBGiOV1Mx0KVLO9Q3JdMO8O3FO1fIIlHUwXVLVXwTy6kX7vtDkupEItbggtoMjwS4_0x0JgQ_KkVIBVfTjzrlj4NrB9B5MSnMtqpD1K3nvrrtjwW-QamxfwieVeSRLPDBmDsmEwJ99x0eH9mIgp1QkK8q50tdvB5ZCX-NjFXbw4AVGU5-z3GiTknZz1w',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA8mTsdIgDPyneH5H5-PW-8cuRA1uvkdxEQ_EJL6xUG7ereSP68g4WReYpPjinBGiOV1Mx0KVLO9Q3JdMO8O3FO1fIIlHUwXVLVXwTy6kX7vtDkupEItbggtoMjwS4_0x0JgQ_KkVIBVfTjzrlj4NrB9B5MSnMtqpD1K3nvrrtjwW-QamxfwieVeSRLPDBmDsmEwJ99x0eH9mIgp1QkK8q50tdvB5ZCX-NjFXbw4AVGU5-z3GiTknZz1w'
    ],
  },
  {
    id: 'prod-006',
    name: 'طقم شموع عطرية فاخرة',
    category: 'عطور ومنزل',
    price: 120,
    originalPrice: 160,
    rating: 4.8,
    reviewsCount: 93,
    badge: 'طبيعي 100%',
    isBestSeller: false,
    stock: 20,
    description: 'ثلاث شموع عطرية بروائح العود واللبان، خشب الصندل، والورد والباتشولي لجو دافئ ومريح.',
    colors: [
      { name: 'زجاج عنبري', hex: '#a66a38', label: 'Amber' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMPSepeN3u2xQFm5x9MeKcWqoz7wbB66NtFgHMLqozCxFUmzHeeN_xnkfyhVhtDDawNzOF1BTd5Gh-XifpE_WbAESbHvtmMcT__HxOOkHjCnCn6p69PG6Oen3Uf3JzkQXimHBKQ2cAJn11CKI1uJlhHsu9KbBQ0CFjg6Yr0QvjMrVeqChQJJopdPxLVDJhK6-39MglxQP5I0L3yenyn47X39QtPQCygNviA58QhCGVHdOYmEaaF9tXA',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMPSepeN3u2xQFm5x9MeKcWqoz7wbB66NtFgHMLqozCxFUmzHeeN_xnkfyhVhtDDawNzOF1BTd5Gh-XifpE_WbAESbHvtmMcT__HxOOkHjCnCn6p69PG6Oen3Uf3JzkQXimHBKQ2cAJn11CKI1uJlhHsu9KbBQ0CFjg6Yr0QvjMrVeqChQJJopdPxLVDJhK6-39MglxQP5I0L3yenyn47X39QtPQCygNviA58QhCGVHdOYmEaaF9tXA'
    ],
  },
  {
    id: 'prod-007',
    name: 'صينية تقديم نحاسية منقوشة',
    category: 'ضيافة ونحاسيات',
    price: 350,
    originalPrice: 400,
    rating: 4.9,
    reviewsCount: 52,
    badge: 'نحاس أصلي',
    isBestSeller: false,
    stock: 6,
    description: 'صينية ضيافة من النحاس الخالص مع نقوش إسلامية دقيقة محفورة يدوياً على أيدي أمهر الحرفيين.',
    colors: [
      { name: 'نحاسي ذهبي', hex: '#d1a84f', label: 'Brass Gold' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXdPYFvfZv_LQTvfRa0dA7uSxUIPiFT6EfL3M1_4CZjZlXuuxS0kjF2n7o1sXLtWc-gUGTmNw017i7P1qoKTQEC3qXwHsx-QUT91OkWpZ0wl7rDpVbH38L8N45qOK9GH4IcKX3svv3owNjwSwSaqQ06vMdg7E7wuielbN5ufHqjj1BkUGfCpkfI8Got25EmMrlYp7LOwnnFZbcmaIPavTr6TLxDUTkSDTb4Dz9VbG6sVpA6NleZMkkPw',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXdPYFvfZv_LQTvfRa0dA7uSxUIPiFT6EfL3M1_4CZjZlXuuxS0kjF2n7o1sXLtWc-gUGTmNw017i7P1qoKTQEC3qXwHsx-QUT91OkWpZ0wl7rDpVbH38L8N45qOK9GH4IcKX3svv3owNjwSwSaqQ06vMdg7E7wuielbN5ufHqjj1BkUGfCpkfI8Got25EmMrlYp7LOwnnFZbcmaIPavTr6TLxDUTkSDTb4Dz9VbG6sVpA6NleZMkkPw'
    ],
  },
  {
    id: 'prod-008',
    name: 'كوب فخاري يدوي الصنع',
    category: 'أكواب وفخاريات',
    price: 85,
    originalPrice: 110,
    rating: 4.6,
    reviewsCount: 79,
    badge: 'صناعة يدوية',
    isBestSeller: false,
    stock: 25,
    description: 'كوب قهوة وشاي من الطين الحراري المعالج بطلاء زجاجي آمن وصحي، مريح لليد ويحتفظ بحرارة مشروبك.',
    colors: [
      { name: 'ترابي دافئ', hex: '#c27e57', label: 'Earthy' },
      { name: 'أبيض كريمي', hex: '#e9dfd0', label: 'Cream White' },
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVc2Rj8HvnGh-brchjDI3p7t7Ch67TodQjMm8GGae9Xyr-lAg2qXg6orrJjeJ_zdC0bb4g-Fd2mClPGqCZCmdp5T6HVnsXbuOvLsPPDl1iZ-lJjrgAz2uOTlk7po82NDNJcz0G50f7aUuLH7SdQzehZzFL5KzVBI62CR_5xQuTaOBxn8Z3wPxqtHBfxl7t8sSpFGzwDkDvmUDXX4CnVuqmXkWL51X4eDkCePTalDoLp_y85vDwqkGjkg',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVc2Rj8HvnGh-brchjDI3p7t7Ch67TodQjMm8GGae9Xyr-lAg2qXg6orrJjeJ_zdC0bb4g-Fd2mClPGqCZCmdp5T6HVnsXbuOvLsPPDl1iZ-lJjrgAz2uOTlk7po82NDNJcz0G50f7aUuLH7SdQzehZzFL5KzVBI62CR_5xQuTaOBxn8Z3wPxqtHBfxl7t8sSpFGzwDkDvmUDXX4CnVuqmXkWL51X4eDkCePTalDoLp_y85vDwqkGjkg'
    ],
  },
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-0921',
    customerName: 'أحمد محمد',
    date: '24 أكتوبر 2024',
    total: 450,
    status: 'مكتمل',
    statusClass: 'status-completed',
    items: [
      { name: 'مبخرة خشبية فاخرة', quantity: 1, price: 245 },
      { name: 'طقم شموع عطرية', quantity: 1, price: 120 },
      { name: 'كوب فخاري يدوي', quantity: 1, price: 85 }
    ],
    city: 'القاهرة'
  },
  {
    id: 'ORD-0920',
    customerName: 'سارة خالد',
    date: '23 أكتوبر 2024',
    total: 120,
    status: 'قيد التنفيذ',
    statusClass: 'status-pending',
    items: [
      { name: 'مفكرة جلدية كلاسيكية', quantity: 1, price: 120 }
    ],
    city: 'الجيزة'
  },
  {
    id: 'ORD-0919',
    customerName: 'فهد عبدالعزيز',
    date: '22 أكتوبر 2024',
    total: 890,
    status: 'تم الشحن',
    statusClass: 'status-shipped',
    items: [
      { name: 'قلادة ذهبية ناعمة', quantity: 2, price: 350 },
      { name: 'مجموعة العناية الفاخرة', quantity: 1, price: 180 }
    ],
    city: 'الإسكندرية'
  },
  {
    id: 'ORD-0918',
    customerName: 'نورة العتيبي',
    date: '21 أكتوبر 2024',
    total: 250,
    status: 'ملغى',
    statusClass: 'status-cancelled',
    items: [
      { name: 'تحفة فنية سيراميك', quantity: 1, price: 245 }
    ],
    city: 'المنصورة'
  }
];

export const CATEGORIES = [
  'الكل',
  'ديكور منزلي',
  'عطور ومنزل',
  'ضيافة ونحاسيات',
  'قرطاسية',
  'أكواب وفخاريات',
  'إكسسوارات',
  'مجموعة هدايا'
];

export const AVAILABLE_COUPONS = {
  'SORUR15': { discountPercent: 15, label: 'خصم 15% للموسم الجديد' },
  'WELCOME10': { discountPercent: 10, label: 'خصم الترحيب 10%' },
  'EGYPT20': { discountPercent: 20, label: 'عرض مصر 20%' }
};
