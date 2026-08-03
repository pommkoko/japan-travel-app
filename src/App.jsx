import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Circle,
  Train,
  Utensils,
  Camera,
  ShoppingBag,
  Building,
  Bus,
  Clock,
  Coins,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Compass,
  RotateCcw,
  Hotel,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Ticket
} from 'lucide-react';

// Master trip dataset containing full 5-day Tokyo & Fuji itinerary
const INITIAL_TRIP_DATA = {
  trip_name: "Japan Travel (Tokyo & Fuji)",
  total_days: 5,
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
          transport_detail: "ผ่านด่าน ตม. รับกระเป๋า และไปที่เคาน์เตอร์ Keisei เพื่อแลกตั๋ว Skyliner + ซื้อตั๋ว Tokyo Subway 72-Hour Pass",
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
          transport_detail: "เดินไปชานชาลา Keisei นั่งรถไฟด่วน Keisei Skyliner (ยิงตรงไม่หยุดพัก 41 นาที)",
          cost_info: "[ใช้ตั๋ว Skyliner ขาไป]",
          cost_jpy: 0,
          category: "Transit",
          lat: 35.7112,
          lng: 139.7745,
          ticket_url: "https://example.com/sample-ticket-qr" // Example ticket
        },
        {
          id: "day1_03",
          order_index: 3,
          time: "11:30 - 12:15",
          start_point: "สถานี Keisei-Ueno",
          location_name: "โรงแรมที่พัก (ย่าน Ueno)",
          transport_detail: "เดินเท้า 5-10 นาที ลากกระเป๋าไปฝากไว้ที่ล็อกบี้โรงแรม",
          cost_info: "-",
          cost_jpy: 0,
          category: "Hotel",
          lat: 35.7138,
          lng: 139.7773,
          ticket_url: ""
        },
        {
          id: "day1_04",
          order_index: 4,
          time: "12:30 - 12:45",
          start_point: "สถานี Ueno (G16)",
          location_name: "สถานี Asakusa (G19)",
          transport_detail: "เดินเข้าสถานีใต้ดิน นั่ง Tokyo Metro Ginza Line (สายสีส้ม) 3 สถานี ไปลง Asakusa (5 นาที) ออกทางออก Exit 1",
          cost_info: "[เริ่มเปิดใช้ตั๋ว Subway 72h]",
          cost_jpy: 0,
          category: "Transit",
          lat: 35.7107,
          lng: 139.7967,
          ticket_url: ""
        },
        {
          id: "day1_05",
          order_index: 5,
          time: "12:45 - 15:00",
          start_point: "สถานี Asakusa",
          location_name: "วัด Senso-ji & ถนน Nakamise",
          transport_detail: "เดินเท้า 2 นาทีเข้าสู่ประตูโคมแดง (Kaminarimon) ไหว้พระถ่ายรูป ชิมสตรีทฟู้ด และทานมื้อเที่ยง Onigiri Yadoroku",
          cost_info: "ค่ากิน: ~1,500 เยน",
          cost_jpy: 1500,
          category: "Sightseeing",
          lat: 35.7148,
          lng: 139.7967,
          ticket_url: ""
        },
        {
          id: "day1_06",
          order_index: 6,
          time: "15:00 - 15:15",
          start_point: "สถานี Asakusa (A18)",
          location_name: "สถานี Oshiage / Skytree (A20)",
          transport_detail: "เดินไปสถานีใต้ดิน นั่ง Toei Subway Asakusa Line (สายสีชมพู) 2 สถานี ไปลง Oshiage (3 นาที)",
          cost_info: "[ใช้ตั๋ว Subway 72h]",
          cost_jpy: 0,
          category: "Transit",
          lat: 35.7107,
          lng: 139.8131,
          ticket_url: ""
        },
        {
          id: "day1_07",
          order_index: 7,
          time: "15:15 - 17:15",
          start_point: "สถานี Oshiage",
          location_name: "Tokyo Skytree & Solamachi",
          transport_detail: "ขึ้นตึกชมวิว Tokyo Skytree ยามบ่าย มองเห็นวิวเมืองกว้างไกล และเดินช้อปปิ้งของฝากในห้าง Solamachi",
          cost_info: "ค่าขึ้นตึก: ~2,700 เยน",
          cost_jpy: 2700,
          category: "Sightseeing",
          lat: 35.7101,
          lng: 139.8107,
          ticket_url: ""
        },
        {
          id: "day1_08",
          order_index: 8,
          time: "17:30 - 17:45",
          start_point: "สถานี Oshiage (Z14)",
          location_name: "สถานี Akihabara",
          transport_detail: "นั่ง Tokyo Metro Hanzomon Line (สายสีม่วง) ไปลง Kinshicho (Z13) แล้วสลับขึ้นรถไฟ JR Chuo-Sobu Line ไปลง Akihabara",
          cost_info: "[ใช้ Subway 72h + แตะ IC Card 180 เยน]",
          cost_jpy: 180,
          category: "Transit",
          lat: 35.6983,
          lng: 139.7731,
          ticket_url: ""
        },
        {
          id: "day1_09",
          order_index: 9,
          time: "17:45 - 20:00",
          start_point: "สถานี Akihabara",
          location_name: "ศาลเจ้า Kanda Myojin & Akihabara",
          transport_detail: "เดินเท้า 7 นาทีไปไหว้ศาลเจ้า Kanda Myojin ก่อนค่ำ แล้วย้อนกลับมาเดินตึกฟิกเกอร์ อนิเมะ ทานราเมน Menya Itto / Nakiryu",
          cost_info: "ค่ากิน: ~1,200 เยน",
          cost_jpy: 1200,
          category: "Sightseeing",
          lat: 35.702,
          lng: 139.7679,
          ticket_url: ""
        },
        {
          id: "day1_10",
          order_index: 10,
          time: "20:15 - 20:20",
          start_point: "สถานี Akihabara",
          location_name: "สถานี Ueno",
          transport_detail: "นั่งรถไฟ JR Yamanote Line (สายสีเขียววงกลม) ย้อนกลับมา Ueno เพียง 2 สถานี (3 นาที)",
          cost_info: "[แตะ IC Card 150 เยน]",
          cost_jpy: 150,
          category: "Transit",
          lat: 35.7138,
          lng: 139.7773,
          ticket_url: ""
        },
        {
          id: "day1_11",
          order_index: 11,
          time: "20:20 - 22:30",
          start_point: "สถานี Ueno",
          location_name: "ตลาด Ameyoko & ร้าน Isomaru Suisan",
          transport_detail: "เดินรับลมยามค่ำคืนที่ตลาด Ameyoko และทานมันปูย่าง/อาหารทะเลปิดท้ายวันที Isomaru Suisan",
          cost_info: "ค่ากินดื่ม: ~2,500 เยน",
          cost_jpy: 2500,
          category: "Food",
          lat: 35.7088,
          lng: 139.7744,
          ticket_url: ""
        }
      ]
    },
    {
      day: 2,
      title: "Market, Temple & Shibuya",
      subtitle: "Toyosu Market, Gotokuji, Harajuku & Shinjuku",
      locations: [
        {
          id: "day2_01",
          order_index: 1,
          time: "08:00 - 08:25",
          start_point: "สถานี Ueno",
          location_name: "สถานี Shishido (Toyosu)",
          transport_detail: "นั่งใต้ดิน Ginza Line ไป Shimbashi แล้วต่อสาย Yurikamome ไปลงสถานี Shishido (หน้าตลาด Toyosu)",
          cost_info: "[Subway 72h + แตะ IC Card 390 เยน]",
          cost_jpy: 390,
          category: "Transit",
          lat: 35.6457,
          lng: 139.7828,
          ticket_url: ""
        },
        {
          id: "day2_02",
          order_index: 2,
          time: "08:25 - 10:00",
          start_point: "สถานี Shishido",
          location_name: "ตลาดปลา Toyosu (Senkyaku Banrai)",
          transport_detail: "เดินชมโซนตลาดอาหารย้อนยุค Senkyaku Banrai หาอาหารเช้าทานซูชิสายพาน Uobei หรือซาซิมิสดๆ",
          cost_info: "ค่ากิน: ~2,500 เยน",
          cost_jpy: 2500,
          category: "Food",
          lat: 35.6449,
          lng: 139.782,
          ticket_url: ""
        },
        {
          id: "day2_03",
          order_index: 3,
          time: "10:15 - 10:45",
          start_point: "สถานี Toyosu",
          location_name: "สถานี Gotokuji",
          transport_detail: "นั่ง Yurakucho Line จาก Toyosu ไป Ichigaya แล้วเปลี่ยนเป็น Shinjuku Line ไป Shinjuku เพื่อต่อ Odakyu Line ไป Gotokuji",
          cost_info: "[Subway 72h + แตะ IC Card 170 เยน]",
          cost_jpy: 170,
          category: "Transit",
          lat: 35.6521,
          lng: 139.6473,
          ticket_url: ""
        },
        {
          id: "day2_04",
          order_index: 4,
          time: "10:45 - 12:00",
          start_point: "สถานี Gotokuji",
          location_name: "วัดแมวกวัก Gotokuji Temple",
          transport_detail: "เดินเท้า 5 นาทีจากสถานี เข้าสู่วัดแมวกวัก ถ่ายรูปคู่กับฝูงตุ๊กตาแมวกวักนับพันตัว",
          cost_info: "-",
          cost_jpy: 0,
          category: "Sightseeing",
          lat: 35.6481,
          lng: 139.6471,
          ticket_url: ""
        },
        {
          id: "day2_05",
          order_index: 5,
          time: "12:15 - 12:30",
          start_point: "สถานี Gotokuji",
          location_name: "สถานี Harajuku",
          transport_detail: "นั่ง Odakyu Line ย้อนกลับมาลง Yoyogi-uehara แล้วเปลี่ยนเป็น Chiyoda Line ไปลง Meijijingu-mae (Harajuku)",
          cost_info: "[Subway 72h + แตะ IC Card 170 เยน]",
          cost_jpy: 170,
          category: "Transit",
          lat: 35.6702,
          lng: 139.7027,
          ticket_url: ""
        },
        {
          id: "day2_06",
          order_index: 6,
          time: "12:30 - 15:30",
          start_point: "สถานี Harajuku",
          location_name: "ศาลเจ้าเมจิ (Meiji Jingu) & ถนน Takeshita",
          transport_detail: "เดินเข้าป่าศาลเจ้าเมจิ พนมมือขอพร แล้วข้ามฝั่งมาตะลุยถนน Takeshita, Omotesando ทานเกี๊ยวซ่า Harajuku Gyozaro",
          cost_info: "ค่ากิน: ~1,400 เยน",
          cost_jpy: 1400,
          category: "Sightseeing",
          lat: 35.6764,
          lng: 139.6993,
          ticket_url: ""
        },
        {
          id: "day2_07",
          order_index: 7,
          time: "15:45 - 16:00",
          start_point: "สถานี Harajuku",
          location_name: "สถานี Shinjuku",
          transport_detail: "นั่ง JR Yamanote Line ไปลง Shinjuku เพียง 2 สถานี (5 นาที)",
          cost_info: "[แตะ IC Card 150 เยน]",
          cost_jpy: 150,
          category: "Transit",
          lat: 35.6896,
          lng: 139.7006,
          ticket_url: ""
        },
        {
          id: "day2_08",
          order_index: 8,
          time: "16:00 - 18:00",
          start_point: "สถานี Shinjuku",
          location_name: "สวน Shinjuku Gyoen National Garden",
          transport_detail: "เดินออกทางออก South Exit เดิน 10 นาทีเข้าสวน Shinjuku Gyoen เดินชมธรรมชาติก่อนสวนปิด (ประตูปิด 16:30 น.)",
          cost_info: "ค่าเข้าสวน: 500 เยน",
          cost_jpy: 500,
          category: "Sightseeing",
          lat: 35.6852,
          lng: 139.7101,
          ticket_url: ""
        },
        {
          id: "day2_09",
          order_index: 9,
          time: "18:15 - 23:00",
          start_point: "สถานี Shinjuku",
          location_name: "Kabukicho, ตึก Godzilla & Omoide Yokocho",
          transport_detail: "เดินข้ามมาฝั่ง East/North Exit เข้าย่าน Kabukicho ถ่ายรูปหัวก๊อดซิลล่า ทานเทมปุระ Tsunahachi และนั่งดื่มตรอก Omoide Yokocho ยาวๆ ถึงดึก",
          cost_info: "ค่ากินดื่มดึก: ~3,000 เยน",
          cost_jpy: 3000,
          category: "Food",
          lat: 35.6953,
          lng: 139.7021,
          ticket_url: ""
        },
        {
          id: "day2_10",
          order_index: 10,
          time: "23:15 - 23:40",
          start_point: "สถานี Shinjuku",
          location_name: "สถานี Ueno",
          transport_detail: "นั่ง JR Yamanote Line (ขบวนก่อนสุดท้าย) จาก Shinjuku กลับมาลง Ueno (25 นาที) เพื่อกลับโรงแรม",
          cost_info: "[แตะ IC Card 210 เยน]",
          cost_jpy: 210,
          category: "Transit",
          lat: 35.7138,
          lng: 139.7773,
          ticket_url: ""
        }
      ]
    },
    {
      day: 3,
      title: "Fuji Day Trip & Shibuya Night",
      subtitle: "Chureito Pagoda, Kawaguchiko & Shibuya Sky",
      locations: [
        {
          id: "day3_01",
          order_index: 1,
          time: "06:15 - 06:40",
          start_point: "สถานี Ueno",
          location_name: "สถานี Shinjuku (Bus Terminal)",
          transport_detail: "นั่ง JR Yamanote Line จาก Ueno ไปลง Shinjuku ออกทางออก New South Exit ขึ้นชั้น 4 ตึก Busta Shinjuku",
          cost_info: "[แตะ IC Card 210 เยน]",
          cost_jpy: 210,
          category: "Transit",
          lat: 35.6888,
          lng: 139.7005,
          ticket_url: ""
        },
        {
          id: "day3_02",
          order_index: 2,
          time: "07:15 - 09:05",
          start_point: "Shinjuku Bus Terminal",
          location_name: "ป้ายรถบัส Chureito Pagoda (Shimoyoshida)",
          transport_detail: "ขึ้น Highway Bus (รอบ 07:15) ยิงตรงบนทางด่วน ลงป้าย Chureito Pagoda / Shimoyoshida Bus Stop",
          cost_info: "[จองล่วงหน้า ~2,200 เยน]",
          cost_jpy: 2200,
          category: "Transport",
          lat: 35.4988,
          lng: 138.8021,
          ticket_url: ""
        },
        {
          id: "day3_03",
          order_index: 3,
          time: "09:15 - 11:30",
          start_point: "ป้าย Shimoyoshida",
          location_name: "เจดีย์แดง Chureito Pagoda & Honcho St.",
          transport_detail: "เดินขึ้นบันได 398 ขั้น ชมวิวเจดีย์คู่ฟูจิ แล้วเดินลงมา 10 นาทีเข้าถนน Honcho Street",
          cost_info: "-",
          cost_jpy: 0,
          category: "Sightseeing",
          lat: 35.5013,
          lng: 138.8013,
          ticket_url: ""
        },
        {
          id: "day3_04",
          order_index: 4,
          time: "11:30 - 12:30",
          start_point: "ย่าน Shimoyoshida",
          location_name: "ร้านอาหารท้องถิ่น Fujiyoshida",
          transport_detail: "ทานมื้อเที่ยงเมนูท้องถิ่น Yoshida Udon",
          cost_info: "ค่ากิน: ~900 เยน",
          cost_jpy: 900,
          category: "Food",
          lat: 35.4935,
          lng: 138.8041,
          ticket_url: ""
        },
        {
          id: "day3_05",
          order_index: 5,
          time: "12:45 - 13:00",
          start_point: "สถานี Shimoyoshida",
          location_name: "สถานี Kawaguchiko",
          transport_detail: "นั่งรถไฟสาย Fujikyu Railway 3 สถานีไปลงสถานี Kawaguchiko (12 นาที)",
          cost_info: "[แตะ IC Card ~310 เยน]",
          cost_jpy: 310,
          category: "Transit",
          lat: 35.4982,
          lng: 138.7686,
          ticket_url: ""
        },
        {
          id: "day3_06",
          order_index: 6,
          time: "13:15 - 15:00",
          start_point: "สถานี Kawaguchiko",
          location_name: "สวนโออิชิ (Oishi Park)",
          transport_detail: "หน้าสถานี Kawaguchiko นั่งรถบัส Omni Bus (Red Line) ไปลงป้ายสุดท้าย Oishi Park",
          cost_info: "[แตะ IC Card/ตั๋วบัส ~490 เยน]",
          cost_jpy: 490,
          category: "Sightseeing",
          lat: 35.5226,
          lng: 138.746,
          ticket_url: ""
        },
        {
          id: "day3_07",
          order_index: 7,
          time: "15:15 - 16:15",
          start_point: "ป้าย Oishi Park",
          location_name: "กระเช้า Mt. Fuji Panoramic Ropeway",
          transport_detail: "นั่ง Red Line ย้อนกลับมาลงป้าย Ropeway ขึ้นกระเช้าลอยฟ้าชมวิวทะเลสาบ",
          cost_info: "ค่ากระเช้า: ~1,000 เยน",
          cost_jpy: 1000,
          category: "Sightseeing",
          lat: 35.5036,
          lng: 138.7719,
          ticket_url: ""
        },
        {
          id: "day3_08",
          order_index: 8,
          time: "16:30 - 18:30",
          start_point: "สถานี Kawaguchiko",
          location_name: "สถานี Shibuya",
          transport_detail: "ขึ้น Highway Bus ขากลับ (ยิงตรงลง Shibuya Bus Terminal)",
          cost_info: "[จองล่วงหน้า ~2,200 เยน]",
          cost_jpy: 2200,
          category: "Transport",
          lat: 35.658,
          lng: 139.7016,
          ticket_url: ""
        },
        {
          id: "day3_09",
          order_index: 9,
          time: "18:45 - 20:30",
          start_point: "สถานี Shibuya",
          location_name: "Shibuya Sky & ห้าแยก Shibuya",
          transport_detail: "ขึ้นตึก Shibuya Scramble Square เข้า Shibuya Sky ชมวิวไฟเมืองยามค่ำคืน",
          cost_info: "ค่าเข้า Shibuya Sky: ~2,700 เยน",
          cost_jpy: 2700,
          category: "Sightseeing",
          lat: 35.6585,
          lng: 139.7023,
          ticket_url: ""
        },
        {
          id: "day3_10",
          order_index: 10,
          time: "20:30 - 22:00",
          start_point: "ห้าแยก Shibuya",
          location_name: "ร้านอาหารย่าน Shibuya",
          transport_detail: "ทานมื้อเย็นลิ้นวัวย่าง Negishi หรือซูชิสายพาน Uobei Sushi",
          cost_info: "ค่ากิน: ~2,200 เยน",
          cost_jpy: 2200,
          category: "Food",
          lat: 35.6595,
          lng: 139.6998,
          ticket_url: ""
        },
        {
          id: "day3_11",
          order_index: 11,
          time: "22:15 - 22:40",
          start_point: "สถานี Shibuya",
          location_name: "สถานี Ueno",
          transport_detail: "นั่ง JR Yamanote Line จาก Shibuya วิ่งตรงกลับมาลงสถานี Ueno (27 นาที)",
          cost_info: "[แตะ IC Card 210 เยน]",
          cost_jpy: 210,
          category: "Transit",
          lat: 35.7138,
          lng: 139.7773,
          ticket_url: ""
        }
      ]
    },
    {
      day: 4,
      title: "Tsukiji, Odaiba & Roppongi",
      subtitle: "Tsukiji Fish Market, Imperial Palace, Odaiba",
      locations: [
        {
          id: "day4_01",
          order_index: 1,
          time: "08:00 - 08:15",
          start_point: "สถานี Ueno (H18)",
          location_name: "สถานี Tsukiji (H11)",
          transport_detail: "นั่ง Tokyo Metro Hibiya Line จาก Ueno ลงที่ Tsukiji",
          cost_info: "[ใช้ตั๋ว Subway 72h]",
          cost_jpy: 0,
          category: "Transit",
          lat: 35.6678,
          lng: 139.7723,
          ticket_url: ""
        },
        {
          id: "day4_02",
          order_index: 2,
          time: "08:15 - 10:15",
          start_point: "สถานี Tsukiji",
          location_name: "ตลาดปลา Tsukiji & วัด Tsukiji Hongwanji",
          transport_detail: "แวะวัดทรงอินเดีย Tsukiji Hongwanji และข้ามฝั่งไปทานสตรีทฟู้ด",
          cost_info: "ค่ากิน: ~2,000 เยน",
          cost_jpy: 2000,
          category: "Food",
          lat: 35.6654,
          lng: 139.7707,
          ticket_url: ""
        },
        {
          id: "day4_03",
          order_index: 3,
          time: "10:15 - 11:45",
          start_point: "ตลาดปลา Tsukiji",
          location_name: "วัด Zojo-ji & สวน Shiba Park",
          transport_detail: "นั่งใต้ดินไปลง Daimon เดินถ่ายรูปอุโบสถวัดโบราณคู่กับ Tokyo Tower",
          cost_info: "ฟรี",
          cost_jpy: 0,
          category: "Sightseeing",
          lat: 35.6574,
          lng: 139.7482,
          ticket_url: ""
        },
        {
          id: "day4_04",
          order_index: 4,
          time: "12:00 - 14:00",
          start_point: "สถานี Otemachi",
          location_name: "Imperial Palace & ทานมื้อเที่ยง",
          transport_detail: "เดินชมสวนพระราชวังอิมพีเรียล ทานข้าวแกงกะหรี่ Curry Bondy",
          cost_info: "ค่ากิน: ~1,500 เยน",
          cost_jpy: 1500,
          category: "Sightseeing",
          lat: 35.6852,
          lng: 139.7528,
          ticket_url: ""
        },
        {
          id: "day4_05",
          order_index: 5,
          time: "14:15 - 17:15",
          start_point: "สถานี Tokyo / Shimbashi",
          location_name: "Odaiba Marine Park & ห้าง DiverCity",
          transport_detail: "นั่งรถไฟลอยฟ้า Yurikamome ไป Odaiba ถ่ายรูปเทพีเสรีภาพจำลองและหุ่น Gundam",
          cost_info: "ค่าเดินทาง/กิน: ~1,500 เยน",
          cost_jpy: 1500,
          category: "Sightseeing",
          lat: 35.6252,
          lng: 139.7754,
          ticket_url: ""
        },
        {
          id: "day4_06",
          order_index: 6,
          time: "17:30 - 21:00",
          start_point: "สถานี Odaiba",
          location_name: "Roppongi Hills & มื้อค่ำ",
          transport_detail: "ขึ้นจุดชมวิวชั้น 52 (Mori Tower) และทานยากิโทริยามค่ำคืน",
          cost_info: "ค่าเข้า/ค่ากิน: ~4,000 เยน",
          cost_jpy: 4000,
          category: "Sightseeing",
          lat: 35.6605,
          lng: 139.7292,
          ticket_url: ""
        },
        {
          id: "day4_07",
          order_index: 7,
          time: "21:15 - 21:35",
          start_point: "สถานี Roppongi (H04)",
          location_name: "สถานี Ueno (H18)",
          transport_detail: "นั่ง Tokyo Metro Hibiya Line กลับมาลงสถานี Ueno",
          cost_info: "[ใช้ตั๋ว Subway 72h]",
          cost_jpy: 0,
          category: "Transit",
          lat: 35.7138,
          lng: 139.7773,
          ticket_url: ""
        }
      ]
    },
    {
      day: 5,
      title: "Yanaka, Shopping & Departure",
      subtitle: "Bunkyo Civic Center, Yanaka Ginza & Narita",
      locations: [
        {
          id: "day5_01",
          order_index: 1,
          time: "08:50 - 10:00",
          start_point: "สถานี Korakuen",
          location_name: "Bunkyo Civic Center (ชั้น 25)",
          transport_detail: "เดินเข้าตึกรัฐบาล Bunkyo ขึ้นลิฟต์ไปชั้น 25 ฟรี! ชมวิวเมืองโตเกียว",
          cost_info: "ฟรี",
          cost_jpy: 0,
          category: "Sightseeing",
          lat: 35.7081,
          lng: 139.7525,
          ticket_url: ""
        },
        {
          id: "day5_02",
          order_index: 2,
          time: "10:30 - 12:00",
          start_point: "สถานี Nezu / Nippori",
          location_name: "ศาลเจ้า Nezu Shrine & เมืองเก่ายานากะ",
          transport_detail: "เดินถ่ายรูปอุโมงค์เสาแดง Nezu Shrine และถนนคนเดิน Yanaka Ginza",
          cost_info: "ค่าขนม: ~1,000 เยน",
          cost_jpy: 1000,
          category: "Sightseeing",
          lat: 35.7202,
          lng: 139.7608,
          ticket_url: ""
        },
        {
          id: "day5_03",
          order_index: 3,
          time: "12:30 - 13:45",
          start_point: "สถานี Ueno",
          location_name: "ตึกม่วง Takeya / Don Quijote Ueno",
          transport_detail: "ซื้อของฝากนาทีสุดท้ายที่ตึกม่วง ทานข้าว และรับกระเป๋าเดินทางที่โรงแรม",
          cost_info: "ค่ากิน: ~1,000 เยน",
          cost_jpy: 1000,
          category: "Shopping",
          lat: 35.7073,
          lng: 139.776,
          ticket_url: ""
        },
        {
          id: "day5_04",
          order_index: 4,
          time: "14:00 - 14:41",
          start_point: "สถานี Keisei-Ueno",
          location_name: "สนามบินนาริตะ (Terminal 1/2)",
          transport_detail: "ขึ้นรถไฟด่วน Keisei Skyliner (รอบ 14:00 น.) ยิงตรงถึงสนามบินนาริตะ",
          cost_info: "[ใช้ตั๋ว Skyliner ขากลับ]",
          cost_jpy: 0,
          category: "Transport",
          lat: 35.7647,
          lng: 140.3863,
          ticket_url: ""
        },
        {
          id: "day5_05",
          order_index: 5,
          time: "14:45 - 17:00",
          start_point: "สนามบินนาริตะ",
          location_name: "เดินทางกลับประเทศไทย",
          transport_detail: "โหลดกระเป๋า ผ่านด่านตรวจค้น ผ่าน Duty Free และเตรียมขึ้นเครื่อง",
          cost_info: "-",
          cost_jpy: 0,
          category: "Transport",
          lat: 35.7647,
          lng: 140.3863,
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

function Header({ tripData, activeDay, setActiveDay, checkedState, totalJPY }) {
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
              {tripData.total_days} วัน | รวม {totalJPY.toLocaleString()} JPY
            </p>
          </div>
        </div>

        <div className="text-right bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0 ml-2">
          <div className="text-[10px] text-slate-400 font-medium">ความคืบหน้า</div>
          <div className="text-xs font-bold text-rose-400">
            {checkedCount}/{totalItemsCount} ({completionPercent}%)
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
    lat: 35.6895, // Default Tokyo
    lng: 139.6917,
    ticket_url: '',
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      // Reset form for new location
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
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up sm:animate-fade-in border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <Pencil className="w-4 h-4 text-rose-500" />
            {initialData?.id ? 'แก้ไขข้อมูลสถานที่' : 'เพิ่มสถานที่ใหม่'}
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
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
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ชื่อสถานที่ (เป้าหมาย)</label>
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
              <Ticket className="w-3.5 h-3.5" /> ลิงก์เก็บตั๋ว / QR Code (Ticket URL)
            </label>
            <input type="text" name="ticket_url" value={formData.ticket_url || ''} onChange={handleChange} placeholder="https://..." className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white" />
          </div>

          {/* Geo Coordinates Helper */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 mb-2">พิกัดแผนที่ (สำหรับปุ่มนำทาง):</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} placeholder="Lat" className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white" />
              <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} placeholder="Lng" className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
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

          <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-start gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>{location.transport_detail}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{location.cost_info}</span>
            {location.cost_jpy > 0 && (
              <span className="ml-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                ¥{location.cost_jpy.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Footer (Navigation, Ticket, Order Arrows) */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
            
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={googleMapsUrl}
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
        loc.transport_detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.start_point.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dayData.locations, categoryFilter, searchQuery]);

  const daySubtotalJPY = useMemo(() => {
    return dayData.locations.reduce((sum, item) => sum + (item.cost_jpy || 0), 0);
  }, [dayData.locations]);

  // Determine actual length for move up/down disabled states
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
          <span className="text-[10px] text-slate-400 block">งบวันน้ี</span>
          <span className="text-xs font-extrabold text-amber-400">
            ¥{daySubtotalJPY.toLocaleString()}
          </span>
        </div>
      </div>

      {filteredLocations.length > 0 ? (
        <div className="relative">
          {filteredLocations.map((loc) => {
            // Find real index for move constraints
            const realIndex = dayData.locations.findIndex(l => l.id === loc.id);
            return (
              <LocationCard
                key={loc.id}
                location={loc}
                isChecked={!!checkedState[loc.id]}
                onToggleCheck={onToggleCheck}
                onEdit={onEdit}
                onMoveUp={(id) => onMove(dayData.day, realIndex, 'up')}
                onMoveDown={(id) => onMove(dayData.day, realIndex, 'down')}
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

      {/* Add new location button at the end of the day */}
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
  // Load editable trip data from localStorage
  const [tripData, setTripData] = useState(() => {
    try {
      const saved = localStorage.getItem('japan_trip_data_v2');
      return saved ? JSON.parse(saved) : INITIAL_TRIP_DATA;
    } catch (e) {
      console.error("Failed to load trip data", e);
      return INITIAL_TRIP_DATA;
    }
  });

  const [activeDay, setActiveDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Load checked-in state
  const [checkedState, setCheckedState] = useState(() => {
    try {
      const saved = localStorage.getItem('japan_trip_checked_v2');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocData, setEditingLocData] = useState(null); // null = add new, object = edit
  const [targetDayNum, setTargetDayNum] = useState(1);

  // Auto-save logic
  useEffect(() => {
    localStorage.setItem('japan_trip_data_v2', JSON.stringify(tripData));
  }, [tripData]);

  useEffect(() => {
    localStorage.setItem('japan_trip_checked_v2', JSON.stringify(checkedState));
  }, [checkedState]);

  // Actions
  const handleToggleCheck = (id) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetEverything = () => {
    if (window.confirm("คุณต้องการล้างการแก้ไขและรีเซ็ตแผนกลับเป็นค่าเริ่มต้นทั้งหมดใช่หรือไม่? (ข้อมูลจะหายไป)")) {
      setTripData(INITIAL_TRIP_DATA);
      setCheckedState({});
      localStorage.removeItem('japan_trip_data_v2');
      localStorage.removeItem('japan_trip_checked_v2');
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
    setTripData(prev => {
      const newData = { ...prev };
      const dayIndex = newData.days.findIndex(d => d.day === dayNum);
      const newLocations = [...newData.days[dayIndex].locations];

      if (locationData.id) {
        // Edit existing
        const locIndex = newLocations.findIndex(l => l.id === locationData.id);
        if (locIndex >= 0) newLocations[locIndex] = locationData;
      } else {
        // Add new
        const newId = `day${dayNum}_ext_${Date.now()}`;
        const newOrderIndex = newLocations.length > 0 
          ? Math.max(...newLocations.map(l => l.order_index)) + 1 
          : 1;
        newLocations.push({ ...locationData, id: newId, order_index: newOrderIndex });
      }

      newData.days[dayIndex].locations = newLocations;
      return newData;
    });
    setIsModalOpen(false);
  };

  const deleteLocationData = (dayNum, locationId) => {
    setTripData(prev => {
      const newData = { ...prev };
      const dayIndex = newData.days.findIndex(d => d.day === dayNum);
      newData.days[dayIndex].locations = newData.days[dayIndex].locations.filter(l => l.id !== locationId);
      
      // Re-index remaining
      newData.days[dayIndex].locations.forEach((loc, i) => loc.order_index = i + 1);
      return newData;
    });
    setIsModalOpen(false);
  };

  const moveLocation = (dayNum, index, direction) => {
    setTripData(prev => {
      const newData = { ...prev };
      const dayIndex = newData.days.findIndex(d => d.day === dayNum);
      const locs = [...newData.days[dayIndex].locations];

      if (direction === 'up' && index > 0) {
        [locs[index - 1], locs[index]] = [locs[index], locs[index - 1]];
      } else if (direction === 'down' && index < locs.length - 1) {
        [locs[index + 1], locs[index]] = [locs[index], locs[index + 1]];
      }

      // Re-index
      locs.forEach((loc, i) => loc.order_index = i + 1);
      newData.days[dayIndex].locations = locs;
      return newData;
    });
  };

  const totalJPY = useMemo(() => {
    return tripData.days.reduce((accDay, d) => {
      return accDay + d.locations.reduce((accLoc, loc) => accLoc + (Number(loc.cost_jpy) || 0), 0);
    }, 0);
  }, [tripData]);

  const visibleDays = useMemo(() => {
    return activeDay === 'all' ? tripData.days : tripData.days.filter((d) => d.day === activeDay);
  }, [tripData, activeDay]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-16">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900/95 shadow-2xl relative border-x border-slate-200 dark:border-slate-800">
        
        <Header
          tripData={tripData}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          checkedState={checkedState}
          totalJPY={totalJPY}
        />

        <main className="p-4">
          {/* Quick Filters */}
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
              Editable Japan Itinerary • Auto-saved to your device
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