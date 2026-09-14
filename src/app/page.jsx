'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import InsectImage from '@/components/InsectImage';

// Dynamically import MapLibre GL map component without SSR
const ThailandMapLibre = dynamic(() => import('@/components/ThailandMapLibre'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-100/80 rounded-2xl flex flex-col items-center justify-center text-secondary border border-outline-variant animate-pulse">
      <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      <p className="text-sm mt-3 font-semibold text-primary">กำลังโหลดแผนที่ประเทศไทย MapLibre GL...</p>
      <p className="text-xs text-secondary mt-1">กำลังเชื่อมต่อพิกัด 6 ภูมิภาค 77 จังหวัด</p>
    </div>
  )
});

const THAI_REGIONS = [
  {
    key: 'NORTH',
    name: 'ภาคเหนือ',
    alias: 'ภาคเหนือ',
    icon: 'filter_hdr',
    color: '#006948',
    provinces: ['เชียงใหม่', 'เชียงราย', 'น่าน', 'พะเยา', 'แพร่', 'แม่ฮ่องสอน', 'ลำปาง', 'ลำพูน', 'อุตรดิตถ์']
  },
  {
    key: 'NORTHEAST',
    name: 'ภาคตะวันออกเฉียงเหนือ',
    alias: 'ภาคอีสาน',
    icon: 'landscape',
    color: '#d97706',
    provinces: ['กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา', 'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร', 'ร้อยเอ็ด', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี', 'อุบลราชธานี']
  },
  {
    key: 'CENTRAL',
    name: 'ภาคกลาง',
    alias: 'ภาคกลาง',
    icon: 'location_city',
    color: '#10b981',
    provinces: ['กรุงเทพมหานคร', 'กำแพงเพชร', 'ชัยนาท', 'นครนายก', 'นครปฐม', 'นครสวรรค์', 'นนทบุรี', 'ปทุมธานี', 'พระนครศรีอยุธยา', 'พิจิตร', 'พิษณุโลก', 'เพชรบูรณ์', 'ลพบุรี', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'อ่างทอง', 'อุทัยธานี']
  },
  {
    key: 'WEST',
    name: 'ภาคตะวันตก',
    alias: 'ภาคตะวันตก',
    icon: 'forest',
    color: '#8b5cf6',
    provinces: ['กาญจนบุรี', 'ตาก', 'ประจวบคีรีขันธ์', 'เพชรบุรี', 'ราชบุรี']
  },
  {
    key: 'EAST',
    name: 'ภาคตะวันออก',
    alias: 'ภาคตะวันออก',
    icon: 'beach_access',
    color: '#06b6d4',
    provinces: ['จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ตราด', 'ปราจีนบุรี', 'ระยอง', 'สระแก้ว']
  },
  {
    key: 'SOUTH',
    name: 'ภาคใต้',
    alias: 'ภาคใต้',
    icon: 'surfing',
    color: '#3b82f6',
    provinces: ['กระบี่', 'ชุมพร', 'ตรัง', 'นครศรีธรรมราช', 'นราธิวาส', 'ปัตตานี', 'พังงา', 'พัทลุง', 'ภูเก็ต', 'ยะลา', 'ระนอง', 'สงขลา', 'สตูล', 'สุราษฎร์ธานี']
  }
];

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';
  const queryHabitat = searchParams.get('habitat') || '';
  const queryRegion = searchParams.get('region') || '';
  const queryProvince = searchParams.get('province') || '';
  const queryHabitatMode = searchParams.get('habitat_mode') === 'true';

  const [insects, setInsects] = useState([]);
  const [allInsects, setAllInsects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dbProvinces, setDbProvinces] = useState([]);
  const [searchInput, setSearchInput] = useState(querySearch);
  const [provinceSearchQuery, setProvinceSearchQuery] = useState('');
  const [hoveredProvince, setHoveredProvince] = useState('');
  const [provinceFilterTab, setProvinceFilterTab] = useState('all'); // 'all' or 'has_data'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchInput(querySearch);
    fetchInsects(querySearch, queryCategory, queryHabitat, queryRegion, queryProvince);
  }, [querySearch, queryCategory, queryHabitat, queryRegion, queryProvince]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, provRes, allInsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/insects?get_provinces=true'),
          fetch('/api/insects')
        ]);
        const catResult = await catRes.json();
        const provResult = await provRes.json();
        const allInsResult = await allInsRes.json();

        if (catResult.success) setCategories(catResult.data);
        if (provResult.success) setDbProvinces(provResult.data);
        if (allInsResult.success) setAllInsects(allInsResult.data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchInsects = async (search = '', category = '', habitat = '', region = '', province = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (habitat) params.set('habitat', habitat);
      if (region) params.set('region', region);
      if (province) params.set('province', province);

      const url = `/api/insects?${params.toString()}`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setInsects(result.data);
      }
    } catch (err) {
      console.error('Error loading insects:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (searchVal, categoryVal, habitatVal, regionVal, provinceVal, modeVal = queryHabitatMode) => {
    const params = new URLSearchParams();
    if (searchVal) params.set('search', searchVal);
    if (categoryVal) params.set('category', categoryVal);
    if (habitatVal) params.set('habitat', habitatVal);
    if (regionVal) params.set('region', regionVal);
    if (provinceVal) params.set('province', provinceVal);
    if (modeVal) params.set('habitat_mode', 'true');
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams(searchInput, queryCategory, queryHabitat, queryRegion, queryProvince);
  };

  const handleCategoryClick = (categoryId) => {
    updateUrlParams(querySearch, categoryId, queryHabitat, queryRegion, queryProvince);
  };

  const handleRegionClick = (regionName) => {
    const nextRegion = queryRegion === regionName ? '' : regionName;
    updateUrlParams(querySearch, queryCategory, queryHabitat, nextRegion, '');
  };

  const handleProvinceClick = (provinceName) => {
    const nextProvince = queryProvince === provinceName ? '' : provinceName;
    updateUrlParams(querySearch, queryCategory, queryHabitat, queryRegion, nextProvince);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setProvinceSearchQuery('');
    setHoveredProvince('');
    updateUrlParams('', '', '', '', '', false);
  };

  // Interactive random discovery
  const handleRandomDiscovery = () => {
    const provincesWithData = allInsects
      .map(i => i.province)
      .filter((v, idx, arr) => v && arr.indexOf(v) === idx);
    
    if (provincesWithData.length > 0) {
      const randomProv = provincesWithData[Math.floor(Math.random() * provincesWithData.length)];
      const reg = THAI_REGIONS.find(r => r.provinces.includes(randomProv))?.name || '';
      updateUrlParams(querySearch, queryCategory, queryHabitat, reg, randomProv);
    }
  };

  const showRegionalSection = queryHabitatMode || Boolean(queryRegion || queryProvince || queryHabitat);

  // Active region & province list
  const activeRegionObj = THAI_REGIONS.find(r => r.name === queryRegion || r.alias === queryRegion);

  const activeProvinces = useMemo(() => {
    if (activeRegionObj) {
      return Array.from(new Set(activeRegionObj.provinces));
    }
    return Array.from(new Set(THAI_REGIONS.flatMap(r => r.provinces)));
  }, [activeRegionObj]);

  // Specimen counts per province (accurately matching multi-province strings)
  const provinceCounts = useMemo(() => {
    const counts = {};
    const allProvinces = THAI_REGIONS.flatMap(r => r.provinces);
    
    allProvinces.forEach(provName => {
      const matchCount = allInsects.filter(ins => {
        if (!ins.province) return false;
        const cleanField = ins.province.replace(/จังหวัด/g, '');
        return cleanField.includes(provName);
      }).length;
      counts[provName] = matchCount;
    });
    
    return counts;
  }, [allInsects]);

  const regionCounts = useMemo(() => {
    return THAI_REGIONS.reduce((acc, reg) => {
      acc[reg.name] = allInsects.filter(ins => {
        if (ins.region === reg.name || ins.region === reg.alias) return true;
        if (ins.province) {
          return reg.provinces.some(p => ins.province.includes(p));
        }
        return false;
      }).length;
      return acc;
    }, {});
  }, [allInsects]);

  // Filter provinces by search and tab
  const filteredProvinces = activeProvinces.filter(p => {
    const matchesSearch = !provinceSearchQuery.trim() || p.toLowerCase().includes(provinceSearchQuery.trim().toLowerCase());
    if (!matchesSearch) return false;
    if (provinceFilterTab === 'has_data') {
      return (provinceCounts[p] || 0) > 0 || dbProvinces.some(dp => dp.province === p);
    }
    return true;
  });

  return (
    <div className="block pt-16 min-h-screen w-full relative">
      <Sidebar />

      <main className="lg:ml-64 px-6 py-8 md:px-10 md:py-10 max-w-container-max mx-auto animate-fade-in-up">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1
              className="font-display-lg text-display-lg text-on-surface"
              style={{
                borderBottom: '3px solid transparent',
                borderImage: 'linear-gradient(to right, var(--color-primary), var(--color-tertiary)) 1',
                paddingBottom: '8px',
              }}
            >
              {showRegionalSection ? 'ค้นหาภูมิภาคและจังหวัดที่พบแมลง' : 'คลังข้อมูลวิจัยแมลงทางชีววิทยา'}
            </h1>
            {!loading && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-label-caps text-label-caps font-bold">
                {insects.length} ตัวอย่าง
              </span>
            )}
          </div>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl leading-relaxed">
            {showRegionalSection 
              ? 'สำรวจการค้นพบสิ่งมีชีวิตจำพวกแมลงผ่านแผนที่ประเทศไทย MapLibre GL แบบโต้ตอบ ครอบคลุมพิกัดพื้นที่ป่า ถิ่นอาศัย และแหล่งกระจายตัวตามธรรมชาติ 77 จังหวัด'
              : 'ระบบคลังข้อมูลกีฏวิทยาของตัวอย่างสิ่งมีชีวิตจำพวกแมลงในประเทศไทย รวบรวมข้อมูลอย่างเป็นระบบเพื่อการศึกษาวิจัยและการอนุรักษ์ ครอบคลุมรหัสตัวอย่าง การจำแนกประเภท อนุกรมวิธาน แหล่งที่อยู่อาศัย และสถานภาพการคุ้มครองตามมาตรฐานสากล'
            }
          </p>
        </header>

        {/* Search Section */}
        <section className="mb-8">
          <form onSubmit={handleSearchSubmit} className="relative group max-w-4xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                  {showRegionalSection ? 'travel_explore' : 'search'}
                </span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 outline-none transition-all placeholder:text-outline-variant shadow-sm"
                placeholder={showRegionalSection ? "ค้นหาชื่อแมลง ถิ่นอาศัย ชื่อจังหวัด หรือภูมิภาค..." : "ค้นหาด้วยชื่อสามัญ หรือ ชื่อวิทยาศาสตร์ (เช่น ด้วงกว่างเฮอร์คิวลิส)..."}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-lg font-label-caps text-label-caps uppercase transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              ค้นหา
            </button>
            {(querySearch || queryCategory || queryHabitat || queryRegion || queryProvince || queryHabitatMode) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="border border-outline text-secondary hover:bg-surface-container-low px-6 py-3 rounded-lg font-label-caps text-label-caps uppercase transition-colors cursor-pointer whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
          </form>
        </section>

        {/* Interactive Thailand Map & Regional Explorer */}
        <section className="mb-8 bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          
          {/* Top Header Bar */}
          <div className="px-6 py-4 bg-surface-container-low/70 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">explore</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2 flex-wrap">
                  แผนที่การกระจายตัวของแมลงในประเทศไทย (MapLibre GL Interactive)
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold font-sans shadow-sm">
                    6 ภูมิภาค 77 จังหวัด
                  </span>
                </h3>
                <p className="text-xs text-secondary">
                  แตะหรือคลิกภูมิภาคบนแผนที่เพื่อซูม หรือคลิกหมุดจังหวัดเพื่อดูตัวอย่างแมลงและกรองข้อมูล
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRandomDiscovery}
                className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="สุ่มสำรวจจังหวัดที่มีตัวอย่างแมลงในฐานข้อมูล"
              >
                <span className="material-symbols-outlined text-[16px]">shuffle</span>
                <span>สุ่มสำรวจพื้นที่</span>
              </button>

              {(queryRegion || queryProvince) && (
                <button
                  onClick={() => updateUrlParams(querySearch, queryCategory, queryHabitat, '', '')}
                  className="px-3 py-1.5 rounded-xl border border-outline text-secondary hover:bg-slate-100 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  <span>ล้างค่าแผนที่</span>
                </button>
              )}
            </div>
          </div>

          {/* Map & Province Explorer 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
            
            {/* Left Column: MapLibre GL Interactive Map */}
            <div className="lg:col-span-7 p-5 flex flex-col justify-between bg-slate-50/40 relative">
              
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-[11px] font-label-caps text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">touch_app</span>
                  แผนที่ประเทศไทยแบบโต้ตอบ (MapLibre GL)
                </span>
                <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {queryProvince ? `📍 จังหวัด ${queryProvince}` : queryRegion ? `🗺️ ${queryRegion}` : '🇹🇭 ทั่วประเทศไทย'}
                </span>
              </div>

              {/* MapLibre GL Thailand Map Component */}
              <div className="w-full my-1">
                <ThailandMapLibre
                  selectedRegion={queryRegion}
                  selectedProvince={queryProvince}
                  hoveredProvince={hoveredProvince}
                  provinceCounts={provinceCounts}
                  regionCounts={regionCounts}
                  insects={allInsects}
                  onSelectRegion={(reg) => handleRegionClick(reg)}
                  onSelectProvince={(prov) => handleProvinceClick(prov)}
                />
              </div>

              {/* Map Region Quick Switch Buttons */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 pt-3 border-t border-outline-variant/60">
                <button
                  onClick={() => handleRegionClick('')}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    queryRegion === ''
                      ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/30'
                      : 'bg-white text-secondary border border-outline-variant hover:bg-primary/5 hover:border-primary/40'
                  }`}
                >
                  🇹🇭 ทุกภาค
                </button>
                {THAI_REGIONS.map((reg) => {
                  const isSelected = queryRegion === reg.name || queryRegion === reg.alias;
                  const count = regionCounts[reg.name] || 0;

                  return (
                    <button
                      key={reg.key}
                      onClick={() => handleRegionClick(reg.name)}
                      className={`px-2 py-1.5 rounded-xl text-[11px] font-medium text-center transition-all cursor-pointer truncate flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'text-white font-bold shadow-sm ring-2'
                          : 'bg-white text-on-surface-variant border border-outline-variant hover:border-primary/40'
                      }`}
                      style={isSelected ? { backgroundColor: reg.color, borderColor: reg.color } : {}}
                      title={`${reg.name} (พบ ${count} ตัวอย่าง)`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#ffffff' : reg.color }}></span>
                      <span className="truncate">{reg.alias || reg.name}</span>
                      <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold font-data-mono ${
                        isSelected ? 'bg-white/25 text-white' : count > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Province Explorer & Filter Panel */}
            <div className="lg:col-span-5 p-5 flex flex-col bg-white">
              
              {/* Region Info & Subheader */}
              <div className="pb-3 border-b border-outline-variant/60">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px] text-primary">
                      {activeRegionObj?.icon || 'public'}
                    </span>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        {activeRegionObj ? activeRegionObj.name : 'ทุกภูมิภาคในประเทศไทย'}
                      </h4>
                      <span className="text-[11px] text-secondary">
                        {activeRegionObj ? `พบตัวอย่าง ${regionCounts[activeRegionObj.name] || 0} รายการ` : `ตัวอย่างทั้งหมด ${allInsects.length} รายการ`}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-surface-container-high text-secondary font-bold font-data-mono">
                    {filteredProvinces.length} จังหวัด
                  </span>
                </div>

                {/* Province Filter Tabs & Live Search Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                  <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant shrink-0">
                    <button
                      onClick={() => setProvinceFilterTab('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        provinceFilterTab === 'all'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      ทั้งหมด ({activeProvinces.length})
                    </button>
                    <button
                      onClick={() => setProvinceFilterTab('has_data')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        provinceFilterTab === 'has_data'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-emerald-700 hover:text-emerald-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      มีแมลง
                    </button>
                  </div>

                  <div className="relative flex-1">
                    <span className="material-symbols-outlined text-outline text-[16px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      search
                    </span>
                    <input
                      type="text"
                      value={provinceSearchQuery}
                      onChange={(e) => setProvinceSearchQuery(e.target.value)}
                      placeholder="ค้นหาชื่อจังหวัด..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline"
                    />
                    {provinceSearchQuery && (
                      <button
                        onClick={() => setProvinceSearchQuery('')}
                        className="material-symbols-outlined text-[14px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 hover:text-on-surface cursor-pointer"
                      >
                        close
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Province Indicator Bar */}
              <div className="py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-secondary">ที่เลือก:</span>
                  {queryProvince ? (
                    <span className="px-3 py-0.5 rounded-full bg-primary text-white font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[13px]">pin_drop</span>
                      จังหวัด {queryProvince}
                      <button
                        onClick={() => handleProvinceClick('')}
                        className="hover:bg-white/20 rounded-full p-0.5 ml-0.5 cursor-pointer"
                        title="ยกเลิกการเลือกจังหวัด"
                      >
                        <span className="material-symbols-outlined text-[11px]">close</span>
                      </button>
                    </span>
                  ) : (
                    <span className="text-secondary font-medium">ทุกจังหวัดในภูมิภาคนี้</span>
                  )}
                </div>

                {queryProvince && (
                  <button
                    onClick={() => handleProvinceClick('')}
                    className="text-primary hover:underline font-semibold cursor-pointer text-xs"
                  >
                    ดูทุกจังหวัด
                  </button>
                )}
              </div>

              {/* Province Interactive Buttons Grid */}
              <div className="flex-1 overflow-y-auto max-h-[380px] custom-scrollbar pr-1 pb-2">
                <div className="grid grid-cols-2 gap-2 pt-1">
                  
                  {/* Option "All Provinces in Region" */}
                  <button
                    onClick={() => handleProvinceClick('')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-1.5 transition-all text-left cursor-pointer ${
                      queryProvince === ''
                        ? 'bg-secondary text-on-secondary shadow-sm ring-2 ring-secondary/30'
                        : 'bg-surface-container-low text-secondary border border-outline-variant/80 hover:bg-secondary/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[15px]">select_all</span>
                      ทุกจังหวัด
                    </span>
                    <span className="text-[10px] opacity-80">ทั้งหมด</span>
                  </button>

                  {/* Province Interactive Pills */}
                  {filteredProvinces.map((provName, index) => {
                    const count = provinceCounts[provName] || 0;
                    const isSelected = queryProvince === provName;
                    const isHovered = hoveredProvince === provName;
                    const hasData = count > 0 || dbProvinces.some(dp => dp.province === provName);
                    
                    const provRegion = THAI_REGIONS.find(r => r.provinces.includes(provName));
                    const provColor = provRegion?.color || '#006948';

                    return (
                      <button
                        key={`prov-${provName}-${index}`}
                        onClick={() => handleProvinceClick(provName)}
                        onMouseEnter={() => setHoveredProvince(provName)}
                        onMouseLeave={() => setHoveredProvince('')}
                        className={`px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-1.5 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'text-white font-bold shadow-md ring-2 scale-[1.02]'
                            : isHovered
                            ? 'bg-sky-50 text-sky-900 border border-sky-400 font-semibold shadow-sm'
                            : hasData
                            ? 'bg-emerald-50/90 text-emerald-950 border border-emerald-300 font-semibold hover:bg-emerald-100 hover:border-emerald-400 shadow-sm'
                            : 'bg-white text-on-surface-variant border border-outline-variant hover:bg-primary/5 hover:border-primary/30'
                        }`}
                        style={isSelected ? { backgroundColor: provColor, borderColor: provColor } : {}}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: isSelected ? '#ffffff' : provColor }}
                          ></span>
                          <span className="truncate font-medium">{provName}</span>
                        </span>
                        
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-data-mono shrink-0 shadow-sm ${
                          isSelected 
                            ? 'bg-white text-slate-900' 
                            : count > 0 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count > 0 ? `${count} ตัวอย่าง` : '0'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {filteredProvinces.length === 0 && (
                  <div className="py-12 text-center text-secondary flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-1">search_off</span>
                    <p className="text-xs">ไม่พบจังหวัดที่ตรงกับเงื่อนไข</p>
                    <button
                      onClick={() => { setProvinceSearchQuery(''); setProvinceFilterTab('all'); }}
                      className="mt-2 text-xs text-primary font-bold hover:underline"
                    >
                      ล้างการค้นหาจังหวัด
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <h3 className="font-label-caps text-label-caps text-secondary mb-3">อันดับทางอนุกรมวิธาน (Taxonomic Orders)</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick('')}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps flex items-center gap-2 transition-all cursor-pointer ${
                queryCategory === ''
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant border border-outline-variant hover:bg-secondary/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              ทั้งหมด
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id.toString())}
                className={`px-4 py-2 rounded-full font-label-caps text-label-caps flex items-center gap-2 transition-all cursor-pointer ${
                  queryCategory === cat.id.toString()
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant border border-outline-variant hover:bg-secondary/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Result Count Summary */}
        {!loading && insects.length > 0 && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-[16px] text-outline">inventory_2</span>
            <p className="font-body-sm text-body-sm text-secondary">
              กำลังแสดงตัวอย่างจำนวน <span className="font-semibold text-on-surface">{insects.length}</span> รายการ
              {querySearch && <> ที่ตรงกับคำค้น &ldquo;<span className="text-primary">{querySearch}</span>&rdquo;</>}
              {queryRegion && <> ในภูมิภาค &ldquo;<span className="text-primary font-bold">{queryRegion}</span>&rdquo;</>}
              {queryProvince && <> จังหวัด &ldquo;<span className="text-primary font-bold">{queryProvince}</span>&rdquo;</>}
              {queryCategory && categories.length > 0 && <> ในอันดับ <span className="text-primary font-bold">{categories.find(c => c.id.toString() === queryCategory)?.name || 'อันดับที่เลือก'}</span></>}
            </p>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary">
            <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
            <p className="mt-4 font-body-md text-secondary">กำลังค้นหาและดึงข้อมูลแมลง...</p>
          </div>
        ) : insects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-outline-variant bg-surface-container-low/50 rounded-xl p-10">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-outline text-[40px]">search_off</span>
            </div>
            <p className="font-headline-sm text-headline-sm text-on-surface mb-2">ไม่พบข้อมูลแมลงในภูมิภาคหรือจังหวัดนี้</p>
            <p className="font-body-md text-outline max-w-md">
              กรุณาลองปรับเปลี่ยนชื่อจังหวัด ภูมิภาค หรือค้นหาจากรายชื่อทั้งหมดอีกครั้ง
            </p>
            {(querySearch || queryCategory || queryHabitat || queryRegion || queryProvince) && (
              <button
                onClick={handleClearFilters}
                className="mt-6 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-caps text-label-caps uppercase hover:bg-primary-container transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                แสดงข้อมูลแมลงทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {insects.map((insect, index) => (
              <article
                key={insect.id}
                className="academic-card group/card bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col cursor-pointer"
                onClick={() => router.push(`/insects/${insect.id}`)}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Image */}
                <div className="h-52 relative overflow-hidden bg-surface-container-low">
                  <InsectImage
                    src={insect.image_url}
                    alt={insect.common_name}
                    className="w-full h-full object-cover"
                    iconSize={40}
                  />
                  {/* Category Badge */}
                  <span className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-on-primary px-2.5 py-1 rounded-md font-label-caps text-[10px] uppercase tracking-wider transition-transform duration-200 group-hover/card:scale-110 shadow-sm">
                    {insect.category_name?.split(' ')[0] || 'INSECT'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-body-md font-bold text-on-surface line-clamp-1 mb-0.5">
                    {insect.common_name}
                  </h4>
                  <p className="font-scientific-name italic text-secondary text-sm mb-2">
                    {insect.scientific_name}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                    {insect.description || 'ไม่มีการบันทึกคำอธิบายทางกายภาพสำหรับตัวอย่างนี้'}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto border-t border-outline-variant/60 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-primary font-bold">location_on</span>
                      <span className="text-[11px] font-label-caps text-primary font-bold line-clamp-1 max-w-[130px]">
                        {insect.province ? `${insect.region ? insect.region + ' - ' : ''}${insect.province}` : (insect.habitat || 'ไม่ระบุถิ่นอาศัย')}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-label-caps text-[10px] uppercase ${
                      insect.status === 'protected' ? 'bg-red-50 text-red-700 border border-red-200' :
                      insect.status === 'endangered' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      insect.status === 'vulnerable' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {insect.status === 'protected' ? 'คุ้มครอง' :
                       insect.status === 'endangered' ? 'ใกล้สูญพันธุ์' :
                       insect.status === 'vulnerable' ? 'มีแนวโน้มลดลง' : 'ปลอดภัย'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
        </div>
      }>
        <CatalogContent />
      </Suspense>

      {/* Footer */}
      <footer className="w-full py-8 px-6 mt-auto bg-surface-container border-t border-outline-variant">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bug_report</span>
              <span className="font-label-caps text-label-caps text-primary">ENTOMODATA PRO</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              © 2026 สมาคมกีฏวิทยาระหว่างประเทศ ข้อมูลวิจัยทางวิทยาศาสตร์ทั้งหมดได้รับการคุ้มครองและเผยแพร่ภายใต้สัญญาอนุญาตแบบเสรี (Open-Access) ร่วมสนับสนุนการรักษาระบบนิเวศทางชีวภาพอย่างยั่งยืน
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a className="text-secondary font-body-sm text-body-sm hover:text-primary underline underline-offset-4 transition-colors" href="#" onClick={(e) => e.preventDefault()}>นโยบายความเป็นส่วนตัว</a>
            <a className="text-secondary font-body-sm text-body-sm hover:text-primary underline underline-offset-4 transition-colors" href="#" onClick={(e) => e.preventDefault()}>ข้อตกลงการให้บริการ</a>
            <a className="text-secondary font-body-sm text-body-sm hover:text-primary underline underline-offset-4 transition-colors" href="#" onClick={(e) => e.preventDefault()}>คำชี้แจงสิทธิ์การอนุรักษ์</a>
          </div>
        </div>
      </footer>
    </>
  );
}
