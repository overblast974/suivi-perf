// Database Manager using IndexedDB
class DatabaseManager {
    constructor() {
        this.dbName = 'SuiviPerfDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('workouts')) {
                    const workoutStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
                    workoutStore.createIndex('type', 'type', { unique: false });
                    workoutStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains('metrics')) {
                    db.createObjectStore('metrics', { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains('goals')) {
                    db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async addWorkout(workout) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readwrite');
            const store = transaction.objectStore('workouts');
            const request = store.add({
                ...workout,
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllWorkouts() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readonly');
            const store = transaction.objectStore('workouts');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getWorkoutsByType(type) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readonly');
            const store = transaction.objectStore('workouts');
            const index = store.index('type');
            const request = index.getAll(type);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteWorkout(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readwrite');
            const store = transaction.objectStore('workouts');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// App Manager
class App {
    constructor() {
        this.db = new DatabaseManager();
        this.currentView = 'dashboard';
        this.currentFilter = 'all';
        this.chart = null;
        this.init();
    }

    async init() {
        try {
            await this.db.init();
            this.setupEventListeners();
            this.setupFormHandling();
            this.loadDashboard();
            this.setTodayDate();
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Add workout buttons
        document.getElementById('addWorkoutBtn').addEventListener('click', () => this.openModal());
        document.getElementById('addWorkoutBtn2').addEventListener('click', () => this.openModal());

        // Modal controls
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());

        // Click outside modal to close
        document.getElementById('addWorkoutModal').addEventListener('click', (e) => {
            if (e.target.id === 'addWorkoutModal') {
                this.closeModal();
            }
        });

        // Workout type change
        document.getElementById('workoutType').addEventListener('change', (e) => {
            this.toggleConditionalFields(e.target.value);
        });

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.filterWorkouts(type);
            });
        });

        // Stats filters
        document.getElementById('statsType').addEventListener('change', () => this.updateChart());
        document.getElementById('statsPeriod').addEventListener('change', () => this.updateChart());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
    }

    setupFormHandling() {
        const form = document.getElementById('workoutForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit();
        });
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('workoutDate').value = today;
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        document.getElementById(view + 'View').classList.add('active');

        this.currentView = view;

        // Load view data
        switch(view) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'workouts':
                this.loadWorkouts();
                break;
            case 'stats':
                this.loadStats();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    async loadDashboard() {
        const workouts = await this.db.getAllWorkouts();

        // Update stats cards
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const thisMonthWorkouts = workouts.filter(w => {
            const date = new Date(w.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        document.getElementById('musculationCount').textContent =
            thisMonthWorkouts.filter(w => w.type === 'musculation').length;
        document.getElementById('runningCount').textContent =
            thisMonthWorkouts.filter(w => w.type === 'running').length;
        document.getElementById('crossfitCount').textContent =
            thisMonthWorkouts.filter(w => w.type === 'crossfit').length;
        document.getElementById('hyroxCount').textContent =
            thisMonthWorkouts.filter(w => w.type === 'hyrox').length;

        // Load recent workouts
        this.displayRecentWorkouts(workouts);
    }

    displayRecentWorkouts(workouts) {
        const container = document.getElementById('recentWorkouts');
        const recent = workouts.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        ).slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <p>Aucun entraînement enregistré</p>
                    <p class="subtitle">Commencez à suivre vos performances</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recent.map(workout => this.createWorkoutCard(workout)).join('');
    }

    createWorkoutCard(workout) {
        const typeLabels = {
            musculation: 'Musculation',
            running: 'Course / Trail',
            crossfit: 'CrossFit',
            hyrox: 'Hyrox'
        };

        const date = new Date(workout.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let details = `<span class="workout-detail">⏱️ ${workout.duration} min</span>`;

        if (workout.type === 'musculation' && workout.totalVolume) {
            details += `<span class="workout-detail">💪 ${workout.totalVolume} kg</span>`;
        }
        if (workout.type === 'running' && workout.distance) {
            details += `<span class="workout-detail">📍 ${workout.distance} km</span>`;
            if (workout.pace) {
                details += `<span class="workout-detail">⚡ ${workout.pace} min/km</span>`;
            }
        }
        if ((workout.type === 'crossfit' || workout.type === 'hyrox') && workout.wodScore) {
            details += `<span class="workout-detail">🎯 ${workout.wodScore}</span>`;
        }

        return `
            <div class="workout-card">
                <div class="workout-header">
                    <div class="workout-type">
                        <span class="workout-type-badge ${workout.type}"></span>
                        <span class="workout-title">${typeLabels[workout.type]}</span>
                    </div>
                    <span class="workout-date">${formattedDate}</span>
                </div>
                <div class="workout-details">
                    ${details}
                </div>
                ${workout.notes ? `<p style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">${workout.notes}</p>` : ''}
            </div>
        `;
    }

    async loadWorkouts() {
        const workouts = await this.db.getAllWorkouts();
        this.displayWorkouts(workouts, 'all');
    }

    async filterWorkouts(type) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        const workouts = type === 'all'
            ? await this.db.getAllWorkouts()
            : await this.db.getWorkoutsByType(type);

        this.displayWorkouts(workouts, type);
    }

    displayWorkouts(workouts, type) {
        const container = document.getElementById('allWorkouts');
        const sorted = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <p>Aucun entraînement</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sorted.map(workout => this.createWorkoutCard(workout)).join('');
    }

    async loadStats() {
        const workouts = await this.db.getAllWorkouts();

        // Update metrics
        document.getElementById('totalVolume').textContent = workouts.length;

        // Calculate progression (comparison with previous month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const thisMonth = workouts.filter(w => {
            const date = new Date(w.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        const previousMonth = workouts.filter(w => {
            const date = new Date(w.date);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        }).length;

        const progression = previousMonth === 0 ? 100 :
            Math.round(((thisMonth - previousMonth) / previousMonth) * 100);

        document.getElementById('progression').textContent =
            progression > 0 ? `+${progression}%` : `${progression}%`;

        // Update chart
        this.updateChart();
    }

    updateChart() {
        const type = document.getElementById('statsType').value;
        const period = document.getElementById('statsPeriod').value;

        this.db.getAllWorkouts().then(workouts => {
            let filtered = type === 'all' ? workouts : workouts.filter(w => w.type === type);

            // Filter by period
            const now = new Date();
            const days = period === 'week' ? 7 : period === 'month' ? 30 :
                        period === 'quarter' ? 90 : 365;

            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - days);

            filtered = filtered.filter(w => new Date(w.date) >= startDate);

            // Group by date
            const grouped = {};
            filtered.forEach(w => {
                const date = new Date(w.date).toLocaleDateString('fr-FR');
                grouped[date] = (grouped[date] || 0) + 1;
            });

            // Prepare chart data
            const labels = Object.keys(grouped).sort((a, b) =>
                new Date(a.split('/').reverse().join('-')) -
                new Date(b.split('/').reverse().join('-'))
            );
            const data = labels.map(label => grouped[label]);

            this.renderChart(labels, data);
        });
    }

    renderChart(labels, data) {
        const canvas = document.getElementById('performanceChart');
        const ctx = canvas.getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Entraînements',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#64748b'
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#64748b',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }

    loadProfile() {
        // Profile is static for now
    }

    openModal() {
        document.getElementById('addWorkoutModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('addWorkoutModal').classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('workoutForm').reset();
        this.toggleConditionalFields('');
        this.setTodayDate();
    }

    toggleConditionalFields(type) {
        document.querySelectorAll('.conditional-fields').forEach(field => {
            field.classList.remove('active');
            field.style.display = 'none';
        });

        if (type) {
            const field = document.getElementById(`${type}Fields`);
            if (field) {
                field.classList.add('active');
                field.style.display = 'block';
            }
        }
    }

    async handleFormSubmit() {
        const type = document.getElementById('workoutType').value;
        const date = document.getElementById('workoutDate').value;
        const duration = document.getElementById('workoutDuration').value;
        const notes = document.getElementById('notes').value;

        const workout = {
            type,
            date,
            duration: parseInt(duration),
            notes
        };

        // Add type-specific fields
        if (type === 'musculation') {
            workout.exercises = document.getElementById('exercises').value;
            workout.totalVolume = parseInt(document.getElementById('totalVolume').value) || 0;
        } else if (type === 'running') {
            workout.distance = parseFloat(document.getElementById('distance').value) || 0;
            workout.runTime = document.getElementById('runTime').value;
            workout.elevation = parseInt(document.getElementById('elevation').value) || 0;
            workout.pace = document.getElementById('pace').value;
        } else if (type === 'crossfit') {
            workout.wod = document.getElementById('wod').value;
            workout.wodScore = document.getElementById('wodScore').value;
        } else if (type === 'hyrox') {
            workout.hyroxType = document.getElementById('hyroxType').value;
            workout.hyroxTime = document.getElementById('hyroxTime').value;
            workout.wodScore = document.getElementById('hyroxTime').value; // For display purposes
            workout.hyroxDetails = document.getElementById('hyroxDetails').value;
        }

        try {
            await this.db.addWorkout(workout);
            this.closeModal();

            // Reload current view
            switch(this.currentView) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'workouts':
                    this.loadWorkouts();
                    break;
                case 'stats':
                    this.loadStats();
                    break;
            }

            // Show success message
            this.showToast('Entraînement ajouté avec succès!');
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            this.showToast('Erreur lors de l\'ajout', 'error');
        }
    }

    showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 500;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async exportData() {
        const workouts = await this.db.getAllWorkouts();
        const dataStr = JSON.stringify(workouts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `suivi-perf-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        this.showToast('Données exportées avec succès!');
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}
