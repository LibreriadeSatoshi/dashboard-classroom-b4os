
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  points_required: number;
}

export interface UserBadge {
  id: number;
  user_id: string;
  badge_id: number;
  unlocked_at: string;
}
    