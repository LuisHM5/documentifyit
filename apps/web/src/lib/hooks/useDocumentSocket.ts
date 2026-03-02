import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api/token';

const WS_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')
  : 'http://localhost:3001';

export interface Presence {
  userId: string;
  name: string;
  type: 'join' | 'leave';
  documentId: string;
}

export interface DocPatch {
  documentId: string;
  patch: Record<string, unknown>;
  userId: string;
}

export interface UseDocumentSocketOptions {
  documentId: string;
  onPatch?: (patch: DocPatch) => void;
  onPresence?: (presence: Presence) => void;
  onStatusChange?: (status: string) => void;
}

export function useDocumentSocket({
  documentId,
  onPatch,
  onPresence,
  onStatusChange,
}: UseDocumentSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !documentId) return;

    const socket = io(`${WS_URL}/realtime`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('doc:join', { documentId, token });
    });

    socket.on('doc:patch', (data: DocPatch) => {
      onPatch?.(data);
    });

    socket.on('doc:presence', (data: Presence) => {
      onPresence?.(data);
    });

    socket.on('doc:status', (data: { status: string }) => {
      onStatusChange?.(data.status);
    });

    return () => {
      socket.emit('doc:leave', { documentId });
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const broadcastPatch = useCallback(
    (patch: Record<string, unknown>) => {
      socketRef.current?.emit('doc:patch', { documentId, patch });
    },
    [documentId],
  );

  return { broadcastPatch };
}
