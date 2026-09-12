/**
 * Official IlmiDunya Administration Accounts
 * Used across the platform support widget and as optional receiving accounts for tutors.
 */
const ADMIN_PAYMENT_ACCOUNTS = [
  {
    id: 'meezan',
    method: 'bank',
    bankName: 'Meezan Bank (Islamic)',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '96010105435308',
    instructions: 'Scan with Meezan Bank App or transfer directly to account 96010105435308 (Raast ID: 03171759093).',
    qrImage: '/images/qr-meezan.jpg',
    isDefault: true,
    isAdminAccount: true
  },
  {
    id: 'easypaisa',
    method: 'easypaisa',
    bankName: 'EasyPaisa Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    instructions: 'Scan with EasyPaisa App or send money directly to 03171759093.',
    qrImage: '/images/qr-easypaisa.jpg',
    isDefault: false,
    isAdminAccount: true
  },
  {
    id: 'jazzcash',
    method: 'jazzcash',
    bankName: 'JazzCash Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    instructions: 'Scan with JazzCash App or transfer directly to 03171759093.',
    qrImage: '/images/qr-jazzcash.jpg',
    isDefault: false,
    isAdminAccount: true
  },
  {
    id: 'upaisa',
    method: 'upaisa',
    bankName: 'UPaisa / UBank',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    instructions: 'Scan with UPaisa App or transfer via Raast Instant ID: 03171759093.',
    qrImage: '/images/qr-upaisa.jpg',
    isDefault: false,
    isAdminAccount: true
  },
  {
    id: 'raast',
    method: 'raast',
    bankName: 'Raast State Bank Instant Pay',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    instructions: 'Send instantly from any bank app in Pakistan using Raast ID: 03171759093.',
    qrImage: '/images/qr-meezan.jpg',
    isDefault: false,
    isAdminAccount: true
  }
];

module.exports = { ADMIN_PAYMENT_ACCOUNTS };

