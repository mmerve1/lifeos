export interface ProposedTaskAction {
  type: 'create_task' | string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | string;
  dueDate?: string | null;
  dueTime?: string | null;
}

export interface MentorMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | string;
  content: string;
  proposedAction?: ProposedTaskAction | null;
  actionStatus?: 'pending' | 'approved' | 'rejected' | null;
  createdAt: string;
}

export interface MentorConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMentorMessagePayload {
  conversationId?: string | null;
  message: string;
  language?: 'tr' | 'en';
}

export interface SendMentorMessageResponse {
  conversation: MentorConversation;
  userMessage: MentorMessage;
  assistantMessage: MentorMessage;
}

export interface MentorMemory {
  id: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface CreateMemoryPayload {
  content: string;
  category?: string;
}

export interface MentorPermissions {
  allowCalendar: boolean;
  allowTasks: boolean;
  allowHabits: boolean;
  allowCareer: boolean;
  allowFinance: boolean;
  allowHealth: boolean;
}
