'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);

  // Contact Us Modal States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isHabitatMode = searchParams?.get('habitat_mode') === 'true' || Boolean(searchParams?.get('habitat'));

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const result = await res.json();
        if (result.success && result.data?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkAdmin();

    window.addEventListener('auth-change', checkAdmin);
    return () => window.removeEventListener('auth-change', checkAdmin);
  }, []);

  const handleOpenContactModal = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setAddress('');
    setComment('');
    setContactSuccess('');
    setContactError('');
    setIsContactModalOpen(true);
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setContactSuccess('');
    setContactError('');

    if (!firstName.trim() || !lastName.trim() || !comment.trim()) {
      setContactError('กรุณากรอก ชื่อ, นามสกุล และแสดงความคิดเห็น/ข้อความ ให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact_us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
          comment
        })
      });

      const result = await res.json();
      if (result.success) {
        setContactSuccess('บันทึกข้อมูลและส่งเรื่องไปยังผู้ดูแลระบบเรียบร้อยแล้ว');
        setTimeout(() => {
          setIsContactModalOpen(false);
        }, 1500);
      } else {
        setContactError(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } catch (err) {
      console.error('Submit contact error:', err);
      setContactError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถใช้ฟังก์ชันส่งออกข้อมูลได้');
      return;
    }

    try {
      const res = await fetch('/api/insects');
      const result = await res.json();

      if (!result.success || !result.data || result.data.length === 0) {
        alert('ไม่พบข้อมูลแมลงสำหรับส่งออก');
        return;
      }

      const insectsData = result.data;

      // Define CSV headers matching table insects schema
      const headers = [
        'id',
        'category_id',
        'category_name (อันดับอนุกรมวิธาน)',
        'common_name (ชื่อสามัญ)',
        'scientific_name (ชื่อวิทยาศาสตร์)',
        'kingdom (อาณาจักร)',
        'phylum (ไฟลัม)',
        'class_name (ชั้น)',
        'family (วงศ์)',
        'genus (สกุล)',
        'species (ชนิดพันธุ์)',
        'mouth_type (ลักษณะปาก)',
        'wing_type (ลักษณะปีก)',
        'leg_type (ลักษณะขา)',
        'antenna_type (ลักษณะหนวด)',
        'region (ภูมิภาค)',
        'province (ชื่อจังหวัด)',
        'source (แหล่งที่มา)',
        'habitat (ถิ่นอาศัย)',
        'status (สถานภาพการอนุรักษ์)',
        'description (คำอธิบาย)',
        'image_url (ลิงก์รูปภาพ)',
        'created_at (วันที่สร้าง)',
        'updated_at (วันที่แก้ไข)'
      ];

      // Convert rows to CSV strings
      const csvRows = [headers.map(h => `"${h}"`).join(',')];

      insectsData.forEach(item => {
        const statusMap = {
          protected: 'สัตว์ป่าคุ้มครอง',
          endangered: 'ใกล้สูญพันธุ์',
          vulnerable: 'มีแนวโน้มลดลง',
          common: 'ปลอดภัย'
        };

        const derivedGenus = item.genus || (item.scientific_name ? item.scientific_name.split(' ')[0] : '');
        const derivedSpecies = item.species || item.scientific_name || '';
        const derivedFamily = item.family || (derivedGenus ? derivedGenus + 'idae' : '');

        const row = [
          item.id || '',
          item.category_id || '',
          item.category_name ? String(item.category_name).replace(/"/g, '""') : '',
          item.common_name ? String(item.common_name).replace(/"/g, '""') : '',
          item.scientific_name ? String(item.scientific_name).replace(/"/g, '""') : '',
          item.kingdom ? String(item.kingdom).replace(/"/g, '""') : 'Animalia',
          item.phylum ? String(item.phylum).replace(/"/g, '""') : 'Arthropoda',
          item.class_name ? String(item.class_name).replace(/"/g, '""') : 'Insecta',
          derivedFamily ? String(derivedFamily).replace(/"/g, '""') : '',
          derivedGenus ? String(derivedGenus).replace(/"/g, '""') : '',
          derivedSpecies ? String(derivedSpecies).replace(/"/g, '""') : '',
          item.mouth_type ? String(item.mouth_type).replace(/"/g, '""') : '',
          item.wing_type ? String(item.wing_type).replace(/"/g, '""') : '',
          item.leg_type ? String(item.leg_type).replace(/"/g, '""') : '',
          item.antenna_type ? String(item.antenna_type).replace(/"/g, '""') : '',
          item.region ? String(item.region).replace(/"/g, '""') : '',
          item.province ? String(item.province).replace(/"/g, '""') : '',
          item.source ? String(item.source).replace(/"/g, '""') : '',
          item.habitat ? String(item.habitat).replace(/"/g, '""') : '',
          statusMap[item.status] || item.status || '',
          item.description ? String(item.description).replace(/"/g, '""') : '',
          item.image_url ? String(item.image_url).replace(/"/g, '""') : '',
          item.created_at ? new Date(item.created_at).toLocaleString('th-TH') : '',
          item.updated_at ? new Date(item.updated_at).toLocaleString('th-TH') : ''
        ];

        csvRows.push(row.map(val => `"${val}"`).join(','));
      });

      // Add UTF-8 BOM so Excel displays Thai characters properly
      const csvString = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `insects_data_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export CSV Error:', err);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ CSV');
    }
  };

  const navItems = [
    { href: '/', icon: 'grid_view', label: 'คลังข้อมูลแมลง', isActive: pathname === '/' && !isHabitatMode },
    { href: '/?habitat_mode=true', icon: 'travel_explore', label: 'ค้นหาภูมิภาคและจังหวัดที่พบ', isActive: pathname === '/' && isHabitatMode },
  ];

  return (
    <>
      <aside className="hidden lg:flex flex-col h-[calc(100vh-64px)] fixed left-0 top-16 w-64 bg-white border-r border-outline-variant/60 animate-slide-in">
        {/* Brand Section */}
        <div className="px-5 py-5 border-b border-outline-variant/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">bug_report</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-[17px] text-primary leading-none font-bold">กีฏวิทยา</h2>
              <p className="text-[10px] uppercase tracking-[0.15em] text-secondary mt-1 font-label-caps">พอร์ทัลการวิจัย</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-label-caps text-outline uppercase tracking-widest">เมนูหลัก</p>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-sm transition-all ${item.isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${item.isActive ? 'text-primary' : ''}`}>
                {item.icon}
              </span>
              {item.label}
              {item.isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
              )}
            </Link>
          ))}

          {isAdmin && (
            <>
              <Link
                href="/admin?tab=users"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-sm transition-all ${pathname === '/admin' && searchParams?.get('tab') !== 'contacts'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${pathname === '/admin' && searchParams?.get('tab') !== 'contacts' ? 'text-primary' : ''}`}>
                  manage_accounts
                </span>
                การจัดการคลังข้อมูล
                {pathname === '/admin' && searchParams?.get('tab') !== 'contacts' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
                )}
              </Link>
              <Link
                href="/admin?tab=contacts"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-sm transition-all ${pathname === '/admin' && searchParams?.get('tab') === 'contacts'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${pathname === '/admin' && searchParams?.get('tab') === 'contacts' ? 'text-primary' : ''}`}>
                  contact_support
                </span>
                ข้อมูลติดต่อเรา
                {pathname === '/admin' && searchParams?.get('tab') === 'contacts' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
                )}
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-outline-variant/40 space-y-1">
          <button
            onClick={handleOpenContactModal}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-secondary font-body-sm hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">contact_support</span>
            ติดต่อเรา
          </button>

          {/* Export Card - Admin only */}
          {isAdmin && (
            <div className="mt-3 p-3.5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 animate-fade-in">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="material-symbols-outlined text-primary text-[16px]">download</span>
                <p className="text-[11px] font-label-caps text-on-surface font-semibold">เครื่องมือส่งออก</p>
              </div>
              <button
                onClick={handleExport}
                className="w-full py-2 text-on-primary text-label-caps font-label-caps rounded-lg flex items-center justify-center gap-2 hover:shadow-md active:scale-[0.97] transition-all cursor-pointer shadow-sm"
                style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                ส่งออกข้อมูล
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Contact Us Modal Overlay rendered via React Portal */}
      {mounted && isContactModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className="bg-white w-full max-w-lg border border-outline-variant rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">contact_support</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-semibold">ติดต่อเรา (Contact Us)</h2>
                  <p className="text-[11px] font-body-sm text-secondary">ส่งข้อมูล ข้อเสนอแนะ หรือความคิดเห็นไปยังผู้ดูแลระบบ</p>
                </div>
              </div>
              <button
                type="button"
                className="material-symbols-outlined text-secondary hover:bg-surface-container-high p-2 rounded-full cursor-pointer transition-colors"
                onClick={() => setIsContactModalOpen(false)}
              >
                close
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitContact} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {contactSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-body-sm flex items-center gap-2 font-medium animate-fade-in">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {contactSuccess}
                </div>
              )}

              {contactError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-body-sm flex items-center gap-2 font-medium animate-fade-in">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {contactError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps font-label-caps text-secondary mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="เช่น สมชาย"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-label-caps font-label-caps text-secondary mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="เช่น สุขใจ"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-caps font-label-caps text-secondary mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 081-234-5678"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-label-caps font-label-caps text-secondary mb-1">
                  ที่อยู่
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="กรอกที่อยู่ของคุณ (ถ้ามี)..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-label-caps font-label-caps text-secondary mb-1">
                  แสดงความคิดเห็น / ข้อความ <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="ระบุความคิดเห็น คำถาม หรือรายละเอียดที่ต้องการแจ้งผู้ดูแลระบบ..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-outline-variant/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-label-caps text-label-caps text-secondary hover:bg-surface-container-high transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-label-caps font-bold hover:shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      กำลังส่งข้อมูล...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      บันทึกและส่งข้อมูล
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

