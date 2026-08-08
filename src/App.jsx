
import React, { useState, useEffect, useMemo } from "react";
import { 
  Compass, Train, MapPin, Coffee, Hotel, ShoppingBag, 
  Clock, Navigation, CheckCircle2, Circle, Search, 
  RotateCcw, Pencil, Plus, Save, Trash2, X, Ticket, ExternalLink, Loader2
} from "lucide-react";
import { supabase } from "./supabaseClient";

// ข้อมูลเริ่มต้นประจำทริป
const INITIAL_DAYS = [
  {
    id: "day1",
    dayNum: 1,
    title: "Arrival & Tokyo Highlights",
    subTitle: "Asakusa, Skytree, Akihabara & Ameyoko",
    budget: "8,230",
    dateStr: "Day 10/11",
    items: [
      { id: "1-1", time: "09:30 - 10:30", category: "เดินทางหลัก", name: "สนามบินนาริตะ (Terminal 1/2)", detail: "ผ่านด่าน ตม. รับกระเป๋า และไปที่เคาน์เตอร์ Keisei เพื่อแลกตั๋ว Skyliner + ซื้อตั๋ว Tokyo Subway 72-Hour Pass", mapUrl: "https://maps.app.goo.gl/3A2aX", completed: false },
      { id: "1-2", time: "10:40 - 11:21", category: "ต่อรถไฟ", name: "สถานี Keisei-Ueno", detail: "นั่ง Keisei Skyliner ตรงยาวสู่สถานี Keisei-Ueno (ใช้เวลา 41 นาที)", mapUrl: "", completed: false },
      { id: "1-3", time: "11:30 - 12:00", category: "โรงแรม", name: "ฝากกระเป๋าที่โรงแรมย่าน Ueno/Asakusa", detail: "เดินหรือนั่งรถไฟต่อไปยังโรงแรมเพื่อฝากกระเป๋าเดินทางใหญ่ก่อนออกเที่ยว", mapUrl: "", completed: false },
      { id: "1-4", time: "12:15 - 13:30", category: "อาหาร/กิน", name: "อาหารกลางวันย่าน Asakusa (เช่น Unatoto หรือ Ramen)", detail: "ทานข้าวหน้าปลาไหล Unatoto หรือราเมงชื่อดังแถววัดเซนโซจิ (งบประมาณ ~1,500 JPY)", mapUrl: "", completed: false },
      { id: "1-5", time: "13:30 - 15:30", category: "ท่องเที่ยว", name: "วัดเซนโซจิ (Sensō-ji) & ถนนนากามิเสะ", detail: "ถ่ายรูปคู่โคมแดง Kaminarimon เดินช้อปขนมบนถนน Nakamise และไหว้พระขอพร", mapUrl: "", completed: false }
    ]
  },
  {
    id: "day2",
    dayNum: 2,
    title: "Classic Tokyo & Shopping",
    subTitle: "Meiji Shrine, Harajuku, Shibuya & Tsukiji",
    budget: "7,500",
    dateStr: "Day 20/10",
    items: [
      { id: "2-1", time: "08:00 - 10:00", category: "อาหาร/กิน", name: "ตลาดปลาสึคิจิ (Tsukiji Outer Market)", detail: "ทานไข่หวานย่าง ข้าวหน้าปลาดิบ (Kaisen-don) และอาหารทะเลสดๆ", mapUrl: "", completed: false }
    ]
  }
];

const CATEGORIES = [
  { name: "ทั้งหมด", icon: Compass },
  { name: "ท่องเที่ยว", icon: MapPin },
  { name: "อาหาร/กิน", icon: Coffee },
  { name: "ต่อรถไฟ", icon: Train },
  { name: "เดินทางหลัก", icon: Train },
  { name: "โรงแรม", icon: Hotel },
  { name: "ช้อปปิ้ง", icon: ShoppingBag },
];

export default function App() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDayId, setActiveDayId] = useState("day1");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    time: "",
    category: "ท่องเที่ยว",
    name: "",
    detail: "",
    mapUrl: "",
  });

  // 1. โหลดข้อมูลจาก Supabase ตอนเปิดแอป
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
        setDays(data.data);
      } else {
        // ถ้ายังไม่มีข้อมูลใน DB ให้ใช้ค่าเริ่มต้นแล้วบันทึกขึ้น DB
        setDays(INITIAL_DAYS);
        await supabase.from('trip_data').upsert({ id: 1, data: INITIAL_DAYS });
      }
    } catch (err) {
      console.error(err);
      setDays(INITIAL_DAYS);
    } finally {
      setLoading(false);
    }
  };

  // 2. ฟังก์ชันเซฟข้อมูลขึ้น Supabase
  const saveToCloud = async (newDays) => {
    setDays(newDays);
    setSaving(true);
    try {
      await supabase.from('trip_data').upsert({ id: 1, data: newDays });
    } catch (err) {
      console.error("Error saving to cloud:", err);
    } finally {
      setSaving(false);
    }
  };

  // คำนวณสถิติ
  const totalItemsCount = useMemo(() => {
    return days.reduce((acc, day) => acc + day.items.length, 0);
  }, [days]);

  const completedItemsCount = useMemo(() => {
    return days.reduce((acc, day) => {
      return acc + day.items.filter((i) => i.completed).length;
    }, 0);
  }, [days]);

  const activeDay = useMemo(() => {
    return days.find((d) => d.id === activeDayId) || days[0];
  }, [days, activeDayId]);

  // สลับสถานะทำเสร็จ
  const toggleComplete = (itemId) => {
    const updated = days.map((day) => {
      if (day.id === activeDayId) {
        return {
          ...day,
          items: day.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return day;
    });
    saveToCloud(updated);
  };

  // เพิ่มรายการใหม่
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newItem = {
      id: Date.now().toString(),
      ...formData,
      completed: false,
    };

    const updated = days.map((day) => {
      if (day.id === activeDayId) {
        return { ...day, items: [...day.items, newItem] };
      }
      return day;
    });

    saveToCloud(updated);
    setIsAdding(false);
    resetForm();
  };

  // แก้ไขรายการ
  const handleUpdateItem = (e) => {
    e.preventDefault();
    if (!formData.name || !editingItem) return;

    const updated = days.map((day) => {
      if (day.id === activeDayId) {
        return {
          ...day,
          items: day.items.map((item) =>
            item.id === editingItem.id ? { ...item, ...formData } : item
          ),
        };
      }
      return day;
    });

    saveToCloud(updated);
    setEditingItem(null);
    resetForm();
  };

  // ลบรายการ
  const handleDeleteItem = (itemId) => {
    if (!window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;

    const updated = days.map((day) => {
      if (day.id === activeDayId) {
        return {
          ...day,
          items: day.items.filter((item) => item.id !== itemId),
        };
      }
      return day;
    });

    saveToCloud(updated);
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({
      time: item.time || "",
      category: item.category || "ท่องเที่ยว",
      name: item.name || "",
      detail: item.detail || "",
      mapUrl: item.mapUrl || "",
    });
  };

  const resetForm = () => {
    setFormData({ time: "", category: "ท่องเที่ยว", name: "", detail: "", mapUrl: "" });
  };

  // กรองรายการตาม Category และ Search
  const filteredItems = useMemo(() => {
    if (!activeDay) return [];
    return activeDay.items.filter((item) => {
      const matchCategory =
        activeCategory === "ทั้งหมด" || item.category === activeCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeDay, activeCategory, searchQuery]);

  // ฟังก์ชันเปิดลิงก์นำทาง
  const openMap = (mapUrl, name) => {
    if (mapUrl && mapUrl.startsWith("http")) {
      window.open(mapUrl, "_blank");
    } else if (mapUrl) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapUrl)}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " Japan")}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-slate-400">กำลังเชื่อมต่อฐานข้อมูลทริปญี่ปุ่น...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Japan Travel (Tokyo & Fuji)
            </h1>
            <p className="text-xs text-slate-400">
              ความคืบหน้า: {completedItemsCount}/{totalItemsCount} (
              {totalItemsCount > 0
                ? Math.round((completedItemsCount / totalItemsCount) * 100)
                : 0}
              %)
            </p>
          </div>
          {saving && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-950/50 px-2 font-mono py-1 rounded border border-emerald-800/50">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* เลือกวัน */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeDayId === day.id
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              Day {day.dayNum}
            </button>
          ))}
        </div>

        {/* ค้นหา */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาสถานที่ หรือสายรถไฟ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* กรองตามหมวดหมู่ */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeCategory === cat.name
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-900/50 text-slate-400 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* หัวข้อวัน */}
        {activeDay && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-400">Day {activeDay.dayNum}</span>
              <h2 className="text-base font-bold text-slate-100">{activeDay.title}</h2>
              <p className="text-xs text-slate-400">{activeDay.subTitle}</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2.5 rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ฟอร์ม เพิ่ม/แก้ไข */}
        {(isAdding || editingItem) && (
          <form
            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-emerald-400">
                {editingItem ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">เวลา</label>
                <input
                  type="text"
                  placeholder="เช่น 09:30 - 10:30"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">หมวดหมู่</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                >
                  {CATEGORIES.filter((c) => c.name !== "ทั้งหมด").map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">ชื่อสถานที่/กิจกรรม *</label>
              <input
                type="text"
                required
                placeholder="เช่น วัดเซนโซจิ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400">รายละเอียดเพิ่มเติม</label>
              <textarea
                placeholder="รายละเอียด..."
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 h-16"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400">ลิงก์ Google Maps (หรือพิกัด)</label>
              <input
                type="text"
                placeholder="วางลิงก์ https://maps.app.goo.gl/... ที่นี่"
                value={formData.mapUrl}
                onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-emerald-500 text-slate-950 py-2 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-1"
              >
                <Save className="w-4 h-4" /> บันทึก
              </button>
            </div>
          </form>
        )}

        {/* รายการกิจกรรม */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-800/50 rounded-2xl">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">ไม่พบรายการกิจกรรม</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all ${
                  item.completed
                    ? "border-emerald-500/20 opacity-60 bg-slate-950/40"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.time && (
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" /> {item.time}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold ${
                        item.completed ? "line-through text-slate-500" : "text-slate-100"
                      }`}
                    >
                      {item.name}
                    </h3>

                    {item.detail && (
                      <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 mt-3">
                      <button
                        onClick={() => openMap(item.mapUrl, item.name)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg"
                      >
                        <Navigation className="w-3.5 h-3.5" /> นำทาง
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
