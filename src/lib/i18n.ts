// Internationalization utilities and translations
// Supports Japanese (default) and English with complete UI text coverage

export const languages = {
  ja: { code: 'ja' as const, name: '日本語' },
  en: { code: 'en' as const, name: 'English' }
};

export const translations = {
  ja: {
    // Navigation
    match: 'マッチ',
    chat: 'メール',
    community: 'コミュニティ',
    settings: 'マイページ',
    
    // Auth
    signup: '新規登録',
    login: 'ログイン',
    logout: 'ログアウト',
    email: 'メールアドレス',
    verificationCode: '認証コード',
    sendCode: 'コードを送信',
    verify: '認証する',
    welcome: 'ようこそ',
    
    // Profile
    displayName: '表示名',
    genderIdentity: '性自認',
    sexualOrientation: '性的指向',
    bio: '自己紹介',
    age: '年齢',
    city: '住所',
    tags: 'タグ',
    
    // Actions
    like: 'いいね',
    pass: 'あとで',
    send: '送信',
    edit: '編集',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    block: 'ブロック',
    report: '報告',
    
    // Messages
    newMatch: '新しいマッチです！',
    messagePlaceholder: 'メッセージを入力...',
    noMessages: 'まだメッセージはありません',
    noMatches: 'まだマッチはありません',
    
    // Communities
    joinCommunity: 'コミュニティに参加',
    leaveCommunity: 'コミュニティを退会',
    createPost: '投稿する',
    postPlaceholder: '今何を考えていますか？',
    
    // KYC
    kycTitle: '本人確認',
    kycDescription: 'アカウントの安全性のため、身分証明書をアップロードしてください。',
    uploadId: '身分証明書をアップロード',
    takeSelfie: 'セルフィーを撮影',
    kycPending: '審査中です',
    kycApproved: '認証済み',
    
    // Settings
    profile: 'プロフィール',
    privacy: 'プライバシー',
    notifications: '通知',
    language: '言語',
    help: 'ヘルプ',
    about: 'アプリについて',
    
    // Billing
    billing: '料金管理',
    messageCredits: 'メッセージクレジット',
    purchase: '購入',
    balance: '残高',
    lowBalance: '残高不足',
    purchasePackage: 'パッケージを購入',
    
    // Errors
    errorGeneric: 'エラーが発生しました。もう一度お試しください。',
    errorNetwork: 'ネットワークエラーが発生しました。',
    errorAuth: '認証に失敗しました。',
    
    // Time
    now: 'たった今',
    minuteAgo: '分前',
    hourAgo: '時間前',
    dayAgo: '日前',
    weekAgo: '週間前',
    
    // Account Management
    accountManagement: 'アカウント管理',
    deleteAccount: 'アカウント削除',
    exportData: 'データエクスポート',
    deleteConfirm: '本当に削除しますか？',
    deleteWarning: '削除すると30日間は復元可能ですが、それ以降は完全に削除されます。',
    exportDescription: 'ご自身のデータをダウンロードできます。処理には数分かかる場合があります。'
  },
  
  en: {
    // Navigation
    match: 'Match',
    chat: 'Mail',
    community: 'Community',
    settings: 'My Page',
    
    // Auth
    signup: 'Sign Up',
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    verificationCode: 'Verification Code',
    sendCode: 'Send Code',
    verify: 'Verify',
    welcome: 'Welcome',
    
    // Profile
    displayName: 'Display Name',
    genderIdentity: 'Gender Identity',
    sexualOrientation: 'Sexual Orientation',
    bio: 'Bio',
    age: 'Age',
    city: 'City',
    tags: 'Tags',
    
    // Actions
    like: 'Like',
    pass: 'Pass',
    send: 'Send',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    block: 'Block',
    report: 'Report',
    
    // Messages
    newMatch: 'It\'s a match!',
    messagePlaceholder: 'Type a message...',
    noMessages: 'No messages yet',
    noMatches: 'No matches yet',
    
    // Communities
    joinCommunity: 'Join Community',
    leaveCommunity: 'Leave Community',
    createPost: 'Create Post',
    postPlaceholder: 'What\'s on your mind?',
    
    // KYC
    kycTitle: 'Identity Verification',
    kycDescription: 'Please upload your ID document for account security.',
    uploadId: 'Upload ID Document',
    takeSelfie: 'Take Selfie',
    kycPending: 'Under Review',
    kycApproved: 'Verified',
    
    // Settings
    profile: 'Profile',
    privacy: 'Privacy',
    notifications: 'Notifications',
    language: 'Language',
    help: 'Help',
    about: 'About',
    
    // Billing
    billing: 'Billing',
    messageCredits: 'Message Credits',
    purchase: 'Purchase',
    balance: 'Balance',
    lowBalance: 'Low Balance',
    purchasePackage: 'Purchase Package',
    
    // Errors
    errorGeneric: 'An error occurred. Please try again.',
    errorNetwork: 'Network error occurred.',
    errorAuth: 'Authentication failed.',
    
    // Time
    now: 'now',
    minuteAgo: 'min ago',
    hourAgo: 'hr ago',
    dayAgo: 'day ago',
    weekAgo: 'week ago',
    
    // Account Management
    accountManagement: 'Account Management',
    deleteAccount: 'Delete Account',
    exportData: 'Export Data',
    deleteConfirm: 'Are you sure you want to delete?',
    deleteWarning: 'Deletion allows 30-day recovery, but after that it\'s permanent.',
    exportDescription: 'You can download your data. Processing may take a few minutes.'
  }
};

export type TranslationKey = keyof typeof translations.ja;