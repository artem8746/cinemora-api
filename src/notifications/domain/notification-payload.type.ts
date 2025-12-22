export type NotificationType =
  | 'profile_updated'
  | 'password_changed'
  | 'account_verified'
  | 'new_message'
  | (string & {});

export interface NotificationPayload {
  type: NotificationType;
  message: string;
  data?: Record<string, unknown>;
  userIds?: string[];
}
