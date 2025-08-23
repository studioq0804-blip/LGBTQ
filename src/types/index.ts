// Core types for Rainbow Match LGBTQ+ matching app
// Defines all data structures, API responses, and UI state types

export interface User {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  // Optional legacy/extended fields used for classification and display
  genderIdentity?: string;
  sexualOrientation?: string;
  bio: string;
  age: number;
  ageRange?: string;
  city: string;
  height?: number; // cm
  bodyStyle?: string;
  relationshipPurpose?: string;
  personalityTraits?: string[];
  tags: string[];
  joinedCommunities: string[]; // Community IDs
  photos: string[];
  avatarUrl: string;
  isVisible: boolean;
  lastActive: string;
  privacy: {
    // Optional flags preserved for backward compatibility
    showGenderIdentity?: boolean;
    showSexualOrientation?: boolean;
    showAge: boolean;
    showCity: boolean;
    showHeight: boolean;
    showBodyStyle: boolean;
    showTags: boolean;
    showBio: boolean;
    hidePhoto: boolean;
  };
}

export interface Match {
  id: string;
  userId: string;
  targetUserId: string;
  status: 'pending' | 'matched' | 'blocked';
  createdAt: string;
  profile: Profile;
}

export interface LikeAction {
  id: string;
  userId: string;
  targetUserId: string;
  action: 'like' | 'pass';
  createdAt: string;
  profile: Profile;
}

export interface ChatThread {
  id: string;
  matchId: string;
  participants: Profile[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  imageUrl: string;
  isJoined: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPrivate: boolean;
  tags: string[];
}

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  author: Profile;
  text: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface MatchFilters {
  ageRange: [number, number];
  maxDistance: number;
  relationshipPurposes: string[];
  ageRanges: string[];
  prefectures: string[];
  sexualOrientations: string[];
  showLikedOnly: boolean;
}

export interface FilterOptions {
  ageRange: [number, number];
  maxDistance: number;
  showLikedOnly: boolean;
}

export interface Language {
  code: 'ja' | 'en';
  name: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface LikeResponse {
  ok: boolean;
  match: boolean;
  matchId?: string;
}

export interface KYCData {
  documentType: string;
  documentImage: string | null;
  selfieImage: string | null;
  status: 'pending' | 'approved' | 'rejected';
}