import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from './notification.service.js';
import prisma from '../lib/prisma.js';
import * as mailService from './mail.service.js';

vi.mock('../lib/prisma.js', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    __esModule: true,
    default: mockDeep(),
  };
});

vi.mock('./mail.service.js', () => ({
  sendNotificationEmail: vi.fn().mockResolvedValue({ messageId: 'test-id' })
}));

const prismaMock = prisma as any;

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a notification and deliver email to a specific user', async () => {
    const mockUser = { userId: 1, email: 'test@example.com', fullName: 'Test User', emailNotificationsEnabled: true };
    prismaMock.notification.findFirst.mockResolvedValue(null);
    prismaMock.notification.create.mockResolvedValue({ notificationId: 1 });
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    await NotificationService.notify({
      userId: 1,
      title: 'test_title',
      message: 'test_message',
      type: 'SYSTEM'
    });

    // Wait a tiny bit for the setImmediate to fire
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(prismaMock.notification.create).toHaveBeenCalled();
    expect(mailService.sendNotificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      expect.any(Object)
    );
  });

  it('should deduplicate close notifications', async () => {
    prismaMock.notification.findFirst.mockResolvedValue({ notificationId: 1 });

    await NotificationService.notify({
      userId: 1,
      title: 'test_title',
      message: 'test_message',
      type: 'SYSTEM'
    });

    // Wait a tiny bit for the setImmediate to fire (though it shouldn't send anything)
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(prismaMock.notification.create).not.toHaveBeenCalled();
    expect(mailService.sendNotificationEmail).not.toHaveBeenCalled();
  });

  it('should broadcast notifications and deduplicate by email', async () => {
    // 3 user records but 2 have the same email
    const mockUsers = [
      { email: 'coord@example.com', fullName: 'Coord 1' },
      { email: 'coord@example.com', fullName: 'Coord 1 (Duplicate)' },
      { email: 'admin@example.com', fullName: 'Admin 1' }
    ];
    
    prismaMock.notification.findFirst.mockResolvedValue(null);
    prismaMock.notification.create.mockResolvedValue({ notificationId: 1 });
    prismaMock.user.findMany.mockResolvedValue(mockUsers);

    await NotificationService.notify({
      title: 'phase_start_title',
      message: '{"key":"phase_start_msg","params":{"name":"Test Phase"}}',
      type: 'PHASE',
      isBroadcast: true
    });

    // Wait for the background worker
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should only call 2 times (coord@example.com and admin@example.com)
    expect(mailService.sendNotificationEmail).toHaveBeenCalledTimes(2);
  });
});
