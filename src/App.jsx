import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Navigation,
  CheckCircle2,
  Train,
  Utensils,
  Camera,
  ShoppingBag,
  Bus,
  Clock,
  Coins,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
  Building,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Loader2,
  Globe,
  FolderPlus,
  Ticket,
  ExternalLink,
  FileText,
  DollarSign,
  CheckSquare,
  Upload,
  WifiOff,
  Download,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Share2,
  Copy,
  Eye,
  Edit3,
  Ban,
  Map
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- Preset Global Templates (ไม่ได้เก็บใน DB ใช้เป็นตัวเลือกตอนสร้างทริปใหม่เท่านั้น) ---
const PRESET_TEMPLATES = [
  {
    trip_id: "preset_tokyo_fuji",
    trip_name: "Japan (Tokyo & Fuji)",
    currency: "JPY",
    total_budget: 150000,
    is_template: true,
    days: [
      {
        day: 1,
        title: "Arrival & Tokyo Highlights",
        subtitle: "Asakusa, Skytree, Akihabara & Ameyoko",
        locations: [
          {
            id: "tokyo_d1_01",
            time: "09:30 - 10:30",
            start_point: "สนามบินนาริตะ (Terminal 1/2)",
            location_name: "สนามบินนาริตะ (Terminal 1/2)",
            transport_detail: "ผ่านด่าน ตม. รับกระเป๋า และไปที่เคาน์เตอร์ Keisei เพื่อแลกตั๋ว Skyliner",
            cost_info: "-",
            cost_amount: 0,
            category: "Transport",
            lat: 35.7647,
            lng: 140.3863,
            ticket_url: "https://www.keisei.co.jp/",
            attachment_note: "E-ticket อยู่ใน Gmail",
            map_url: ""
          },
          {
            id: "tokyo_d1_02",
            time: "10:40 - 11:21",
            start_point: "สนามบินนาริตะ",
            location_name: "สถานี Keisei-Ueno",
            transport_detail: "นั่งรถไฟด่วน Keisei Skyliner (41 นาที)",
            cost_info: "[ใช้ตั๋ว Skyliner ขาไป]",
            cost_amount: 2500,
            category: "Transit",
            lat: 35.7112,
            lng: 139.7745,
            ticket_url: "",
            attachment_note: "",
            map_url: ""
          }
        ]
      },
      {
        day: 2,
        title: "Classic Tokyo & Shopping",
        subtitle: "Tsukiji Market & Harajuku",
        locations: [
          {
            id: "tokyo_d2_01",
            time: "08:00 - 10:00",
            start_point: "สถานี Ueno",
            location_name: "ตลาดปลา Tsukiji Outer Market",
            transport_detail: "ทานไข่หวานย่าง ข้าวหน้าปลาดิบ และอาหารทะเลสดๆ",
            cost_info: "ค่ากิน: ~2,500 เยน",
            cost_amount: 2500,
            category: "Food",
            lat: 35.6654,
            lng: 139.7707,
            ticket_url: "",
            attachment_note: "",
            map_url: ""
          }
        ]
      }
    ]
  },
  {
    trip_id: "preset_hong_kong",
    trip_name: "Hong Kong Express (3 Days)",
    currency: "HKD",
    total_budget: 5000,
    is_template: true,
    days: [
      {
        day: 1,
        title: "Kowloon & Victoria Harbour",
        subtitle: "Tsim Sha Tsui, Star Ferry, Peak Tram",
        locations: [
          {
            id: "hk_d1_01",
            time: "10:00 - 12:00",
            start_point: "HKIA Airport",
            location_name: "Tsim Sha Tsui (TST)",
            transport_detail: "นั่ง Airport Express เข้าเมืองลงสถานี Kowloon",
            cost_info: "MTR / Octopus Card",
            cost_amount: 105,
            category: "Transport",
            lat: 22.2988,
            lng: 114.1722,
            ticket_url: "",
            attachment_note: "",
            map_url: ""
          }
        ]
      }
    ]
  }
];

const CATEGORY_MAP = {
  Sightseeing: { label: "ท่องเที่ยว", color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800", icon: Camera },
  Food: { label: "อาหาร/กิน", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800", icon: Utensils },
  Transit: { label: "ต่อรถไฟ", color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800", icon: Train },
  Transport: { label: "เดินทางหลัก", color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800", icon: Bus },
  Hotel: { label: "โรงแรม", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800", icon: Building },
  Shopping: { label: "ช้อปปิ้ง", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800", icon: ShoppingBag }
};

const LOCAL_STORAGE_KEY = 'japan_travel_planner_store_v10';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// UUID เสมอ (แม้ browser เก่าไม่มี crypto.randomUUID) — Postgres uuid column ต้องการ format นี้เท่านั้น
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// แปลงแถวจาก Supabase (snake_case) ให้เป็น shape ที่ UI ใช้ (camelCase)
const rowToTrip = (row) => ({
  trip_id: row.id,
  trip_name: row.trip_name,
  currency: row.currency || 'THB',
  total_budget: row.total_budget || 0,
  is_template: !!row.is_template,
  days: row.days || [],
  checkedState: row.checked_state || {},
  share_token: row.share_token || null,
  share_permission: row.share_permission || 'view',
  updated_at: row.updated_at
});

// แปลง trip object ของ UI กลับเป็นแถวสำหรับ upsert เข้า Supabase
const tripToRow = (trip, ownerId) => ({
  id: trip.trip_id,
  owner_id: ownerId,
  trip_name: trip.trip_name,
  currency: trip.currency || 'THB',
  total_budget: trip.total_budget || 0,
  is_template: !!trip.is_template,
  days: trip.days || [],
  checked_state: trip.checkedState || {},
  share_token: trip.share_token || null,
  share_permission: trip.share_permission || 'view',
  updated_at: new Date().toISOString()
});

/**
 * ย้ายข้อมูลทริปที่สร้างไว้ตอนเป็น Guest (localStorage) เข้าบัญชีจริงบน Supabase
 * รันครั้งเดียวต่อ user (เช็ค flag กันซ้ำ) และปลอดภัยจาก retry ถ้าเน็ตหลุดระหว่างทำ
 */
const mergeGuestDataOnLogin = async (user) => {
  const migratedFlagKey = `travel_planner_migrated_${user.id}`;
  if (localStorage.getItem(migratedFlagKey)) return;

  let guestData = null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) guestData = JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse guest data for migration', e);
  }

  if (!guestData || !Array.isArray(guestData.trips) || guestData.trips.length === 0) {
    localStorage.setItem(migratedFlagKey, '1');
    return;
  }

  const tripsToMigrate = guestData.trips.filter(
    (t) => !(t.is_template && t.trip_id?.startsWith('preset_'))
  );

  if (tripsToMigrate.length === 0) {
    localStorage.setItem(migratedFlagKey, '1');
    return;
  }

  // กันข้อมูลซ้อน: ถ้า user เคย login เครื่องอื่นมาก่อนแล้วมีทริปบน cloud อยู่แล้ว ไม่ migrate ทับ
  const { data: existingTrips, error: fetchErr } = await supabase
    .from('trips')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  if (fetchErr) {
    console.error('Check existing trips failed, will retry migration next login:', fetchErr);
    return; // ไม่ set flag -> ลองใหม่ตอน login ครั้งหน้า
  }

  if (existingTrips && existingTrips.length > 0) {
    localStorage.setItem(migratedFlagKey, '1');
    return;
  }

  const rowsToInsert = tripsToMigrate.map((t) => ({
    id: UUID_REGEX.test(t.trip_id) ? t.trip_id : generateUUID(),
    owner_id: user.id,
    trip_name: t.trip_name,
    currency: t.currency || 'THB',
    total_budget: t.total_budget || 0,
    is_template: !!t.is_template,
    days: t.days || [],
    checked_state: t.checkedState || {},
    updated_at: new Date().toISOString()
  }));

  const { error: insertErr } = await supabase.from('trips').insert(rowsToInsert);

  if (insertErr) {
    console.error('Migrate guest trips failed, will retry next login:', insertErr);
    return; // ไม่ set flag -> ลองใหม่รอบหน้า
  }

  localStorage.setItem(migratedFlagKey, '1');
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  console.log(`Migrated ${rowsToInsert.length} guest trip(s) into account.`);
};

// อ่าน share token จาก URL แบบ /shared/:token
const getShareTokenFromUrl = () => {
  const match = window.location.pathname.match(/\/shared\/([0-9a-f-]{36})/i);
  return match ? match[1] : null;
};

export default function App() {
  const [tripsList, setTripsList] = useState([]);
  const [activeTripId, setActiveTripId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Auth States
  const [sessionUser, setSessionUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');

  // Shared-link mode (คนเปิดผ่านลิงก์แชร์ ไม่จำเป็นต้อง login)
  const [sharedToken] = useState(getShareTokenFromUrl());
  const [sharedTripMode, setSharedTripMode] = useState(false);
  const [sharedTripError, setSharedTripError] = useState('');

  // UI Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingLocData, setEditingLocData] = useState(null);
  const [targetDayNum, setTargetDayNum] = useState(1);
  const [shareCopyLabel, setShareCopyLabel] = useState('คัดลอกลิงก์');
  const [newTripNameInput, setNewTripNameInput] = useState('');

  // Storage states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedTicketUrl, setUploadedTicketUrl] = useState('');
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState([]);
  const [resolvingMapUrl, setResolvingMapUrl] = useState(false);

  // PWA & Network Status States
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const saveTimeoutRef = useRef(null);
  const latestTripRef = useRef(null);
  const sessionUserRef = useRef(null); // ให้ closure ใน setTimeout เห็น user ล่าสุดเสมอ

  useEffect(() => {
    sessionUserRef.current = sessionUser;
  }, [sessionUser]);

  const deleteFileFromStorage = async (fileUrl) => {
    if (!fileUrl || !fileUrl.includes('trip-attachments')) return;
    try {
      const urlParts = fileUrl.split('/trip-attachments/');
      if (urlParts[1]) {
        const filePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('trip-attachments').remove([filePath]);
      }
    } catch (err) {
      console.warn("ลบไฟล์ขยะจาก Storage ไม่สำเร็จ:", err);
    }
  };

  // ============ บันทึกข้อมูลขึ้น Cloud (แยก 2 เส้นทาง: เจ้าของ / คนแก้ผ่านลิงก์แชร์) ============
  const pushTripToCloud = async (trip) => {
    if (!navigator.onLine) {
      setSaving(false);
      return;
    }

    try {
      setSaving(true);

      if (sharedTripMode) {
        if (trip.share_permission !== 'edit') return; // viewer ห้ามเขียน
        await supabase.rpc('update_trip_by_share_token', {
          token: sharedToken,
          new_days: trip.days,
          new_checked_state: trip.checkedState,
          new_total_budget: trip.total_budget,
          new_currency: trip.currency,
          new_trip_name: trip.trip_name
        });
      } else if (sessionUserRef.current) {
        await supabase
          .from('trips')
          .upsert(tripToRow(trip, sessionUserRef.current.id), { onConflict: 'id' });
      }
      // โหมด Guest ไม่ต้องทำอะไรเพิ่ม (บันทึกลง localStorage ไปแล้วตอน persistTrip)
    } catch (err) {
      console.error('Cloud push failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const persistLocalStorage = (list, activeId) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ trips: list, activeTripId: activeId, updated_at: Date.now() })
      );
    } catch (e) {
      console.error('Failed to save to LocalStorage', e);
    }
  };

  // ฟังก์ชันกลางสำหรับบันทึกทริปที่แก้ไข (ใช้แทนทั้ง saveAllToStore และ updateCurrentTripData เดิม)
  const persistTrip = (updatedTrip, newActiveId = null) => {
    setTripsList((prev) => {
      const exists = prev.some((t) => t.trip_id === updatedTrip.trip_id);
      const next = exists
        ? prev.map((t) => (t.trip_id === updatedTrip.trip_id ? updatedTrip : t))
        : [...prev, updatedTrip];

      const targetActiveId = newActiveId || activeTripId || updatedTrip.trip_id;
      if (!sharedTripMode) {
        persistLocalStorage(next, targetActiveId);
      }
      return next;
    });

    if (newActiveId) setActiveTripId(newActiveId);

    latestTripRef.current = updatedTrip;
    setSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      pushTripToCloud(updatedTrip);
    }, 1500);
  };

  // ลบทริปออกจาก DB จริง (เฉพาะโหมดเจ้าของ, ไม่ใช่ shared link)
  const deleteTripFromCloud = async (tripId) => {
    if (sharedTripMode || !sessionUserRef.current) return;
    try {
      await supabase.from('trips').delete().eq('id', tripId).eq('owner_id', sessionUserRef.current.id);
    } catch (err) {
      console.error('Delete trip from cloud failed:', err);
    }
  };

  // ============ Init: โหลดข้อมูลตอนเปิดแอป (3 โหมด: Shared link / Logged-in / Guest) ============
  const setupDefaultStarterTrip = () => {
    const starterTrip = {
      ...PRESET_TEMPLATES[0],
      trip_id: generateUUID(),
      trip_name: `${PRESET_TEMPLATES[0].trip_name} (My Trip)`,
      is_template: false,
      total_budget: 100000,
      checkedState: {},
      days: PRESET_TEMPLATES[0].days.map((day) => ({
        ...day,
        locations: (day.locations || []).map((loc) => ({ ...loc, id: generateUUID() }))
      }))
    };

    setTripsList([starterTrip]);
    setActiveTripId(starterTrip.trip_id);
    latestTripRef.current = starterTrip;
    persistLocalStorage([starterTrip], starterTrip.trip_id);
    if (sessionUserRef.current) pushTripToCloud(starterTrip);
  };

  // ดึงข้อมูลจาก localStorage มาโชว์ทันที ก่อนเช็ค auth/network ใดๆ
  // กันหน้าจอว่างตอนออฟไลน์จริง หรือเน็ตช้า/ไม่เสถียร
  const hydrateFromLocalCache = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const localData = JSON.parse(saved);
        if (localData && Array.isArray(localData.trips) && localData.trips.length > 0) {
          setTripsList(localData.trips);
          setActiveTripId(localData.activeTripId || localData.trips[0]?.trip_id || '');
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to hydrate from local cache', e);
    }
    return false;
  };

  const loadSharedTrip = async () => {
    setLoading(true);
    setSharedTripError('');
    try {
      const { data, error } = await supabase.rpc('get_trip_by_share_token', { token: sharedToken });
      if (error || !data || data.length === 0) {
        setSharedTripError('ลิงก์นี้ไม่ถูกต้องหรือถูกยกเลิกการแชร์ไปแล้ว');
        setLoading(false);
        return;
      }
      const trip = rowToTrip(data[0]);
      setSharedTripMode(true);
      setTripsList([trip]);
      setActiveTripId(trip.trip_id);
    } catch (err) {
      console.error('Load shared trip failed:', err);
      setSharedTripError('ไม่สามารถโหลดทริปที่แชร์ได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const loadOwnedTrips = async (user, alreadyHydrated = false) => {
    if (!alreadyHydrated) setLoading(true);

    if (!navigator.onLine) {
      // ไม่มีเน็ตจริง -> ใช้ข้อมูลจาก cache (ถ้ามี, ดึงมาแล้วตอน hydrateFromLocalCache) ต่อไปเลย
      setLoading(false);
      return;
    }

    await mergeGuestDataOnLogin(user);

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const trips = data.map(rowToTrip);
        const realTrips = trips.filter((t) => !t.is_template);
        const fallbackId = realTrips.length > 0 ? realTrips[0].trip_id : trips[0]?.trip_id || '';
        setTripsList(trips);
        setActiveTripId(fallbackId);
        persistLocalStorage(trips, fallbackId);
      } else if (!alreadyHydrated) {
        setupDefaultStarterTrip();
      }
    } catch (err) {
      // navigator.onLine บอกว่าออนไลน์ แต่ request จริงล้มเหลว (เช่น DevTools Offline throttle
      // หรือเน็ตหลุดกลางทาง) -> ไม่ล้างข้อมูลที่ hydrate จาก cache ไว้แล้ว ปล่อยให้ user เห็นข้อมูลเดิมต่อไป
      console.warn('Could not load trips from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuestTrips = () => {
    setLoading(true);
    let localData = null;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) localData = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse local storage', e);
    }

    if (localData && Array.isArray(localData.trips) && localData.trips.length > 0) {
      setTripsList(localData.trips);
      setActiveTripId(localData.activeTripId || localData.trips[0]?.trip_id || '');
      latestTripRef.current = null;
      setLoading(false);
    } else {
      setupDefaultStarterTrip();
      setLoading(false);
    }
  };

  useEffect(() => {
    // โหมดลิงก์แชร์: ตัดผ่าน auth ทั้งหมด โหลดเฉพาะทริปนั้นแล้วจบ
    if (sharedToken) {
      loadSharedTrip();
      // ยังตรวจ session ไว้เผื่อ user เป็นเจ้าของทริปเอง (โชว์ badge ได้ในอนาคต) แต่ไม่ block การโหลด
      return;
    }

    // แสดงข้อมูลจาก cache ทันทีก่อนเช็ค auth/network ใดๆ กันหน้าจอว่างตอนออฟไลน์/เน็ตช้า
    const hasCache = hydrateFromLocalCache();
    if (hasCache) setLoading(false);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setSessionUser(currentUser);
      if (currentUser) loadOwnedTrips(currentUser, hasCache);
      else if (!hasCache) loadGuestTrips();
      else setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setSessionUser(currentUser);
      if (currentUser) loadOwnedTrips(currentUser, true);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (latestTripRef.current) pushTripToCloud(latestTripRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthInfo('');

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setIsAuthModalOpen(false);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;

        if (data.session) {
          // โปรเจกต์ปิด email confirmation ไว้ -> ล็อกอินให้เลยทันที
          setIsAuthModalOpen(false);
        } else {
          // ต้องยืนยันอีเมลก่อน
          setAuthInfo('สมัครสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ');
        }
      }
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) return;

    // flush การแก้ไขที่ค้างอยู่ก่อนออกจากระบบ กันข้อมูลหาย
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      if (latestTripRef.current) {
        await pushTripToCloud(latestTripRef.current);
      }
    }

    await supabase.auth.signOut();
    setSessionUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setTripsList([]);
    setActiveTripId('');
    loadGuestTrips();
  };

  const currentTrip = useMemo(() => {
    const realTrips = (tripsList || []).filter((t) => !t.is_template);
    if (realTrips.length === 0) return null;
    const matched = realTrips.find((t) => t.trip_id === activeTripId);
    return matched || realTrips[0];
  }, [tripsList, activeTripId]);

  useEffect(() => {
    if (currentTrip && currentTrip.trip_id !== activeTripId) {
      setActiveTripId(currentTrip.trip_id);
    }
  }, [currentTrip, activeTripId]);

  const handleSelectTrip = (tripId) => {
    setActiveTripId(tripId);
    setActiveDay('all');
    persistLocalStorage(tripsList, tripId);
  };

  const updateCurrentTripData = (updatedTrip) => {
    persistTrip(updatedTrip, updatedTrip.trip_id);
  };

  // ============ Share Link ============
  const handleGenerateShareLink = async (permission) => {
    if (!currentTrip || !sessionUser) return;
    const token = currentTrip.share_token || generateUUID();
    const updatedTrip = { ...currentTrip, share_token: token, share_permission: permission };
    updateCurrentTripData(updatedTrip);
  };

  const handleRevokeShareLink = () => {
    if (!currentTrip) return;
    if (!window.confirm('ยกเลิกลิงก์แชร์นี้ใช่หรือไม่? ลิงก์เดิมจะใช้งานไม่ได้อีก')) return;
    updateCurrentTripData({ ...currentTrip, share_token: null });
  };

  const handleCopyShareLink = async () => {
    if (!currentTrip?.share_token) return;
    const url = `${window.location.origin}/shared/${currentTrip.share_token}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopyLabel('คัดลอกแล้ว ✓');
      setTimeout(() => setShareCopyLabel('คัดลอกลิงก์'), 2000);
    } catch {
      window.prompt('คัดลอกลิงก์นี้:', url);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    try {
      setUploadingFile(true);

      const targetTripId = currentTrip?.trip_id || activeTripId;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${targetTripId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('trip-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('trip-attachments').getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        if (uploadedTicketUrl && uploadedTicketUrl !== editingLocData?.ticket_url) {
          await deleteFileFromStorage(uploadedTicketUrl);
        }
        const newUrl = publicUrlData.publicUrl;
        setUploadedTicketUrl(newUrl);
        setNewlyUploadedUrls((prev) => [...prev, newUrl]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`อัปโหลดไฟล์ไม่สำเร็จ: ${error.message || 'โปรดตรวจสอบสิทธิ์ Supabase Storage'}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCloseModal = async () => {
    if (newlyUploadedUrls.length > 0) {
      for (const url of newlyUploadedUrls) {
        if (url !== editingLocData?.ticket_url) {
          await deleteFileFromStorage(url);
        }
      }
    }
    setNewlyUploadedUrls([]);
    setUploadedTicketUrl('');
    setIsModalOpen(false);
  };

  const handleCreateBlankTrip = () => {
    const finalName = newTripNameInput.trim() || 'ทริปใหม่ของฉัน';
    const newTrip = {
      trip_id: generateUUID(),
      trip_name: finalName,
      currency: 'THB',
      total_budget: 0,
      is_template: false,
      checkedState: {},
      days: [{ day: 1, title: 'Day 1', subtitle: 'เริ่มต้นการเดินทาง', locations: [] }]
    };
    setActiveDay('all');
    setIsTemplateModalOpen(false);
    setNewTripNameInput('');
    persistTrip(newTrip, newTrip.trip_id);
  };

  const handleCreateNewTripFromTemplate = (templateObj) => {
    const clonedDays = (templateObj.days || []).map((day) => ({
      ...day,
      locations: (day.locations || []).map((loc) => ({ ...loc, id: generateUUID() }))
    }));

    const newTrip = {
      ...templateObj,
      trip_id: generateUUID(),
      trip_name: `${templateObj.trip_name.replace(/^\[Template\]\s*/, '')} (My Trip)`,
      is_template: false,
      checkedState: {},
      days: clonedDays
    };

    setActiveDay('all');
    setIsTemplateModalOpen(false);
    persistTrip(newTrip, newTrip.trip_id);
  };

  const handleSaveAsPersonalTemplate = () => {
    if (!currentTrip) return;

    const baseName = currentTrip.trip_name.replace(/^\[Template\]\s*/, '');
    const templateName = `[Template] ${baseName}`;
    const existing = tripsList.find((t) => t.is_template && t.trip_name === templateName);

    const clonedDays = (currentTrip.days || []).map((day) => ({
      ...day,
      locations: (day.locations || []).map((loc) => ({ ...loc }))
    }));

    if (existing) {
      if (!window.confirm(`มีแม่แบบ "${templateName}" อยู่แล้ว คุณต้องการบันทึกทับแม่แบบเดิมหรือไม่?`)) return;
      persistTrip({ ...existing, days: clonedDays, currency: currentTrip.currency, total_budget: currentTrip.total_budget });
    } else {
      const newTemplate = {
        ...currentTrip,
        trip_id: generateUUID(),
        trip_name: templateName,
        is_template: true,
        share_token: null,
        checkedState: {},
        days: clonedDays
      };
      persistTrip(newTemplate);
    }
    alert(`บันทึกแม่แบบ "${templateName}" เรียบร้อยแล้ว!`);
  };

  const handleDeleteCurrentTrip = () => {
    if (!currentTrip) return;

    const realTrips = tripsList.filter((t) => !t.is_template);
    if (realTrips.length <= 1) {
      alert('ไม่สามารถลบทริปสุดท้ายได้ ต้องมีอย่างน้อย 1 ทริป');
      return;
    }

    if (!window.confirm(`คุณต้องการลบทริป "${currentTrip.trip_name}" ใช่หรือไม่?`)) return;

    const targetTripId = currentTrip.trip_id;
    (currentTrip.days || []).forEach((day) => {
      (day.locations || []).forEach((loc) => {
        if (loc.ticket_url) deleteFileFromStorage(loc.ticket_url);
      });
    });

    deleteTripFromCloud(targetTripId);

    const remaining = tripsList.filter((t) => t.trip_id !== targetTripId);
    const nextRealTrip = remaining.find((t) => !t.is_template);
    const nextActiveId = nextRealTrip ? nextRealTrip.trip_id : remaining[0]?.trip_id || '';

    setTripsList(remaining);
    setActiveTripId(nextActiveId);
    if (!sharedTripMode) persistLocalStorage(remaining, nextActiveId);
  };

  const handleAddNewDay = () => {
    if (!currentTrip) return;
    const currentDays = currentTrip.days || [];
    const newDayNum = currentDays.length > 0 ? Math.max(...currentDays.map((d) => d.day)) + 1 : 1;
    const newDayObj = { day: newDayNum, title: `Day ${newDayNum}`, subtitle: 'กิจกรรมประจำวัน', locations: [] };
    updateCurrentTripData({ ...currentTrip, days: [...currentDays, newDayObj] });
    setActiveDay(newDayNum);
  };

  const handleDeleteDay = (dayNum) => {
    if (!currentTrip) return;
    if (currentTrip.days.length <= 1) {
      alert('ทริปต้องมีอย่างน้อย 1 วัน ไม่สามารถลบวันสุดท้ายได้');
      return;
    }

    if (!window.confirm(`คุณต้องการลบ Day ${dayNum} และสถานที่ทั้งหมดในวันนี้ใช่หรือไม่?`)) return;

    const dayToDelete = currentTrip.days.find((d) => d.day === dayNum);
    const deletedLocs = dayToDelete?.locations || [];
    deletedLocs.forEach((loc) => {
      if (loc.ticket_url) deleteFileFromStorage(loc.ticket_url);
    });

    const remainingDays = currentTrip.days
      .filter((d) => d.day !== dayNum)
      .map((d, index) => ({ ...d, day: index + 1 }));

    const cleanedChecked = { ...currentTrip.checkedState };
    deletedLocs.forEach((loc) => {
      delete cleanedChecked[loc.id];
    });

    updateCurrentTripData({ ...currentTrip, days: remainingDays, checkedState: cleanedChecked });

    if (activeDay === dayNum) setActiveDay('all');
    else if (activeDay !== 'all' && activeDay > dayNum) setActiveDay(activeDay - 1);
  };

  const handleToggleCheck = (locId) => {
    if (!currentTrip || (sharedTripMode && currentTrip.share_permission !== 'edit')) return;
    const updated = { ...currentTrip.checkedState, [locId]: !currentTrip.checkedState?.[locId] };
    updateCurrentTripData({ ...currentTrip, checkedState: updated });
  };

  const saveLocationData = (dayNum, locationData) => {
    if (!currentTrip) return;

    if (editingLocData?.ticket_url && locationData.ticket_url !== editingLocData.ticket_url) {
      deleteFileFromStorage(editingLocData.ticket_url);
    }

    const updatedDays = (currentTrip.days || []).map((day) => {
      if (day.day !== dayNum) return day;
      const currentLocations = day.locations || [];
      const newLocations = locationData.id
        ? currentLocations.map((l) => (l.id === locationData.id ? { ...locationData } : l))
        : [...currentLocations, { ...locationData, id: generateUUID() }];
      return { ...day, locations: newLocations };
    });

    updateCurrentTripData({ ...currentTrip, days: updatedDays });
    setNewlyUploadedUrls([]);
    setIsModalOpen(false);
  };

  const deleteLocationData = (dayNum, locationId) => {
    if (!currentTrip) return;

    const dayObj = currentTrip.days?.find((d) => d.day === dayNum);
    const locToDelete = dayObj?.locations?.find((l) => l.id === locationId);
    if (locToDelete?.ticket_url) deleteFileFromStorage(locToDelete.ticket_url);

    const updatedDays = (currentTrip.days || []).map((day) => {
      if (day.day !== dayNum) return day;
      return { ...day, locations: (day.locations || []).filter((l) => l.id !== locationId) };
    });

    const cleanedChecked = { ...currentTrip.checkedState };
    delete cleanedChecked[locationId];

    updateCurrentTripData({ ...currentTrip, days: updatedDays, checkedState: cleanedChecked });
    setNewlyUploadedUrls([]);
    setIsModalOpen(false);
  };

  const moveLocationReal = (dayNum, targetLocId, direction) => {
    if (!currentTrip) return;

    const updatedDays = (currentTrip.days || []).map((day) => {
      if (day.day !== dayNum) return day;
      const locs = [...(day.locations || [])];
      const realIndex = locs.findIndex((l) => l.id === targetLocId);
      if (realIndex === -1) return day;

      if (direction === 'up' && realIndex > 0) {
        [locs[realIndex - 1], locs[realIndex]] = [locs[realIndex], locs[realIndex - 1]];
      } else if (direction === 'down' && realIndex < locs.length - 1) {
        [locs[realIndex + 1], locs[realIndex]] = [locs[realIndex], locs[realIndex + 1]];
      }
      return { ...day, locations: locs };
    });

    updateCurrentTripData({ ...currentTrip, days: updatedDays });
  };

  // เช็คว่าเป็นลิงก์แชร์แบบย่อของ Google Maps ไหม (ดึงพิกัดจากตัว URL ตรงๆ ไม่ได้ ต้อง resolve ก่อน)
  const isShortMapLink = (url) => {
    if (!url) return false;
    return /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(url.trim());
  };

  // เรียก serverless function ให้ตามลิงก์ย่อไปหาพิกัดแทน (เลี่ยงข้อจำกัด CORS ฝั่งเบราว์เซอร์)
  const resolveMapUrlToCoords = async (url) => {
    try {
      const res = await fetch(`/api/resolve-map-link?url=${encodeURIComponent(url)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        return { lat: data.lat, lng: data.lng };
      }
      return null;
    } catch (err) {
      console.warn('Resolve map link failed:', err);
      return null;
    }
  };

  // ดึงพิกัดจากลิงก์ Google Maps ที่ user แปะไว้ในช่อง "ลิงก์ Google Maps"
  // รองรับเฉพาะลิงก์เต็มที่มีพิกัดอยู่ใน URL ตรงๆ เท่านั้น (ลิงก์แชร์แบบย่อ maps.app.goo.gl ดึงไม่ได้ ต้องผ่าน resolveMapUrlToCoords ตอนบันทึกแทน)
  const extractLatLngFromMapUrl = (url) => {
    if (!url) return null;
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // .../@35.714,139.796,17z
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // พารามิเตอร์พิกัดภายในของ Google
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=35.714,139.796
      /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?query=35.714,139.796
      /[?&]destination=(-?\d+\.\d+),(-?\d+\.\d+)/ // ?destination=35.714,139.796
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }
    return null;
  };

  // สร้างลิงก์ Google Maps เส้นทางทั้งวัน (ต้นทาง -> จุดแวะ -> ปลายทาง)
  // ลำดับความแม่นยำ: 1) พิกัดที่ดึงจากลิงก์ Google Maps ที่ user แปะไว้ 2) พิกัดจากข้อมูล preset (lat/lng) 3) ชื่อสถานที่
  const buildDayRouteUrl = (dayData, tripName) => {
    const locs = (dayData.locations || []).filter((l) => l.location_name);
    if (locs.length === 0) return null;

    const toPoint = (loc) => {
      const fromMapUrl = extractLatLngFromMapUrl(loc.map_url);
      if (fromMapUrl) return `${fromMapUrl.lat},${fromMapUrl.lng}`;

      const hasCoords =
        typeof loc.lat === 'number' &&
        typeof loc.lng === 'number' &&
        !(loc.lat === 0 && loc.lng === 0);
      if (hasCoords) return `${loc.lat},${loc.lng}`;

      return encodeURIComponent(`${loc.location_name} ${tripName || ''}`.trim());
    };

    if (locs.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${toPoint(locs[0])}`;
    }

    // Google Maps รองรับจุดแวะผ่าน URL ได้จำกัด (~9 จุด) ตัดถ้าเกินกันลิงก์พัง
    const capped = locs.slice(0, 10);
    const origin = toPoint(capped[0]);
    const destination = toPoint(capped[capped.length - 1]);
    const waypoints = capped.slice(1, -1).map(toPoint).join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    return url;
  };

  const getFilteredLocations = (locations) => {
    if (!locations) return [];
    return locations.filter((loc) => {
      const matchesCategory = categoryFilter === 'ALL' || loc.category === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        (loc.location_name && loc.location_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (loc.transport_detail && loc.transport_detail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (loc.start_point && loc.start_point.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  };

  const totalCostAmount = useMemo(() => {
    if (!currentTrip?.days) return 0;
    return currentTrip.days.reduce(
      (accDay, d) => accDay + (d.locations || []).reduce((accLoc, loc) => accLoc + (Number(loc.cost_amount) || 0), 0),
      0
    );
  }, [currentTrip]);

  const checklistProgress = useMemo(() => {
    if (!currentTrip?.days) return { completed: 0, total: 0 };
    let targetLocations = [];
    if (activeDay === 'all') {
      currentTrip.days.forEach((d) => targetLocations.push(...(d.locations || [])));
    } else {
      const dayObj = currentTrip.days.find((d) => d.day === activeDay);
      if (dayObj) targetLocations = dayObj.locations || [];
    }
    const total = targetLocations.length;
    const completed = targetLocations.filter((loc) => !!currentTrip.checkedState?.[loc.id]).length;
    return { completed, total };
  }, [currentTrip, activeDay]);

  const remainingBudget = (currentTrip?.total_budget || 0) - totalCostAmount;
  const budgetPercentage =
    currentTrip?.total_budget > 0 ? Math.min(Math.round((totalCostAmount / currentTrip.total_budget) * 100), 100) : 0;

  const isReadOnly = sharedTripMode && currentTrip?.share_permission !== 'edit';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
        <p className="text-slate-400 text-sm">กำลังเชื่อมต่อคลังทริปท่องเที่ยว...</p>
      </div>
    );
  }

  if (sharedToken && sharedTripError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans text-center gap-3">
        <Ban className="w-10 h-10 text-rose-500" />
        <p className="text-slate-300 text-sm">{sharedTripError}</p>
        <a href="/" className="text-rose-400 text-xs underline">กลับไปหน้าแรก</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-16">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900/95 shadow-2xl relative border-x border-slate-200 dark:border-slate-800">

        {/* Shared-link mode banner */}
        {sharedTripMode && (
          <div className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 sticky top-0 z-40 shadow-md ${isReadOnly ? 'bg-sky-700 text-white' : 'bg-emerald-700 text-white'}`}>
            {isReadOnly ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>กำลังดูทริปที่ถูกแชร์ ({isReadOnly ? 'ดูอย่างเดียว' : 'แก้ไขได้'})</span>
          </div>
        )}

        {/* User Auth Status Bar (ซ่อนตอนอยู่ในโหมด shared link) */}
        {!sharedTripMode && (
          <div className="bg-slate-900 text-slate-300 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
            {sessionUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate text-slate-200 font-medium">{sessionUser.email}</span>
                </div>
                <button onClick={handleSignOut} className="text-slate-400 hover:text-rose-400 flex items-center gap-1 ml-2 shrink-0 transition-colors" title="ออกจากระบบ">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออก</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-400 text-[11px]">โหมด Guest (บันทึกเฉพาะในเครื่อง)</span>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthInfo('');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ / สมัคร</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-40 shadow-md">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              <span>โหมดออฟไลน์: กำลังใช้งานจากข้อมูลในเครื่อง</span>
            </div>
            <button onClick={() => setIsOffline(false)} className="text-amber-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="bg-rose-950/90 border-b border-rose-800/80 px-3 py-2 text-white flex items-center justify-between gap-2 text-xs sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>ติดตั้งแอปนี้ลงบนหน้าจอมือถือของคุณ</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleInstallPWA} className="bg-rose-500 hover:bg-rose-600 px-2.5 py-1 rounded-md font-bold text-white transition-colors">
                ติดตั้ง
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Multi-Trips Selector Bar (ซ่อนตอนอยู่ใน shared link mode เพราะมีแค่ทริปเดียว) */}
        {!sharedTripMode && (
          <div className="bg-slate-950 text-white px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
              <Globe className="w-4 h-4 text-rose-400 shrink-0" />
              <select
                value={activeTripId}
                onChange={(e) => handleSelectTrip(e.target.value)}
                className="bg-slate-800 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-700 outline-none w-full truncate"
              >
                {tripsList.filter((t) => !t.is_template).map((t) => (
                  <option key={t.trip_id} value={t.trip_id}>{t.trip_name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setIsTemplateModalOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-2 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ ทริป</span>
              </button>
              <button onClick={handleDeleteCurrentTrip} className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors" title="ลบทริปนี้">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {!currentTrip ? (
          <div className="p-10 text-center text-slate-400 text-sm space-y-3">
            <p>ยังไม่มีทริป</p>
            <button onClick={() => setIsTemplateModalOpen(true)} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold">
              เริ่มสร้างทริปใหม่
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg border-b border-slate-800">
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-white flex items-center gap-1.5">{currentTrip?.trip_name}</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{currentTrip?.days?.length || 0} วัน</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      <CheckSquare className="w-3 h-3" />
                      {checklistProgress.completed} / {checklistProgress.total} สำเร็จ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!sharedTripMode && sessionUser && (
                    <button onClick={() => setIsShareModalOpen(true)} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1" title="แชร์ทริปนี้">
                      <Share2 className="w-3 h-3" /> แชร์
                    </button>
                  )}
                  {!sharedTripMode && (
                    <button onClick={handleSaveAsPersonalTemplate} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-rose-400 px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1" title="บันทึกทริปนี้เป็นแม่แบบส่วนตัว">
                      <Sparkles className="w-3 h-3" /> Template
                    </button>
                  )}
                  {saving && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/50 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  )}
                </div>
              </div>

              {/* Budget Overview Widget */}
              <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>ใช้ไป: <strong className="text-amber-400">{totalCostAmount.toLocaleString()}</strong> {currentTrip?.currency || 'THB'}</span>
                  </div>
                  <button onClick={() => !isReadOnly && setIsBudgetModalOpen(true)} className="text-[11px] text-slate-400 hover:text-white underline flex items-center gap-1" disabled={isReadOnly}>
                    <DollarSign className="w-3 h-3 text-rose-400" />
                    <span>งบ: {currentTrip?.total_budget ? currentTrip.total_budget.toLocaleString() : 'ยังไม่ตั้ง'}</span>
                  </button>
                </div>

                {currentTrip?.total_budget > 0 && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${remainingBudget < 0 ? 'bg-rose-500' : budgetPercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">คงเหลือ:</span>
                      <span className={`font-bold ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {remainingBudget.toLocaleString()} {currentTrip?.currency || 'THB'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Days Tabs + ปุ่มเพิ่มวัน */}
              <div className="px-2 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveDay('all')} className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap ${activeDay === 'all' ? 'bg-rose-500 text-white font-semibold' : 'bg-slate-800 text-slate-300'}`}>
                  ทั้งหมด
                </button>
                {(currentTrip?.days || []).map((d) => (
                  <button key={d.day} onClick={() => setActiveDay(d.day)} className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap ${activeDay === d.day ? 'bg-rose-500 text-white font-semibold' : 'bg-slate-800 text-slate-300'}`}>
                    Day {d.day}
                  </button>
                ))}
                {!isReadOnly && (
                  <button onClick={handleAddNewDay} className="px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold whitespace-nowrap bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition-colors flex items-center gap-1" title="เพิ่มวันใหม่">
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มวัน</span>
                  </button>
                )}
              </div>
            </header>

            {/* Main Content */}
            <main className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาสถานที่ หรือสายรถไฟ..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white">ล้าง</button>
                  )}
                </div>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <button onClick={() => setCategoryFilter('ALL')} className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${categoryFilter === 'ALL' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    ทั้งหมด
                  </button>
                  {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
                    const Icon = cat.icon;
                    return (
                      <button key={key} onClick={() => setCategoryFilter(categoryFilter === key ? 'ALL' : key)} className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 border ${categoryFilter === key ? 'bg-slate-700 text-white border-rose-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 flex items-center gap-1 px-1">
                <Map className="w-3 h-3 shrink-0" />
                <span>เส้นทางวันนี้จะแม่นยำขึ้นถ้าแปะ "ลิงก์ Google Maps" (แบบเต็ม ไม่ใช่ลิงก์แชร์ย่อ) ไว้ตอนเพิ่มสถานที่</span>
              </p>

              {(currentTrip?.days || [])
                .filter((d) => activeDay === 'all' || d.day === activeDay)
                .map((dayData) => {
                  const filteredLocs = getFilteredLocations(dayData.locations || []);
                  const totalLocs = dayData.locations?.length || 0;

                  return (
                    <div key={dayData.day} className="mb-6 space-y-3">
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-rose-400">Day {dayData.day}</span>
                          <h2 className="text-sm font-bold text-white truncate">{dayData.title}</h2>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(dayData.locations || []).length > 0 && (
                            <button
                              onClick={() => {
                                const url = buildDayRouteUrl(dayData, currentTrip?.trip_name);
                                if (url) window.open(url, '_blank', 'noopener,noreferrer');
                              }}
                              className="p-1.5 bg-slate-900 hover:bg-cyan-950 text-cyan-400 rounded-lg text-xs flex items-center gap-1 font-semibold transition-colors border border-cyan-800/40"
                              title="ดูเส้นทางทั้งวันใน Google Maps"
                            >
                              <Map className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">เส้นทางวันนี้</span>
                            </button>
                          )}
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => {
                                  setTargetDayNum(dayData.day);
                                  setEditingLocData(null);
                                  setUploadedTicketUrl('');
                                  setNewlyUploadedUrls([]);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs flex items-center gap-1 font-semibold transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> เพิ่มสถานที่
                              </button>
                              <button onClick={() => handleDeleteDay(dayData.day)} className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition-colors" title={`ลบ Day ${dayData.day}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {filteredLocs.length === 0 ? (
                        <div className="text-center py-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                          ยังไม่มีสถานที่ในวันนี้
                        </div>
                      ) : (
                        filteredLocs.map((loc) => {
                          const isChecked = !!currentTrip.checkedState?.[loc.id];
                          const realIndex = (dayData.locations || []).findIndex((l) => l.id === loc.id);

                          return (
                            <div key={loc.id} className={`p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 transition-all ${isChecked ? 'opacity-50' : 'opacity-100'}`}>
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleToggleCheck(loc.id)} className="text-slate-400 hover:text-emerald-400">
                                    <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'text-emerald-400' : ''}`} />
                                  </button>
                                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-rose-400" /> {loc.time}
                                  </span>
                                </div>
                                {!isReadOnly && (
                                  <button
                                    onClick={() => {
                                      setTargetDayNum(dayData.day);
                                      setEditingLocData(loc);
                                      setUploadedTicketUrl(loc.ticket_url || '');
                                      setNewlyUploadedUrls([]);
                                      setIsModalOpen(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-white"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <h3 className={`text-sm font-bold text-white ${isChecked ? 'line-through text-slate-500' : ''}`}>{loc.location_name}</h3>

                              {loc.start_point && loc.start_point !== loc.location_name && (
                                <p className="text-xs text-slate-400">จาก: {loc.start_point}</p>
                              )}

                              {loc.transport_detail && (
                                <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/60 flex items-start gap-1">
                                  <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <span>{loc.transport_detail}</span>
                                </p>
                              )}

                              {(loc.ticket_url || loc.attachment_note) && (
                                <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-1.5 text-xs">
                                  {loc.ticket_url && (
                                    <div className="flex items-center justify-between gap-2">
                                      <a href={loc.ticket_url} target="_blank" rel="noreferrer" className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium truncate">
                                        <Ticket className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">เปิดเอกสารแนบ / ตั๋วเดินทาง</span>
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                      </a>
                                    </div>
                                  )}
                                  {loc.attachment_note && (
                                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                                      <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                                      <span>{loc.attachment_note}</span>
                                    </span>
                                  )}
                                </div>
                              )}

                              {loc.cost_amount > 0 && (
                                <div className="text-xs text-amber-400 font-bold flex items-center gap-1">
                                  <Coins className="w-3 h-3" />
                                  <span>{loc.cost_amount.toLocaleString()} {currentTrip?.currency || 'THB'}</span>
                                  <span className="text-[10px] text-slate-500 font-normal">({loc.cost_info})</span>
                                </div>
                              )}

                              <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                                <a
                                  href={loc.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.location_name + ' ' + currentTrip?.trip_name)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40"
                                >
                                  <Navigation className="w-3.5 h-3.5" /> นำทาง
                                </a>

                                {!isReadOnly && (
                                  <div className="flex gap-1">
                                    <button onClick={() => moveLocationReal(dayData.day, loc.id, 'up')} disabled={realIndex === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-20">
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => moveLocationReal(dayData.day, loc.id, 'down')} disabled={realIndex === totalLocs - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-20">
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
            </main>
          </>
        )}

        {/* Modal Auth (Sign In / Sign Up) */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-sm p-5 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {authMode === 'login' ? <LogIn className="w-4 h-4 text-rose-500" /> : <UserPlus className="w-4 h-4 text-rose-500" />}
                  <span>{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}</span>
                </h3>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {authError && <div className="p-2.5 bg-rose-950/80 border border-rose-800/80 rounded-lg text-rose-300 text-xs">{authError}</div>}
              {authInfo && <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs">{authInfo}</div>}

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">อีเมล</label>
                  <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="name@example.com" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700 outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">รหัสผ่าน</label>
                  <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700 outline-none focus:border-rose-500" />
                </div>
                <button type="submit" disabled={authLoading} className="w-full p-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl flex justify-center items-center gap-1.5 transition-colors">
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : authMode === 'login' ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-800/80">
                <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); setAuthInfo(''); }} className="text-xs text-slate-400 hover:text-rose-400 underline transition-colors">
                  {authMode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิกใหม่ที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Share Trip */}
        {isShareModalOpen && currentTrip && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-sm p-5 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-500" /> แชร์ทริปนี้
                </h3>
                <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {!currentTrip.share_token ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">เลือกสิทธิ์ของคนที่ได้รับลิงก์นี้:</p>
                  <button onClick={() => handleGenerateShareLink('view')} className="w-full p-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <Eye className="w-4 h-4" /> สร้างลิงก์ (ดูอย่างเดียว)
                  </button>
                  <button onClick={() => handleGenerateShareLink('edit')} className="w-full p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> สร้างลิงก์ (แก้ไขได้)
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${currentTrip.share_permission === 'edit' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' : 'bg-sky-950/60 text-sky-300 border border-sky-800/50'}`}>
                    {currentTrip.share_permission === 'edit' ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>สิทธิ์ปัจจุบัน: {currentTrip.share_permission === 'edit' ? 'แก้ไขได้' : 'ดูอย่างเดียว'}</span>
                  </div>

                  <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-[11px] text-slate-300 break-all">
                    {`${window.location.origin}/shared/${currentTrip.share_token}`}
                  </div>

                  <button onClick={handleCopyShareLink} className="w-full p-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" /> {shareCopyLabel}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateShareLink(currentTrip.share_permission === 'edit' ? 'view' : 'edit')}
                      className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700"
                    >
                      สลับเป็น{currentTrip.share_permission === 'edit' ? 'ดูอย่างเดียว' : 'แก้ไขได้'}
                    </button>
                    <button onClick={handleRevokeShareLink} className="flex-1 p-2 bg-slate-800 hover:bg-rose-950 text-rose-400 text-[11px] font-semibold rounded-lg border border-slate-700 flex items-center justify-center gap-1">
                      <Ban className="w-3.5 h-3.5" /> ยกเลิกลิงก์
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal เลือก Template / สร้างทริปใหม่ */}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-md p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-rose-500" /> เพิ่มทริปใหม่
                </h3>
                <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">สร้างทริปใหม่เปล่าๆ (Blank Trip)</h4>
                    <p className="text-[10px] text-slate-400">สร้างทริปจากหน้ากระดาษเปล่า ไม่ใช้แม่แบบ</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={newTripNameInput}
                      onChange={(e) => setNewTripNameInput(e.target.value)}
                      placeholder="ตั้งชื่อทริป (เช่น เที่ยวเกาหลี ธ.ค.)"
                      className="flex-1 text-xs p-2 bg-slate-900 text-white rounded-lg border border-slate-700 outline-none focus:border-rose-500"
                    />
                    <button onClick={handleCreateBlankTrip} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                      + สร้าง
                    </button>
                  </div>
                </div>

                <hr className="border-slate-800" />
                <p className="text-xs text-slate-400">หรือเลือกจากแม่แบบสำเร็จรูป / แม่แบบส่วนตัว:</p>

                {[...PRESET_TEMPLATES, ...tripsList.filter((t) => t.is_template)].map((tpl) => (
                  <div key={tpl.trip_id} className="p-3 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{tpl.trip_name}</h4>
                      <p className="text-[10px] text-slate-400">{tpl.days?.length || 0} วัน | สกุลเงิน: {tpl.currency || 'THB'}</p>
                    </div>
                    <button onClick={() => handleCreateNewTripFromTemplate(tpl)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                      ใช้แม่แบบนี้
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal ตั้งค่างบประมาณทริป */}
        {isBudgetModalOpen && currentTrip && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-sm p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> ตั้งค่างบประมาณทริป
                </h3>
                <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const newBudget = Number(form.total_budget.value) || 0;
                  const newCurrency = form.currency.value || 'THB';
                  const newTripName = form.trip_name.value.trim() || currentTrip.trip_name;
                  updateCurrentTripData({ ...currentTrip, trip_name: newTripName, total_budget: newBudget, currency: newCurrency });
                  setIsBudgetModalOpen(false);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ชื่อทริป</label>
                  <input name="trip_name" defaultValue={currentTrip.trip_name} className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">งบประมาณรวม</label>
                    <input name="total_budget" type="number" defaultValue={currentTrip.total_budget || 0} className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">สกุลเงิน</label>
                    <input name="currency" defaultValue={currentTrip.currency || 'THB'} placeholder="เช่น JPY, THB" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                  </div>
                </div>
                <button type="submit" className="w-full p-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex justify-center items-center gap-1 transition-colors">
                  <Save className="w-4 h-4" /> บันทึกการตั้งค่า
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal เพิ่ม/แก้ไข รายการสถานที่ */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-end justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-md p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">{editingLocData ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}</h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  let locData = {
                    ...editingLocData,
                    time: form.time.value,
                    location_name: form.location_name.value,
                    start_point: form.start_point.value,
                    transport_detail: form.transport_detail.value,
                    cost_amount: Number(form.cost_amount.value) || 0,
                    cost_info: form.cost_info.value,
                    category: form.category.value,
                    map_url: form.map_url.value,
                    ticket_url: uploadedTicketUrl || form.ticket_url.value,
                    attachment_note: form.attachment_note.value
                  };

                  // ถ้าเป็นลิงก์ย่อและเป็นลิงก์ใหม่/เปลี่ยนไปจากเดิม ให้ resolve หาพิกัดก่อนบันทึก
                  if (isShortMapLink(locData.map_url) && locData.map_url !== editingLocData?.map_url) {
                    setResolvingMapUrl(true);
                    const coords = await resolveMapUrlToCoords(locData.map_url);
                    if (coords) locData = { ...locData, lat: coords.lat, lng: coords.lng };
                    setResolvingMapUrl(false);
                  }

                  saveLocationData(targetDayNum, locData);
                }}
                className="space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input name="time" defaultValue={editingLocData?.time || ''} placeholder="เวลา (เช่น 09:00)" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                  <select name="category" defaultValue={editingLocData?.category || 'Sightseeing'} className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700">
                    {Object.entries(CATEGORY_MAP).map(([k, cat]) => (
                      <option key={k} value={k}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <input name="location_name" required defaultValue={editingLocData?.location_name || ''} placeholder="ชื่อสถานที่ (จุดหมาย) *" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                <input name="start_point" defaultValue={editingLocData?.start_point || ''} placeholder="เริ่มเดินทางจาก (จุดเริ่มต้น)" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                <textarea name="transport_detail" defaultValue={editingLocData?.transport_detail || ''} placeholder="รายละเอียดการเดินทาง..." className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700 h-16" />

                <div className="grid grid-cols-2 gap-3">
                  <input name="cost_amount" type="number" defaultValue={editingLocData?.cost_amount || 0} placeholder="ประมาณการราคา" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                  <input name="cost_info" defaultValue={editingLocData?.cost_info || ''} placeholder="หมายเหตุงบ (เช่น MTR)" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5" /> แนบเอกสาร / ลิงก์ตั๋วเดินทาง
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs p-2 rounded-lg border border-dashed border-slate-600 flex items-center justify-center gap-1.5 transition-colors">
                      {uploadingFile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          <span>กำลังอัปโหลด...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-rose-400" />
                          <span>แนบไฟล์ตั๋ว/รูปภาพ (PDF, JPG, PNG)</span>
                        </>
                      )}
                      <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploadingFile} className="hidden" />
                    </label>
                  </div>

                  {uploadedTicketUrl && (
                    <div className="text-[10px] text-emerald-400 bg-emerald-950/50 p-1.5 rounded border border-emerald-800/40 flex items-center justify-between">
                      <span className="truncate">✓ มีไฟล์แนบพร้อมใช้งาน</span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (uploadedTicketUrl !== editingLocData?.ticket_url) await deleteFileFromStorage(uploadedTicketUrl);
                          setUploadedTicketUrl('');
                        }}
                        className="text-slate-400 hover:text-rose-400 text-xs p-0.5"
                        title="นำไฟล์แนบออก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <input name="ticket_url" value={uploadedTicketUrl} onChange={(e) => setUploadedTicketUrl(e.target.value)} placeholder="URL ลิงก์ตั๋ว / e-Ticket (https://...)" className="w-full text-xs p-2 bg-slate-800 text-white rounded-lg border border-slate-700" />
                  <input name="attachment_note" defaultValue={editingLocData?.attachment_note || ''} placeholder="หมายเหตุการเก็บไฟล์ (เช่น อยู่ใน Google Drive / Email)" className="w-full text-xs p-2 bg-slate-800 text-white rounded-lg border border-slate-700" />
                </div>

                <input name="map_url" defaultValue={editingLocData?.map_url || ''} placeholder="ลิงก์ Google Maps (ถ้ามี)" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={uploadingFile || resolvingMapUrl} className="flex-1 p-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl flex justify-center items-center gap-1 transition-colors">
                    {resolvingMapUrl ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบลิงก์...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> บันทึก
                      </>
                    )}
                  </button>
                  {editingLocData?.id && (
                    <button type="button" onClick={() => deleteLocationData(targetDayNum, editingLocData.id)} className="p-2.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
