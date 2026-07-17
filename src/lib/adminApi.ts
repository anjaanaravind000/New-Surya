import { isSupabaseConfigured, requireSupabase } from './supabaseClient';

export type ManagedUserInput = {
  name: string;
  phone: string;
  email: string;
  password: string;
  roleCode: string;
  branchCodes: string[];
};

export async function createManagedUser(input: ManagedUserInput): Promise<{ mode: 'cloud' | 'demo'; userId?: string }> {
  if (!isSupabaseConfigured) return { mode:'demo' };

  const { data, error } = await requireSupabase().functions.invoke('admin-create-user', { body:input });
  if (error) throw new Error(error.message || 'Unable to create the user.');
  if (!data?.ok) throw new Error(data?.error || 'Unable to create the user.');
  return { mode:'cloud', userId:data.userId };
}
