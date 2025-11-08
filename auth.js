// Authentication Logic
class AuthManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkSession();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signupFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Form switching
        document.getElementById('showSignupBtn').addEventListener('click', () => {
            this.showSignupForm();
        });

        document.getElementById('showLoginBtn').addEventListener('click', () => {
            this.showLoginForm();
        });
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('signupForm').classList.remove('active');
        this.hideMessage();
    }

    showSignupForm() {
        document.getElementById('signupForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        this.hideMessage();
    }

    showMessage(message, type = 'error') {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = message;
        messageEl.className = `auth-message show ${type}`;
    }

    hideMessage() {
        const messageEl = document.getElementById('authMessage');
        messageEl.className = 'auth-message';
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showMessage('Veuillez remplir tous les champs', 'error');
            return;
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.showMessage('Connexion réussie ! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(error.message || 'Erreur de connexion', 'error');
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const age = parseInt(document.getElementById('signupAge').value);
        const gender = document.getElementById('signupGender').value;
        const weight = parseFloat(document.getElementById('signupWeight').value) || null;
        const height = parseInt(document.getElementById('signupHeight').value) || null;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

        // Validation
        if (!name || !email || !age || !gender || !password) {
            this.showMessage('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            this.showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        try {
            // Create auth user
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        age,
                        gender
                    }
                }
            });

            if (authError) throw authError;

            // Calculate BMI if weight and height provided
            let bmi = null;
            if (weight && height) {
                const heightInMeters = height / 100;
                bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
            }

            // Create user profile
            const { error: profileError } = await this.supabase
                .from('users_profile')
                .insert({
                    user_id: authData.user.id,
                    name,
                    age,
                    gender,
                    weight,
                    height,
                    bmi
                });

            if (profileError) throw profileError;

            this.showMessage('Compte créé ! Connexion en cours...', 'success');

            // Auto-login after signup
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage(error.message || 'Erreur lors de la création du compte', 'error');
        }
    }

    async checkSession() {
        const { data: { session } } = await this.supabase.auth.getSession();

        if (session) {
            // User is already logged in, redirect to app
            window.location.href = 'index.html';
        }
    }
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});
