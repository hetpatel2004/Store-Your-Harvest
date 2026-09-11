const mongoose = require('mongoose');
const User = require('../models/User');
const Storage = require('../models/Storage');
const Booking = require('../models/Booking');

// Crop Knowledge Base (Optimal storage ranges, shelf life, notes)
const CROP_PROFILES = {
  Potato: { tempMin: 3, tempMax: 6, humidity: '90-95%', shelfLife: '6-10 months', defaultRate: 1.8 },
  Tomato: { tempMin: 8, tempMax: 13, humidity: '85-90%', shelfLife: '2-4 weeks', defaultRate: 2.5 },
  Onion: { tempMin: 0, tempMax: 2, humidity: '65-70%', shelfLife: '5-8 months', defaultRate: 2.0 },
  Mango: { tempMin: 10, tempMax: 13, humidity: '85-90%', shelfLife: '3-6 weeks', defaultRate: 3.5 },
  Apple: { tempMin: -1, tempMax: 2, humidity: '90-95%', shelfLife: '6-9 months', defaultRate: 3.0 },
  Banana: { tempMin: 13, tempMax: 15, humidity: '90-95%', shelfLife: '2-4 weeks', defaultRate: 2.2 },
  Grapes: { tempMin: -1, tempMax: 0, humidity: '90-95%', shelfLife: '2-4 months', defaultRate: 3.2 },
  Chilli: { tempMin: 7, tempMax: 10, humidity: '90-95%', shelfLife: '3-5 weeks', defaultRate: 2.8 },
  Carrot: { tempMin: 0, tempMax: 2, humidity: '95-98%', shelfLife: '4-6 months', defaultRate: 2.2 },
};

const seedUsers = [
  {
    name: 'AgriCold Admin',
    email: 'admin@agricold.in',
    phone: '+91 98250 11001',
    password: 'Admin@123',
    role: 'admin',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  {
    name: 'Rajeshbhai Patel',
    email: 'rajesh@patelcoldstorage.com',
    phone: '+91 98980 23456',
    password: 'Owner@123',
    role: 'owner',
    city: 'Sanand',
    state: 'Gujarat',
  },
  {
    name: 'Kirit Shah',
    email: 'kirit@greenfresh.in',
    phone: '+91 98240 76543',
    password: 'Owner@123',
    role: 'owner',
    city: 'Naroda, Ahmedabad',
    state: 'Gujarat',
  },
  {
    name: 'Sureshbhai Desai',
    email: 'suresh@desaiagro.com',
    phone: '+91 97230 44556',
    password: 'Owner@123',
    role: 'owner',
    city: 'Bavla',
    state: 'Gujarat',
  },
  {
    name: 'Ramesh Patel',
    email: 'ramesh@farmer.com',
    phone: '+91 99090 12345',
    password: 'Farmer@123',
    role: 'farmer',
    city: 'Sanand',
    state: 'Gujarat',
  },
];

const seedStorageData = (owner1Id, owner2Id, owner3Id) => [
  {
    ownerId: owner1Id,
    name: 'Patel Agro & Multi-Chamber Cold Storage',
    tagline: 'Modern Freon & Ammonia Multi-Zone Controlled Facility',
    address: 'Survey No. 142, Sanand-Viramgam Highway, GIDC Phase 2',
    city: 'Sanand',
    district: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 22.9856,
    longitude: 72.3802,
    storageType: 'Multipurpose CA Cold Store',
    totalCapacity: 5000000, // 5,000 MT / 50 lakh kg
    availableCapacity: 1850000, // 18.5 lakh kg
    temperatureMin: 2,
    temperatureMax: 12,
    humidityMin: 85,
    humidityMax: 95,
    acceptedCrops: ['Potato', 'Tomato', 'Onion', 'Chilli', 'Carrot'],
    minimumQuantity: 200,
    pricePerKg: 2.20,
    handlingCharge: 350,
    transportRatePerKm: 25,
    storageDuration: '15 to 210 days',
    paymentTerms: '25% advance on unloading, balance at departure or monthly. UPI, RTGS & Cheque.',
    damagePolicy: 'Government approved APEDA standard insurance covering 90% inventory against power failure and cooling unit disruption.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.8,
    reviewsCount: 46,
    verified: true,
    status: 'approved',
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '06:00 AM - 11:00 PM (24x7 during Rabi & Kharif harvest seasons)',
    contactPhone: '+91 98980 23456',
    contactEmail: 'rajesh@patelcoldstorage.com',
    features: ['Pre-cooling tunnel', 'Automatic humidity control', 'Weighbridge on-site (60 MT)', 'Forklift loading bay', 'Daily digital temp log'],
  },
  {
    ownerId: owner2Id,
    name: 'GreenFresh Cold Chain & Pack House Logistics',
    tagline: 'Export Grade Controlled Atmosphere (CA) Chilled Storage',
    address: 'Plot 48/B, Naroda Dehgam Road, Near GIDC Ring Road',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0805,
    longitude: 72.6589,
    storageType: 'Controlled Atmosphere (CA)',
    totalCapacity: 3800000,
    availableCapacity: 920000,
    temperatureMin: 0,
    temperatureMax: 8,
    humidityMin: 90,
    humidityMax: 98,
    acceptedCrops: ['Tomato', 'Potato', 'Apple', 'Grapes', 'Carrot'],
    minimumQuantity: 100,
    pricePerKg: 2.50,
    handlingCharge: 400,
    transportRatePerKm: 28,
    storageDuration: '10 to 180 days',
    paymentTerms: '30% advance on intake, 70% upon dispatch. Digital payments preferred.',
    damagePolicy: 'Fully insured with National Insurance Co. Guaranteed 0°C to 4°C continuous temperature logging with SMS alerts to farmer.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.9,
    reviewsCount: 62,
    verified: true,
    status: 'approved',
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '05:00 AM - 10:00 PM',
    contactPhone: '+91 98240 76543',
    contactEmail: 'kirit@greenfresh.in',
    features: ['CA Gas flushing (CO2/O2)', 'Ethylene scrubbing', 'ISO 22000 Certified', 'Palletized racking system', 'Reefer truck docking'],
  },
  {
    ownerId: owner3Id,
    name: 'Bavla Mega Agro Cold Storage & Ripening Unit',
    tagline: 'Farmer-first pricing with dedicated onion & tuber chambers',
    address: 'National Highway 8A, Near Dholka Crossroads, Bavla',
    city: 'Bavla',
    district: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 22.8361,
    longitude: 72.3619,
    storageType: 'Multipurpose CA Cold Store',
    totalCapacity: 6200000,
    availableCapacity: 3100000,
    temperatureMin: 0,
    temperatureMax: 15,
    humidityMin: 70,
    humidityMax: 90,
    acceptedCrops: ['Onion', 'Potato', 'Mango', 'Banana', 'Tomato'],
    minimumQuantity: 50,
    pricePerKg: 1.95,
    handlingCharge: 300,
    transportRatePerKm: 22,
    storageDuration: '15 to 240 days',
    paymentTerms: 'Subsidized farmer rates. Flexible payment post market sale via APMC Mandi settlement.',
    damagePolicy: 'Comprehensive transit & cold storage risk coverage. Certified moisture control prevents sprouting.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.7,
    reviewsCount: 39,
    verified: true,
    status: 'approved',
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '24 Hours Open (Harvest season priority)',
    contactPhone: '+91 97230 44556',
    contactEmail: 'suresh@desaiagro.com',
    features: ['Low humidity onion bays', 'Solar power supplemented', 'Direct APMC Mandi rail & road connectivity', 'Crate rental service'],
  },
  {
    ownerId: owner1Id,
    name: 'Kadi Chilled Agritech & Seed Preservation',
    tagline: 'Specialized deep chill unit for seeds, carrots, and perishable greens',
    address: 'Station Road, Industrial Area, Kadi',
    city: 'Kadi',
    district: 'Mehsana',
    state: 'Gujarat',
    latitude: 23.3039,
    longitude: 72.3328,
    storageType: 'Cold Storage & Pack House',
    totalCapacity: 3200000,
    availableCapacity: 850000,
    temperatureMin: -2,
    temperatureMax: 6,
    humidityMin: 85,
    humidityMax: 95,
    acceptedCrops: ['Carrot', 'Potato', 'Apple', 'Grapes', 'Chilli'],
    minimumQuantity: 150,
    pricePerKg: 2.30,
    handlingCharge: 380,
    transportRatePerKm: 26,
    storageDuration: '30 to 180 days',
    paymentTerms: '20% upfront, balance upon warehouse receipt clearance.',
    damagePolicy: 'Zero spoilage guarantee with IoT sensor network and automated backup generator failover in 12 seconds.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.6,
    reviewsCount: 22,
    verified: true,
    status: 'approved',
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '06:30 AM - 09:30 PM',
    contactPhone: '+91 98980 23456',
    contactEmail: 'kadi.storage@patelagro.com',
    features: ['Automated temperature logging', 'IoT remote app monitoring for farmers', 'Sprout suppressant air treatment'],
  },
  {
    ownerId: owner2Id,
    name: 'Gandhinagar FreshHarvest Polar Warehouses',
    tagline: 'Ultra-modern temperature controlled facility near Capital APMC',
    address: 'Sector 28 GIDC, Gandhinagar Bypass Road',
    city: 'Gandhinagar',
    district: 'Gandhinagar',
    state: 'Gujarat',
    latitude: 23.2384,
    longitude: 72.6588,
    storageType: 'Multipurpose CA Cold Store',
    totalCapacity: 4500000,
    availableCapacity: 2200000,
    temperatureMin: 1,
    temperatureMax: 14,
    humidityMin: 80,
    humidityMax: 95,
    acceptedCrops: ['Tomato', 'Mango', 'Banana', 'Potato', 'Onion', 'Chilli'],
    minimumQuantity: 100,
    pricePerKg: 2.40,
    handlingCharge: 360,
    transportRatePerKm: 25,
    storageDuration: '15 to 150 days',
    paymentTerms: 'Payment via Bharat QR, UPI, or Mandi account transfer.',
    damagePolicy: 'Certified loss compensation policy with independent surveyor inspection.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.9,
    reviewsCount: 54,
    verified: true,
    status: 'approved',
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '06:00 AM - 10:00 PM',
    contactPhone: '+91 98240 76543',
    contactEmail: 'contact@freshharvestpolar.in',
    features: ['High capacity sorting tables', 'Ethylene ripening chamber for mangoes & bananas', '24/7 security guard'],
  },
  {
    ownerId: owner3Id,
    name: 'Anand Charotar Agricultural Cold Vaults',
    tagline: 'Heart of Gujarat vegetable and fruit preservation hub',
    address: 'Anand-Sojitra Road, Near APMC Market Yard, Anand',
    city: 'Anand',
    district: 'Anand',
    state: 'Gujarat',
    latitude: 22.5645,
    longitude: 72.9289,
    storageType: 'Controlled Atmosphere (CA)',
    totalCapacity: 7500000,
    availableCapacity: 4100000,
    temperatureMin: 2,
    temperatureMax: 14,
    humidityMin: 85,
    humidityMax: 95,
    acceptedCrops: ['Banana', 'Mango', 'Tomato', 'Potato', 'Chilli'],
    minimumQuantity: 100,
    pricePerKg: 2.10,
    handlingCharge: 320,
    transportRatePerKm: 24,
    storageDuration: '15 to 200 days',
    paymentTerms: 'Flexible credit for registered FPO (Farmer Producer Organization) members.',
    damagePolicy: 'NABARD standard insurance compliance with full compensation on verified cooling variance.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.8,
    reviewsCount: 71,
    verified: true,
    status: 'approved',
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '05:30 AM - 10:30 PM',
    contactPhone: '+91 97230 44556',
    contactEmail: 'charotar@anandcoldvaults.org',
    features: ['NABARD recognized', 'FPO discount tariffs', 'Electronic weight receipts', 'Moisture balance air curtain'],
  },
  {
    ownerId: owner1Id,
    name: 'Dholka Rural Cold Preservation Center',
    tagline: 'Affordable village-proximity cold hub with rapid vehicle unloading',
    address: 'Dholka-Kheda Highway, Opp. Gujarat Agro Infrastructure Yard',
    city: 'Dholka',
    district: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 22.7239,
    longitude: 72.4644,
    storageType: 'Multipurpose CA Cold Store',
    totalCapacity: 2800000,
    availableCapacity: 600000,
    temperatureMin: 4,
    temperatureMax: 12,
    humidityMin: 80,
    humidityMax: 90,
    acceptedCrops: ['Tomato', 'Potato', 'Onion', 'Chilli'],
    minimumQuantity: 50,
    pricePerKg: 1.85,
    handlingCharge: 280,
    transportRatePerKm: 20,
    storageDuration: '10 to 120 days',
    paymentTerms: 'Cash, UPI, Kisan Credit Card payment linked.',
    damagePolicy: 'State Agricultural Board safety standards with emergency backup generator.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.5,
    reviewsCount: 19,
    verified: true,
    status: 'approved',
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '06:00 AM - 09:00 PM',
    contactPhone: '+91 98980 23456',
    contactEmail: 'dholka@patelagro.com',
    features: ['Low minimum deposit', 'Kisan Credit Card friendly', 'Direct tractor trailer ramp'],
  },
  {
    ownerId: owner2Id,
    name: 'Shree Krishna Agro Chilling & Warehousing (Pending Approval)',
    tagline: 'Newly commissioned multi-zone cold facility awaiting final physical inspection',
    address: 'Survey 88, Changodar Industrial Estate, Sarkhej-Bavla Road',
    city: 'Changodar',
    district: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 22.9212,
    longitude: 72.4287,
    storageType: 'Multipurpose CA Cold Store',
    totalCapacity: 4000000,
    availableCapacity: 3800000,
    temperatureMin: 1,
    temperatureMax: 10,
    humidityMin: 85,
    humidityMax: 95,
    acceptedCrops: ['Tomato', 'Potato', 'Carrot', 'Grapes'],
    minimumQuantity: 100,
    pricePerKg: 2.15,
    handlingCharge: 340,
    transportRatePerKm: 24,
    storageDuration: '15 to 180 days',
    paymentTerms: 'Standard digital bank transfer or cash.',
    damagePolicy: 'General commercial storage insurance.',
    powerBackup: true,
    cctvMonitoring: true,
    rating: 4.4,
    reviewsCount: 8,
    verified: false,
    status: 'pending', // Pending admin verification demonstration
    availability: 'Available',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
    operatingHours: '07:00 AM - 08:00 PM',
    contactPhone: '+91 98240 76543',
    contactEmail: 'shreekrishna@changodaragro.com',
    features: ['Dual cooling compressors', 'New insulation panels', 'Large parking yard'],
  },
];

const seedDatabase = async () => {
  try {
    // Ensure static Admin user is always created
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@agricold.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'AgriCold Super Admin',
        email: adminEmail,
        phone: '+91 98250 11001',
        password: adminPassword,
        role: 'admin',
        city: 'Ahmedabad',
        state: 'Gujarat',
      });
      console.log(`🔑 Static Admin account initialized: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`🔑 Static Admin account verified: ${adminEmail}`);
    }

    const userCount = await User.countDocuments();
    if (userCount > 1) {
      console.log('⚡ Database already contains storage data. Ready.');
      return;
    }

    console.log('🌱 Seeding AgriCold Connect database with realistic Gujarat agricultural demo data...');

    // Clear existing
    await User.deleteMany({});
    await Storage.deleteMany({});
    await Booking.deleteMany({});

    // Create Users
    const createdUsers = [];
    for (const u of seedUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const adminUser = createdUsers[0];
    const owner1 = createdUsers[1];
    const owner2 = createdUsers[2];
    const owner3 = createdUsers[3];
    const farmer = createdUsers[4];

    console.log(` Created ${createdUsers.length} test accounts (Admin, Owners, Farmer)`);

    // Create Storages
    const storageList = seedStorageData(owner1._id, owner2._id, owner3._id);
    const createdStorages = await Storage.insertMany(storageList);
    console.log(` Created ${createdStorages.length} verified cold storage facilities`);

    // Create Sample Bookings
    const sampleBookings = [
      {
        farmerId: farmer._id,
        farmerName: farmer.name,
        farmerPhone: farmer.phone,
        farmerEmail: farmer.email,
        storageId: createdStorages[0]._id,
        storageName: createdStorages[0].name,
        ownerId: owner1._id,
        crop: 'Tomato',
        quantity: 500, // 500 kg
        requiredTemp: '8°C - 12°C',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        durationDays: 30,
        estimatedStorageCost: 1100, // 2.20 * 500 * 1
        handlingCost: 350,
        transportCost: 300,
        totalCost: 1750,
        distanceKm: 12.0,
        specialRequirements: 'Needs immediate pre-cooling upon delivery. Packed in standard 20kg plastic crates.',
        status: 'pending',
      },
      {
        farmerId: farmer._id,
        farmerName: farmer.name,
        farmerPhone: farmer.phone,
        farmerEmail: farmer.email,
        storageId: createdStorages[2]._id,
        storageName: createdStorages[2].name,
        ownerId: owner3._id,
        crop: 'Onion',
        quantity: 2500, // 2500 kg
        requiredTemp: '0°C - 2°C',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        durationDays: 90,
        estimatedStorageCost: 14625, // 1.95 * 2500 * 3
        handlingCost: 600,
        transportCost: 450,
        totalCost: 15675,
        distanceKm: 18.5,
        specialRequirements: 'Ventilated mesh bags. Low humidity bay requested.',
        status: 'accepted',
      },
      {
        farmerId: null,
        farmerName: 'Bharatbhai Solanki',
        farmerPhone: '+91 98790 88221',
        farmerEmail: 'bharat.farmer@gmail.com',
        storageId: createdStorages[1]._id,
        storageName: createdStorages[1].name,
        ownerId: owner2._id,
        crop: 'Potato',
        quantity: 5000,
        requiredTemp: '3°C - 5°C',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        durationDays: 60,
        estimatedStorageCost: 25000,
        handlingCost: 800,
        transportCost: 700,
        totalCost: 26500,
        distanceKm: 24.0,
        specialRequirements: 'Certified seed potatoes for next planting cycle. Sprout inhibitor required.',
        status: 'accepted',
      },
    ];

    await Booking.insertMany(sampleBookings);
    console.log(` Created sample farmer storage bookings`);
    console.log('✅ Demo seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase, CROP_PROFILES };
