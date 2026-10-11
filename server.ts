import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize server-side Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DB_FILE = path.resolve(process.cwd(), 'erp_cloud_db.json');

interface CloudDB {
  products: any[];
  categories: any[];
  departments: any[];
  companies: any[];
  units: any[];
  customers: any[];
  invoices: any[];
  purchases: any[];
  telecomOperators: any[];
  telecomTransactions: any[];
  telecomBalanceAdds: any[];
  utilityOperators: any[];
  utilityTransactions: any[];
  offers: any[];
  subscriptionPlans: any[];
  employees: any[];
  attendance: any[];
  salaries: any[];
  branches: any[];
  users: any[];
  auditLogs: any[];
  notifications: any[];
  incomeExpense: any[];
  bankTransactions: any[];
  warranties: any[];
  installments: any[];
  targets: any[];
  itemTransfers: any[];
  pinnedModules: string[];
  themeConfig: {
    primaryColor: string;
    accentColor: string;
    soundEnabled: boolean;
    businessName: string;
    legalName: string;
    crNo: string;
    phone: string;
    email: string;
    address: string;
    currency: string;
    vatRate: number;
    decimalPlaces: number;
  };
  translations: Record<string, Record<string, string>>;
  updatedAt: string;
}

const DEFAULT_DB: CloudDB = {
  products: [
    { id: 1, nameEn: 'iPhone 15 Pro Max 256GB', nameBn: 'আইফোন ১৫ প্রো ম্যাক্স ২৫৬জিবি', nameAr: 'آيفون ١٥ برو ماكس ٢٥٦ جيجا', category: 'Mobile', brand: 'Apple', company: 'Apple Inc.', department: 'Electronics', unit: 'Pcs', model: 'A2849', variant: 'Natural Titanium / 256GB', barcode: '8901234567890', imei: '356789123456789', serialNo: 'SN-APL-99201', cost: 410.000, price: 479.000, wholesale: 455.000, stock: 12, lowStockAlert: 3, warranty: '1 Year Official Apple', featured: true, active: true, hasImei: true, boxPack: true, is_deleted: false },
    { id: 2, nameEn: 'Samsung Galaxy S24 Ultra 5G', nameBn: 'স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা ৫জি', nameAr: 'سامسونج جالاكسي إس ٢٤ ألترا', category: 'Mobile', brand: 'Samsung', company: 'Samsung Gulf', department: 'Electronics', unit: 'Pcs', model: 'SM-S928B', variant: 'Titanium Gray / 512GB', barcode: '8901234567891', imei: '987654321123456', serialNo: 'SN-SAM-88412', cost: 365.000, price: 429.000, wholesale: 405.000, stock: 9, lowStockAlert: 3, warranty: '1 Year Dealer Warranty', featured: true, active: true, hasImei: true, boxPack: true, is_deleted: false },
    { id: 3, nameEn: 'Sony WH-1000XM5 ANC Headphones', nameBn: 'সনি ডব্লিউএইচ-১০০০এক্সএম৫ হেডফোন', nameAr: 'سماعات سوني اللاسلكية العازلة للضوضاء', category: 'Audio', brand: 'Sony', company: 'Sony MEA', department: 'Accessories', unit: 'Pcs', model: 'WH-1000XM5', variant: 'Midnight Black', barcode: '8901234567892', imei: '', serialNo: 'SN-SNY-55309', cost: 105.000, price: 134.900, wholesale: 122.000, stock: 18, lowStockAlert: 5, warranty: '6 Months Warranty', featured: true, active: true, hasImei: false, boxPack: true, is_deleted: false },
    { id: 4, nameEn: 'Samsung 65" Crystal UHD 4K Smart TV', nameBn: 'স্যামসাং ৬৫" ফোর-কে স্মার্ট টিভি', nameAr: 'تلفزيون سامسونج ذكي ٦٥ بوصة ٤ كي', category: 'TV', brand: 'Samsung', company: 'Samsung Gulf', department: 'Home Appliances', unit: 'Pcs', model: 'UA65CU8000', variant: '65 Inch', barcode: '8901234567893', imei: '', serialNo: 'SN-TV-44021', cost: 175.000, price: 225.000, wholesale: 210.000, stock: 6, lowStockAlert: 2, warranty: '2 Years Official Warranty', featured: true, active: true, hasImei: false, boxPack: true, is_deleted: false },
    { id: 5, nameEn: 'Xiaomi Redmi Note 13 Pro 5G', nameBn: 'শাওমি রেডমি নোট ১৩ প্রো ৫জি', nameAr: 'شاومي ريدمي نوت ١٣ برو', category: 'Mobile', brand: 'Xiaomi', company: 'Xiaomi Oman', department: 'Electronics', unit: 'Pcs', model: '2312DRA50G', variant: 'Aurora Purple / 256GB', barcode: '8901234567894', imei: '864209753124680', serialNo: 'SN-XMI-22109', cost: 88.000, price: 112.500, wholesale: 104.000, stock: 24, lowStockAlert: 5, warranty: '1 Year Warranty', featured: true, active: true, hasImei: true, boxPack: true, is_deleted: false },
    { id: 6, nameEn: 'Apple MacBook Air 15" M3 Chip', nameBn: 'অ্যাপল ম্যাকবুক এয়ার ১৫" এম৩ চিপ', nameAr: 'أبل ماك بوك إير ١٥ بوصة إم ٣', category: 'Laptop', brand: 'Apple', company: 'Apple Inc.', department: 'Computing', unit: 'Pcs', model: 'MRYU3', variant: '16GB RAM / 512GB SSD', barcode: '8901234567895', imei: '', serialNo: 'SN-MAC-77901', cost: 485.000, price: 565.000, wholesale: 540.000, stock: 5, lowStockAlert: 2, warranty: '1 Year Apple Care', featured: true, active: true, hasImei: false, boxPack: true, is_deleted: false },
    { id: 7, nameEn: 'Walton High-Speed Ceiling Fan 56"', nameBn: 'ওয়ালটন সিলিং ফ্যান ৫৬ ইঞ্চি', nameAr: 'مروحة سقف والتون عالية السرعة', category: 'Appliances', brand: 'Walton', company: 'Walton Group', department: 'Home Appliances', unit: 'Box', model: 'WCF-560', variant: 'Classic White', barcode: '8901234567896', imei: '', serialNo: 'SN-WLT-10023', cost: 14.500, price: 19.500, wholesale: 17.500, stock: 35, lowStockAlert: 8, warranty: '2 Years Motor Warranty', featured: false, active: true, hasImei: false, boxPack: true, is_deleted: false },
    { id: 8, nameEn: 'Apple Watch Series 10 GPS 46mm', nameBn: 'অ্যাপল ওয়াচ সিরিজ ১০ ৪৬মিমি', nameAr: 'ساعة أبل سيريس ١٠ مقاس ٤٦ مم', category: 'Watch', brand: 'Apple', company: 'Apple Inc.', department: 'Wearables', unit: 'Pcs', model: 'MWWE3', variant: 'Jet Black Aluminum', barcode: '8901234567897', imei: '', serialNo: 'SN-AW-66012', cost: 132.000, price: 164.000, wholesale: 152.000, stock: 14, lowStockAlert: 4, warranty: '1 Year Apple Warranty', featured: true, active: true, hasImei: false, boxPack: true, is_deleted: false },
  ],
  categories: [
    { id: 1, name: 'Mobile', nameBn: 'মোবাইল', nameAr: 'الهواتف' },
    { id: 2, name: 'TV', nameBn: 'টিভি', nameAr: 'التلفزيونات' },
    { id: 3, name: 'Laptop', nameBn: 'ল্যাপটপ', nameAr: 'اللابتوبات' },
    { id: 4, name: 'Audio', nameBn: 'অডিও', nameAr: 'الصوتيات' },
    { id: 5, name: 'Watch', nameBn: 'স্মার্ট ওয়াচ', nameAr: 'الساعات الذكية' },
    { id: 6, name: 'Appliances', nameBn: 'হোম অ্যাপ্লায়েন্স', nameAr: 'الأجهزة المنزلية' },
    { id: 7, name: 'Accessories', nameBn: 'অ্যাকসেসরিজ', nameAr: 'الإكسسوارات' },
  ],
  departments: [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Accessories' },
    { id: 3, name: 'Home Appliances' },
    { id: 4, name: 'Computing' },
    { id: 5, name: 'Telecom Services' },
  ],
  companies: [
    { id: 1, name: 'Apple Inc.' },
    { id: 2, name: 'Samsung Gulf' },
    { id: 3, name: 'Sony MEA' },
    { id: 4, name: 'Xiaomi Oman' },
    { id: 5, name: 'Walton Group' },
  ],
  units: [
    { id: 1, name: 'Pcs' },
    { id: 2, name: 'Box' },
    { id: 3, name: 'Carton' },
    { id: 4, name: 'Set' },
  ],
  customers: [
    { id: 1, name: 'Sheikh Ahmed Al-Balushi', phone: '+968 9988 7766', email: 'ahmed.balushi@omanmail.om', address: 'Mabellah Sanaya, Muscat, Oman', branch: 'Mabellah Main Branch', totalPurchases: 1840.500, segment: 'VIP Diamond', loyaltyPoints: 1840, balance: 0.000, is_deleted: false },
    { id: 2, name: 'Fatima Al-Rawahi', phone: '+968 9977 4455', email: 'fatima.rawahi@omanmail.om', address: 'Al Khoudh, Seeb, Oman', branch: 'Seeb Commercial Branch', totalPurchases: 920.000, segment: 'VIP Gold', loyaltyPoints: 920, balance: 25.000, is_deleted: false },
    { id: 3, name: 'Mohammad Robiul Islam', phone: '+968 9430 1393', email: 'assalatasom@gmail.com', address: 'Ruwi High Street, Muscat, Oman', branch: 'Ruwi Wholesale Hub', totalPurchases: 2450.000, segment: 'VIP Platinum', loyaltyPoints: 2450, balance: 0.000, is_deleted: false },
    { id: 4, name: 'Salim Al-Harthi', phone: '+968 9211 3344', email: 'salim.harthi@omanmail.om', address: 'Sohar Industrial Area, Oman', branch: 'Sohar Regional Branch', totalPurchases: 310.000, segment: 'Regular', loyaltyPoints: 310, balance: 0.000, is_deleted: false },
  ],
  invoices: [
    {
      id: 1,
      invoice_no: 'RST-00001',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      customer: 'Sheikh Ahmed Al-Balushi',
      customerId: 1,
      branch: 'Mabellah Main Branch',
      items: [
        { id: 1, name: 'iPhone 15 Pro Max 256GB', barcode: '8901234567890', imei: '356789123456789', price: 479.000, cost: 410.000, qty: 1 },
        { id: 3, name: 'Sony WH-1000XM5 ANC Headphones', barcode: '8901234567892', imei: '', price: 134.900, cost: 105.000, qty: 1 }
      ],
      subtotal: 613.900,
      discount: 3.900,
      vat: 30.500,
      grand_total: 640.500,
      payment: 'Card',
      profit: 94.900,
      status: 'Paid',
      operator: 'admin',
      is_deleted: false
    },
    {
      id: 2,
      invoice_no: 'RST-00002',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      customer: 'Mohammad Robiul Islam',
      customerId: 3,
      branch: 'Mabellah Main Branch',
      items: [
        { id: 2, name: 'Samsung Galaxy S24 Ultra 5G', barcode: '8901234567891', imei: '987654321123456', price: 429.000, cost: 365.000, qty: 1 }
      ],
      subtotal: 429.000,
      discount: 0.000,
      vat: 21.450,
      grand_total: 450.450,
      payment: 'Cash',
      profit: 64.000,
      status: 'Paid',
      operator: 'admin',
      is_deleted: false
    }
  ],
  purchases: [
    { id: 1, po_no: 'PUR-00101', date: new Date(Date.now() - 86400000 * 4).toISOString(), supplier: 'Dubai Al-Khaleej Distributors', product: 'iPhone 15 Pro Max 256GB', barcode: '8901234567890', qty: 10, unitCost: 410.000, total: 4100.000, branch: 'Mabellah Main Branch' },
    { id: 2, po_no: 'PUR-00102', date: new Date(Date.now() - 86400000 * 1).toISOString(), supplier: 'Muscat Samsung Authorized Hub', product: 'Samsung Galaxy S24 Ultra 5G', barcode: '8901234567891', qty: 8, unitCost: 365.000, total: 2920.000, branch: 'Mabellah Main Branch' }
  ],
  telecomOperators: [
    { id: 1, name: 'Omantel (Hayyak / Baqati)', code: 'OMT', color: '#008542', balance: 450.000, commissionType: 'percent', commissionValue: 2.5, latencyMs: 18, reliability: 99.94, packetLoss: 0.01, status: 'Optimal', is_active: true },
    { id: 2, name: 'Ooredoo Oman (Shababiah)', code: 'OOD', color: '#e11d48', balance: 320.500, commissionType: 'fixed', commissionValue: 0.055, latencyMs: 22, reliability: 99.89, packetLoss: 0.02, status: 'Optimal', is_active: true },
    { id: 3, name: 'Vodafone Oman (5G Red)', code: 'VDF', color: '#dc2626', balance: 280.000, commissionType: 'percent', commissionValue: 2.8, latencyMs: 16, reliability: 99.96, packetLoss: 0.00, status: 'Optimal', is_active: true },
    { id: 4, name: 'FRiENDi Mobile Oman', code: 'FRD', color: '#7c3aed', balance: 150.000, commissionType: 'fixed', commissionValue: 0.040, latencyMs: 27, reliability: 99.78, packetLoss: 0.04, status: 'Nominal', is_active: true },
    { id: 5, name: 'Renna Mobile Oman', code: 'RNN', color: '#ea580c', balance: 115.000, commissionType: 'fixed', commissionValue: 0.035, latencyMs: 29, reliability: 99.72, packetLoss: 0.05, status: 'Nominal', is_active: true },
    { id: 6, name: 'Awasr Fiber High-Speed', code: 'AWS', color: '#0284c7', balance: 500.000, commissionType: 'percent', commissionValue: 3.5, latencyMs: 9, reliability: 99.99, packetLoss: 0.00, status: 'Optimal', is_active: true },
  ],
  telecomTransactions: [
    { id: 1, txNo: 'TEL-9001', operatorId: 1, operatorName: 'Omantel (Hayyak / Baqati)', phone: '+968 9430 1393', amount: 5.000, profit: 0.125, previousBalance: 455.000, newBalance: 450.000, date: new Date(Date.now() - 7200000).toISOString(), dealer: 'admin', branch: 'Mabellah Main Branch' },
    { id: 2, txNo: 'TEL-9002', operatorId: 2, operatorName: 'Ooredoo Oman (Shababiah)', phone: '+968 9988 7766', amount: 2.000, profit: 0.055, previousBalance: 322.500, newBalance: 320.500, date: new Date(Date.now() - 3600000).toISOString(), dealer: 'dealer1', branch: 'Seeb Commercial Branch' },
  ],
  telecomBalanceAdds: [
    { id: 1, operatorId: 1, operatorName: 'Omantel (Hayyak / Baqati)', amount: 200.000, previousBalance: 255.000, newBalance: 455.000, date: new Date(Date.now() - 86400000).toISOString(), operator: 'admin' }
  ],
  utilityOperators: [
    { id: 1, name: 'Nama Electricity Supply (ONEIC)', code: 'ELEC', color: '#d97706', commissionType: 'percent', commissionValue: 1.2, is_active: true },
    { id: 2, name: 'Diam / Nama Water Services', code: 'WATER', color: '#0284c7', commissionType: 'percent', commissionValue: 1.2, is_active: true },
    { id: 3, name: 'Omantel / Awasr Home Fiber Bill', code: 'FIBER', color: '#059669', commissionType: 'percent', commissionValue: 2.0, is_active: true },
  ],
  utilityTransactions: [
    { id: 1, billNo: 'UTL-301', operatorId: 1, operatorName: 'Nama Electricity Supply (ONEIC)', accountNo: 'ELEC-8849201', customerName: 'Sheikh Ahmed Al-Balushi', amount: 34.500, profit: 0.414, date: new Date(Date.now() - 14400000).toISOString(), operator: 'admin' }
  ],
  offers: [
    { id: 1, titleEn: 'Eid Al-Watani Smartphone Fest', titleBn: 'ঈদ আল-ওয়াতানি স্মার্টফোন উৎসব', titleAr: 'مهرجان الهواتف الذكية الوطني', description: 'Up to 15% discount + free protection kit on flagship 5G phones', type: 'percent', value: 15, category: 'Mobile', minPurchase: 150.000, targetSegment: 'VIP Diamond', active: true },
    { id: 2, titleEn: 'Oman Fiber & Smart TV Bundle', titleBn: 'ওমান ফাইবার ও স্মার্ট টিভি বান্ডেল', titleAr: 'باقة الألياف البصرية والتلفزيون الذكي', description: 'Flat 25 OMR off on 65" 4K TVs with Awasr/Omantel Fiber recharge', type: 'fixed', value: 25.000, category: 'TV', minPurchase: 200.000, targetSegment: 'All', active: true },
    { id: 3, titleEn: 'Dealer Telecom Margin Booster', titleBn: 'ডিলার টেলিকম মার্জিন বুস্টার', titleAr: 'عرض تعزيز هامش ربح وكلاء الاتصالات', description: 'Extra 0.5% bonus commission on top-ups exceeding 100 OMR/day', type: 'percent', value: 0.5, category: 'Telecom', minPurchase: 100.000, targetSegment: 'Dealer', active: true }
  ],
  subscriptionPlans: [
    { id: 1, operator: 'Omantel', planName: 'Baqati Sinbad 5G', priceOmr: 12.000, validityDays: 30, dataGb: 45, socialDataGb: 20, localMinutes: 700, intlMinutes: 50, dealerMarginPct: 2.5, speedMbps: 500, badge: 'Best Value' },
    { id: 2, operator: 'Ooredoo', planName: 'Shababiah Plus 5G', priceOmr: 10.000, validityDays: 28, dataGb: 35, socialDataGb: 15, localMinutes: 500, intlMinutes: 30, dealerMarginPct: 2.75, speedMbps: 450, badge: 'Popular Youth' },
    { id: 3, operator: 'Vodafone', planName: 'Red Unlimited 5G', priceOmr: 16.000, validityDays: 30, dataGb: 100, socialDataGb: 50, localMinutes: 1500, intlMinutes: 100, dealerMarginPct: 2.8, speedMbps: 850, badge: 'High Margin' },
    { id: 4, operator: 'FRiENDi', planName: 'Halal International', priceOmr: 5.000, validityDays: 28, dataGb: 14, socialDataGb: 5, localMinutes: 200, intlMinutes: 120, dealerMarginPct: 3.2, speedMbps: 150, badge: 'Top Expat Plan' },
    { id: 5, operator: 'Awasr', planName: 'Fibernet 1Gbps Home', priceOmr: 29.000, validityDays: 30, dataGb: 9999, socialDataGb: 9999, localMinutes: 1000, intlMinutes: 0, dealerMarginPct: 3.5, speedMbps: 1000, badge: 'Ultra Low Latency' },
    { id: 6, operator: 'Renna', planName: 'Renna Super Saver', priceOmr: 4.000, validityDays: 28, dataGb: 10, socialDataGb: 4, localMinutes: 150, intlMinutes: 60, dealerMarginPct: 3.0, speedMbps: 120, badge: 'Budget Pick' },
  ],
  employees: [
    { id: 1, name: 'Tariq Al-Zadjali', position: 'Branch Manager', branch: 'Mabellah Main Branch', phone: '+968 9570 6628', salary: 550.000, commissionPct: 1.5, joinDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Kamrul Hasan', position: 'Senior POS & IMEI Specialist', branch: 'Mabellah Main Branch', phone: '+968 9430 1393', salary: 340.000, commissionPct: 1.0, joinDate: '2024-03-10', status: 'Active' },
    { id: 3, name: 'Yusuf Al-Kindi', position: 'Telecom Dealer Supervisor', branch: 'Seeb Commercial Branch', phone: '+968 9122 8899', salary: 420.000, commissionPct: 2.0, joinDate: '2024-06-01', status: 'Active' },
  ],
  attendance: [
    { id: 1, date: new Date().toISOString().slice(0, 10), employee: 'Tariq Al-Zadjali', branch: 'Mabellah Main Branch', status: 'Present', checkIn: '08:55 AM' },
    { id: 2, date: new Date().toISOString().slice(0, 10), employee: 'Kamrul Hasan', branch: 'Mabellah Main Branch', status: 'Present', checkIn: '08:58 AM' },
    { id: 3, date: new Date().toISOString().slice(0, 10), employee: 'Yusuf Al-Kindi', branch: 'Seeb Commercial Branch', status: 'Present', checkIn: '09:02 AM' },
  ],
  salaries: [
    { id: 1, date: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10), employee: 'Tariq Al-Zadjali', month: 'September 2026', amount: 550.000, status: 'Paid' },
    { id: 2, date: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10), employee: 'Kamrul Hasan', month: 'September 2026', amount: 340.000, status: 'Paid' },
  ],
  branches: [
    { id: 1, name: 'Mabellah Main Branch', address: 'Mabellah Sanaya, Road No 6, Muscat, Oman', phone: '+968 9430 1393', manager: 'Tariq Al-Zadjali', is_active: true },
    { id: 2, name: 'Seeb Commercial Branch', address: 'Al Khoudh Souq Street, Seeb, Oman', phone: '+968 9570 6628', manager: 'Yusuf Al-Kindi', is_active: true },
    { id: 3, name: 'Ruwi Wholesale Hub', address: 'Ruwi High Street, Muscat, Oman', phone: '+968 9988 1122', manager: 'Mohammad Robiul', is_active: true },
    { id: 4, name: 'Sohar Regional Branch', address: 'Sohar Industrial Highway, Oman', phone: '+968 9211 3344', manager: 'Salim Al-Harthi', is_active: true },
  ],
  users: [
    { id: 1, username: 'admin', password: '123', pin: '1234', fullname: 'System Administrator', email: 'assalatasom@gmail.com', phone: '+968 9430 1393', role: 'admin', branch: 'Mabellah Main Branch', permissions: ['all'], is_deleted: false },
    { id: 2, username: 'manager', password: '123', pin: '2222', fullname: 'Tariq Branch Manager', email: 'manager@rstelectronics.om', phone: '+968 9570 6628', role: 'manager', branch: 'Mabellah Main Branch', permissions: ['dashboard', 'pos', 'inventory', 'telecom', 'reports', 'vip', 'employees'], is_deleted: false },
    { id: 3, username: 'staff1', password: '123', pin: '3333', fullname: 'Kamrul Sales Staff', email: 'staff@rstelectronics.om', phone: '+968 9430 1393', role: 'staff', branch: 'Mabellah Main Branch', permissions: ['dashboard', 'pos', 'inventory', 'telecom'], is_deleted: false },
    { id: 4, username: 'dealer1', password: '123', pin: '4444', fullname: 'Oman Telecom Dealer', email: 'dealer@rstelectronics.om', phone: '+968 9122 8899', role: 'dealer', branch: 'Seeb Commercial Branch', permissions: ['telecom', 'offers'], is_deleted: false },
  ],
  auditLogs: [
    { id: 1, time: new Date(Date.now() - 7200000).toISOString(), user: 'admin', role: 'admin', action: 'System Boot & Cloud Sync Verified', module: 'System', branch: 'Mabellah Main Branch' },
    { id: 2, time: new Date(Date.now() - 3600000).toISOString(), user: 'admin', role: 'admin', action: 'Sale Invoice RST-00002 created (450.450 OMR)', module: 'POS', branch: 'Mabellah Main Branch' },
  ],
  notifications: [
    { id: 1, time: new Date(Date.now() - 3600000).toISOString(), title: 'New High-Value Sale (RST-00002)', body: 'Samsung Galaxy S24 Ultra sold for 450.450 OMR at Mabellah Main Branch.', type: 'sale', emailSent: true, read: false },
    { id: 2, time: new Date(Date.now() - 1800000).toISOString(), title: 'Telecom Balance Alert', body: 'Renna Mobile Oman dealer pool is at 115.000 OMR.', type: 'telecom', emailSent: false, read: false },
  ],
  incomeExpense: [
    { id: 1, date: new Date().toISOString().slice(0, 10), type: 'income', category: 'Mobile Service & Repair', amount: 45.000, note: 'iPhone screen replacement service' },
    { id: 2, date: new Date().toISOString().slice(0, 10), type: 'expense', category: 'Showroom Electricity & Fiber', amount: 28.500, note: 'Mabellah showroom monthly utility' },
  ],
  bankTransactions: [
    { id: 1, date: new Date().toISOString().slice(0, 10), bank: 'Bank Muscat Corporate', type: 'Deposit', refNo: 'BM-998123', amount: 1250.000, status: 'Cleared' }
  ],
  warranties: [
    { id: 1, invoiceNo: 'RST-00001', customer: 'Sheikh Ahmed Al-Balushi', product: 'iPhone 15 Pro Max 256GB', imei: '356789123456789', startDate: '2026-10-08', expiryDate: '2027-10-08', status: 'Active' },
    { id: 2, invoiceNo: 'RST-00002', customer: 'Mohammad Robiul Islam', product: 'Samsung Galaxy S24 Ultra 5G', imei: '987654321123456', startDate: '2026-10-10', expiryDate: '2027-10-10', status: 'Active' },
  ],
  installments: [
    { id: 1, customer: 'Fatima Al-Rawahi', product: 'Apple MacBook Air 15" M3', total: 565.000, downPayment: 265.000, monthlyInstallment: 50.000, remainingBalance: 300.000, nextDueDate: '2026-11-01', status: 'Active' }
  ],
  targets: [
    { id: 1, branch: 'Mabellah Main Branch', period: 'October 2026', targetOmr: 15000.000, achievedOmr: 9850.000 },
    { id: 2, branch: 'Seeb Commercial Branch', period: 'October 2026', targetOmr: 10000.000, achievedOmr: 6420.000 },
  ],
  itemTransfers: [
    { id: 1, date: new Date().toISOString().slice(0, 10), product: 'Xiaomi Redmi Note 13 Pro 5G', fromBranch: 'Mabellah Main Branch', toBranch: 'Seeb Commercial Branch', qty: 5, operator: 'admin' }
  ],
  pinnedModules: ['dashboard', 'pos', 'inventory', 'telecom', 'offers', 'vip', 'reports', 'security'],
  themeConfig: {
    primaryColor: '#059669',
    accentColor: '#d97706',
    soundEnabled: true,
    businessName: 'RST ELECTRONICS',
    legalName: 'AL WAHA AL KHDRA AL MUTAKAMILAH TRADING',
    crNo: '1374092',
    phone: '+968 9430 1393',
    email: 'assalatasom@gmail.com',
    address: 'Mabellah Sanaya, Road No 6, Sultanate of Oman',
    currency: 'OMR',
    vatRate: 5,
    decimalPlaces: 3,
  },
  translations: {
    en: {
      app_title: 'RST ELECTRONICS ERP & TELECOM',
      storefront: 'Live Storefront',
      erp_console: 'ERP Admin Console',
      dashboard: 'Executive Dashboard',
      pos_sales: 'POS & Barcode Billing',
      inventory: 'Inventory & IMEI Hub',
      telecom_oman: 'Oman Telecom & Latency',
      offers_engine: 'Offers & Plan Comparison',
      vip_crm: 'VIP Loyalty & Branches',
      employees_hr: 'Employees & Payroll',
      reports_analytics: 'Financial Reports & Export',
      security_rbac: 'Roles, Logs & Alerts',
      theme_lang: 'Theme, Sound & Languages',
      scan_barcode: 'Scan Barcode / IMEI',
      ai_copilot: 'Gemini ERP Copilot',
      total_revenue: 'Total Revenue',
      net_profit: 'Net Profit Margin',
      telecom_pool: 'Telecom Dealer Pool',
      active_inventory: 'Inventory Valuation',
    },
    bn: {
      app_title: 'আরএসটি ইলেকট্রনিক্স ইআরপি ও টেলিকম',
      storefront: 'লাইভ অনলাইন শপ',
      erp_console: 'ইআরপি অ্যাডমিন প্যানেল',
      dashboard: 'এক্সিকিউটিভ ড্যাশবোর্ড',
      pos_sales: 'পিওএস ও বারকোড বিলিং',
      inventory: 'ইনভেন্টরি ও আইএমইআই হাব',
      telecom_oman: 'ওমান টেলিকম ও নেটওয়ার্ক',
      offers_engine: 'অফার ও প্ল্যান তুলনা',
      vip_crm: 'ভিআইপি কাস্টমার ও ব্রাঞ্চ',
      employees_hr: 'এমপ্লয়ি ও বেতন ব্যবস্থাপনা',
      reports_analytics: 'রিপোর্ট, ইনভয়েস ও এক্সেল',
      security_rbac: 'ইউজার রোল, লগ ও অ্যালার্ট',
      theme_lang: 'থিম, সাউন্ড ও ভাষা এডিটর',
      scan_barcode: 'বারকোড / IMEI স্ক্যান',
      ai_copilot: 'জেমিনি এআই সহকারী',
      total_revenue: 'মোট বিক্রয় রাজস্ব',
      net_profit: 'নিট মুনাফা মার্জিন',
      telecom_pool: 'টেলিকম ডিলার ব্যালেন্স',
      active_inventory: 'স্টক ভ্যালুয়েশন',
    },
    ar: {
      app_title: 'آر إس تي للإلكترونيات والاتصالات',
      storefront: 'المتجر الإلكتروني المباشر',
      erp_console: 'لوحة تحكم النظام',
      dashboard: 'لوحة القيادة التنفيذية',
      pos_sales: 'نقاط البيع والباركود',
      inventory: 'المخزون وأرقام IMEI',
      telecom_oman: 'اتصالات عُمان والشبكة',
      offers_engine: 'مقارنة العروض والباقات',
      vip_crm: 'عملاء VIP والفروع',
      employees_hr: 'الموظفين والرواتب',
      reports_analytics: 'التقارير والفواتير والتصدير',
      security_rbac: 'الصلاحيات والسجلات والتنبيهات',
      theme_lang: 'المظهر والصوت واللغات',
      scan_barcode: 'مسح الباركود / IMEI',
      ai_copilot: 'مساعد الذكاء الاصطناعي',
      total_revenue: 'إجمالي الإيرادات',
      net_profit: 'صافي هامش الربح',
      telecom_pool: 'رصيد وكلاء الاتصالات',
      active_inventory: 'قيمة المخزون النشط',
    }
  },
  updatedAt: new Date().toISOString()
};

function loadDB(): CloudDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return { ...DEFAULT_DB, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error loading DB:', err);
  }
  saveDB(DEFAULT_DB);
  return DEFAULT_DB;
}

function saveDB(data: CloudDB) {
  try {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

let dbState = loadDB();

// SSE clients for real-time updates across tabs/devices
const sseClients = new Set<express.Response>();

function broadcastUpdate() {
  const payload = `data: ${JSON.stringify({ updatedAt: dbState.updatedAt })}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// API Routes
app.get('/api/state', (_req, res) => {
  res.json(dbState);
});

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

app.post('/api/state/sync', (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }
  dbState = {
    ...dbState,
    ...incoming,
    updatedAt: new Date().toISOString(),
  };
  saveDB(dbState);
  broadcastUpdate();
  res.json({ ok: true, updatedAt: dbState.updatedAt });
});

app.post('/api/state/reset', (_req, res) => {
  dbState = JSON.parse(JSON.stringify(DEFAULT_DB));
  saveDB(dbState);
  broadcastUpdate();
  res.json(dbState);
});

// Server-side Gemini AI Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], lang = 'en' } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const totalSalesOmr = dbState.invoices.reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const totalProfitOmr = dbState.invoices.reduce((s, i) => s + Number(i.profit || 0), 0);
    const telecomProfitOmr = dbState.telecomTransactions.reduce((s, t) => s + Number(t.profit || 0), 0);
    const totalTelecomPool = dbState.telecomOperators.reduce((s, o) => s + Number(o.balance || 0), 0);

    const systemContext = `You are the official AI ERP & Telecom Copilot for ${dbState.themeConfig.businessName} (${dbState.themeConfig.legalName}), CR No: ${dbState.themeConfig.crNo}, located in ${dbState.themeConfig.address}.
Currency: ${dbState.themeConfig.currency} (3 decimal places, e.g., 12.500 OMR). VAT Rate: ${dbState.themeConfig.vatRate}%.
Live Enterprise Telemetry:
- Active Products in Inventory: ${dbState.products.filter(p => !p.is_deleted).length} items
- Total Sales Revenue: ${totalSalesOmr.toFixed(3)} OMR (${dbState.invoices.length} invoices)
- Retail Net Profit: ${totalProfitOmr.toFixed(3)} OMR
- Oman Telecom Dealer Pool Balance: ${totalTelecomPool.toFixed(3)} OMR
- Telecom Commission Profit: ${telecomProfitOmr.toFixed(3)} OMR
- Telecom Operators: ${dbState.telecomOperators.map(o => `${o.name} (Bal: ${o.balance.toFixed(3)} OMR, Margin: ${o.commissionValue}${o.commissionType === 'percent' ? '%' : ' OMR'}, Latency: ${o.latencyMs}ms)`).join('; ')}
- VIP Customers: ${dbState.customers.map(c => `${c.name} (${c.segment}, Spent: ${c.totalPurchases.toFixed(3)} OMR)`).join('; ')}

Respond concisely and professionally in the language requested by the user (current UI language: ${lang === 'bn' ? 'Bengali (বাংলা)' : lang === 'ar' ? 'Arabic (العربية)' : 'English'}). Provide actionable financial, inventory, telecom margin, or VIP marketing insights.`;

    const contents = [
      ...history.slice(-6).map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(h.text || '') }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemContext,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({ reply: response.text || 'No response generated.' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate AI insight.' });
  }
});

// Server-side Gemini Automated Executive Summary
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { lang = 'en' } = req.body;
    const totalSalesOmr = dbState.invoices.reduce((s, i) => s + Number(i.grand_total || 0), 0);
    const totalProfitOmr = dbState.invoices.reduce((s, i) => s + Number(i.profit || 0), 0);
    const telecomProfitOmr = dbState.telecomTransactions.reduce((s, t) => s + Number(t.profit || 0), 0);
    const lowStockItems = dbState.products.filter(p => !p.is_deleted && p.stock <= (p.lowStockAlert || 5)).map(p => p.nameEn);

    const prompt = `Generate a concise 3-bullet executive intelligence summary for RST Electronics Oman ERP based on:
- Retail Sales: ${totalSalesOmr.toFixed(3)} OMR, Retail Profit: ${totalProfitOmr.toFixed(3)} OMR
- Telecom Commission Profit: ${telecomProfitOmr.toFixed(3)} OMR across Omantel, Ooredoo, Vodafone, Awasr, FRiENDi, Renna
- Low stock items needing restock: ${lowStockItems.length ? lowStockItems.join(', ') : 'None (all healthy)'}
- Top VIP Customer: Mohammad Robiul Islam (2450.000 OMR) and Sheikh Ahmed Al-Balushi (1840.500 OMR).
Language: ${lang === 'bn' ? 'Bengali (বাংলা)' : lang === 'ar' ? 'Arabic (العربية)' : 'English'}. Keep it sharp, data-driven, and under 90 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({ summary: response.text || '' });
  } catch (error: any) {
    console.error('Gemini Insights Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate executive summary.' });
  }
});

async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RST Electronics ERP & Telecom Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
