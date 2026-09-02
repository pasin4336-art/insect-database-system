'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          if (result.data.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
          router.refresh();
        }, 800);
      } else {
        setError(result.message || 'การเข้าสู่ระบบล้มเหลว ตรวจสอบข้อมูลอีกครั้ง');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes subtlePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.85;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out both;
        }
        .animate-subtle-pulse {
          animation: subtlePulse 2.4s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-background min-h-screen flex flex-col relative overflow-hidden">
        {/* Texture Overlay */}
        <div className="absolute inset-0 scholarly-texture pointer-events-none"></div>

        {/* Vintage scientific illustration background (Inline SVG for reliability) */}
        <div className="absolute -top-12 -left-12 w-80 h-80 opacity-[0.04] pointer-events-none rotate-12 text-primary">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="40" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="30" />
            <circle cx="50" cy="50" r="20" />
            <line x1="10" y1="50" x2="90" y2="50" />
            <line x1="50" y1="10" x2="50" y2="90" />
            <polygon points="50,15 85,50 50,85 15,50" />
            <path d="M 30,30 L 70,70 M 30,70 L 70,30" />
          </svg>
        </div>

        {/* Wing venation background (Inline SVG for reliability) */}
        <div className="absolute -bottom-12 -right-12 w-96 h-96 opacity-[0.04] pointer-events-none -rotate-12 text-primary">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3">
            <path d="M 0,0 C 20,40 50,60 100,100 M 0,20 C 15,45 40,65 90,100 M 0,40 C 10,50 30,70 80,100" />
            <path d="M 20,10 C 25,25 35,35 50,50 M 40,25 C 45,40 55,50 70,70 M 60,40 C 65,55 75,65 90,85" />
            <path d="M 10,40 Q 30,20 60,10 M 20,60 Q 40,40 70,30 M 30,80 Q 50,60 80,50" />
            <path d="M 5,50 C 25,60 45,70 85,90 M 15,70 C 35,80 55,90 95,95" />
          </svg>
        </div>

        <main className="flex-grow flex items-center justify-center p-6 z-10">
          <div className="w-full max-w-[440px] animate-fade-in-up">
            {/* Login Card */}
            <div className="bg-white border border-outline-variant/60 login-card-shadow p-8 rounded-xl">

              {/* Brand Identity */}
              <div className="text-center mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center w-16 h-16 bg-primary mb-4 rounded-xl hover:opacity-95 transition-opacity shadow-sm"
                >
                  <span className="material-symbols-outlined text-on-primary text-[32px] animate-subtle-pulse">
                    bug_report
                  </span>
                </Link>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                  EntomoData Pro
                </h1>
                <p className="font-label-caps text-[10px] text-secondary uppercase tracking-[0.15em] font-semibold">
                  สมาคมกีฏวิทยาระหว่างประเทศ
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Error Message */}
                {error && (
                  <div className="bg-error-container border border-error/30 text-on-error-container p-3 text-body-sm rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-[18px] shrink-0">
                      error
                    </span>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-primary-container border border-primary/20 text-on-primary-container p-3 text-body-sm rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span className="font-medium">ตรวจสอบข้อมูลสำเร็จแล้ว กำลังนำทาง...</span>
                  </div>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <label
                    className="block font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider font-bold"
                    htmlFor="username"
                  >
                    ชื่อผู้ใช้งาน หรือ อีเมล
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                      person
                    </span>
                    <input
                      className="w-full bg-background border border-outline-variant/60 rounded-lg pl-11 pr-4 py-2.5 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_0_3px_rgba(0,105,72,0.15)] transition-all"
                      id="username"
                      name="username"
                      placeholder="curator@entomology.org"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label
                      className="block font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider font-bold"
                      htmlFor="password"
                    >
                      รหัสผ่าน
                    </label>
                    <a
                      className="font-body-sm text-xs text-primary hover:underline transition-all font-semibold"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('กรุณาติดต่อเจ้าหน้าที่ดูแลระบบกลางเพื่อขอรับรหัสผ่านใหม่');
                      }}
                    >
                      ลืมรหัสผ่าน?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                      lock
                    </span>
                    <input
                      className="w-full bg-background border border-outline-variant/60 rounded-lg pl-11 pr-4 py-2.5 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_0_3px_rgba(0,105,72,0.15)] transition-all"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center">
                  <input
                    className="w-4 h-4 text-primary border-outline-variant/60 rounded focus:ring-offset-0 focus:ring-0 cursor-pointer"
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label
                    className="ml-2 font-body-sm text-sm text-secondary cursor-pointer select-none"
                    htmlFor="remember"
                  >
                    จดจำอุปกรณ์นี้ในระบบ
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  className="w-full text-on-primary py-3 rounded-lg font-label-caps text-label-caps uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer"
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      กำลังยืนยันตัวตน...
                    </>
                  ) : (
                    <>
                      เข้าสู่ระบบคลังข้อมูล
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-outline-variant/40"></div>
                <span className="px-3 font-label-caps text-[10px] text-outline uppercase tracking-wider">
                  เฉพาะเจ้าหน้าที่ระบบกีฏวิทยา
                </span>
                <div className="flex-grow border-t border-outline-variant/40"></div>
              </div>

              {/* Registration / Support */}
              <div className="text-center space-y-4">
                <p className="font-body-sm text-sm text-secondary">
                  ต้องการสิทธิ์เข้าถึง?{' '}
                  <a
                    className="text-primary font-semibold hover:underline"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('ขณะนี้ระบบปิดการสมัครสมาชิกภายนอกชั่วคราว กรุณาติดต่อฝ่ายลงทะเบียนหน่วยงานวิจัย');
                    }}
                  >
                    ลงทะเบียนสร้างบัญชีใหม่
                  </a>
                </p>
                <div className="flex justify-center gap-6">
                  <a
                    className="flex items-center gap-1 font-label-caps text-[10px] text-secondary hover:text-primary transition-colors uppercase tracking-wider"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('พอร์ทัลความช่วยเหลือออนไลน์: ติดต่อเจ้าหน้าที่ได้ที่ support@entomology.org');
                    }}
                  >
                    <span className="material-symbols-outlined text-[15px]">help</span>
                    ช่วยเหลือ
                  </a>
                  <a
                    className="flex items-center gap-1 font-label-caps text-[10px] text-secondary hover:text-primary transition-colors uppercase tracking-wider"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('การเชื่อมต่อกับพอร์ทัลหลักได้รับการเข้ารหัสความปลอดภัยระดับ SSL/TLS');
                    }}
                  >
                    <span className="material-symbols-outlined text-[15px]">verified_user</span>
                    ความปลอดภัย
                  </a>
                </div>
              </div>
            </div>

            {/* Global Footer Information */}
            <footer className="mt-6 text-center space-y-2">
              <p className="font-body-sm text-[11px] text-outline leading-relaxed">
                © 2026 สมาคมกีฏวิทยาระหว่างประเทศ ข้อมูลวิจัยทางวิทยาศาสตร์ทั้งหมดเผยแพร่ภายใต้สัญญาอนุญาตแบบเปิด
              </p>
              <div className="flex justify-center gap-3">
                <a
                  className="font-label-caps text-[10px] text-outline hover:text-secondary uppercase tracking-wider"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  นโยบายความเป็นส่วนตัว
                </a>
                <span className="text-outline-variant">•</span>
                <a
                  className="font-label-caps text-[10px] text-outline hover:text-secondary uppercase tracking-wider"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  ข้อกำหนดบริการ
                </a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}
