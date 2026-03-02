import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JoinRoomPayload {
  documentId: string;
  token: string;
}

interface PatchPayload {
  documentId: string;
  patch: Record<string, unknown>;
  cursorPosition?: { blockId: string; offset: number };
}

interface CursorPayload {
  documentId: string;
  blockId: string;
  offset: number;
  userId: string;
  userName: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class DocumentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  declare server: Server;

  private readonly logger = new Logger(DocumentGateway.name);

  /** documentId → Set of socketIds */
  private readonly rooms = new Map<string, Set<string>>();
  /** socketId → { userId, orgId, name } */
  private readonly clients = new Map<string, { userId: string; orgId: string; name: string }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.debug(`WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`WS disconnected: ${client.id}`);
    // Remove from all rooms and notify others
    this.rooms.forEach((members, docId) => {
      if (members.has(client.id)) {
        members.delete(client.id);
        const info = this.clients.get(client.id);
        if (info) {
          client.to(`doc:${docId}`).emit('doc:presence', {
            type: 'leave',
            userId: info.userId,
            documentId: docId,
          });
        }
      }
    });
    this.clients.delete(client.id);
  }

  @SubscribeMessage('doc:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): void {
    const { documentId, token } = payload;
    try {
      const jwtPayload = this.jwtService.verify<{ sub: string; orgId: string; email: string }>(
        token,
        { secret: this.configService.get<string>('auth.jwtSecret') },
      );
      this.clients.set(client.id, {
        userId: jwtPayload.sub,
        orgId: jwtPayload.orgId,
        name: jwtPayload.email,
      });

      void client.join(`doc:${documentId}`);

      if (!this.rooms.has(documentId)) {
        this.rooms.set(documentId, new Set());
      }
      const room = this.rooms.get(documentId);
      if (room) room.add(client.id);

      // Broadcast presence to room
      client.to(`doc:${documentId}`).emit('doc:presence', {
        type: 'join',
        userId: jwtPayload.sub,
        name: jwtPayload.email,
        documentId,
      });

      this.logger.debug(`${jwtPayload.email} joined doc:${documentId}`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  @SubscribeMessage('doc:leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { documentId: string },
  ): void {
    const { documentId } = payload;
    void client.leave(`doc:${documentId}`);
    const info = this.clients.get(client.id);
    if (info) {
      client.to(`doc:${documentId}`).emit('doc:presence', {
        type: 'leave',
        userId: info.userId,
        documentId,
      });
    }
    this.rooms.get(documentId)?.delete(client.id);
  }

  @SubscribeMessage('doc:patch')
  handlePatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PatchPayload,
  ): void {
    const info = this.clients.get(client.id);
    if (!info) return;
    // Broadcast the patch to everyone else in the room
    client.to(`doc:${payload.documentId}`).emit('doc:patch', {
      ...payload,
      userId: info.userId,
    });
  }

  @SubscribeMessage('doc:cursor')
  handleCursor(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CursorPayload,
  ): void {
    client.to(`doc:${payload.documentId}`).emit('doc:cursor', payload);
  }

  /** Broadcast a status change (e.g., after approval transition) to all viewers of that doc */
  broadcastStatusChange(documentId: string, status: string, actorId: string): void {
    this.server.to(`doc:${documentId}`).emit('doc:status', { documentId, status, actorId });
  }
}
