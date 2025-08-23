// アプリ全体で使用する定数定義
// 性自認・性的指向の選択肢、料金設定、通報カテゴリーなど

// 性自認の選択肢（UI組込用リスト）
export const GENDER_IDENTITY_OPTIONS = [
  '男性',
  '女性',
  'トランスジェンダー男性（生まれは女性／現在は男性として生活）',
  'トランスジェンダー女性（生まれは男性／現在は女性として生活）',
  'ノンバイナリー（男性／女性のどちらにも当てはまらないと感じる）',
  'ジェンダークィア（「男らしさ／女らしさ」の枠にとらわれない性のあり方）',
  'アジェンダー（性自認がない、または必要と感じない）',
  'ジェンダーフルイド（状況や時期によって変化する）',
  '決めていない／考え中',
  'その他'
];

// 性的指向の選択肢（UI組込用リスト）
export const SEXUAL_ORIENTATION_OPTIONS = [
  'レズビアン（女性が女性を好き）',
  'ゲイ（男性が男性を好き）',
  'バイセクシャル（男女どちらも好き）',
  'トランスジェンダー（多様な性的指向を含む）',
  'クエスチョニング（まだ決めていない／考え中）',
  'その他'
];

// 料金設定
export const PRICING = {
  MESSAGE_COST: 20, // 1通あたりの料金（円）
  PACKAGE_PRICE: 1000, // パッケージ価格（円）
  PACKAGE_CREDITS: 50, // パッケージで付与されるクレジット数
  LOW_BALANCE_THRESHOLD: 10, // 低残高アラートの閾値
  SUPER_LIKE_COST: 3 // スーパーライクのコスト
};

// 通報カテゴリー
export const REPORT_CATEGORIES = [
  {
    value: 'harassment_threat',
    label: '嫌がらせ・脅迫',
    description: '脅迫、嫌がらせ、ストーカー行為',
    severity: 'high'
  },
  {
    value: 'discrimination',
    label: '差別的発言',
    description: 'LGBTQ+や他の属性への差別・偏見',
    severity: 'high'
  },
  {
    value: 'self_harm_risk',
    label: '自傷・他害リスク',
    description: '自傷行為や他者への危害の示唆',
    severity: 'high'
  },
  {
    value: 'inappropriate_content',
    label: 'わいせつ・不適切な内容',
    description: '性的な内容や不適切な画像・動画',
    severity: 'medium'
  },
  {
    value: 'impersonation',
    label: 'なりすまし',
    description: '他人になりすましている',
    severity: 'medium'
  },
  {
    value: 'age_violation',
    label: '年齢違反',
    description: '18歳未満と思われる',
    severity: 'medium'
  },
  {
    value: 'commercial_solicitation',
    label: '商用・勧誘',
    description: '商品販売や勧誘行為',
    severity: 'low'
  },
  {
    value: 'spam',
    label: 'スパム',
    description: '迷惑メッセージや繰り返し投稿',
    severity: 'low'
  }
] as const;

// 都道府県リスト
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// 興味・趣味タグ
export const INTEREST_TAGS = [
  'アート', '音楽', '映画', '読書', '旅行', '料理', 'スポーツ', 'ヨガ',
  'ダンス', 'ゲーム', 'テクノロジー', '写真', '自然', 'カフェ', 'ファッション',
  'LGBTQ+', 'アクティビズム', '瞑想', 'フィットネス', 'アニメ', 'マンガ',
  'コーヒー', 'ワイン', 'ペット', '園芸', 'DIY', 'ボランティア', '学習',
  'プログラミング', 'デザイン', '起業', 'サステナビリティ'
];

// 出会いの目的の選択肢
export const RELATIONSHIP_PURPOSE_OPTIONS = [
  '恋人',
  '遊び相手', 
  '友人',
  '共感相手'
];

// 性格の選択肢
export const PERSONALITY_TRAITS = [
  '陽気',
  '寂しがり',
  '話し上手',
  '天然入ってる',
  '気分や',
  '気が短い',
  'のんびり屋',
  '積極的',
  '消極的',
  'リーダー派'
];

// 体型・スタイルの選択肢
export const BODY_STYLE_OPTIONS = [
  'マッチョ',
  '細身',
  '長身',
  'ぽっちゃり',
  'アスリート体型',
  '平均的',
  'その他'
];

// OTP設定
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  RESEND_COOLDOWN_SECONDS: 60,
  MAX_ATTEMPTS: 3,
  LOCKOUT_DURATION_MINUTES: 5
};

// KYC設定
export const KYC_CONFIG = {
  MIN_AGE: 18,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_ID_TYPES: ['運転免許証', 'パスポート', 'マイナンバーカード', '住民基本台帳カード'],
  REVIEW_TIME_HOURS: 24
};

// 年代区分の選択肢
export const AGE_RANGE_OPTIONS = [
  '10代後半（18-19歳）',
  '20代前半（20-24歳）',
  '20代後半（25-29歳）',
  '30代前半（30-34歳）',
  '30代後半（35-39歳）',
  '40代前半（40-44歳）',
  '40代後半（45-49歳）',
  '50代前半（50-54歳）',
  '50代後半（55-59歳）',
  '60代前半（60-64歳）',
  '60代後半（65-69歳）',
  '70代以上（70歳以上）'
];