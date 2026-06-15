export type UserRole = 'member' | 'business' | 'admin';
export type PostCategory =
  | 'news' | 'immigration' | 'church' | 'association' | 'fundraiser' | 'funeral' | 'alert'
  | 'hospitality' | 'realestate';
export type ContentStatus = 'pending' | 'approved' | 'rejected';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Volunteer';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  city: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  show_phone?: boolean;
  show_email?: boolean;
  push_notifications?: boolean;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBusiness {
  id: string;
  owner_id: string | null;
  name: string;
  category: string;
  description: string;
  owner_name: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string | null;
  emoji: string;
  color: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  status: ContentStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPost {
  id: string;
  author_id: string | null;
  author_name: string;
  category: PostCategory;
  title: string;
  body: string;
  city: string;
  status: ContentStatus;
  pinned: boolean;
  important: boolean;
  image_url: string | null;
  reactions_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbEvent {
  id: string;
  organizer_id: string | null;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  organizer_name: string;
  city: string;
  emoji: string;
  color: string;
  featured: boolean;
  attendees_count: number;
  status: ContentStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbJob {
  id: string;
  posted_by_id: string | null;
  title: string;
  description: string;
  location: string;
  contact: string;
  expires_on: string | null;
  posted_by_name: string;
  job_type: JobType;
  status: ContentStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  unread: boolean;
  created_at: string;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface DbAppFeedback {
  id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  category: string;
  message: string;
  created_at: string;
}

export interface DbSavedItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  created_at: string;
}

export interface DbReaction {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  reaction_type: string;
  created_at: string;
}

export interface DbReport {
  id: string;
  reporter_id: string | null;
  item_id: string;
  item_type: string;
  reason: string;
  message: string | null;
  status: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; name: string };
        Update: Partial<Profile>;
      };
      posts: {
        Row: DbPost;
        Insert: Omit<DbPost, 'id' | 'created_at' | 'updated_at' | 'reactions_count'> & {
          id?: string;
          reactions_count?: number;
        };
        Update: Partial<DbPost>;
      };
      businesses: {
        Row: DbBusiness;
        Insert: Omit<DbBusiness, 'id' | 'created_at' | 'updated_at' | 'rating'> & {
          id?: string;
          rating?: number;
        };
        Update: Partial<DbBusiness>;
      };
      events: {
        Row: DbEvent;
        Insert: Omit<DbEvent, 'id' | 'created_at' | 'updated_at' | 'attendees_count'> & {
          id?: string;
          attendees_count?: number;
        };
        Update: Partial<DbEvent>;
      };
      jobs: {
        Row: DbJob;
        Insert: Omit<DbJob, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<DbJob>;
      };
      notifications: {
        Row: DbNotification;
        Insert: Omit<DbNotification, 'id' | 'created_at'> & { id?: string };
        Update: Partial<DbNotification>;
      };
      event_rsvps: {
        Row: EventRsvp;
        Insert: Omit<EventRsvp, 'id' | 'created_at'> & { id?: string };
        Update: Partial<EventRsvp>;
      };
      app_feedback: {
        Row: DbAppFeedback;
        Insert: Omit<DbAppFeedback, 'id' | 'created_at'> & { id?: string };
        Update: Partial<DbAppFeedback>;
      };
      saved_items: {
        Row: DbSavedItem;
        Insert: Omit<DbSavedItem, 'id' | 'created_at'> & { id?: string };
        Update: Partial<DbSavedItem>;
      };
      reactions: {
        Row: DbReaction;
        Insert: Omit<DbReaction, 'id' | 'created_at'> & { id?: string };
        Update: Partial<DbReaction>;
      };
      reports: {
        Row: DbReport;
        Insert: Omit<DbReport, 'id' | 'created_at'> & { id?: string };
        Update: Partial<DbReport>;
      };
    };
    Enums: {
      user_role: UserRole;
      post_category: PostCategory;
      content_status: ContentStatus;
      job_type: JobType;
    };
  };
}
