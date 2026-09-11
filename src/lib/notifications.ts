import { prisma } from './prisma';

export type NotificationType =
  | 'NEW_RESIDENT'
  | 'RENT_DUE'
  | 'RENT_OVERDUE'
  | 'NEW_COMPLAINT'
  | 'COMPLAINT_STATUS'
  | 'RESIDENT_CHECKOUT'
  | 'ROOM_AVAILABLE';

export async function createNotification(data: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}
