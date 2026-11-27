import { apiRequest } from './client';
import {
  CreateMemoryPayload,
  MentorConversation,
  MentorMemory,
  MentorMessage,
  MentorPermissions,
  SendMentorMessagePayload,
  SendMentorMessageResponse,
} from '../types/mentor';

export const mentorApi = {
  getConversations(): Promise<MentorConversation[]> {
    return apiRequest<MentorConversation[]>('/mentor/conversations', {
      method: 'GET',
    });
  },

  getMessages(conversationId: string): Promise<MentorMessage[]> {
    return apiRequest<MentorMessage[]>(
      `/mentor/conversations/${conversationId}/messages`,
      { method: 'GET' }
    );
  },

  sendMessage(
    payload: SendMentorMessagePayload
  ): Promise<SendMentorMessageResponse> {
    return apiRequest<SendMentorMessageResponse>('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  resolveAction(messageId: string, approve: boolean): Promise<MentorMessage> {
    return apiRequest<MentorMessage>(`/mentor/messages/${messageId}/action`, {
      method: 'POST',
      body: JSON.stringify({ approve }),
    });
  },

  getMemories(): Promise<MentorMemory[]> {
    return apiRequest<MentorMemory[]>('/mentor/memories', {
      method: 'GET',
    });
  },

  addMemory(payload: CreateMemoryPayload): Promise<MentorMemory> {
    return apiRequest<MentorMemory>('/mentor/memories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteMemory(id: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/mentor/memories/${id}`, {
      method: 'DELETE',
    });
  },

  getPermissions(): Promise<MentorPermissions> {
    return apiRequest<MentorPermissions>('/mentor/permissions', {
      method: 'GET',
    });
  },

  updatePermissions(
    permissions: MentorPermissions
  ): Promise<MentorPermissions> {
    return apiRequest<MentorPermissions>('/mentor/permissions', {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });
  },
};
