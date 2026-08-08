import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Train,
  Utensils,
  Camera,
  ShoppingBag,
  Bus,
  Clock,
  Coins,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
  RotateCcw,
  Hotel,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Ticket,
  Loader2
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ข้อมูลเริ่มต้นแบบสั้น (มีแค่ Day 1 และ Day 2)
const INITIAL_TRIP_DATA = {
  trip_name: "Japan Travel (Tokyo & Fuji)",
  total_days: 2,
  days: [
    {
      day: 1,
      title: "Arrival & Tokyo Highlights",
      subtitle: "Asakusa, Skytree, Akihabara & Ameyoko",
      locations: [
        {
          id: "day1_01",
          order_index: 1,
          time: "09:30 - 10:30",
          start_point: "สนามบินนาริตะ (Terminal 1/2)",
          location_name: "สนามบินนาริตะ (Terminal 1/2)",
          transport_detail: "ผ่านด่าน ตม. รับกระเป๋า และไปที่เคาน์เตอร์ Keisei เพื่อแลกตั๋ว Skyliner",
          cost_info: "-",
          cost_jpy: 0,
          category: "Transport",
          lat: 35.7647,
          lng: 140.3863,
          ticket_url: ""
        },
        {
          id: "day1_02",
          order_index: 2,
          time: "10:40 - 11:21",
          start_point: "สนามบินนาริตะ",
          location_name: "สถานี Keisei-Ueno",
          transport_detail: "นั่งรถไฟด่วน Keisei Skyliner (ยิงตรงไม่หยุดพัก 41 นาที)",
          cost_info: "[ใช้ตั๋ว Skyliner ขาไป]",
          cost_jpy: 0,
          category: "Transit",
          lat: 35.7112,
          lng: 139.7745,
          ticket_url: ""
        }
      ]
    },
    {
      day: 2,
      title: "Classic Tokyo & Shopping",
      subtitle: "Meiji Shrine, Harajuku, Shibuya & Tsukiji",
      locations: [
        {
          id: "day2_01",
          order_index: 1,
          time: "08:00 - 10:00",
          start_point: "สถานี Ueno",
          location_name: "ตลาดปลา Tsukiji Outer Market",
          transport_detail: "ทานไข่หวานย่าง ข้าวหน้าปลาดิบ (Kaisen-don) และอาหารทะเลสดๆ",
          cost_info: "ค่ากิน: ~2,500 เยน",
          cost_jpy: 2500,
          category: "Food",
          lat: 35.6654,
          lng: 139.7707,
          ticket_url: ""
        }
      ]
    }
  ]
};

const CATEGORY_MAP = {
  Sightseeing: {
    label: "ท่องเที่ยว",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    icon: Camera,
  },
  Food: {
    label: "อาหาร/กิน",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    icon: Utensils,
  },
  Transit: {
    label: "ต่อรถไฟ",
    color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    icon: Train,
  },
  Transport: {
    label: "เดินทางหลัก",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
    icon: Bus,
  },
  Hotel: {
    label: "โรงแรม",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    icon: Hotel,
  },
  Shopping: {
    label: "ช้อปปิ้ง",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    icon: ShoppingBag,
  }
};

function Header({ tripData, activeDay, setActiveDay, checkedState, totalJPY, saving }) {
  const totalItemsCount = useMemo(() => {
    return tripData.days.reduce((acc, d) => acc + d.locations.length, 0);
  }, [tripData]);

  const checkedCount = useMemo(() => {
    return Object.values(checkedState).filter(Boolean).length;
  }, [checkedState]);

  const completionPercent = totalItemsCount > 0 ? Math.round((checkedCount / totalItemsCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg border-b border-slate-800">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 line-clamp-1">
              {tripData.trip_name}
            </h1>
            <p className="text-xs text-slate-400">
              {tripData.days.length} วัน | รวม {totalJPY.toLocaleString()} JPY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/50 font-mono">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          <div className="text-right bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
            <div className="text-[10px] text-slate-400 font-medium">ความคืบหน้า</div>
            <div className="text-xs font-bold text-rose-400">
              {checkedCount}/{totalItemsCount} ({completionPercent}%)
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-800 h-1">
        <div
          className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-1 transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <div className="px-2 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveDay('all')}
          className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
            activeDay === 'all'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-900/30 font-semibold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          ทั้งหมด
        </button>

        {tripData.days.map((d) => {
          const isSelected = activeDay === d.day;
          const dayChecked = d.locations.filter((loc) => checkedState[loc.id]).length;
          const dayTotal = d.locations.length;

          return (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-900/30 font-semibold ring-1 ring-rose-400/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Day {d.day}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none flex items-center ${
                  isSelected ? 'bg-rose-700 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {dayChecked}/{dayTotal}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

function LocationModal({ isOpen, onClose, onSave, onDelete, initialData, dayNum }) {
  const [formData, setFormData] = useState({
    time: '',
    start_point: '',
    location_name: '',
    transport_detail: '',
    cost_info: '',
    cost_jpy: 0,
    category: 'Sightseeing',
    lat: 35.6895,
    lng: 139.6917,
    ticket_url: '',
    map_url: '',
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ map_url: '', ...initialData });
    } else {
      setFormData({
        time: '',
        start_point: '',
        location_name: '',
        transport_detail: '',
        cost_info: '',
        cost_jpy: 0,
        category: 'Sightseeing',
        lat: 35.6895,
        lng: 139.6917,
        ticket_url: '',
        map_url: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost_jpy' || name === 'lat' || name === 'lng' ? Number(value) || 0 : value
    }));
  };

  const handleSave = () => {
    onSave(dayNum, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4 transition-opacity">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <Pencil className="w-4 h-4 text-rose-500" />
            {initialData?.id ? 'แก้ไขข้อมูลสถานที่' : 'เพิ่มสถานที่ใหม่'}
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ช่วงเวลา</label>
              <input type="text" name="time" value={formData.time} onChange={handleChange} placeholder="เช่น 09:00 - 10:00" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">หมวดหมู่</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white">
                {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ชื่อสถานที่ (เป้าหมาย) *</label>
            <input type="text" name="location_name" value={formData.location_name} onChange={handleChange} placeholder="จุดหมายปลายทาง" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">เริ่มเดินทางจาก (จุดเริ่มต้น)</label>
            <input type="text" name="start_point" value={formData.start_point} onChange={handleChange} placeholder="เริ่มเดินทางจากสถานีไหน..." className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">รายละเอียดการเดินทาง / สายรถไฟ</label>
            <textarea name="transport_detail" value={formData.transport_detail} onChange={handleChange} placeholder="อธิบายเส้นทาง สายรถไฟ หรือรายละเอียดเพิ่มเติม" rows={3} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none text-slate-900 dark:text-white"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ค่าใช้จ่าย (ข้อความ)</label>
              <input type="text" name="cost_info" value={formData.cost_info} onChange={handleChange} placeholder="เช่น IC Card หรือ ใช้ Pass" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ราคาโดยประมาณ (JPY)</label>
              <input type="number" name="cost_jpy" value={formData.cost_jpy} onChange={handleChange} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-500" /> ลิงก์ Google Maps (สำหรับปุ่มนำทาง)
            </label>
            <input type="text" name="map_url" value={formData.map_url || ''} onChange={handleChange} placeholder="วางลิงก์ https://maps.app.goo.gl/... ที่นี่" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-amber-500" /> ลิงก์เก็บตั๋ว / QR Code (Ticket URL)
            </label>
            <input type="text" name="ticket_url" value={formData.ticket_url || ''} onChange={handleChange} placeholder="https://..." className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2 pb-6 sm:pb-4">
          <button onClick={handleSave} className="w-full min-h-[48px] bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md">
            <Save className="w-5 h-5" />
            บันทึกข้อมูล
          </button>
          
          {initialData?.id && (
            <button onClick={() => {
              if(window.confirm('คุณต้องการลบสถานที่นี้ออกจากแผนใช่หรือไม่?')) {
                onDelete(dayNum, initialData.id);
              }
            }} className="w-full min-h-[44px] bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-600 hover:text-rose-600 dark:text-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
              <Trash2 className="w-4 h-4" />
              ลบสถานที่นี้
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function LocationCard({ 
  location, 
  isChecked, 
  onToggleCheck, 
  onEdit, 
  onMoveUp, 
  onMoveDown,
  isFirst,
  isLast 
}) {
  const categoryConfig = CATEGORY_MAP[location.category] || CATEGORY_MAP.Sightseeing;
  const CategoryIcon = categoryConfig.icon;

  // ฟังก์ชันสร้างลิงก์นำทาง (รองรับทั้ง Google Maps URL และพิกัด Lat/Lng)
  const getGoogleMapsUrl = () => {
    if (location.map_url && location.map_url.startsWith('http')) {
      return location.map_url;
    }
    if (location.lat && location.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.location_name + " Japan")}`;
  };

  const hasTicket = !!location.ticket_url;

  return (
    <div className={`relative pl-8 sm:pl-9 pb-6 transition-all group ${isChecked ? 'opacity-70' : 'opacity-100'}`}>
      <div className="absolute left-[13px] sm:left-[17px] top-6 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-700 group-last:hidden" />

      <button
        onClick={() => onToggleCheck(location.id)}
        aria-label="Check in"
        className={`absolute left-0 sm:left-1 top-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
          isChecked
            ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-slate-100 dark:ring-slate-950'
            : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-500 text-transparent hover:border-rose-400'
        }`}
      >
        <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      <div className={`rounded-xl border transition-all overflow-hidden ${
        isChecked 
          ? 'bg-slate-50/80 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800'
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md dark:bg-slate-800/90 dark:border-slate-700'
      }`}>
        
        <div className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/50 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>{location.time}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${categoryConfig.color}`}>
                <CategoryIcon className="w-3 h-3" />
                <span>{categoryConfig.label}</span>
              </div>
              
              <button 
                onClick={() => onEdit(location)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Edit location"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h3 className={`text-base font-bold text-slate-900 dark:text-white leading-snug pr-4 ${isChecked ? 'line-through text-slate-500 dark:text-slate-500' : ''}`}>
            {location.location_name}
          </h3>

          {location.start_point && location.start_point !== location.location_name && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-slate-400">จาก:</span> {location.start_point}
            </p>
          )}

          {location.transport_detail && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{location.transport_detail}</span>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{location.cost_info}</span>
            {location.cost_jpy > 0 && (
              <span className="ml-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                ¥{location.cost_jpy.toLocaleString()}
              </span>
            )}
          </div>

          {/* ปุ่มนำทาง, เปิดตั๋ว, และลูกศรขึ้น-ลง */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
            
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-transform active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>นำทาง</span>
              </a>

              {hasTicket && (
                <a
                  href={location.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-transform active:scale-95"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>เปิดตั๋ว</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => onMoveUp(location.id)}
                disabled={isFirst}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:bg-transparent transition-colors"
                aria-label="Move Up"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onMoveDown(location.id)}
                disabled={isLast}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:bg-transparent transition-colors"
                aria-label="Move Down"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function DayTimeline({ dayData, checkedState, onToggleCheck, onEdit, onAddLocation, onMove, searchQuery, categoryFilter }) {
  const filteredLocations = useMemo(() => {
    return dayData.locations.filter((loc) => {
      const matchesCategory = categoryFilter === 'ALL' || loc.category === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        loc.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.transport_detail && loc.transport_detail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (loc.start_point && loc.start_point.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [dayData.locations, categoryFilter, searchQuery]);

  const daySubtotalJPY = useMemo(() => {
    return dayData.locations.reduce((sum, item) => sum + (item.cost_jpy || 0), 0);
  }, [dayData.locations]);

  const totalLocs = dayData.locations.length;

  return (
    <div className="mb-8">
      <div className="sticky top-[108px] sm:top-[112px] z-20 mb-5 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-md border border-slate-700/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              Day {dayData.day}
            </span>
            <h2 className="text-sm font-bold text-white tracking-wide">{dayData.title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{dayData.subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">งบวันนี้</span>
          <span className="text-xs font-extrabold text-amber-400">
            ¥{daySubtotalJPY.toLocaleString()}
          </span>
        </div>
      </div>

      {filteredLocations.length > 0 ? (
        <div className="relative">
          {filteredLocations.map((loc) => {
            const realIndex = dayData.locations.findIndex(l => l.id === loc.id);
            return (
              <LocationCard
                key={loc.id}
                location={loc}
                isChecked={!!checkedState[loc.id]}
                onToggleCheck={onToggleCheck}
                onEdit={onEdit}
                onMoveUp={() => onMove(dayData.day, realIndex, 'up')}
                onMoveDown={() => onMove(dayData.day, realIndex, 'down')}
                isFirst={realIndex === 0}
                isLast={realIndex === totalLocs - 1}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          ไม่พบสถานที่ตรงกับการค้นหาหรือตัวกรอง
        </div>
      )}

      <div className="mt-2 pl-8 sm:pl-9">
         <button 
           onClick={() => onAddLocation(dayData.day)}
           className="w-full min-h-[48px] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
         >
           <Plus className="w-5 h-5" />
           เพิ่มสถานที่ใน Day {dayData.day}
         </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tripData, setTripData] = useState(INITIAL_TRIP_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [checkedState, setCheckedState] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocData, setEditingLocData] = useState(null);
  const [targetDayNum, setTargetDayNum] = useState(1);

  // 1. โหลดข้อมูลจาก Supabase ตอนเปิดเว็บ
  useEffect(() => {
    fetchTripData();
  }, []);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_data')
        .select('data')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching data:", error);
      }

      if (data && data.data) {
        setTripData(data.data);
      } else {
        setTripData(INITIAL_TRIP_DATA);
        await supabase.from('trip_data').upsert({ id: 1, data: INITIAL_TRIP_DATA });
      }
    } catch (err) {
      console.error(err);
      setTripData(INITIAL_TRIP_DATA);
    } finally {
      setLoading(false);
    }
  };

  // 2. บันทึกข้อมูลขึ้น Supabase Cloud
  const saveToCloud = async (newData) => {
    setTripData(newData);
    setSaving(true);
    try {
      await supabase.from('trip_data').upsert({ id: 1, data: newData });
    } catch (err) {
      console.error("Error saving to cloud:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCheck = (id) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetEverything = async () => {
    if (window.confirm("คุณต้องการล้างการแก้ไขและรีเซ็ตแผนกลับเป็นค่าเริ่มต้นทั้งหมดใช่หรือไม่?")) {
      setCheckedState({});
      await saveToCloud(INITIAL_TRIP_DATA);
    }
  };

  const openAddModal = (dayNum) => {
    setTargetDayNum(dayNum);
    setEditingLocData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dayNum, locationData) => {
    setTargetDayNum(dayNum);
    setEditingLocData(locationData);
    setIsModalOpen(true);
  };

  const saveLocationData = (dayNum, locationData) => {
    const newData = { ...tripData };
    const dayIndex = newData.days.findIndex(d => d.day === dayNum);
    const newLocations = [...newData.days[dayIndex].locations];

    if (locationData.id) {
      const locIndex = newLocations.findIndex(l => l.id === locationData.id);
      if (locIndex >= 0) newLocations[locIndex] = locationData;
    } else {
      const newId = `day${dayNum}_ext_${Date.now()}`;
      const newOrderIndex = newLocations.length > 0 
        ? Math.max(...newLocations.map(l => l.order_index)) + 1 
        : 1;
      newLocations.push({ ...locationData, id: newId, order_index: newOrderIndex });
    }

    newData.days[dayIndex].locations = newLocations;
    saveToCloud(newData);
    setIsModalOpen(false);
  };

  const deleteLocationData = (dayNum, locationId) => {
    const newData = { ...tripData };
    const dayIndex = newData.days.findIndex(d => d.day === dayNum);
    newData.days[dayIndex].locations = newData.days[dayIndex].locations.filter(l => l.id !== locationId);
    
    newData.days[dayIndex].locations.forEach((loc, i) => loc.order_index = i + 1);
    saveToCloud(newData);
    setIsModalOpen(false);
  };

  const moveLocation = (dayNum, index, direction) => {
    const newData = { ...tripData };
    const dayIndex = newData.days.findIndex(d => d.day === dayNum);
    const locs = [...newData.days[dayIndex].locations];

    if (direction === 'up' && index > 0) {
      [locs[index - 1], locs[index]] = [locs[index], locs[index - 1]];
    } else if (direction === 'down' && index < locs.length - 1) {
      [locs[index + 1], locs[index]] = [locs[index], locs[index + 1]];
    }

    locs.forEach((loc, i) => loc.order_index = i + 1);
    newData.days[dayIndex].locations = locs;
    saveToCloud(newData);
  };

  const totalJPY = useMemo(() => {
    return tripData.days.reduce((accDay, d) => {
      return accDay + d.locations.reduce((accLoc, loc) => accLoc + (Number(loc.cost_jpy) || 0), 0);
    }, 0);
  }, [tripData]);

  const visibleDays = useMemo(() => {
    return activeDay === 'all' ? tripData.days : tripData.days.filter((d) => d.day === activeDay);
  }, [tripData, activeDay]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
        <p className="text-slate-400 text-sm">กำลังโหลดข้อมูลแผนทริปจาก Supabase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-16">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900/95 shadow-2xl relative border-x border-slate-200 dark:border-slate-800">
        
        <Header
          tripData={tripData}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          checkedState={checkedState}
          totalJPY={totalJPY}
          saving={saving}
        />

        <main className="p-4">
          <div className="mb-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสถานที่ หรือสายรถไฟ..."
                className="w-full pl-9 pr-3 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 text-xs font-bold text-slate-400 hover:text-slate-600">
                  ล้าง
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1.5 min-h-[36px] rounded-xl text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                ทั้งหมด
              </button>
              {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
                const Icon = cat.icon;
                const isSelected = categoryFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(isSelected ? 'ALL' : key)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-xl text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {visibleDays.map((dayData) => (
            <DayTimeline
              key={dayData.day}
              dayData={dayData}
              checkedState={checkedState}
              onToggleCheck={handleToggleCheck}
              onEdit={(loc) => openEditModal(dayData.day, loc)}
              onAddLocation={openAddModal}
              onMove={moveLocation}
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
            />
          ))}

          <div className="pt-8 pb-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={handleResetEverything}
              className="text-xs font-semibold px-4 py-2 min-h-[44px] rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/50 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตแผนทั้งหมดกลับเป็นค่าเริ่มต้น</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-4">
              Japan Travel Companion • Cloud Synced with Supabase
            </p>
          </div>
        </main>

        <LocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={saveLocationData}
          onDelete={deleteLocationData}
          initialData={editingLocData}
          dayNum={targetDayNum}
        />

      </div>
    </div>
  );
}
