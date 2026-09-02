// Mock data store for the database fallback when MySQL is not running.
export let categories = [
  { id: 1, name: 'Coleoptera (ด้วง)', description: 'แมลงที่มีปีกคู่หน้าแข็งปรีด ปีกคู่หลังใช้บิน เช่น ด้วงกว่าง ด้วงคีม' },
  { id: 2, name: 'Lepidoptera (ผีเสื้อและมอธ)', description: 'แมลงที่มีปีกเป็นแผ่นบางๆ คลุมด้วยเกล็ดสีสันสวยงาม' },
  { id: 3, name: 'Odonata (แมลงปอ)', description: 'แมลงที่มีตารวมขนาดใหญ่ ปีกบางยาวสองคู่ บินได้รวดเร็ว' }
];

export let insects = [
  {
    id: 1,
    category_id: 1,
    category_name: 'Coleoptera (ด้วง)',
    common_name: 'ด้วงกว่างเฮอร์คิวลิส',
    scientific_name: 'Dynastes hercules',
    kingdom: 'Animalia',
    phylum: 'Arthropoda',
    class_name: 'Insecta',
    family: 'Scarabaeidae',
    genus: 'Dynastes',
    species: 'Dynastes hercules',
    mouth_type: 'กัดกิน (Chewing)',
    wing_type: 'ปีกแข็ง (Elytra)',
    leg_type: 'ขาขุดดิน/เดิน (Cursorial)',
    antenna_type: 'หนวดแบบใบไม้ (Lamellate)',
    region: 'ภาคเหนือ',
    province: 'เชียงใหม่',
    source: 'สำรวจภาคสนาม ป่าดอยอินทนนท์',
    description: 'หนึ่งในด้วงที่มีขนาดใหญ่ที่สุดในโลก มีเขายาวสง่างาม',
    habitat: 'ป่าฝนเขตร้อน',
    status: 'common',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuR5wcuOdMealxSUmneAXE6zVBXoXaX5vjc3S2OrFcgVVCOYs26ulhz8gWcwxdzwaAy_8tzjXVdKQq-2ZSXWJ9UGNdHqPj3ukwPKJ0qFjAPpeKjodP9kpPsBH0plh-NLNB9gMFm8i_qkv-kNu7-ECgVdxEELV9H1XyHNLRd7g4l5sI5-TdP0Js4nYTNVHwfiv_KtLmY-cLQMEdHyRtiNM1vBBRg2_OD5N0iwUPzyos0RnI4Z1hV1xr',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    category_id: 1,
    category_name: 'Coleoptera (ด้วง)',
    common_name: 'ด้วงคีมยีราฟ',
    scientific_name: 'Prosopocoilus giraffa',
    kingdom: 'Animalia',
    phylum: 'Arthropoda',
    class_name: 'Insecta',
    family: 'Lucanidae',
    genus: 'Prosopocoilus',
    species: 'Prosopocoilus giraffa',
    mouth_type: 'เคี้ยวตัด (Chewing)',
    wing_type: 'ปีกแข็ง (Elytra)',
    leg_type: 'ขาเดิน (Cursorial)',
    antenna_type: 'หนวดแบบข้อหัก (Geniculate)',
    region: 'ภาคเหนือ',
    province: 'เชียงราย',
    source: 'เขตรักษาพันธุ์สัตว์ป่าดอยหลวง',
    description: 'ด้วงคีมที่มีส่วนของเคี้ยว (คีม) ยาวมากคล้ายคอยีราฟ',
    habitat: 'ป่าดิบแล้งและป่าดิบชื้น',
    status: 'vulnerable',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUYwjhVN3UNJLXJph8UZ1q9SaDM7G6ETDi7boiq7Ml6bPr5iuuOqo-L5zWACu02YF_wA6LRZNXWQF3MOLzjMiPNbneb-89tZdQDymExtbJ7Qzzp1SKGxSXYlRndWxcSBgzzstCHfVSJ-Ev5roh-36ZC2_i397XBxK8qscxNTWSaMuk79sbNv8aurGUC-H-8C7yjPl25TCHgvWvCQ-2LQlPISWy6nC3TJHHG89RHw-vWGpIGAywshaM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    category_id: 2,
    category_name: 'Lepidoptera (ผีเสื้อและมอธ)',
    common_name: 'ผีเสื้อหางติ่งสะพานฟ้า',
    scientific_name: 'Graphium sarpedon',
    kingdom: 'Animalia',
    phylum: 'Arthropoda',
    class_name: 'Insecta',
    family: 'Papilionidae',
    genus: 'Graphium',
    species: 'Graphium sarpedon',
    mouth_type: 'ดูดกิน (Siphoning)',
    wing_type: 'ปีกเกล็ด (Scaly wings)',
    leg_type: 'ขาเดิน (Cursorial)',
    antenna_type: 'หนวดแบบรูปกระบอง (Clavate)',
    region: 'ภาคกลาง',
    province: 'นครนายก',
    source: 'อุทยานแห่งชาติเขาใหญ่',
    description: 'ผีเสื้อกลางวันที่มีแถบสีฟ้าสดใสพาดผ่านกลางปีก',
    habitat: 'สวนผลไม้ และชายป่าดิบ',
    status: 'common',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyg9tumTYF6OJj_AWyHv9tonFS_VaDuBeD6HN53giXlecRg8xdFTZUxW2RKGJL-wkZ22WhxH5RFy7GFYRTSWT0yw0MaeI6iE4Pjzcpq7eGSHPahahbSsBRYZqexijLfyXd24qBKlyhsq4utFt28JRO0d7l9Zsr8ytpttybUZ7gcpyzSk2DrjMPhCkfpDkgShHmZ28ZDAO-_XfU0FPO-Z41Ah0pM3ivOaiuC-VLw7_vOBijyTW5D5hu',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    category_id: 3,
    category_name: 'Odonata (แมลงปอ)',
    common_name: 'แมลงปอเข็มท้องยาว',
    scientific_name: 'Ischnura senegalensis',
    kingdom: 'Animalia',
    phylum: 'Arthropoda',
    class_name: 'Insecta',
    family: 'Coenagrionidae',
    genus: 'Ischnura',
    species: 'Ischnura senegalensis',
    mouth_type: 'เคี้ยวเอื้อง (Chewing)',
    wing_type: 'ปีกบางใส (Membranous)',
    leg_type: 'ขาจับเหยื่อ (Raptorial)',
    antenna_type: 'หนวดแบบเส้นด้ายสั้น (Setaceous)',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    province: 'ขอนแก่น',
    source: 'บึงแก่นนคร',
    description: 'แมลงปอขนาดเล็ก ลำตัวผอมยาว มักพบบริเวณแหล่งน้ำนิ่ง',
    habitat: 'หนอง บึง และทุ่งนา',
    status: 'common',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4K_aF7tVVrcO928SOaEQ4OTYMh0BO9Au2PjOhl-r3qh1ndWV02oD2huW9RT1Gi3_h9YgZwYb6TfQZnOZIw9E3ufbKl6ry20VwEDn7HpSEB7eKQRsDyxrNIHrnwe_iPw6BuER8J7zsiJiH-OAeTTMKvLAmmm0QxAsd5nwl7f9OQSqvvzqeMaOT1R5A1lISraZzFRg7JKVky9lCNFiBfsPi4WbS8F_MMLsbcwopPsAXtd3TJmBjaU-u',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export let users = [
  { id: 1, username: 'admin_insect', password: '$2b$10$nHDkD3QDCY771YgV3NaPT.SLIPoIdzgALJHMjjLxIP2MZARYXxCra', email: 'admin@insectdb.com', role: 'admin' },
  { id: 2, username: 'somchai_dev', password: '$2b$10$qjJz.BDM8ZWfz7G6lIqqn.GEfmGDXQh531tX67cv8dqUN1zs3C3v2', email: 'somchai@gmail.com', role: 'user' }
];

export let contact_us = [
  {
    id: 1,
    first_name: 'สมชาย',
    last_name: 'สุขใจ',
    address: '123/45 ถนนวิภาวดีรังสิต แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร 10900',
    phone: '081-234-5678',
    comment: 'สอบถามเรื่องการส่งมอบตัวอย่างแมลงทับและตัวอย่างจัดเก็บในคลังข้อมูล',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 2,
    first_name: 'สมศรี',
    last_name: 'ใจดี',
    address: '99/9 หมู่ 2 ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120',
    phone: '089-876-5432',
    comment: 'ต้องการขอสิทธิ์เข้าถึงข้อมูลผลงานการวิจัยเกี่ยวกับแมลงปอและเขตนิเวศวิทยาเพิ่มเติม',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];
