// Supabase Database Wrapper
// Replaces IndexedDB with Supabase backend

class SupabaseDatabase {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = null;
    }

    async init() {
        // Get current session
        const { data: { session } } = await this.supabase.auth.getSession();

        if (!session) {
            // No session, redirect to login
            window.location.href = 'auth.html';
            throw new Error('No authentication session');
        }

        this.currentUser = session.user;

        // Ensure profile exists
        await this.ensureProfile();

        return this;
    }

    async ensureProfile() {
        const { data, error } = await this.supabase
            .from('users_profile')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: insertError } = await this.supabase
                .from('users_profile')
                .insert({
                    user_id: this.currentUser.id,
                    name: this.currentUser.user_metadata?.name || 'Athlète'
                });

            if (insertError) {
                console.error('Error creating profile:', insertError);
            }
        }
    }

    // Workouts methods
    async addWorkout(workout) {
        const { data, error } = await this.supabase
            .from('workouts')
            .insert({
                ...workout,
                user_id: this.currentUser.id
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    }

    async getWorkout(id) {
        const { data, error } = await this.supabase
            .from('workouts')
            .select('*')
            .eq('id', id)
            .eq('user_id', this.currentUser.id)
            .single();

        if (error) throw error;
        return data;
    }

    async getAllWorkouts() {
        const { data, error } = await this.supabase
            .from('workouts')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async updateWorkout(id, workout) {
        const { error } = await this.supabase
            .from('workouts')
            .update(workout)
            .eq('id', id)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    async deleteWorkout(id) {
        const { error } = await this.supabase
            .from('workouts')
            .delete()
            .eq('id', id)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    // Profile methods
    async getProfile() {
        const { data, error } = await this.supabase
            .from('users_profile')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .single();

        if (error) {
            console.error('Error getting profile:', error);
            return {};
        }

        // Transform Supabase format to app format
        return {
            userInfo: {
                name: data.name,
                age: data.age,
                gender: data.gender,
                role: data.role || 'user'
            },
            anthropo: {
                weight: data.weight,
                height: data.height,
                bodyFat: data.body_fat,
                bmi: data.bmi
            },
            metrics: {
                vo2max: data.vo2max,
                vma: data.vma,
                fcMax: data.fc_max,
                fcRepos: data.fc_repos
            },
            reminder: {
                enabled: data.reminder_enabled,
                time: data.reminder_time,
                message: data.reminder_message
            }
        };
    }

    async saveProfile(profile) {
        // Transform app format to Supabase format
        const updateData = {};

        if (profile.userInfo) {
            updateData.name = profile.userInfo.name;
            updateData.age = profile.userInfo.age;
            updateData.gender = profile.userInfo.gender;
        }

        if (profile.anthropo) {
            updateData.weight = profile.anthropo.weight;
            updateData.height = profile.anthropo.height;
            updateData.body_fat = profile.anthropo.bodyFat;
            updateData.bmi = profile.anthropo.bmi;
        }

        if (profile.metrics) {
            updateData.vo2max = profile.metrics.vo2max;
            updateData.vma = profile.metrics.vma;
            updateData.fc_max = profile.metrics.fcMax;
            updateData.fc_repos = profile.metrics.fcRepos;
        }

        if (profile.reminder !== undefined) {
            updateData.reminder_enabled = profile.reminder.enabled;
            updateData.reminder_time = profile.reminder.time;
            updateData.reminder_message = profile.reminder.message;
        }

        const { error } = await this.supabase
            .from('users_profile')
            .update(updateData)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    // Goals methods
    async addGoal(goal) {
        const { data, error } = await this.supabase
            .from('goals')
            .insert({
                ...goal,
                user_id: this.currentUser.id
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    }

    async getGoal(id) {
        const { data, error } = await this.supabase
            .from('goals')
            .select('*')
            .eq('id', id)
            .eq('user_id', this.currentUser.id)
            .single();

        if (error) throw error;
        return data;
    }

    async getAllGoals() {
        const { data, error } = await this.supabase
            .from('goals')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async updateGoal(id, goal) {
        const { error } = await this.supabase
            .from('goals')
            .update(goal)
            .eq('id', id)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    async deleteGoal(id) {
        const { error } = await this.supabase
            .from('goals')
            .delete()
            .eq('id', id)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    // Role methods
    async getUserRole() {
        const profile = await this.getProfile();
        return profile.userInfo?.role || 'user';
    }

    async isAdmin() {
        const role = await this.getUserRole();
        return role === 'admin';
    }

    // Auth helper
    async logout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) console.error('Logout error:', error);
        window.location.href = 'auth.html';
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.SupabaseDatabase = SupabaseDatabase;
}
