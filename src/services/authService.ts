import { supabase, handleSupabaseError, handleSupabaseSuccess } from './supabase';
import { User } from '../types';

export class AuthService {
  // User sign up
  static async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // User sign in
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // User sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(null);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(user);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get current session
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(session);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Create user profile after signup
  static async createUserProfile(userId: string, email: string, profileData: Partial<User> = {}) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          created_at: new Date().toISOString(),
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
