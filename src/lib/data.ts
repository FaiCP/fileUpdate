import type { User } from '@/lib/types';

export const getUserById = (userId: string, allUsers: User[]): User | undefined => allUsers.find(u => u.id === userId);
