export const ADMIN_PAYMENT_ACCOUNTS = [
  {
    id: 'meezan',
    method: 'bank',
    name: 'Meezan Bank',
    bankName: 'Meezan Bank (Islamic)',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '96010105435308',
    raastId: '03171759093',
    instructions: 'Scan with Meezan Bank App or transfer directly to account 96010105435308 (Raast: 03171759093).',
    qrImage: '/images/qr-meezan.jpg',
    isDefault: true,
    isAdminAccount: true,
    badgeText: 'Official Meezan Bank'
  },
  {
    id: 'easypaisa',
    method: 'easypaisa',
    name: 'EasyPaisa',
    bankName: 'EasyPaisa Mobile Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    raastId: '03171759093',
    instructions: 'Scan with EasyPaisa App or send money directly to 03171759093.',
    qrImage: '/images/qr-easypaisa.jpg',
    isDefault: false,
    isAdminAccount: true,
    badgeText: 'Official EasyPaisa'
  },
  {
    id: 'jazzcash',
    method: 'jazzcash',
    name: 'JazzCash',
    bankName: 'JazzCash Mobile Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    raastId: '03171759093',
    instructions: 'Scan with JazzCash App or transfer directly to 03171759093.',
    qrImage: '/images/qr-jazzcash.jpg',
    isDefault: false,
    isAdminAccount: true,
    badgeText: 'Official JazzCash'
  },
  {
    id: 'upaisa',
    method: 'upaisa',
    name: 'UPaisa / UBank',
    bankName: 'UPaisa & Raast Instant ID',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    raastId: '03171759093',
    instructions: 'Scan with UPaisa App or transfer via Raast ID 03171759093.',
    qrImage: '/images/qr-upaisa.jpg',
    isDefault: false,
    isAdminAccount: true,
    badgeText: 'Official UPaisa / UBank'
  },
  {
    id: 'raast',
    method: 'raast',
    name: 'Raast Instant Pay',
    bankName: 'Raast State Bank Instant Pay',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    raastId: '03171759093',
    instructions: 'Send instantly from any Pakistani bank app using Raast ID: 03171759093.',
    qrImage: '/images/qr-meezan.jpg',
    isDefault: false,
    isAdminAccount: true,
    badgeText: 'State Bank Raast'
  }
];

