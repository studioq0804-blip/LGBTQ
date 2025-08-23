import { corsHeaders } from '../_shared/cors.ts';

// 16名の多様なプロフィール（サーバーサイド）
const mockProfiles = [
  // ゲイ 4名
  {
    id: 'profile-gay-1',
    user_id: 'user-gay-1',
    display_name: 'ひろき',
    gender_identity: '男性',
    sexual_orientation: 'ゲイ',
    bio: 'カフェ経営をしています。コーヒーと人との出会いが大好きです☕️',
    age_range: '30代前半（30-34歳）',
    city: '東京都',
    height: 175,
    body_style: '平均的',
    relationship_purpose: '恋人',
    personality_traits: ['陽気', '話し上手', '積極的'],
    tags: ['コーヒー', 'カフェ', '起業', '旅行'],
    avatar_url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-gay-2',
    user_id: 'user-gay-2',
    display_name: 'たかし',
    gender_identity: '男性',
    sexual_orientation: 'ゲイ',
    bio: 'シェフとして働いています。美味しい料理で人を幸せにしたいです🍳',
    age_range: '20代後半（25-29歳）',
    city: '大阪府',
    height: 168,
    body_style: '細身',
    relationship_purpose: '恋人',
    personality_traits: ['のんびり屋', '気分や', '話し上手'],
    tags: ['料理', 'シェフ', 'レストラン', 'グルメ'],
    avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-gay-3',
    user_id: 'user-gay-3',
    display_name: 'けんじ',
    gender_identity: '男性',
    sexual_orientation: 'ゲイ',
    bio: 'デザイナーとして働いています。アートとクリエイティブな表現が大好きです🎨',
    age_range: '20代後半（25-29歳）',
    city: '神奈川県',
    height: 172,
    body_style: 'アスリート体型',
    relationship_purpose: '友人',
    personality_traits: ['積極的', 'リーダー派', '陽気'],
    tags: ['デザイン', 'アート', 'クリエイティブ', 'UI/UX'],
    avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-gay-4',
    user_id: 'user-gay-4',
    display_name: 'ゆうた',
    gender_identity: '男性',
    sexual_orientation: 'ゲイ',
    bio: 'フィットネストレーナーをしています。健康的な生活を一緒に楽しみましょう💪',
    age_range: '30代前半（30-34歳）',
    city: '愛知県',
    height: 180,
    body_style: 'マッチョ',
    relationship_purpose: '遊び相手',
    personality_traits: ['積極的', '陽気', 'リーダー派'],
    tags: ['フィットネス', 'トレーニング', '健康', 'スポーツ'],
    avatar_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // レズビアン 4名
  {
    id: 'profile-lesbian-1',
    user_id: 'user-lesbian-1',
    display_name: 'さくら',
    gender_identity: '女性',
    sexual_orientation: 'レズビアン',
    bio: '読書とカフェ巡りが趣味です。素敵な出会いを探しています📚',
    age_range: '20代前半（20-24歳）',
    city: '東京都',
    height: 162,
    body_style: '細身',
    relationship_purpose: '恋人',
    personality_traits: ['のんびり屋', '話し上手', '消極的'],
    tags: ['読書', 'カフェ', '旅行', 'ヨガ'],
    avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-lesbian-2',
    user_id: 'user-lesbian-2',
    display_name: 'みお',
    gender_identity: '女性',
    sexual_orientation: 'レズビアン',
    bio: '獣医師として動物の命を守っています。動物好きな人と出会いたいです🐾',
    age_range: '20代後半（25-29歳）',
    city: '京都府',
    height: 158,
    body_style: '平均的',
    relationship_purpose: '恋人',
    personality_traits: ['気分や', 'のんびり屋', '天然入ってる'],
    tags: ['獣医', '動物', 'ペット', '医療'],
    avatar_url: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-lesbian-3',
    user_id: 'user-lesbian-3',
    display_name: 'あやか',
    gender_identity: '女性',
    sexual_orientation: 'レズビアン',
    bio: 'ヨガインストラクターです。心と体の健康を大切にしています🧘‍♀️',
    age_range: '20代後半（25-29歳）',
    city: '福岡県',
    height: 165,
    body_style: 'アスリート体型',
    relationship_purpose: '友人',
    personality_traits: ['積極的', '陽気', 'リーダー派'],
    tags: ['ヨガ', '瞑想', '健康', 'ウェルネス'],
    avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-lesbian-4',
    user_id: 'user-lesbian-4',
    display_name: 'ゆい',
    gender_identity: '女性',
    sexual_orientation: 'レズビアン',
    bio: '図書館司書をしています。知識と静寂を愛しています📖',
    age_range: '20代前半（20-24歳）',
    city: '北海道',
    height: 160,
    body_style: '細身',
    relationship_purpose: '共感相手',
    personality_traits: ['消極的', 'のんびり屋', '寂しがり'],
    tags: ['図書館', '読書', '知識', '静寂'],
    avatar_url: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // トランスジェンダー 2名
  {
    id: 'profile-trans-1',
    user_id: 'user-trans-1',
    display_name: 'あきら',
    gender_identity: 'トランスジェンダー男性',
    sexual_orientation: 'ゲイ',
    bio: '音楽プロデューサーをしています。音楽で世界を変えたいです🎵',
    age_range: '30代前半（30-34歳）',
    city: '沖縄県',
    height: 170,
    body_style: '平均的',
    relationship_purpose: '恋人',
    personality_traits: ['積極的', '陽気', 'リーダー派'],
    tags: ['音楽', 'プロデュース', 'レコーディング', 'ライブ'],
    avatar_url: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-trans-2',
    user_id: 'user-trans-2',
    display_name: 'まい',
    gender_identity: 'トランスジェンダー女性',
    sexual_orientation: 'レズビアン',
    bio: 'アーティストとして表現活動をしています。アートで世界を彩りたいです🎭',
    age_range: '20代後半（25-29歳）',
    city: '長野県',
    height: 163,
    body_style: '細身',
    relationship_purpose: '友人',
    personality_traits: ['天然入ってる', '陽気', '積極的'],
    tags: ['アート', '表現', 'パフォーマンス', 'クリエイティブ'],
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // バイセクシャル 2名
  {
    id: 'profile-bi-1',
    user_id: 'user-bi-1',
    display_name: 'えみ',
    gender_identity: '女性',
    sexual_orientation: 'バイセクシャル',
    bio: 'エンジニアとして働いています。テクノロジーで社会を良くしたいです💻',
    age_range: '20代後半（25-29歳）',
    city: '宮城県',
    height: 164,
    body_style: '平均的',
    relationship_purpose: '恋人',
    personality_traits: ['積極的', '話し上手', 'リーダー派'],
    tags: ['プログラミング', 'AI', 'テクノロジー', 'イノベーション'],
    avatar_url: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-bi-2',
    user_id: 'user-bi-2',
    display_name: 'だいき',
    gender_identity: '男性',
    sexual_orientation: 'バイセクシャル',
    bio: 'スポーツトレーナーとして健康をサポートしています。アクティブな生活を楽しみましょう💪',
    age_range: '20代後半（25-29歳）',
    city: '群馬県',
    height: 178,
    body_style: 'マッチョ',
    relationship_purpose: '遊び相手',
    personality_traits: ['陽気', '積極的', 'リーダー派'],
    tags: ['スポーツ', 'トレーニング', '健康', 'フィットネス'],
    avatar_url: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // クエスチョニング 4名
  {
    id: 'profile-questioning-1',
    user_id: 'user-questioning-1',
    display_name: 'ゆうき',
    gender_identity: 'ジェンダーフルイド',
    sexual_orientation: 'クエスチョニング',
    bio: 'フリーランスライターです。多様性について発信しています✍️',
    age_range: '20代後半（25-29歳）',
    city: '静岡県',
    height: 167,
    body_style: '細身',
    relationship_purpose: '共感相手',
    personality_traits: ['消極的', 'のんびり屋', '天然入ってる'],
    tags: ['ライティング', 'ジャーナリズム', 'LGBTQ+', '執筆'],
    avatar_url: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-questioning-2',
    user_id: 'user-questioning-2',
    display_name: 'なな',
    gender_identity: 'ジェンダークィア',
    sexual_orientation: 'クエスチョニング',
    bio: '心理学を学んでいます。人の心に寄り添える人になりたいです💭',
    age_range: '20代前半（20-24歳）',
    city: '広島県',
    height: 161,
    body_style: '平均的',
    relationship_purpose: '友人',
    personality_traits: ['消極的', '寂しがり', '天然入ってる'],
    tags: ['心理学', 'カウンセリング', '学習', 'サポート'],
    avatar_url: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-questioning-3',
    user_id: 'user-questioning-3',
    display_name: 'はるか',
    gender_identity: 'アジェンダー',
    sexual_orientation: 'クエスチョニング',
    bio: '建築家として美しい空間を創造しています。デザインが好きな人と繋がりたいです🏗️',
    age_range: '30代前半（30-34歳）',
    city: '新潟県',
    height: 169,
    body_style: '長身',
    relationship_purpose: '友人',
    personality_traits: ['積極的', 'リーダー派', '話し上手'],
    tags: ['建築', 'デザイン', '空間', 'クリエイティブ'],
    avatar_url: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-questioning-4',
    user_id: 'user-questioning-4',
    display_name: 'りな',
    gender_identity: 'ノンバイナリー',
    sexual_orientation: 'クエスチョニング',
    bio: '静かな時間と本が好きです。深い友情を大切にしています📚',
    age_range: '20代前半（20-24歳）',
    city: '山形県',
    height: 166,
    body_style: '平均的',
    relationship_purpose: '共感相手',
    personality_traits: ['消極的', 'のんびり屋', '寂しがり'],
    tags: ['読書', '瞑想', '写真', '自然'],
    avatar_url: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // パンセクシャル 2名
  {
    id: 'profile-pan-1',
    user_id: 'user-pan-1',
    display_name: 'こうじ',
    gender_identity: 'ノンバイナリー',
    sexual_orientation: 'パンセクシャル',
    bio: 'アートと音楽が大好きです。多様性を大切にしています。🌈',
    age_range: '20代後半（25-29歳）',
    city: '千葉県',
    height: 171,
    body_style: '平均的',
    relationship_purpose: '恋人',
    personality_traits: ['陽気', '話し上手', '積極的'],
    tags: ['アート', '音楽', 'LGBTQ+', '映画'],
    avatar_url: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-pan-2',
    user_id: 'user-pan-2',
    display_name: 'みき',
    gender_identity: 'ジェンダーフルイド',
    sexual_orientation: 'パンセクシャル',
    bio: 'テクノロジーとゲームが好きです。一緒に楽しめる人と出会いたいです。',
    age_range: '30代前半（30-34歳）',
    city: '埼玉県',
    height: 165,
    body_style: '細身',
    relationship_purpose: '遊び相手',
    personality_traits: ['積極的', 'リーダー派', '陽気'],
    tags: ['テクノロジー', 'ゲーム', 'プログラミング', 'アニメ'],
    avatar_url: 'https://images.pexels.com/photos/1844012/pexels-photo-1844012.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    is_visible: true,
    last_active: new Date().toISOString(),
    privacy_settings: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showHeight: true,
      showBodyStyle: true,
      showTags: true,
      showBio: true,
      hidePhoto: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // フィルターパラメータを取得
    const ageRanges = searchParams.get('ageRanges')?.split(',') || [];
    const cities = searchParams.get('cities')?.split(',') || [];
    const relationshipPurposes = searchParams.get('relationshipPurposes')?.split(',') || [];
    const sexualOrientations = searchParams.get('sexualOrientations')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '50');

    // フィルタリング処理
    let filteredProfiles = mockProfiles.filter(profile => {
      // 年代フィルター
      if (ageRanges.length > 0 && !ageRanges.includes(profile.age_range)) {
        return false;
      }

      // 都道府県フィルター
      if (cities.length > 0 && !cities.includes(profile.city)) {
        return false;
      }

      // 出会いの目的フィルター
      if (relationshipPurposes.length > 0 && !relationshipPurposes.includes(profile.relationship_purpose)) {
        return false;
      }

      // 性的指向フィルター
      if (sexualOrientations.length > 0) {
        const matches = sexualOrientations.some(orientation => 
          profile.sexual_orientation.includes(orientation)
        );
        if (!matches) return false;
      }

      return true;
    });

    // 制限適用
    if (limit > 0) {
      filteredProfiles = filteredProfiles.slice(0, limit);
    }

    console.log(`Mock profiles API: returning ${filteredProfiles.length} profiles`);

    return new Response(
      JSON.stringify(filteredProfiles),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Mock profiles API error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});