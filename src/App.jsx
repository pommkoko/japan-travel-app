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
  FolderPlus
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- Preset Global Templates ---
const PRESET_TEMPLATES = [
  {
    trip_id: "preset_tokyo_fuji",
    trip_name: "Japan (Tokyo & Fuji)",
    currency: "JPY",
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
            ticket_url: "",
            map_url: ""
          },
          {
            id: "tokyo_d1_02",
            time: "10:40 - 11:21",
            start_point: "สนามบินนาริตะ",
            location_name: "สถานี Keisei-Ueno",
            transport_detail: "นั่งรถไฟด่วน Keisei Skyliner (41 นาที)",
            cost_info: "[ใช้ตั๋ว Skyliner ขาไป]",
            cost_amount: 0,
            category: "Transit",
            lat: 35.7112,
            lng: 139.7745,
            ticket_url: "",
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

const LOCAL_STORAGE_KEY = 'japan_travel_planner_store_v7';

export default function App() {
  const [tripsList, setTripsList] = useState([]);
  const [activeTripId, setActiveTripId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [checkedState, setCheckedState] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingLocData, setEditingLocData] = useState(null);
  const [targetDayNum, setTargetDayNum] = useState(1);

  const saveTimeoutRef = useRef(null);
  const latestStoreRef = useRef(null);

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const pushToCloud = async (payload) => {
    try {
      setSaving(true);
      await supabase.from('trip_data').upsert({ id: 1, data: payload });
    } catch (err) {
      console.error("Cloud push failed:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    initApp();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (latestStoreRef.current) {
          pushToCloud(latestStoreRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const initApp = async () => {
    setLoading(true);
    let localData = null;

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) localData = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }

    if (localData && Array.isArray(localData.trips) && localData.trips.length > 0) {
      setTripsList(localData.trips);
      const realTrips = localData.trips.filter(t => !t.is_template);
      const fallbackId = realTrips.length > 0 ? realTrips[0].trip_id : "";
      const targetId = realTrips.some(t => t.trip_id === localData.activeTripId)
        ? localData.activeTripId
        : fallbackId;

      setActiveTripId(targetId);
      if (localData.checkedState) setCheckedState(localData.checkedState);
      latestStoreRef.current = localData;
      setLoading(false);
    }

    try {
      const { data } = await supabase
        .from('trip_data')
        .select('data')
        .eq('id', 1)
        .single();

      if (data && data.data && Array.isArray(data.data.trips) && data.data.trips.length > 0) {
        const cloudPayload = data.data;
        const currentLocalUpdatedAt = latestStoreRef.current?.updated_at || localData?.updated_at || 0;
        const cloudUpdatedAt = cloudPayload.updated_at || 0;

        if (cloudUpdatedAt >= currentLocalUpdatedAt) {
          const cloudTrips = cloudPayload.trips;
          const realTrips = cloudTrips.filter(t => !t.is_template);
          const fallbackId = realTrips.length > 0 ? realTrips[0].trip_id : "";
          const validActiveId = realTrips.some(t => t.trip_id === cloudPayload.activeTripId)
            ? cloudPayload.activeTripId
            : fallbackId;

          const cloudChecked = cloudPayload.checkedState || {};

          setTripsList(cloudTrips);
          setActiveTripId(validActiveId);
          setCheckedState(cloudChecked);

          const syncedLocal = {
            trips: cloudTrips,
            activeTripId: validActiveId,
            checkedState: cloudChecked,
            updated_at: cloudUpdatedAt
          };

          latestStoreRef.current = syncedLocal;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(syncedLocal));
        } else {
          console.log("Local data is newer than Cloud data. Syncing local to cloud...");
          if (latestStoreRef.current) {
            pushToCloud(latestStoreRef.current);
          }
        }
      } else if (!localData) {
        const starterTrip = {
          ...PRESET_TEMPLATES[0],
          trip_id: `trip_${generateUUID()}`,
          trip_name: `${PRESET_TEMPLATES[0].trip_name} (My Trip)`,
          is_template: false,
          days: PRESET_TEMPLATES[0].days.map(day => ({
            ...day,
            locations: (day.locations || []).map(loc => ({ ...loc, id: generateUUID() }))
          }))
        };

        const initialStore = {
          trips: [...PRESET_TEMPLATES, starterTrip],
          activeTripId: starterTrip.trip_id,
          checkedState: {},
          updated_at: Date.now()
        };

        setTripsList(initialStore.trips);
        setActiveTripId(initialStore.activeTripId);
        latestStoreRef.current = initialStore;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialStore));
        await pushToCloud(initialStore);
      }
    } catch (err) {
      console.warn("Could not sync with Supabase (Offline mode active):", err);
    } finally {
      setLoading(false);
    }
  };

  const currentTrip = useMemo(() => {
    const realTrips = (tripsList || []).filter(t => !t.is_template);
    if (realTrips.length === 0) return null;

    const matched = realTrips.find(t => t.trip_id === activeTripId);
    if (!matched && realTrips.length > 0) {
      return realTrips[0];
    }
    return matched;
  }, [tripsList, activeTripId]);

  useEffect(() => {
    if (currentTrip && currentTrip.trip_id !== activeTripId) {
      setActiveTripId(currentTrip.trip_id);
    }
  }, [currentTrip, activeTripId]);

  const handleSelectTrip = (tripId) => {
    setActiveTripId(tripId);
    setActiveDay(1);
    saveAllToStore(tripsList, tripId, checkedState);
  };

  const saveAllToStore = (newTripsList, newActiveId, newCheckedState = checkedState) => {
    setTripsList(newTripsList);
    const targetActiveId = newActiveId || activeTripId;

    const payload = {
      trips: newTripsList,
      activeTripId: targetActiveId,
      checkedState: newCheckedState,
      updated_at: Date.now()
    };

    latestStoreRef.current = payload;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save to LocalStorage", e);
    }

    setSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      pushToCloud(payload);
    }, 1500);
  };

  const handleCreateNewTripFromTemplate = (templateObj) => {
    const newTripId = `trip_${generateUUID()}`;

    const clonedDays = (templateObj.days || []).map(day => ({
      ...day,
      locations: (day.locations || []).map(loc => ({
        ...loc,
        id: generateUUID()
      }))
    }));

    const newTrip = {
      ...templateObj,
      trip_id: newTripId,
      trip_name: `${templateObj.trip_name.replace(/^\[Template\]\s*/, '')} (My Trip)`,
      is_template: false,
      days: clonedDays
    };

    const updatedList = [...tripsList, newTrip];
    setActiveTripId(newTripId);
    setActiveDay(1);
    setIsTemplateModalOpen(false);
    saveAllToStore(updatedList, newTripId);
  };

  const handleSaveAsPersonalTemplate = () => {
    if (!currentTrip) return;

    const baseName = currentTrip.trip_name.replace(/^\[Template\]\s*/, '');
    const templateName = `[Template] ${baseName}`;

    const existingIndex = tripsList.findIndex(t => t.is_template && t.trip_name === templateName);

    const clonedDays = (currentTrip.days || []).map(day => ({
      ...day,
      locations: (day.locations || []).map(loc => ({ ...loc }))
    }));

    let updatedList = [...tripsList];

    if (existingIndex !== -1) {
      if (!window.confirm(`มีแม่แบบ "${templateName}" อยู่แล้ว คุณต้องการบันทึกทับแม่แบบเดิมหรือไม่?`)) {
        return;
      }
      updatedList[existingIndex] = {
        ...currentTrip,
        trip_id: updatedList[existingIndex].trip_id,
        trip_name: templateName,
        is_template: true,
        days: clonedDays
      };
    } else {
      const templateId = `tpl_${generateUUID()}`;
      const newTemplate = {
        ...currentTrip,
        trip_id: templateId,
        trip_name: templateName,
        is_template: true,
        days: clonedDays
      };
      updatedList.push(newTemplate);
    }

    alert(`บันทึกแม่แบบ "${templateName}" เรียบร้อยแล้ว!`);
    saveAllToStore(updatedList, activeTripId);
  };

  const handleDeleteCurrentTrip = () => {
    if (!currentTrip) return;

    const realTrips = tripsList.filter(t => !t.is_template);
    if (realTrips.length <= 1) {
      alert("ไม่สามารถลบทริปสุดท้ายได้ ต้องมีอย่างน้อย 1 ทริป");
      return;
    }

    if (window.confirm(`คุณต้องการลบทริป "${currentTrip.trip_name}" ใช่หรือไม่?`)) {
      const targetTripId = currentTrip.trip_id;
      const remaining = tripsList.filter(t => t.trip_id !== targetTripId);
      const nextRealTrip = remaining.find(t => !t.is_template);
      const nextActiveId = nextRealTrip ? nextRealTrip.trip_id : remaining[0].trip_id;

      const cleanedChecked = { ...checkedState };
      Object.keys(cleanedChecked).forEach(key => {
        if (key.startsWith(`${targetTripId}_`)) {
          delete cleanedChecked[key];
        }
      });

      setCheckedState(cleanedChecked);
      setActiveTripId(nextActiveId);
      saveAllToStore(remaining, nextActiveId, cleanedChecked);
    }
  };

  const updateCurrentTripData = (updatedTrip) => {
    const newList = tripsList.map(t => t.trip_id === updatedTrip.trip_id ? updatedTrip : t);
    saveAllToStore(newList, updatedTrip.trip_id);
  };

  const handleToggleCheck = (locId) => {
    if (!currentTrip) return;
    const checkKey = `${currentTrip.trip_id}_${locId}`;
    const updated = { ...checkedState, [checkKey]: !checkedState[checkKey] };
    setCheckedState(updated);
    saveAllToStore(tripsList, currentTrip.trip_id, updated);
  };

  const saveLocationData = (dayNum, locationData) => {
    if (!currentTrip) return;

    const updatedDays = (currentTrip.days || []).map(day => {
      if (day.day !== dayNum) return day;

      const currentLocations = day.locations || [];
      let newLocations = [];

      if (locationData.id) {
        newLocations = currentLocations.map(l => l.id === locationData.id ? { ...locationData } : l);
      } else {
        newLocations = [...currentLocations, { ...locationData, id: generateUUID() }];
      }

      return { ...day, locations: newLocations };
    });

    const updatedTrip = { ...currentTrip, days: updatedDays };
    updateCurrentTripData(updatedTrip);
    setIsModalOpen(false);
  };

  const deleteLocationData = (dayNum, locationId) => {
    if (!currentTrip) return;

    const updatedDays = (currentTrip.days || []).map(day => {
      if (day.day !== dayNum) return day;
      return { ...day, locations: (day.locations || []).filter(l => l.id !== locationId) };
    });

    const updatedTrip = { ...currentTrip, days: updatedDays };
    updateCurrentTripData(updatedTrip);
    setIsModalOpen(false);
  };

  const moveLocationReal = (dayNum, targetLocId, direction) => {
    if (!currentTrip) return;

    const updatedDays = (currentTrip.days || []).map(day => {
      if (day.day !== dayNum) return day;

      const locs = [...(day.locations || [])];
      const realIndex = locs.findIndex(l => l.id === targetLocId);
      if (realIndex === -1) return day;

      if (direction === 'up' && realIndex > 0) {
        [locs[realIndex - 1], locs[realIndex]] = [locs[realIndex], locs[realIndex - 1]];
      } else if (direction === 'down' && realIndex < locs.length - 1) {
        [locs[realIndex + 1], locs[realIndex]] = [locs[realIndex], locs[realIndex + 1]];
      }

      return { ...day, locations: locs };
    });

    const updatedTrip = { ...currentTrip, days: updatedDays };
    updateCurrentTripData(updatedTrip);
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
    return currentTrip.days.reduce((accDay, d) => {
      return accDay + (d.locations || []).reduce((accLoc, loc) => accLoc + (Number(loc.cost_amount) || 0), 0);
    }, 0);
  }, [currentTrip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
        <p className="text-slate-400 text-sm">กำลังเชื่อมต่อคลังทริปท่องเที่ยว...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-16">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900/95 shadow-2xl relative border-x border-slate-200 dark:border-slate-800">

        {/* Top Multi-Trips Selector Bar */}
        <div className="bg-slate-950 text-white px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
            <Globe className="w-4 h-4 text-rose-400 shrink-0" />
            <select
              value={activeTripId}
              onChange={(e) => handleSelectTrip(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-700 outline-none w-full truncate"
            >
              {tripsList.filter(t => !t.is_template).map(t => (
                <option key={t.trip_id} value={t.trip_id}>
                  {t.trip_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-2 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ ทริป</span>
            </button>

            <button
              onClick={handleDeleteCurrentTrip}
              className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
              title="ลบทริปนี้"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* กรณีไม่มีทริปจริงเหลืออยู่เลย */}
        {!currentTrip ? (
          <div className="p-10 text-center text-slate-400 text-sm space-y-3">
            <p>ยังไม่มีทริป</p>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold"
            >
              เริ่มจากแม่แบบ
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg border-b border-slate-800">
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                    {currentTrip?.trip_name}
                  </h1>
                  <p className="text-xs text-slate-400">
                    {currentTrip?.days?.length || 0} วัน | งบประมาณ {totalCostAmount.toLocaleString()} {currentTrip?.currency || 'THB'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAsPersonalTemplate}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-rose-400 px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1"
                    title="บันทึกทริปนี้เป็นแม่แบบส่วนตัว"
                  >
                    <Sparkles className="w-3 h-3" /> เป็น Template
                  </button>
                  {saving && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/50 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  )}
                </div>
              </div>

              {/* Days Tabs */}
              <div className="px-2 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveDay('all')}
                  className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap ${
                    activeDay === 'all' ? 'bg-rose-500 text-white font-semibold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ทั้งหมด
                </button>
                {(currentTrip?.days || []).map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setActiveDay(d.day)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap ${
                      activeDay === d.day ? 'bg-rose-500 text-white font-semibold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Day {d.day}
                  </button>
                ))}
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
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white">
                      ล้าง
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setCategoryFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      categoryFilter === 'ALL' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setCategoryFilter(categoryFilter === key ? 'ALL' : key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 border ${
                          categoryFilter === key ? 'bg-slate-700 text-white border-rose-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(currentTrip?.days || [])
                .filter(d => activeDay === 'all' || d.day === activeDay)
                .map((dayData) => {
                  const filteredLocs = getFilteredLocations(dayData.locations || []);
                  const totalLocs = dayData.locations?.length || 0;

                  return (
                    <div key={dayData.day} className="mb-6 space-y-3">
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-rose-400">Day {dayData.day}</span>
                          <h2 className="text-sm font-bold text-white">{dayData.title}</h2>
                        </div>
                        <button
                          onClick={() => { setTargetDayNum(dayData.day); setEditingLocData(null); setIsModalOpen(true); }}
                          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs flex items-center gap-1 font-semibold transition-colors"
                        >
                          <Plus className="w-4 h-4" /> เพิ่ม
                        </button>
                      </div>

                      {filteredLocs.length === 0 ? (
                        <div className="text-center py-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                          ไม่พบสถานที่ตามคำค้นหา
                        </div>
                      ) : (
                        filteredLocs.map((loc) => {
                          const checkKey = `${currentTrip.trip_id}_${loc.id}`;
                          const isChecked = !!checkedState[checkKey];
                          const realIndex = (dayData.locations || []).findIndex(l => l.id === loc.id);

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

                                <div className="flex items-center gap-1">
                                  <button onClick={() => { setTargetDayNum(dayData.day); setEditingLocData(loc); setIsModalOpen(true); }} className="p-1 text-slate-400 hover:text-white">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <h3 className={`text-sm font-bold text-white ${isChecked ? 'line-through text-slate-500' : ''}`}>
                                {loc.location_name}
                              </h3>

                              {loc.start_point && loc.start_point !== loc.location_name && (
                                <p className="text-xs text-slate-400">จาก: {loc.start_point}</p>
                              )}

                              {loc.transport_detail && (
                                <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/60 flex items-start gap-1">
                                  <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <span>{loc.transport_detail}</span>
                                </p>
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
                                  href={loc.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.location_name + " " + currentTrip?.trip_name)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40"
                                >
                                  <Navigation className="w-3.5 h-3.5" /> นำทาง
                                </a>

                                <div className="flex gap-1">
                                  <button
                                    onClick={() => moveLocationReal(dayData.day, loc.id, 'up')}
                                    disabled={realIndex === 0}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => moveLocationReal(dayData.day, loc.id, 'down')}
                                    disabled={realIndex === totalLocs - 1}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>
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

        {/* Modal เลือก Template */}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-md p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-rose-500" /> เลือกแม่แบบสำหรับทริปใหม่
                </h3>
                <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                <p className="text-xs text-slate-400 mb-2">เลือกจากแม่แบบสำเร็จรูป หรือแม่แบบส่วนตัวของคุณ:</p>
                {tripsList
                  .filter(t => t.is_template)
                  .map((tpl) => (
                    <div key={tpl.trip_id} className="p-3 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">{tpl.trip_name}</h4>
                        <p className="text-[10px] text-slate-400">{tpl.days?.length || 0} วัน | สกุลเงิน: {tpl.currency || 'THB'}</p>
                      </div>
                      <button
                        onClick={() => handleCreateNewTripFromTemplate(tpl)}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        ใช้แม่แบบนี้
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal เพิ่ม/แก้ไข รายการสถานที่ */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-end justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-md p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">{editingLocData ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                saveLocationData(targetDayNum, {
                  ...editingLocData,
                  time: form.time.value,
                  location_name: form.location_name.value,
                  start_point: form.start_point.value,
                  transport_detail: form.transport_detail.value,
                  cost_amount: Number(form.cost_amount.value) || 0,
                  cost_info: form.cost_info.value,
                  category: form.category.value,
                  map_url: form.map_url.value
                });
              }} className="space-y-2">
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
                  <input name="cost_amount" type="number" defaultValue={editingLocData?.cost_amount || 0} placeholder="ราคา" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                  <input name="cost_info" defaultValue={editingLocData?.cost_info || ''} placeholder="หมายเหตุงบ (เช่น MTR)" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />
                </div>

                <input name="map_url" defaultValue={editingLocData?.map_url || ''} placeholder="ลิงก์ Google Maps (ถ้ามี)" className="w-full text-xs p-2.5 bg-slate-800 text-white rounded-lg border border-slate-700" />

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 p-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex justify-center items-center gap-1 transition-colors">
                    <Save className="w-4 h-4" /> บันทึก
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
