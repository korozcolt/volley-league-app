export interface INotificationProvider {
  // Envío de notificaciones
  sendNotification(notification: NotificationData): Promise<{ data: any; error: string | null }>;
  sendBulkNotifications(notifications: NotificationData[]): Promise<{ data: any[]; error: string | null }>;
  
  // Gestión de usuarios
  subscribeUser(userId: string, topics: string[]): Promise<{ data: any; error: string | null }>;
  unsubscribeUser(userId: string, topics: string[]): Promise<{ data: any; error: string | null }>;
  
  // Plantillas
  createTemplate(template: NotificationTemplate): Promise<{ data: any; error: string | null }>;
  getTemplates(): Promise<{ data: NotificationTemplate[]; error: string | null }>;
  
  // Historial
  getNotificationHistory(userId: string, limit?: number): Promise<{ data: any[]; error: string | null }>;
}

export interface NotificationData {
  title: string;
  body: string;
  recipients: string[];
  type: 'match_reminder' | 'tournament_update' | 'team_invitation' | 'general';
  data?: Record<string, any>;
  scheduledFor?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
}
