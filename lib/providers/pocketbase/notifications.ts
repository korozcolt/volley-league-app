import PocketBase from 'pocketbase';
import { INotificationProvider, NotificationData, NotificationTemplate } from '../interfaces/INotificationProvider';

export class PocketBaseNotificationProvider implements INotificationProvider {
  constructor(private pb: PocketBase) {}

  async sendNotification(notification: NotificationData) {
    try {
      // TODO: Implementar envío de notificaciones
      // Por ahora solo guardar en base de datos como log
      const data = await this.pb.collection('notifications').create({
        title: notification.title,
        body: notification.body,
        recipients: notification.recipients,
        type: notification.type,
        data: notification.data || {},
        sent_at: new Date().toISOString(),
        status: 'sent'
      });
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async sendBulkNotifications(notifications: NotificationData[]) {
    try {
      const results = [];
      for (const notification of notifications) {
        const result = await this.sendNotification(notification);
        results.push(result.data);
      }
      
      return { data: results, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async subscribeUser(userId: string, topics: string[]) {
    try {
      // TODO: Implementar suscripciones
      const data = await this.pb.collection('user_subscriptions').create({
        user: userId,
        topics: topics,
        subscribed_at: new Date().toISOString()
      });
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async unsubscribeUser(userId: string, topics: string[]) {
    try {
      // TODO: Implementar desuscripciones
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async createTemplate(template: NotificationTemplate) {
    try {
      const data = await this.pb.collection('notification_templates').create(template);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async getTemplates() {
    try {
      const records = await this.pb.collection('notification_templates').getList(1, 50);
      return { data: records.items, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async getNotificationHistory(userId: string, limit = 20) {
    try {
      const records = await this.pb.collection('notifications').getList(1, limit, {
        filter: `recipients ~ "${userId}"`,
        sort: '-sent_at'
      });
      
      return { data: records.items, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }
}
