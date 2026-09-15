'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import InsectImage from '@/components/InsectImage';

const AVAILABLE_REGIONS = [
  { name: 'ภาคเหนือ', alias: 'ภาคเหนือ', color: '#006948', icon: 'filter_hdr' },
  { name: 'ภาคตะวันออกเฉียงเหนือ', alias: 'ภาคอีสาน', color: '#d97706', icon: 'landscape' },
  { name: 'ภาคกลาง', alias: 'ภาคกลาง', color: '#10b981', icon: 'location_city' },
  { name: 'ภาคตะวันออก', alias: 'ภาคตะวันออก', color: '#06b6d4', icon: 'beach_access' },
  { name: 'ภาคตะวันตก', alias: 'ภาคตะวันตก', color: '#8b5cf6', icon: 'forest' },
  { name: 'ภาคใต้', alias: 'ภาคใต้', color: '#3b82f6', icon: 'surfing' }
];

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit');
  const tabParam = searchParams.get('tab');

  const [insects, setInsects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('users'); // default to 'users'

  // Insect Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);

  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [habitat, setHabitat] = useState('');
  const [status, setStatus] = useState('common');
  const [imageUrl, setImageUrl] = useState('');

  // Taxonomy Hierarchy State
  const [kingdom, setKingdom] = useState('Animalia');
  const [phylum, setPhylum] = useState('Arthropoda');
  const [classNameInput, setClassNameInput] = useState('Insecta');
  const [family, setFamily] = useState('');
  const [genus, setGenus] = useState('');
  const [species, setSpecies] = useState('');

  // Morphological & Geographical State
  const [mouthType, setMouthType] = useState('');
  const [wingType, setWingType] = useState('');
  const [legType, setLegType] = useState('');
  const [antennaType, setAntennaType] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [source, setSource] = useState('');

  // Multi-Region helper handlers
  const toggleRegion = (regName) => {
    const currentList = region ? region.split(',').map(r => r.trim()).filter(Boolean) : [];
    const exists = currentList.some(r => r === regName || r.includes(regName) || regName.includes(r));
    let updated;
    if (exists) {
      updated = currentList.filter(r => r !== regName && !r.includes(regName) && !regName.includes(r));
    } else {
      updated = [...currentList, regName];
    }
    setRegion(updated.join(', '));
  };

  const isRegionSelected = (regName) => {
    if (!region) return false;
    return region.includes(regName);
  };

  const selectAllRegions = () => {
    setRegion(AVAILABLE_REGIONS.map(r => r.name).join(', '));
  };

  const clearAllRegions = () => {
    setRegion('');
  };

  // Category Form State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catFormMode, setCatFormMode] = useState('add'); // 'add' or 'edit'
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // User Form State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormMode, setUserFormMode] = useState('add'); // 'add' or 'edit'
  const [editingUserId, setEditingUserId] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('user');

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Contact Form & View State for Admin
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactFormMode, setContactFormMode] = useState('add'); // 'add' or 'edit'
  const [editingContactId, setEditingContactId] = useState(null);
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactComment, setContactComment] = useState('');

  // View Contact Detail Modal State
  const [isViewContactModalOpen, setIsViewContactModalOpen] = useState(false);
  const [viewContactModalItem, setViewContactModalItem] = useState(null);

  const handleViewContactOpen = (contactItem) => {
    setViewContactModalItem(contactItem);
    setIsViewContactModalOpen(true);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tabParam === 'users') {
      setAdminTab('users');
    } else if (tabParam === 'insects') {
      setAdminTab('insects');
    } else if (tabParam === 'categories') {
      setAdminTab('categories');
    } else if (tabParam === 'contacts') {
      setAdminTab('contacts');
    }
  }, [tabParam]);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        const authResult = await authRes.json();

        if (!authResult.success || authResult.data?.role !== 'admin') {
          router.push('/login');
          return;
        }

        setUser(authResult.data);
        setAuthLoading(false);

        // Load all data
        await Promise.all([fetchInsects(), fetchCategories(), fetchUsers(), fetchContacts()]);
      } catch (err) {
        console.error('Admin Auth Check Failed:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [router]);

  // Handle edit param from URL
  useEffect(() => {
    if (editParam && insects.length > 0) {
      const insectToEdit = insects.find(ins => ins.id === parseInt(editParam));
      if (insectToEdit) {
        setAdminTab('insects');
        openEditModal(insectToEdit);
      }
    }
  }, [editParam, insects]);

  const fetchInsects = async () => {
    try {
      const res = await fetch('/api/insects');
      const result = await res.json();
      if (result.success) {
        setInsects(result.data);
      }
    } catch (err) {
      console.error('Error fetching insects:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
        if (result.data.length > 0 && !categoryId) {
          setCategoryId(result.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const result = await res.json();
      if (result.success) {
        setUsersList(result.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  const fetchContacts = async (searchTerm = '') => {
    try {
      const url = searchTerm ? `/api/contact_us?search=${encodeURIComponent(searchTerm)}` : '/api/contact_us';
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setContactsList(result.data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleContactSearch = (e) => {
    const term = e.target.value;
    setContactSearchTerm(term);
    fetchContacts(term);
  };

  const handleContactModalOpen = () => {
    setContactFormMode('add');
    setEditingContactId(null);
    setContactFirstName('');
    setContactLastName('');
    setContactPhone('');
    setContactAddress('');
    setContactComment('');
    setIsContactModalOpen(true);
  };

  const handleContactEditOpen = (contactItem) => {
    setContactFormMode('edit');
    setEditingContactId(contactItem.id);
    setContactFirstName(contactItem.first_name || '');
    setContactLastName(contactItem.last_name || '');
    setContactPhone(contactItem.phone || '');
    setContactAddress(contactItem.address || '');
    setContactComment(contactItem.comment || '');
    setIsContactModalOpen(true);
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    if (!contactFirstName.trim() || !contactLastName.trim() || !contactComment.trim()) {
      alert('กรุณากรอกข้อมูล ชื่อ, นามสกุล และแสดงความคิดเห็น/ข้อความ');
      return;
    }

    try {
      const endpoint = contactFormMode === 'add' ? '/api/contact_us' : `/api/contact_us/${editingContactId}`;
      const method = contactFormMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: contactFirstName,
          last_name: contactLastName,
          phone: contactPhone,
          address: contactAddress,
          comment: contactComment
        })
      });

      const result = await res.json();
      if (result.success) {
        alert(result.message || (contactFormMode === 'add' ? 'เพิ่มรายการติดต่อใหม่สำเร็จ' : 'แก้ไขข้อมูลติดต่อสำเร็จ'));
        setIsContactModalOpen(false);
        fetchContacts(contactSearchTerm);
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลติดต่อ');
      }
    } catch (err) {
      console.error('Contact Form Submit Error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลติดต่อ');
    }
  };

  const handleContactDelete = async (id, name) => {
    if (!confirm(`คุณต้องการลบข้อมูลการติดต่อของคุณ "${name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/contact_us/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        alert('ลบข้อมูลการติดต่อเรียบร้อยแล้ว');
        fetchContacts(contactSearchTerm);
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      console.error('Delete Contact Error:', err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูลการติดต่อ');
    }
  };

  const handleExportContacts = () => {
    if (!contactsList || contactsList.length === 0) {
      alert('ไม่พบข้อมูลการติดต่อสำหรับส่งออก');
      return;
    }

    const headers = ['ID', 'ชื่อ', 'นามสกุล', 'เบอร์โทร', 'ที่อยู่', 'แสดงความคิดเห็น', 'วันที่ติดต่อ'];
    const csvRows = [headers.map(h => `"${h}"`).join(',')];

    contactsList.forEach(c => {
      const row = [
        `C-${c.id.toString().padStart(4, '0')}`,
        c.first_name ? String(c.first_name).replace(/"/g, '""') : '',
        c.last_name ? String(c.last_name).replace(/"/g, '""') : '',
        c.phone ? String(c.phone).replace(/"/g, '""') : '',
        c.address ? String(c.address).replace(/"/g, '""') : '',
        c.comment ? String(c.comment).replace(/"/g, '""') : '',
        c.created_at ? new Date(c.created_at).toLocaleDateString('th-TH') : ''
      ];
      csvRows.push(row.map(v => `"${v}"`).join(','));
    });

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contact_us_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Insect Form Helper Actions
  const resetForm = () => {
    setCommonName('');
    setScientificName('');
    setCategoryId(categories[0]?.id.toString() || '');
    setDescription('');
    setHabitat('');
    setStatus('common');
    setImageUrl('');
    setKingdom('Animalia');
    setPhylum('Arthropoda');
    setClassNameInput('Insecta');
    setFamily('');
    setGenus('');
    setSpecies('');
    setMouthType('');
    setWingType('');
    setLegType('');
    setAntennaType('');
    setRegion('');
    setProvince('');
    setSource('');
    setEditingId(null);
    setUploadProgress('');
  };

  const openAddModal = () => {
    setFormMode('add');
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (insect) => {
    setFormMode('edit');
    setEditingId(insect.id);
    setCommonName(insect.common_name);
    setScientificName(insect.scientific_name);
    setCategoryId(insect.category_id.toString());
    setDescription(insect.description || '');
    setHabitat(insect.habitat || '');
    setStatus(insect.status || 'common');
    setImageUrl(insect.image_url || '');
    setKingdom(insect.kingdom || 'Animalia');
    setPhylum(insect.phylum || 'Arthropoda');
    setClassNameInput(insect.class_name || 'Insecta');
    setFamily(insect.family || '');
    setGenus(insect.genus || (insect.scientific_name ? insect.scientific_name.split(' ')[0] : ''));
    setSpecies(insect.species || insect.scientific_name || '');
    setMouthType(insect.mouth_type || '');
    setWingType(insect.wing_type || '');
    setLegType(insect.leg_type || '');
    setAntennaType(insect.antenna_type || '');
    setRegion(insect.region || '');
    setProvince(insect.province || '');
    setSource(insect.source || '');
    setUploadProgress('');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
    if (editParam) {
      router.push('/admin');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('กำลังอัปโหลดไฟล์รูปภาพ...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        setImageUrl(result.url);
        setUploadProgress('อัปโหลดรูปภาพสำเร็จแล้ว! บันทึกไฟล์เรียบร้อย');
      } else {
        setUploadProgress(`อัปโหลดล้มเหลว: ${result.message}`);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadProgress('การอัปโหลดขัดข้องจากปัญหาเครือข่าย');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      category_id: parseInt(categoryId),
      common_name: commonName,
      scientific_name: scientificName,
      description,
      habitat,
      status,
      image_url: imageUrl,
      kingdom: kingdom || 'Animalia',
      phylum: phylum || 'Arthropoda',
      class_name: classNameInput || 'Insecta',
      family: family || '',
      genus: genus || (scientificName ? scientificName.split(' ')[0] : ''),
      species: species || scientificName || '',
      mouth_type: mouthType || '',
      wing_type: wingType || '',
      leg_type: legType || '',
      antenna_type: antennaType || '',
      region: region || '',
      province: province || '',
      source: source || ''
    };

    const url = formMode === 'add' ? '/api/insects' : `/api/insects/${editingId}`;
    const method = formMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        alert(formMode === 'add' ? 'เพิ่มตัวอย่างแมลงเข้าระบบสำเร็จแล้ว!' : 'แก้ไขปรับปรุงข้อมูลแมลงสำเร็จแล้ว!');
        handleModalClose();
        fetchInsects();
      } else {
        alert(`ข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error('Error saving record:', err);
      alert('เกิดข้อขัดข้องขณะเชื่อมต่อเพื่อบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลตัวอย่างแมลง "${name}" ออกจากคลังวิจัยนี้อย่างถาวร?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/insects/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();

      if (result.success) {
        alert('ลบข้อมูลตัวอย่างแมลงเสร็จสิ้น');
        fetchInsects();
      } else {
        alert(`ข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('การลบข้อมูลตัวอย่างขัดข้อง');
    }
  };

  // Category Form Helper Actions
  const resetCatForm = () => {
    setCatName('');
    setCatDescription('');
    setEditingCatId(null);
  };

  const openAddCatModal = () => {
    setCatFormMode('add');
    resetCatForm();
    setIsCatModalOpen(true);
  };

  const openEditCatModal = (cat) => {
    setCatFormMode('edit');
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setIsCatModalOpen(true);
  };

  const handleCatModalClose = () => {
    setIsCatModalOpen(false);
    resetCatForm();
  };

  const handleCatFormSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: catName, description: catDescription };
    const url = catFormMode === 'add' ? '/api/categories' : `/api/categories/${editingCatId}`;
    const method = catFormMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        alert(catFormMode === 'add' ? 'เพิ่มหมวดหมู่สำเร็จแล้ว!' : 'แก้ไขหมวดหมู่สำเร็จแล้ว!');
        handleCatModalClose();
        fetchCategories();
        fetchInsects();
      } else {
        alert(`ข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลหมวดหมู่');
    }
  };

  const handleCatDelete = async (id, name) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${name}" นี้ออกจากระบบทะเบียน?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        alert('ลบหมวดหมู่สำเร็จแล้ว');
        fetchCategories();
        fetchInsects();
      } else {
        alert(`ข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบหมวดหมู่');
    }
  };

  // User Form Helper Actions
  const resetUserForm = () => {
    setUsernameInput('');
    setEmailInput('');
    setPasswordInput('');
    setRoleInput('user');
    setEditingUserId(null);
  };

  const openAddUserModal = () => {
    setUserFormMode('add');
    resetUserForm();
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (userData) => {
    setUserFormMode('edit');
    setEditingUserId(userData.id);
    setUsernameInput(userData.username);
    setEmailInput(userData.email);
    setPasswordInput('');
    setRoleInput(userData.role || 'user');
    setIsUserModalOpen(true);
  };

  const handleUserModalClose = () => {
    setIsUserModalOpen(false);
    resetUserForm();
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username: usernameInput,
      email: emailInput,
      role: roleInput,
      password: passwordInput
    };

    const url = userFormMode === 'add' ? '/api/users' : `/api/users/${editingUserId}`;
    const method = userFormMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        alert(userFormMode === 'add' ? 'สร้างผู้ใช้งานใหม่สำเร็จเรียบร้อย!' : 'อัปเดตข้อมูลผู้ใช้งานสำเร็จเรียบร้อย!');
        handleUserModalClose();
        fetchUsers();
      } else {
        alert(`ข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error('User form submit error:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกข้อมูลผู้ใช้งาน');
    }
  };

  const handleUserDelete = async (id, name) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้งาน "${name}" ออกจากระบบ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        alert('ลบบัญชีผู้ใช้งานเสร็จสิ้น');
        fetchUsers();
      } else {
        alert(`ข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('เกิดข้อขัดข้องในการลบผู้ใช้งาน');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="block pt-16 min-h-screen w-full relative">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 px-6 py-8 md:px-10 md:py-10 max-w-7xl mx-auto flex flex-col animate-fade-in-up">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface">
              {adminTab === 'contacts' ? 'การจัดการข้อมูลติดต่อเรา' : 'การจัดการคลังข้อมูล'}
            </h1>
            <p className="font-body-lg text-body-lg text-secondary mt-1">
              {adminTab === 'contacts'
                ? 'บริหารจัดการข้อความ ความคิดเห็น และข้อเสนอแนะจากผู้ใช้งานระบบ'
                : adminTab === 'users' ? 'บริหารจัดการบัญชีผู้ใช้งานระบบ สิทธิ์การเข้าถึงข้อมูล และการตั้งค่าสิทธิ์บัญชี'
                  : 'ภาพรวมสิ่งสะสมตัวอย่างแมลง การเพิ่มและปรับปรุงทะเบียนข้อมูลความหลากหลาย'}
            </p>
          </div>
          {adminTab === 'contacts' ? (
            <button
              onClick={handleContactModalOpen}
              className="flex items-center gap-2 text-on-primary px-6 py-3 rounded-lg font-body-md font-semibold hover:opacity-90 transition-opacity shadow-sm active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
            >
              <span className="material-symbols-outlined">add</span>
              เพิ่มรายการติดต่อใหม่
            </button>
          ) : adminTab === 'users' ? (
            <button
              onClick={openAddUserModal}
              className="flex items-center gap-2 text-on-primary px-6 py-3 rounded-lg font-body-md font-semibold hover:opacity-90 transition-opacity shadow-sm active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
            >
              <span className="material-symbols-outlined">person_add</span>
              เพิ่มผู้ใช้งานใหม่
            </button>
          ) : adminTab === 'insects' ? (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 text-on-primary px-6 py-3 rounded-lg font-body-md font-semibold hover:opacity-90 transition-opacity shadow-sm active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
            >
              <span className="material-symbols-outlined">add</span>
              เพิ่มข้อมูลแมลงใหม่
            </button>
          ) : (
            <button
              onClick={openAddCatModal}
              className="flex items-center gap-2 text-on-primary px-6 py-3 rounded-lg font-body-md font-semibold hover:opacity-90 transition-opacity shadow-sm active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
            >
              <span className="material-symbols-outlined">add</span>
              เพิ่มหมวดหมู่ใหม่
            </button>
          )}
        </div>

        {/* Tab Navigator */}
        {adminTab !== 'contacts' && (
          <div className="flex gap-6 border-b border-outline-variant/60 mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setAdminTab('users')}
              className={`pb-3 border-b-2 font-body-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${adminTab === 'users' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              การจัดการผู้ใช้งานระบบ
            </button>
            <button
              onClick={() => setAdminTab('insects')}
              className={`pb-3 border-b-2 font-body-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${adminTab === 'insects' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">bug_report</span>
              จัดการข้อมูลแมลง
            </button>
            <button
              onClick={() => setAdminTab('categories')}
              className={`pb-3 border-b-2 font-body-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${adminTab === 'categories' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">category</span>
              จัดการหมวดหมู่ / อันดับ
            </button>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-outline-variant/60 p-6 rounded-xl transition-all hover:border-primary/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-lg">group</span>
              <span className="text-primary font-data-mono text-[11px] font-bold uppercase tracking-wider">บัญชีผู้ใช้</span>
            </div>
            <p className="font-label-caps text-[11px] text-secondary mb-1">ผู้ใช้งานทั้งหมดในระบบ</p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{usersList.length} คน</h3>
          </div>
          <div className="bg-white border border-outline-variant/60 p-6 rounded-xl transition-all hover:border-primary/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2.5 rounded-lg">admin_panel_settings</span>
              <span className="text-tertiary font-data-mono text-[11px] font-bold uppercase tracking-wider">ผู้ดูแล</span>
            </div>
            <p className="font-label-caps text-[11px] text-secondary mb-1">ผู้ดูแลระบบ (Admin)</p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{usersList.filter(u => u.role === 'admin').length} คน</h3>
          </div>
          <div className="bg-white border border-outline-variant/60 p-6 rounded-xl transition-all hover:border-primary/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2.5 rounded-lg">person</span>
              <span className="text-secondary font-data-mono text-[11px] font-bold uppercase tracking-wider">ทั่วไป</span>
            </div>
            <p className="font-label-caps text-[11px] text-secondary mb-1">ผู้ใช้งานทั่วไป (User)</p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{usersList.filter(u => u.role !== 'admin').length} คน</h3>
          </div>
          <div className="bg-white border border-outline-variant/60 p-6 rounded-xl transition-all hover:border-primary/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-lg">microbiology</span>
              <span className="text-primary font-data-mono text-[11px] font-bold uppercase tracking-wider">สปีชีส์</span>
            </div>
            <p className="font-label-caps text-[11px] text-secondary mb-1">สิ่งสะสมแมลงในคลัง</p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{insects.length} รายการ</h3>
          </div>
        </div>

        {/* Tab 0: User Management Registry Table */}
        {adminTab === 'users' && (
          <div className="bg-white border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-4 border-b border-outline-variant/60 bg-surface flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm font-semibold">ทะเบียนข้อมูลผู้ใช้งานระบบ (User Registry)</h4>
              <button
                onClick={openAddUserModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-label-caps text-label-caps font-bold cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span> เพิ่มผู้ใช้งาน
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e293b] text-white">
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">ชื่อผู้ใช้งาน (Username)</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">อีเมล (Email)</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">สิทธิ์ใช้งาน (Role)</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">วันที่ลงทะเบียน</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {usersList.map((u) => (
                    <tr key={u.id} className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-data-mono text-sm text-secondary">
                        USR-{u.id.toString().padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-body-md font-semibold text-on-surface leading-snug">{u.username}</div>
                            {user?.username === u.username && (
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                บัญชีปัจจุบัน
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-body-sm text-secondary">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-label-caps uppercase font-bold ${u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {u.role === 'admin' ? 'admin_panel_settings' : 'person'}
                          </span>
                          {u.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งานทั่วไป (User)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-data-mono text-sm text-secondary whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => openEditUserModal(u)}
                            className="material-symbols-outlined text-secondary hover:text-tertiary transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                            title="แก้ไขข้อมูลผู้ใช้งาน"
                          >
                            edit
                          </button>
                          {user?.username !== u.username && (
                            <button
                              onClick={() => handleUserDelete(u.id, u.username)}
                              className="material-symbols-outlined text-secondary hover:text-error transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                              title="ลบบัญชีผู้ใช้งาน"
                            >
                              delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/60">
              <p className="font-body-sm text-body-sm text-secondary">
                มีบัญชีผู้ใช้งานทั้งหมด <span className="font-bold text-on-surface">{usersList.length}</span> บัญชีในระบบ
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Insect Registry Table */}
        {adminTab === 'insects' && (
          <div className="bg-white border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-4 border-b border-outline-variant/60 bg-surface flex flex-col sm:flex-row justify-between items-center gap-4">
              <h4 className="font-headline-sm text-headline-sm font-semibold">ทะเบียนข้อมูลตัวอย่างแมลง</h4>
              <div className="flex items-center gap-2">
                <button onClick={() => alert('ตัวเลือกคัดกรองข้อมูลระดับลึก โหลดค่าเสร็จ')} className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/80 rounded-lg font-label-caps text-label-caps text-secondary hover:bg-surface-container-low cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span> กรองข้อมูล
                </button>
                <button onClick={() => alert('เรียงลำดับตามตัวอักษรของชื่อวิทยาศาสตร์')} className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/80 rounded-lg font-label-caps text-label-caps text-secondary hover:bg-surface-container-low cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[16px]">sort</span> เรียงลำดับ
                </button>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e293b] text-white">
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">ชื่อแมลง / รหัสวิจัย</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">อันดับ (Order)</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">สถานะนิเวศ</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">อัปเดตล่าสุด</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {insects.map((ins) => (
                    <tr key={ins.id} className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low relative shrink-0">
                            <InsectImage
                              src={ins.image_url}
                              alt={ins.common_name}
                              className="w-full h-full object-cover"
                              iconSize={24}
                            />
                          </div>
                          <div>
                            <div className="font-body-md font-semibold text-on-surface leading-snug">{ins.common_name}</div>
                            <div className="font-scientific-name text-xs italic text-secondary mt-0.5">{ins.scientific_name}</div>
                            <div className="font-data-mono text-[10px] text-outline mt-1 uppercase tracking-wider">SPEC-ID-{ins.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 bg-surface-container-high rounded-md text-[10px] font-label-caps text-secondary border border-outline-variant/60 uppercase">
                          {ins.category_name?.split(' ')[0] || 'TAXA'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-primary font-semibold text-sm capitalize">
                          <span className={`w-2 h-2 rounded-full ${ins.status === 'protected' ? 'bg-red-500' :
                            ins.status === 'endangered' ? 'bg-orange-500' :
                              ins.status === 'vulnerable' ? 'bg-amber-500' :
                                'bg-emerald-500'
                            }`}></span>
                          {ins.status === 'protected' ? 'คุ้มครอง' :
                            ins.status === 'endangered' ? 'ใกล้สูญพันธุ์' :
                              ins.status === 'vulnerable' ? 'มีแนวโน้มลดลง' : 'ปลอดภัย'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-data-mono text-sm text-secondary whitespace-nowrap">
                        {new Date(ins.updated_at || ins.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => router.push(`/insects/${ins.id}`)}
                            className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                            title="ดูรายละเอียดข้อมูล"
                          >
                            visibility
                          </button>
                          <button
                            onClick={() => openEditModal(ins)}
                            className="material-symbols-outlined text-secondary hover:text-tertiary transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                            title="แก้ไขข้อมูลทะเบียน"
                          >
                            edit
                          </button>
                          <button
                            onClick={() => handleDelete(ins.id, ins.common_name)}
                            className="material-symbols-outlined text-secondary hover:text-error transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                            title="ลบตัวอย่างออกจากทะเบียน"
                          >
                            delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/60 flex justify-between items-center">
              <p className="font-body-sm text-body-sm text-secondary">
                กำลังแสดงตัวอย่างจำนวน <span className="font-bold text-on-surface">{insects.length}</span> รายการในระบบ
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Category Registry Table */}
        {adminTab === 'categories' && (
          <div className="bg-white border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-4 border-b border-outline-variant/60 bg-surface flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm font-semibold">ทะเบียนหมวดหมู่อันดับแมลง</h4>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e293b] text-white">
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider w-2/12">รหัส ID</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider w-3/12">ชื่อหมวดหมู่ (อันดับประเภท)</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider w-5/12">คำอธิบายรายละเอียด</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider text-right w-2/12">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-data-mono text-sm text-secondary">
                        CAT-{cat.id.toString().padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4 font-body-md font-semibold text-on-surface">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 font-body-sm text-secondary">
                        {cat.description || 'ไม่มีการบันทึกคำอธิบายสำหรับหมวดหมู่นี้'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => openEditCatModal(cat)}
                            className="material-symbols-outlined text-secondary hover:text-tertiary transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                            title="แก้ไขข้อมูลหมวดหมู่"
                          >
                            edit
                          </button>
                          <button
                            onClick={() => handleCatDelete(cat.id, cat.name)}
                            className="material-symbols-outlined text-secondary hover:text-error transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                            title="ลบหมวดหมู่"
                          >
                            delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/60">
              <p className="font-body-sm text-body-sm text-secondary">
                มีหมวดหมู่ทั้งหมด <span className="font-bold text-on-surface">{categories.length}</span> รายการในระบบ
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Contacts Table */}
        {adminTab === 'contacts' && (
          <div className="bg-white border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-4 border-b border-outline-variant/60 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-headline-sm text-headline-sm font-semibold">รายการติดต่อเรา (Contact Us)</h4>
                <p className="text-[12px] text-secondary font-body-sm">อ่านข้อความความคิดเห็น จัดการข้อมูลผู้ติดต่อ และการส่งออกข้อมูล</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-secondary">search</span>
                  <input
                    type="text"
                    value={contactSearchTerm}
                    onChange={handleContactSearch}
                    placeholder="ค้นหาชื่อ, เบอร์, ข้อความ..."
                    className="w-full pl-9 pr-3 py-1.5 border border-outline-variant rounded-lg font-body-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleContactModalOpen}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary/90 rounded-lg font-label-caps text-label-caps font-bold cursor-pointer transition-colors shadow-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> เพิ่มรายการติดต่อ
                </button>
                <button
                  onClick={handleExportContacts}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-label-caps text-label-caps font-bold cursor-pointer transition-colors whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span> ส่งออก CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e293b] text-white">
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">ชื่อ - นามสกุล</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">เบอร์โทรศัพท์</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">ที่อยู่</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider max-w-[220px]">แสดงความคิดเห็น / ข้อความ</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider">วันที่ติดต่อ</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {contactsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-secondary font-body-md">
                        ไม่พบข้อมูลรายการติดต่อ
                      </td>
                    </tr>
                  ) : (
                    contactsList.map((c) => (
                      <tr key={c.id} className="bg-white hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-data-mono text-sm text-secondary">
                          C-{c.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4 font-body-md font-semibold text-on-surface whitespace-nowrap">
                          {c.first_name} {c.last_name}
                        </td>
                        <td className="px-6 py-4 font-body-sm text-secondary whitespace-nowrap">
                          {c.phone || '-'}
                        </td>
                        <td className="px-6 py-4 font-body-sm text-secondary max-w-[180px] truncate" title={c.address}>
                          {c.address || '-'}
                        </td>
                        <td className="px-6 py-4 font-body-sm text-on-surface max-w-[220px]">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate" title={c.comment}>{c.comment}</span>
                            <button
                              onClick={() => handleViewContactOpen(c)}
                              className="px-2 py-0.5 text-[11px] bg-primary/10 text-primary hover:bg-primary/20 rounded font-bold transition-colors shrink-0"
                            >
                              อ่านดู
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-data-mono text-sm text-secondary whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewContactOpen(c)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors cursor-pointer"
                              title="อ่านรายละเอียดความคิดเห็น"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              อ่านดู
                            </button>
                            <button
                              onClick={() => handleContactEditOpen(c)}
                              className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                              title="แก้ไขข้อมูลการติดต่อ"
                            >
                              edit
                            </button>
                            <button
                              onClick={() => handleContactDelete(c.id, `${c.first_name} ${c.last_name}`)}
                              className="material-symbols-outlined text-secondary hover:text-error transition-colors cursor-pointer p-1 rounded hover:bg-surface-container"
                              title="ลบข้อมูลการติดต่อ"
                            >
                              delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/60 flex justify-between items-center">
              <p className="font-body-sm text-body-sm text-secondary">
                มีผู้ติดต่อทั้งหมด <span className="font-bold text-on-surface">{contactsList.length}</span> รายการในระบบ
              </p>
            </div>
          </div>
        )}

        {/* Modal 0: User Modal Form Overlay rendered via React Portal */}
        {mounted && isUserModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="bg-white w-full max-w-md border border-outline-variant rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                <h2 className="font-headline-sm text-headline-sm font-semibold">
                  {userFormMode === 'add' ? 'เพิ่มผู้ใช้งานระบบใหม่' : 'แก้ไขข้อมูลผู้ใช้งาน'}
                </h2>
                <button
                  className="material-symbols-outlined text-secondary hover:bg-surface-container-high p-2 rounded-full cursor-pointer transition-colors"
                  onClick={handleUserModalClose}
                >
                  close
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form className="space-y-4" id="userForm" onSubmit={handleUserFormSubmit}>
                  <div>
                    <label className="block font-label-caps text-label-caps mb-1 text-secondary uppercase font-bold">
                      ชื่อผู้ใช้งาน (Username)
                    </label>
                    <input
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                      placeholder="เช่น somchai_dev"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps mb-1 text-secondary uppercase font-bold">
                      อีเมล (Email)
                    </label>
                    <input
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                      placeholder="เช่น user@example.com"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps mb-1 text-secondary uppercase font-bold">
                      รหัสผ่าน (Password) {userFormMode === 'edit' && <span className="text-[11px] font-normal text-outline lowercase">(เว้นว่างไว้หากไม่เปลี่ยน)</span>}
                    </label>
                    <input
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                      placeholder={userFormMode === 'add' ? 'กำหนดรหัสผ่าน...' : '•••••••• (เว้นว่างไว้หากไม่เปลี่ยน)'}
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required={userFormMode === 'add'}
                    />
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps mb-1 text-secondary uppercase font-bold">
                      สิทธิ์ใช้งานในระบบ (Role)
                    </label>
                    <select
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      required
                    >
                      <option value="user">ผู้ใช้งานทั่วไป (User)</option>
                      <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-outline text-on-surface font-body-md rounded-lg hover:bg-white transition-colors cursor-pointer"
                  onClick={handleUserModalClose}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="userForm"
                  className="px-5 py-2.5 text-on-primary font-body-md font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
                >
                  บันทึกข้อมูล
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

        {/* Modal 1: Insect Modal Form Overlay rendered via React Portal */}
        {mounted && isModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="bg-white w-full max-w-2xl border border-outline-variant rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ width: '100%', maxWidth: '672px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                <h2 className="font-headline-sm text-headline-sm font-semibold">
                  {formMode === 'add' ? 'บันทึกข้อมูลตัวอย่างแมลงใหม่' : 'แก้ไขข้อมูลตัวอย่างแมลง'}
                </h2>
                <button
                  className="material-symbols-outlined text-secondary hover:bg-surface-container-high p-2 rounded-full cursor-pointer transition-colors"
                  onClick={handleModalClose}
                >
                  close
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form className="space-y-6" id="specimenForm" onSubmit={handleFormSubmit}>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                        ชื่อสามัญ (ไทย)
                      </label>
                      <input
                        className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                        placeholder="เช่น ด้วงกว่างเฮอร์คิวลิส"
                        type="text"
                        value={commonName}
                        onChange={(e) => setCommonName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                        ชื่อวิทยาศาสตร์ (Scientific Name)
                      </label>
                      <input
                        className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                        placeholder="เช่น Dynastes hercules"
                        type="text"
                        value={scientificName}
                        onChange={(e) => setScientificName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                        ถิ่นอาศัย (Habitat Zone)
                      </label>
                      <input
                        className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                        placeholder="เช่น ป่าดิบชื้น, หนองน้ำ"
                        type="text"
                        value={habitat}
                        onChange={(e) => setHabitat(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                        สถานภาพการอนุรักษ์
                      </label>
                      <select
                        className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <option value="common">ปลอดภัย / ไม่น่ากังวล (Least Concern)</option>
                        <option value="vulnerable">มีแนวโน้มลดลง (Vulnerable)</option>
                        <option value="endangered">ใกล้สูญพันธุ์ (Endangered)</option>
                        <option value="protected">สัตว์ป่าคุ้มครอง (Protected)</option>
                      </select>
                    </div>
                  </div>

                  {/* Taxonomic Hierarchy Section */}
                  <div className="border border-outline-variant/80 rounded-xl p-4 bg-surface-container-low/50 space-y-3">
                    <h4 className="font-label-caps text-label-caps font-bold text-primary flex items-center gap-1.5 border-b border-outline-variant/60 pb-2">
                      <span className="material-symbols-outlined text-[18px]">account_tree</span>
                      ลำดับขั้นทางอนุกรมวิธาน (Taxonomic Hierarchy)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          อาณาจักร (KINGDOM)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={kingdom}
                          onChange={(e) => setKingdom(e.target.value)}
                          placeholder="Animalia"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ไฟลัม (PHYLUM)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={phylum}
                          onChange={(e) => setPhylum(e.target.value)}
                          placeholder="Arthropoda"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ชั้น (CLASS)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={classNameInput}
                          onChange={(e) => setClassNameInput(e.target.value)}
                          placeholder="Insecta"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          อันดับ (ORDER)
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          required
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          วงศ์ (FAMILY)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={family}
                          onChange={(e) => setFamily(e.target.value)}
                          placeholder="เช่น Scarabaeidae"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          สกุล (GENUS)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white italic outline-none"
                          value={genus}
                          onChange={(e) => setGenus(e.target.value)}
                          placeholder="เช่น Dynastes"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ชนิดพันธุ์ (SPECIES)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white italic outline-none"
                          value={species}
                          onChange={(e) => setSpecies(e.target.value)}
                          placeholder="เช่น Dynastes hercules"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Morphological Features Section */}
                  <div className="border border-outline-variant/80 rounded-xl p-4 bg-surface-container-low/50 space-y-3">
                    <h4 className="font-label-caps text-label-caps font-bold text-primary flex items-center gap-1.5 border-b border-outline-variant/60 pb-2">
                      <span className="material-symbols-outlined text-[18px]">bug_report</span>
                      ลักษณะทางสัณฐานวิทยา (Morphological Attributes)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ลักษณะปาก (พิมพ์เอง)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={mouthType}
                          onChange={(e) => setMouthType(e.target.value)}
                          placeholder="เช่น กัดกิน (Chewing), ดูดกิน"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ลักษณะปีก (พิมพ์เอง)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={wingType}
                          onChange={(e) => setWingType(e.target.value)}
                          placeholder="เช่น ปีกแข็ง (Elytra), ปีกเกล็ด"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ลักษณะขา (พิมพ์เอง)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={legType}
                          onChange={(e) => setLegType(e.target.value)}
                          placeholder="เช่น ขาเดิน, ขากระโดด, ขาจับเหยื่อ"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ลักษณะหนวด (พิมพ์เอง)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={antennaType}
                          onChange={(e) => setAntennaType(e.target.value)}
                          placeholder="เช่น หนวดแบบเส้นด้าย, หนวดแบบใบไม้"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Geographical Region & Origin Section */}
                  <div className="border border-outline-variant/80 rounded-xl p-4 bg-surface-container-low/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                      <h4 className="font-label-caps text-label-caps font-bold text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">map</span>
                        ข้อมูลภูมิภาคและแหล่งที่มา (Geographical Region & Origin)
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllRegions}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          เลือกทุกภาค
                        </button>
                        <span className="text-outline-variant">|</span>
                        <button
                          type="button"
                          onClick={clearAllRegions}
                          className="text-[11px] font-semibold text-error/80 hover:underline cursor-pointer"
                        >
                          ล้างค่า
                        </button>
                      </div>
                    </div>

                    {/* Multi-Region Chip Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase">
                          ภูมิภาคที่พบ (สามารถเลือกได้มากกว่า 1 ภูมิภาค โดยคลิกเลือก)
                        </label>
                        {region && (
                          <span className="text-[11px] text-primary font-bold">
                            เลือกแล้ว: {region.split(',').filter(Boolean).length} ภูมิภาค
                          </span>
                        )}
                      </div>
                      
                      {/* Region Badges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {AVAILABLE_REGIONS.map((reg) => {
                          const isSelected = isRegionSelected(reg.name);
                          return (
                            <button
                              key={reg.name}
                              type="button"
                              onClick={() => toggleRegion(reg.name)}
                              className={`px-2.5 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20'
                                  : 'bg-white text-secondary hover:bg-slate-50 border-outline-variant hover:border-primary/50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                {isSelected ? 'check_circle' : 'add_circle_outline'}
                              </span>
                              <span className="truncate">{reg.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Combined region preview & manual edit */}
                      <div className="mt-2.5 flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-outline-variant/60">
                        <span className="text-[11px] text-secondary font-medium whitespace-nowrap flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">sell</span>
                          ภูมิภาคที่เลือก:
                        </span>
                        <input
                          type="text"
                          className="flex-1 px-2.5 py-1 border border-outline-variant focus:border-primary rounded-md text-xs bg-white outline-none font-medium text-primary"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          placeholder="เลือกจากปุ่มด้านบน หรือพิมพ์เพิ่มเติมคั่นด้วยเครื่องหมายจุลภาค (,)"
                        />
                      </div>
                    </div>

                    {/* Province & Source */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          ชื่อจังหวัดที่พบ (พิมพ์เอง / ระบุหลายจังหวัดคั่นด้วยจุลภาค)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          placeholder="เช่น เชียงใหม่, น่าน, เชียงราย, ขอนแก่น"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-label-caps text-secondary font-bold uppercase mb-1">
                          แหล่งที่มาของข้อมูล (พิมพ์เอง)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg text-sm bg-white outline-none"
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          placeholder="เช่น สำรวจภาคสนาม, อุทยานแห่งชาติ, ONEP"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                      คำอธิบายลักษณะและการสังเกตการณ์
                    </label>
                    <textarea
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                      placeholder="ระบุพฤติกรรม สัณฐานวิทยา หรือพิกัดและบันทึกรายละเอียดของตัวอย่างสิ่งมีชีวิต..."
                      rows="4"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                      ที่อยู่ลิงก์รูปภาพตัวอย่างแมลง (URL)
                    </label>
                    <input
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background font-mono text-xs mb-4 transition-all"
                      placeholder="หรือ ระบุที่อยู่ลิงก์รูปภาพโดยตรง..."
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />

                    {/* Drag and Drop Upload Area */}
                    <div className="relative border-dashed border-2 border-outline-variant rounded-xl flex flex-col items-center justify-center p-6 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors mb-2">
                        upload_file
                      </span>
                      <p className="font-body-md text-secondary text-center">
                        {uploading ? 'กำลังส่งประมวลผลไฟล์...' : (
                          <>
                            คลิกที่นี่ หรือ ลากรูปภาพมาวางเพื่อ <span className="text-primary font-bold">เลือกอัปโหลดไฟล์รูป</span>
                          </>
                        )}
                      </p>
                      {uploadProgress && (
                        <p className="text-xs font-label-caps text-primary mt-2">{uploadProgress}</p>
                      )}
                    </div>

                    {imageUrl && (
                      <div className="mt-4 flex items-center gap-4 border border-outline-variant p-3 bg-background rounded-lg shadow-sm">
                        <div className="w-16 h-16 bg-surface-container overflow-hidden border border-outline-variant rounded-md shrink-0">
                          <img className="w-full h-full object-cover" src={imageUrl} alt="Preview" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <span className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block">รูปภาพตัวอย่างสิ่งมีชีวิต</span>
                          <p className="font-mono text-xs text-outline truncate">{imageUrl}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="material-symbols-outlined text-error hover:bg-error-container p-2 rounded-full cursor-pointer transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-outline text-on-surface font-body-md rounded-lg hover:bg-white transition-colors cursor-pointer"
                  onClick={handleModalClose}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="specimenForm"
                  className="px-5 py-2.5 text-on-primary font-body-md font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
                >
                  บันทึกข้อมูล
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

        {/* Modal 2: Category Modal Form Overlay rendered via React Portal */}
        {mounted && isCatModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="bg-white w-full max-w-lg border border-outline-variant rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ width: '100%', maxWidth: '512px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                <h2 className="font-headline-sm text-headline-sm font-semibold">
                  {catFormMode === 'add' ? 'บันทึกหมวดหมู่ใหม่' : 'แก้ไขข้อมูลหมวดหมู่'}
                </h2>
                <button
                  className="material-symbols-outlined text-secondary hover:bg-surface-container-high p-2 rounded-full cursor-pointer transition-colors"
                  onClick={handleCatModalClose}
                >
                  close
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form className="space-y-6" id="categoryForm" onSubmit={handleCatFormSubmit}>
                  <div>
                    <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                      ชื่อหมวดหมู่ (อันดับประเภทแมลง)
                    </label>
                    <input
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                      placeholder="เช่น Diptera (แมลงวันและยุง)"
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps mb-1.5 text-secondary uppercase font-bold">
                      คำอธิบายรายละเอียดหมวดหมู่
                    </label>
                    <textarea
                      className="w-full px-3 py-2.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none bg-background transition-all"
                      placeholder="ระบุลักษณะจำเพาะของอันดับทางกีฏวิทยานี้..."
                      rows="4"
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-outline text-on-surface font-body-md rounded-lg hover:bg-white transition-colors cursor-pointer"
                  onClick={handleCatModalClose}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="categoryForm"
                  className="px-5 py-2.5 text-on-primary font-body-md font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
                >
                  บันทึกข้อมูล
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

        {/* Modal 4: Admin Contact Modal Form Overlay rendered via React Portal */}
        {mounted && isContactModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="bg-white w-full max-w-lg border border-outline-variant rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh' }}>
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                <h2 className="font-headline-sm text-headline-sm font-semibold">
                  {contactFormMode === 'add' ? 'เพิ่มรายการติดต่อใหม่' : 'แก้ไขข้อมูลการติดต่อ'}
                </h2>
                <button
                  className="material-symbols-outlined text-secondary hover:bg-surface-container-high p-2 rounded-full cursor-pointer transition-colors"
                  onClick={() => setIsContactModalOpen(false)}
                >
                  close
                </button>
              </div>

              <form onSubmit={handleContactFormSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-caps font-label-caps text-secondary mb-1">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactFirstName}
                      onChange={(e) => setContactFirstName(e.target.value)}
                      placeholder="เช่น สมชาย"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-label-caps font-label-caps text-secondary mb-1">
                      นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactLastName}
                      onChange={(e) => setContactLastName(e.target.value)}
                      placeholder="เช่น สุขใจ"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-caps font-label-caps text-secondary mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-label-caps font-label-caps text-secondary mb-1">
                    ที่อยู่
                  </label>
                  <textarea
                    rows={2}
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="กรอกที่อยู่..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-label-caps font-label-caps text-secondary mb-1">
                    แสดงความคิดเห็น / ข้อความ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactComment}
                    onChange={(e) => setContactComment(e.target.value)}
                    placeholder="กรอกแสดงความคิดเห็น..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>

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
                    className="px-5 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-label-caps font-bold hover:shadow-md active:scale-95 transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
                  >
                    {contactFormMode === 'add' ? 'บันทึกรายการติดต่อ' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Modal 5: View Contact Comment Detail Overlay rendered via React Portal */}
        {mounted && isViewContactModalOpen && viewContactModalItem && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="bg-white w-full max-w-lg border border-outline-variant rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh' }}>
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm font-semibold">รายละเอียดข้อความ / ความคิดเห็น</h2>
                    <p className="text-[11px] font-body-sm text-secondary">รหัสรายการติดต่อ C-{viewContactModalItem.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="material-symbols-outlined text-secondary hover:bg-surface-container-high p-2 rounded-full cursor-pointer transition-colors"
                  onClick={() => setIsViewContactModalOpen(false)}
                >
                  close
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-outline-variant/60">
                  <div>
                    <p className="text-[11px] font-label-caps text-secondary uppercase tracking-wider">ชื่อ - นามสกุล</p>
                    <p className="font-body-md font-semibold text-on-surface mt-0.5">{viewContactModalItem.first_name} {viewContactModalItem.last_name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-label-caps text-secondary uppercase tracking-wider">เบอร์โทรศัพท์</p>
                    <p className="font-body-md font-medium text-on-surface mt-0.5">{viewContactModalItem.phone || 'ไม่ระบุ'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-label-caps text-secondary uppercase tracking-wider">ที่อยู่</p>
                    <p className="font-body-sm text-on-surface mt-0.5 whitespace-pre-wrap">{viewContactModalItem.address || 'ไม่ระบุ'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-label-caps text-secondary uppercase tracking-wider">วันที่ส่งข้อความ</p>
                    <p className="font-data-mono text-xs text-secondary mt-0.5">{new Date(viewContactModalItem.created_at).toLocaleString('th-TH')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-label-caps font-label-caps text-secondary mb-1.5 font-bold">
                    แสดงความคิดเห็น / ข้อความที่ส่งถึงผู้ดูแลระบบ:
                  </label>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-on-surface font-body-md leading-relaxed whitespace-pre-wrap">
                    {viewContactModalItem.comment}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-outline-variant/60 bg-surface flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsViewContactModalOpen(false)}
                  className="px-5 py-2 text-on-primary rounded-lg font-label-caps text-label-caps font-bold hover:shadow-md transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
        </div>
      }>
        <AdminDashboardContent />
      </Suspense>
      {/* Footer */}
      <footer className="w-full py-8 px-6 mt-auto bg-surface-container border-t border-outline-variant">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bug_report</span>
              <span className="font-label-caps text-label-caps text-primary">EntomoData Pro</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              © 2026 สมาคมกีฏวิทยาระหว่างประเทศ ข้อมูลวิจัยทางวิทยาศาสตร์ทั้งหมดได้รับการเผยแพร่ภายใต้สัญญาอนุญาตแบบเปิดเสรี
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <a className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>นโยบายคุ้มครองความเป็นส่วนตัว</a>
            <a className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>ข้อตกลงและเงื่อนไขการใช้บริการ</a>
            <a className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>แนวทางการจัดการคลังข้อมูล</a>
          </div>
        </div>
      </footer>
    </>
  );
}
