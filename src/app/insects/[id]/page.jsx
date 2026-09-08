'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import InsectImage from '@/components/InsectImage';

export default function InsectDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [insect, setInsect] = useState(null);
  const [related, setRelated] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current user auth status
        const authRes = await fetch('/api/auth/me');
        const authResult = await authRes.json();
        if (authResult.success) {
          setUser(authResult.data);
        }

        // Fetch insect details
        const insectRes = await fetch(`/api/insects/${id}`);
        const insectResult = await insectRes.json();
        if (insectResult.success) {
          setInsect(insectResult.data);
          
          // Fetch related specimens in same category
          const categoryId = insectResult.data.category_id;
          const relatedRes = await fetch(`/api/insects?category=${categoryId}`);
          const relatedResult = await relatedRes.json();
          if (relatedResult.success) {
            // Filter out current specimen
            const list = relatedResult.data.filter(ins => ins.id !== parseInt(id)).slice(0, 4);
            setRelated(list);
          }
        } else {
          setInsect(null);
        }
      } catch (err) {
        console.error('Error fetching insect details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleExportPDF = () => {
    if (!insect) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('กรุณาเปิดสิทธิ์ให้เบราว์เซอร์อนุญาต Pop-up เพื่อดาวน์โหลดรายงาน PDF');
      return;
    }

    const createdDate = insect.created_at ? new Date(insect.created_at).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'ไม่ระบุ';

    const printDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const statusText = insect.status === 'protected' ? 'สัตว์ป่าคุ้มครอง (Protected)' :
                       insect.status === 'endangered' ? 'ใกล้สูญพันธุ์ (Endangered)' :
                       insect.status === 'vulnerable' ? 'มีแนวโน้มลดลง (Vulnerable)' : 'ปลอดภัย (Least Concern)';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>รายงานตัวอย่างกีฏวิทยา - ${insect.common_name} (${insect.scientific_name})</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400;1,600&display=swap');
          
          @page {
            size: A4;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            font-family: 'Sarabun', sans-serif;
            color: #0f172a;
            line-height: 1.6;
            margin: 0;
            padding: 24px;
            background: #ffffff;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #006948;
            padding-bottom: 14px;
            margin-bottom: 24px;
          }

          .brand-title {
            font-size: 22px;
            font-weight: 700;
            color: #006948;
            letter-spacing: -0.5px;
          }

          .brand-sub {
            font-size: 11px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
          }

          .report-meta {
            text-align: right;
            font-size: 11px;
            color: #64748b;
          }

          .hero {
            display: flex;
            gap: 24px;
            margin-bottom: 24px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }

          .image-box {
            width: 200px;
            height: 200px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            shrink: 0;
          }

          .image-box img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .details-box {
            flex: 1;
          }

          .specimen-tag {
            display: inline-block;
            background: #006948;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            margin-bottom: 8px;
            font-family: monospace;
          }

          h1 {
            margin: 0 0 4px 0;
            font-size: 24px;
            color: #0f172a;
            font-weight: 700;
          }

          .scientific {
            font-family: 'Source Serif 4', serif;
            font-style: italic;
            font-size: 17px;
            color: #475569;
            margin-bottom: 14px;
          }

          .badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .badge {
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 6px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #334155;
          }

          .badge-status {
            background: #dcfce7;
            color: #15803d;
            border-color: #86efac;
          }

          .section-title {
            font-size: 15px;
            font-weight: 700;
            color: #006948;
            border-bottom: 1.5px solid #006948;
            padding-bottom: 4px;
            margin-top: 24px;
            margin-bottom: 12px;
          }

          .description-text {
            font-size: 13.5px;
            color: #334155;
            text-align: justify;
            background: #ffffff;
            margin-bottom: 24px;
            white-space: pre-line;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 13px;
          }

          th, td {
            padding: 10px 14px;
            border: 1px solid #cbd5e1;
            text-align: left;
          }

          th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 600;
            width: 32%;
          }

          td {
            color: #0f172a;
          }

          .footer {
            margin-top: 40px;
            padding-top: 14px;
            border-top: 1px solid #cbd5e1;
            font-size: 10.5px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div className="header">
          <div>
            <div className="brand-title">EntomoData Pro</div>
            <div className="brand-sub">สมาคมกีฏวิทยาระหว่างประเทศ • รายงานข้อมูลทางวิชาการ</div>
          </div>
          <div className="report-meta">
            <strong>เอกสารรายงานวิจัยสิ่งสะสม</strong><br>
            พิมพ์เมื่อ: ${printDate}
          </div>
        </div>

        <div className="hero">
          <div className="image-box">
            ${insect.image_url ? `<img src="${insect.image_url}" alt="${insect.common_name}" />` : '<div style="color:#94a3b8">ไม่มีรูปภาพตัวอย่าง</div>'}
          </div>
          <div className="details-box">
            <span className="specimen-tag">รหัสตัวอย่าง #INS-${insect.id.toString().padStart(4, '0')}</span>
            <h1>${insect.common_name}</h1>
            <div className="scientific">${insect.scientific_name}</div>
            <div className="badges">
              <span className="badge badge-status">${statusText}</span>
              <span className="badge">อันดับ: ${insect.category_name || 'ไม่ระบุ'}</span>
              <span className="badge">ถิ่นอาศัย: ${insect.habitat || 'ไม่ระบุ'}</span>
            </div>
          </div>
        </div>

        <div className="section-title">คำอธิบายทางกายภาพและชีววิทยา (Biological Description)</div>
        <div className="description-text">
          ${insect.description || 'ไม่มีการบันทึกคำอธิบายสัณฐานวิทยาเพิ่มเติมสำหรับตัวอย่างแมลงนี้ในคลังข้อมูล'}
        </div>

        <div className="section-title">ข้อมูลการจำแนกและอนุกรมวิธาน (Taxonomic Classification)</div>
        <table>
          <tr>
            <th>ชื่อสามัญ (Common Name)</th>
            <td><strong>${insect.common_name}</strong></td>
          </tr>
          <tr>
            <th>ชื่อวิทยาศาสตร์ (Scientific Name)</th>
            <td><em style="font-family: 'Source Serif 4', serif;">${insect.scientific_name}</em></td>
          </tr>
          <tr>
            <th>อาณาจักร (Kingdom)</th>
            <td>${insect.kingdom || 'Animalia'}</td>
          </tr>
          <tr>
            <th>ไฟลัม (Phylum)</th>
            <td>${insect.phylum || 'Arthropoda'}</td>
          </tr>
          <tr>
            <th>ชั้น (Class)</th>
            <td>${insect.class_name || 'Insecta'}</td>
          </tr>
          <tr>
            <th>อันดับทางอนุกรมวิธาน (Order)</th>
            <td>${insect.category_name || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>วงศ์ (Family)</th>
            <td>${insect.family || (insect.scientific_name ? insect.scientific_name.split(' ')[0] + 'idae' : '-')}</td>
          </tr>
          <tr>
            <th>สกุล (Genus)</th>
            <td><em>${insect.genus || (insect.scientific_name ? insect.scientific_name.split(' ')[0] : '-')}</em></td>
          </tr>
          <tr>
            <th>ชนิดพันธุ์ (Species)</th>
            <td><em>${insect.species || insect.scientific_name || '-'}</em></td>
          </tr>
          <tr>
            <th>ถิ่นอาศัย / เขตนิเวศวิทยา (Habitat)</th>
            <td>${insect.habitat || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>ภูมิภาคที่พบ (Region)</th>
            <td>${insect.region || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>จังหวัดที่พบ (Province)</th>
            <td>${insect.province || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>แหล่งที่มา (Source)</th>
            <td>${insect.source || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>ลักษณะปาก (Mouthparts)</th>
            <td>${insect.mouth_type || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>ลักษณะปีก (Wing Type)</th>
            <td>${insect.wing_type || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>ลักษณะขา (Leg Type)</th>
            <td>${insect.leg_type || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>ลักษณะหนวด (Antenna Type)</th>
            <td>${insect.antenna_type || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <th>สถานภาพการอนุรักษ์ (Status)</th>
            <td>${statusText}</td>
          </tr>
          <tr>
            <th>วันที่บันทึกประวัติเข้าระบบ</th>
            <td>${createdDate}</td>
          </tr>
        </table>

        <div className="footer">
          <span>ระบบคลังข้อมูลวิจัยแมลงทางชีววิทยา • EntomoData Pro</span>
          <span>เอกสารฉบับนี้ออกโดยระบบอัตโนมัติเพื่อใช้อ้างอิงเชิงวิชาการ</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleEditRedirect = () => {
    router.push(`/admin?edit=${insect.id}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
        </div>
      </>
    );
  }

  if (!insect) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <span className="material-symbols-outlined text-error text-[64px] mb-4">error</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">ไม่พบข้อมูลตัวอย่างแมลง</h2>
          <p className="font-body-md text-secondary mt-2 max-w-md">
            รหัสตัวอย่างแมลงที่คุณต้องการสำรวจ ไม่มีระบุอยู่ในระบบคลังวิจัยสิ่งมีชีวิตกีฏวิทยา
          </p>
          <Link href="/" className="mt-8 px-6 py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            กลับไปที่คลังข้อมูลแมลง
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="block pt-16 min-h-screen w-full relative">
        <Sidebar />

        {/* Main Content Canvas */}
        <main className="lg:ml-64 px-6 py-8 md:px-10 md:py-10 max-w-5xl animate-fade-in-up">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 mb-6 text-secondary font-label-caps text-[11px] uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">คลังข้อมูลแมลง</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-secondary">{insect.category_name?.split(' ')[0] || 'อันดับอนุกรมวิธาน'}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold truncate max-w-[200px]">{insect.common_name}</span>
          </nav>

          {/* Hero Section */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
            {/* Image Gallery Column */}
            <div className="md:col-span-5">
              <div className="relative group aspect-square overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm flex items-center justify-center">
                <InsectImage 
                  src={insect.image_url} 
                  alt={insect.common_name} 
                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" 
                  iconSize={64}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    onClick={() => alert('การซูมแบบความละเอียดสูงพิเศษ โหลดรูปขยายพื้นผิวเรียบร้อย')}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-outline-variant hover:bg-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </button>
                  <button 
                    onClick={() => alert('เปิดโหมดการแสดงภาพแบบเต็มหน้าจอ')}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-outline-variant hover:bg-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Information Column */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-label-caps text-[11px] font-bold">
                  รหัสตัวอย่าง #INS-{insect.id.toString().padStart(4, '0')}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(window.location.href); alert('คัดลอกลิงก์ข้อมูลตัวอย่างลงในคลิปบอร์ดแล้ว'); }}
                    className="text-secondary hover:text-primary transition-colors cursor-pointer"
                    title="แชร์ข้อมูลแมลง"
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                  <button 
                    onClick={() => alert('บันทึกตัวอย่างแมลงนี้ลงในรายการคัดสรรส่วนตัว')}
                    className="text-secondary hover:text-error transition-colors cursor-pointer"
                    title="คัดสรรรายการ"
                  >
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                  </button>
                </div>
              </div>

              <h1 className="font-display-lg text-display-lg text-on-surface leading-tight mb-2">
                {insect.common_name}
              </h1>
              <p className="font-scientific-name text-scientific-name text-secondary italic mb-6">
                {insect.scientific_name}
              </p>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/60 font-label-caps text-[11px] text-secondary">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    insect.status === 'protected' ? 'bg-red-500' :
                    insect.status === 'endangered' ? 'bg-orange-500' :
                    insect.status === 'vulnerable' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}></span>
                  {insect.status === 'protected' ? 'คุ้มครอง' :
                   insect.status === 'endangered' ? 'ใกล้สูญพันธุ์' :
                   insect.status === 'vulnerable' ? 'มีแนวโน้มลดลง' : 'ปลอดภัย (Least Concern)'}
                </span>
                <span className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/60 font-label-caps text-[11px] text-secondary">
                  <span className="material-symbols-outlined text-[14px]">category</span>
                  {insect.category_name?.split(' ')[0] || 'ไม่ระบุอันดับ'}
                </span>
                <span className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/60 font-label-caps text-[11px] text-secondary">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {insect.habitat || 'ไม่ระบุถิ่นอาศัย'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {user && user.role === 'admin' && (
                  <button 
                    onClick={handleEditRedirect}
                    className="bg-primary text-on-primary px-6 py-3 rounded-lg hover:bg-primary-container transition-all font-label-caps text-label-caps flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    แก้ไขข้อมูลตัวอย่าง
                  </button>
                )}
                <button 
                  onClick={handleExportPDF}
                  className="border border-outline text-secondary px-6 py-3 rounded-lg hover:bg-surface-container-low transition-all font-label-caps text-label-caps flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  ส่งออกรายงาน PDF
                </button>
              </div>
            </div>
          </section>

          {/* Content Tabs */}
          <section className="border-t border-outline-variant/60 pt-8">
            <div className="flex gap-6 border-b border-outline-variant/60 mb-6 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-3 border-b-2 font-label-caps text-label-caps whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-on-surface'
                }`}
              >
                ภาพรวมตัวอย่าง
              </button>
              <button 
                onClick={() => setActiveTab('taxonomy')}
                className={`pb-3 border-b-2 font-label-caps text-label-caps whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'taxonomy' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-on-surface'
                }`}
              >
                โครงสร้างอนุกรมวิธาน
              </button>
              <button 
                onClick={() => setActiveTab('habitat')}
                className={`pb-3 border-b-2 font-label-caps text-label-caps whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'habitat' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-on-surface'
                }`}
              >
                แหล่งอาศัยและนิเวศวิทยา
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Tab contents */}
              <div className="lg:col-span-2 space-y-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="font-headline-sm text-headline-sm mb-3 text-on-surface">คำอธิบายทางกายภาพและชีววิทยา</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-6">
                      {insect.description || 'ไม่มีการบันทึกคำอธิบายสัณฐานวิทยาเพิ่มเติมสำหรับตัวอย่างแมลงนี้ในคลังข้อมูล'}
                    </p>
                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-scholarly">
                      <h4 className="font-label-caps text-label-caps text-primary mb-4">ข้อมูลลักษณะทางกายภาพเบื้องต้น</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-secondary font-body-sm block">ระดับขั้นอนุกรมวิธาน</span>
                          <span className="font-data-mono text-data-mono capitalize font-bold text-on-surface">ชนิดพันธุ์ (Species)</span>
                        </div>
                        <div>
                          <span className="text-secondary font-body-sm block">เขตนิเวศวิทยาที่พบ</span>
                          <span className="font-data-mono text-data-mono font-bold text-on-surface">{insect.habitat || 'ไม่บันทึกข้อมูล'}</span>
                        </div>
                        <div>
                          <span className="text-secondary font-body-sm block">ภูมิภาค / จังหวัดที่พบ</span>
                          <span className="font-data-mono text-data-mono font-bold text-on-surface">
                            {insect.region ? `${insect.region}${insect.province ? ` (${insect.province})` : ''}` : (insect.province || 'ไม่ระบุ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-secondary font-body-sm block">แหล่งที่มา</span>
                          <span className="font-data-mono text-data-mono font-bold text-on-surface">{insect.source || 'ไม่ระบุ'}</span>
                        </div>
                        <div>
                          <span className="text-secondary font-body-sm block">ลักษณะปาก / ปีก</span>
                          <span className="font-data-mono text-data-mono font-bold text-on-surface">
                            {insect.mouth_type || '-'} / {insect.wing_type || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-secondary font-body-sm block">ลักษณะขา / หนวด</span>
                          <span className="font-data-mono text-data-mono font-bold text-on-surface">
                            {insect.leg_type || '-'} / {insect.antenna_type || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-secondary font-body-sm block">ระดับการคุกคาม/สถานภาพอนุรักษ์</span>
                          <span className="font-data-mono text-data-mono capitalize font-bold text-on-surface">
                            {insect.status === 'protected' ? 'คุ้มครอง' :
                             insect.status === 'endangered' ? 'ใกล้สูญพันธุ์' :
                             insect.status === 'vulnerable' ? 'มีแนวโน้มลดลง' : 'ปลอดภัย'}
                          </span>
                        </div>
                        <div>
                          <span className="text-secondary font-body-sm block">วันที่ขึ้นทะเบียนประวัติ</span>
                          <span className="font-data-mono text-data-mono font-bold text-on-surface">{new Date(insect.created_at).toLocaleDateString('th-TH')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'taxonomy' && (
                  <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-[#1e293b] px-4 py-3">
                      <span className="font-label-caps text-label-caps text-white">โครงสร้างการจำแนกประเภท (Taxonomy Hierarchy)</span>
                    </div>
                    <table className="w-full text-left font-body-sm">
                      <tbody className="divide-y divide-outline-variant">
                        <tr className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="p-4 text-secondary font-label-caps text-[11px] w-1/3">อาณาจักร (KINGDOM)</td>
                          <td className="p-4 font-bold text-on-surface">{insect.kingdom || 'Animalia'}</td>
                        </tr>
                        <tr className="bg-white hover:bg-surface-container-high transition-colors">
                          <td className="p-4 text-secondary font-label-caps text-[11px]">ไฟลัม (PHYLUM)</td>
                          <td className="p-4 font-bold text-on-surface">{insect.phylum || 'Arthropoda'}</td>
                        </tr>
                        <tr className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="p-4 text-secondary font-label-caps text-[11px]">ชั้น (CLASS)</td>
                          <td className="p-4 font-bold text-on-surface">{insect.class_name || 'Insecta'}</td>
                        </tr>
                        <tr className="bg-white hover:bg-surface-container-high transition-colors">
                          <td className="p-4 text-secondary font-label-caps text-[11px]">อันดับ (ORDER)</td>
                          <td className="p-4 font-bold text-on-surface">{insect.category_name?.split(' ')[0] || 'ไม่ระบุอันดับ'}</td>
                        </tr>
                        <tr className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="p-4 text-secondary font-label-caps text-[11px]">วงศ์ (FAMILY)</td>
                          <td className="p-4 font-bold text-on-surface">{insect.family || (insect.scientific_name ? insect.scientific_name.split(' ')[0] + 'idae' : '-')}</td>
                        </tr>
                        <tr className="bg-white hover:bg-surface-container-high transition-colors">
                          <td className="p-4 text-secondary font-label-caps text-[11px]">สกุล (GENUS)</td>
                          <td className="p-4 font-bold text-on-surface italic">{insect.genus || (insect.scientific_name ? insect.scientific_name.split(' ')[0] : '-')}</td>
                        </tr>
                        <tr className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="p-4 text-secondary font-label-caps text-[11px]">ชนิดพันธุ์ (SPECIES)</td>
                          <td className="p-4 font-bold text-on-surface italic">{insect.species || insect.scientific_name || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'habitat' && (
                  <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
                    <h4 className="font-label-caps text-label-caps text-primary mb-3 border-b border-outline-variant pb-2">ระบบนิเวศทางธรรมชาติ</h4>
                    <div className="space-y-4">
                      <p className="text-body-sm leading-relaxed text-on-surface-variant">
                        มักพบการแพร่กระจายและดำรงชีวิตอยู่ในพื้นที่แบบ <strong>{insect.habitat || 'สภาพพื้นที่ธรรมชาติเฉพาะเขต'}</strong> ซึ่งกลุ่มสิ่งมีชีวิตสายพันธุ์นี้ถือเป็นดัชนีชี้วัดความอุดมสมบูรณ์ที่สำคัญยิ่งในสภาพสิ่งแวดล้อมนั้น ๆ มีสถานภาพการคุ้มครองตามเกณฑ์ความปลอดภัยคือ <strong className="capitalize text-primary">
                          {insect.status === 'protected' ? 'คุ้มครอง' :
                           insect.status === 'endangered' ? 'ใกล้สูญพันธุ์' :
                           insect.status === 'vulnerable' ? 'มีแนวโน้มลดลง' : 'ปลอดภัย'}
                        </strong>
                      </p>
                      
                      {/* Interactive CSS map placeholder */}
                      <div className="w-full h-48 rounded-xl overflow-hidden relative shadow-inner" style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9, #a5d6a7)' }}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#006948_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-1 bg-black/5">
                          <span className="material-symbols-outlined text-[32px] text-primary">map</span>
                          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md font-label-caps text-[10px] shadow-sm text-primary font-bold border border-primary/20">
                            แผนที่การกระจายตัวทางภูมิศาสตร์จำลอง
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Mini Taxonomy Card */}
              <div className="space-y-6">
                <div className="bg-white border border-outline-variant overflow-hidden rounded-xl shadow-sm">
                  <div className="bg-primary px-4 py-3">
                    <span className="font-label-caps text-label-caps text-white">ข้อมูลการจำแนกชั้นย่อย</span>
                  </div>
                  <table className="w-full text-left font-body-sm">
                    <tbody className="divide-y divide-outline-variant">
                      <tr className="bg-surface-container-low">
                        <td className="p-3.5 text-secondary font-label-caps text-[10px]">อันดับ (ORDER)</td>
                        <td className="p-3.5 font-bold text-on-surface">{insect.category_name || 'Coleoptera'}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-3.5 text-secondary font-label-caps text-[10px]">สกุล (GENUS)</td>
                        <td className="p-3.5 font-bold text-on-surface italic">{insect.genus || (insect.scientific_name ? insect.scientific_name.split(' ')[0] : '-')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Related Records */}
          {related.length > 0 && (
            <section className="mt-12 border-t border-outline-variant/60 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">ตัวอย่างแมลงในกลุ่มเดียวกัน</h3>
                <Link 
                  href={`/?category=${insect.category_id}`} 
                  className="text-primary font-label-caps text-label-caps hover:underline font-bold"
                >
                  ดูทั้งหมดในประเภทนี้
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => router.push(`/insects/${item.id}`)}
                    className="bg-white border border-outline-variant hover:shadow-scholarly transition-all cursor-pointer group rounded-xl overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="aspect-square bg-surface-container-low overflow-hidden relative">
                      <InsectImage 
                        src={item.image_url} 
                        alt={item.common_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        iconSize={32}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-[10px] font-label-caps text-secondary mb-1 uppercase tracking-wider">
                        {item.category_name?.split(' ')[0] || 'TAXA'}
                      </div>
                      <div className="font-headline-sm text-[15px] leading-tight line-clamp-1 mb-0.5 text-on-surface font-semibold">{item.common_name}</div>
                      <div className="font-scientific-name text-[12px] italic text-secondary line-clamp-1 mt-auto">{item.scientific_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 px-6 mt-auto bg-surface-container border-t border-outline-variant">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bug_report</span>
              <span className="font-label-caps text-label-caps text-primary">EntomoData Pro</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              © 2026 สมาคมกีฏวิทยาระหว่างประเทศ ข้อมูลวิจัยทางวิทยาศาสตร์ทั้งหมดเผยแพร่ภายใต้สัญญาอนุญาตแบบเปิด มุ่งมั่นรักษาระบบสิ่งแวดล้อมและความหลากหลายของแมลงและสัตว์ไม่มีกระดูกสันหลังร่วมกันอย่างยั่งยืน
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest">ข้อมูลบริการ</span>
              <a className="font-body-sm text-secondary hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>นโยบายการคุ้มครองข้อมูล</a>
              <a className="font-body-sm text-secondary hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>ข้อตกลงและเงื่อนไขการใช้บริการ</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest">แนวทางระบบ</span>
              <a className="font-body-sm text-secondary hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>ข้อกำหนดการดูแลข้อมูล</a>
              <a className="font-body-sm text-secondary hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>เอกสารทางเทคนิค API</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
