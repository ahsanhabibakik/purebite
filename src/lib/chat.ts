import { prisma } from '@/lib/db';
import { ChatStatus, ChatPriority, ChatMessageType } from '@prisma/client';

interface CreateChatRoomData {
  userId: string;
  title?: string;
  priority?: ChatPriority;
  initialMessage?: string;
}

interface SendMessageData {
  roomId: string;
  senderId: string;
  message: string;
  messageType?: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface ChatRoomFilters {
  status?: ChatStatus;
  assignedTo?: string;
  userId?: string;
  isArchived?: boolean;
}

export class ChatService {
  
  /**
   * Create a new chat room
   */
  static async createChatRoom(data: CreateChatRoomData) {
    const room = await prisma.chatRoom.create({
      data: {
        userId: data.userId,
        title: data.title,
        priority: data.priority || ChatPriority.NORMAL,
        status: ChatStatus.OPEN,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    // Send initial message if provided
    if (data.initialMessage) {
      await this.sendMessage({
        roomId: room.id,
        senderId: data.userId,
        message: data.initialMessage,
        messageType: ChatMessageType.TEXT,
      });
    }

    return room;
  }

  /**
   * Get chat rooms with filters
   */
  static async getChatRooms(filters: ChatRoomFilters, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.assignedTo !== undefined) {
      where.assignedTo = filters.assignedTo === 'unassigned' ? null : filters.assignedTo;
    }
    if (filters.userId) where.userId = filters.userId;
    if (filters.isArchived !== undefined) where.isArchived = filters.isArchived;

    const [rooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              message: true,
              messageType: true,
              createdAt: true,
              isRead: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),
      prisma.chatRoom.count({ where }),
    ]);

    return {
      rooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific chat room with messages
   */
  static async getChatRoom(roomId: string, userId?: string) {
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new Error('Chat room not found');
    }

    // Check if user has access to this room
    if (userId && room.userId !== userId && room.assignedTo !== userId) {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Access denied');
      }
    }

    return room;
  }

  /**
   * Send a message in a chat room
   */
  static async sendMessage(data: SendMessageData) {
    const message = await prisma.$transaction(async (tx) => {
      // Create the message
      const newMessage = await tx.chatMessage.create({
        data: {
          roomId: data.roomId,
          senderId: data.senderId,
          message: data.message,
          messageType: data.messageType || ChatMessageType.TEXT,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Update the room's last message timestamp
      await tx.chatRoom.update({
        where: { id: data.roomId },
        data: { lastMessageAt: new Date() },
      });

      return newMessage;
    });

    return message;
  }

  /**
   * Assign a chat room to an agent
   */
  static async assignChatRoom(roomId: string, agentId: string) {
    const room = await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        assignedTo: agentId,
        status: ChatStatus.IN_PROGRESS,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Send system message
    await this.sendMessage({
      roomId,
      senderId: agentId,
      message: `${room.agent?.name || 'Support agent'} has joined the conversation`,
      messageType: ChatMessageType.SYSTEM,
    });

    return room;
  }

  /**
   * Update chat room status
   */
  static async updateChatRoomStatus(roomId: string, status: ChatStatus, userId?: string) {
    const room = await prisma.chatRoom.update({
      where: { id: roomId },
      data: { status },
    });

    // Send system message for status changes
    if (userId) {
      const statusMessages = {
        [ChatStatus.OPEN]: 'Chat reopened',
        [ChatStatus.IN_PROGRESS]: 'Chat is now in progress',
        [ChatStatus.RESOLVED]: 'Chat marked as resolved',
        [ChatStatus.CLOSED]: 'Chat closed',
      };

      if (statusMessages[status]) {
        await this.sendMessage({
          roomId,
          senderId: userId,
          message: statusMessages[status],
          messageType: ChatMessageType.SYSTEM,
        });
      }
    }

    return room;
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(roomId: string, userId: string) {
    await prisma.chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId: string) {
    const count = await prisma.chatMessage.count({
      where: {
        room: {
          OR: [
            { userId },
            { assignedTo: userId },
          ],
        },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Set typing status
   */
  static async setTypingStatus(roomId: string, userId: string, isTyping: boolean) {
    if (isTyping) {
      await prisma.chatTyping.upsert({
        where: {
          roomId_userId: {
            roomId,
            userId,
          },
        },
        create: {
          roomId,
          userId,
          isTyping: true,
        },
        update: {
          isTyping: true,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.chatTyping.deleteMany({
        where: {
          roomId,
          userId,
        },
      });
    }
  }

  /**
   * Get typing users in a room
   */
  static async getTypingUsers(roomId: string) {
    const typingRecords = await prisma.chatTyping.findMany({
      where: {
        roomId,
        isTyping: true,
        updatedAt: {
          gte: new Date(Date.now() - 10000), // Only show typing if updated within last 10 seconds
        },
      },
      select: {
        userId: true,
      },
    });

    return typingRecords.map(record => record.userId);
  }

  /**
   * Archive/unarchive a chat room
   */
  static async archiveChatRoom(roomId: string, isArchived: boolean) {
    return prisma.chatRoom.update({
      where: { id: roomId },
      data: { isArchived },
    });
  }

  /**
   * Get chat statistics for admin dashboard
   */
  static async getChatStats() {
    const [totalRooms, openRooms, inProgressRooms, todayMessages] = await Promise.all([
      prisma.chatRoom.count(),
      prisma.chatRoom.count({ where: { status: ChatStatus.OPEN } }),
      prisma.chatRoom.count({ where: { status: ChatStatus.IN_PROGRESS } }),
      prisma.chatMessage.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalRooms,
      openRooms,
      inProgressRooms,
      todayMessages,
    };
  }

  /**
   * Search chat messages
   */
  static async searchMessages(query: string, roomId?: string, limit = 50) {
    const where: any = {
      message: {
        contains: query,
        mode: 'insensitive',
      },
    };

    if (roomId) {
      where.roomId = roomId;
    }

    return prisma.chatMessage.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        room: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}

export default ChatService;