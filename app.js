// Database Manager using IndexedDB
class DatabaseManager {
    constructor() {
        this.dbName = 'SuiviPerfDB';
        this.version = 2;  // Increased version for new stores
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

                if (!db.objectStoreNames.contains('profile')) {
                    db.createObjectStore('profile', { keyPath: 'id' });
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

    async getProfile() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['profile'], 'readonly');
            const store = transaction.objectStore('profile');
            const request = store.get('user');

            request.onsuccess = () => resolve(request.result || {});
            request.onerror = () => reject(request.error);
        });
    }

    async saveProfile(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['profile'], 'readwrite');
            const store = transaction.objectStore('profile');
            const request = store.put({ id: 'user', ...data });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async addGoal(goal) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['goals'], 'readwrite');
            const store = transaction.objectStore('goals');
            const request = store.add(goal);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllGoals() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['goals'], 'readonly');
            const store = transaction.objectStore('goals');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
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
        this.currentSort = 'recent';
        this.charts = {
            frequency: null,
            volume: null,
            performance: null
        };
        this.calendar = {
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear()
        };
        this.init();
    }

    async init() {
        try {
            await this.db.init();
            this.setupEventListeners();
            this.setupFormHandling();
            this.setupMenu();
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

        // Plan session modal controls
        document.getElementById('closePlanModalBtn').addEventListener('click', () => this.closePlanModal());
        document.getElementById('cancelPlanBtn').addEventListener('click', () => this.closePlanModal());

        // Click outside modal to close
        document.getElementById('addWorkoutModal').addEventListener('click', (e) => {
            if (e.target.id === 'addWorkoutModal') {
                this.closeModal();
            }
        });

        document.getElementById('planSessionModal').addEventListener('click', (e) => {
            if (e.target.id === 'planSessionModal') {
                this.closePlanModal();
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

        // Workout sort
        const sortSelect = document.getElementById('workoutSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.loadWorkouts();
            });
        }

        // Stats filters
        document.getElementById('statsType').addEventListener('change', () => this.updateStats());
        document.getElementById('statsPeriod').addEventListener('change', () => this.updateStats());
        const statsAgg = document.getElementById('statsAggregation');
        if (statsAgg) {
            statsAgg.addEventListener('change', () => this.updateStats());
        }

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Calendar controls
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        if (prevMonth && nextMonth) {
            prevMonth.addEventListener('click', () => this.changeMonth(-1));
            nextMonth.addEventListener('click', () => this.changeMonth(1));
        }

        // Profile buttons
        const editUserInfoBtn = document.getElementById('editUserInfoBtn');
        const editAnthropoBtn = document.getElementById('editAnthropoBtn');
        const editMetricsBtn = document.getElementById('editMetricsBtn');
        const editGoalsBtn = document.getElementById('editGoalsBtn');

        if (editUserInfoBtn) editUserInfoBtn.addEventListener('click', () => this.showToast('Fonctionnalité en développement'));
        if (editAnthropoBtn) editAnthropoBtn.addEventListener('click', () => this.showToast('Fonctionnalité en développement'));
        if (editMetricsBtn) editMetricsBtn.addEventListener('click', () => this.showToast('Fonctionnalité en développement'));
        if (editGoalsBtn) editGoalsBtn.addEventListener('click', () => this.showToast('Fonctionnalité en développement'));

        // Goal button
        const addGoalBtn = document.getElementById('addGoalBtn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.showToast('Fonctionnalité en développement'));
        }
    }

    setupMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const closeMenuBtn = document.getElementById('closeMenuBtn');
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');

        const openMenu = () => {
            sideMenu.classList.add('active');
            menuOverlay.classList.add('active');
        };

        const closeMenu = () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        };

        menuBtn.addEventListener('click', openMenu);
        closeMenuBtn.addEventListener('click', closeMenu);
        menuOverlay.addEventListener('click', closeMenu);

        // Menu actions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.dataset.action;
                closeMenu();

                switch(action) {
                    case 'export':
                        this.exportData();
                        break;
                    case 'import':
                        this.showToast('Fonctionnalité en développement');
                        break;
                    case 'settings':
                        this.switchView('profile');
                        break;
                    case 'about':
                        this.showToast('Suivi Performance v1.0');
                        break;
                }
            });
        });
    }

    setupFormHandling() {
        const form = document.getElementById('workoutForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit();
        });

        const planForm = document.getElementById('planSessionForm');
        planForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePlanFormSubmit();
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
            case 'program':
                this.loadProgram();
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
        // Filter only completed workouts (treat undefined status as completed for backward compatibility)
        const completedWorkouts = workouts.filter(w => !w.status || w.status === 'completed');

        // Update stats cards
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const thisMonthWorkouts = completedWorkouts.filter(w => {
            const date = new Date(w.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        document.getElementById('musculationCount').textContent =
            thisMonthWorkouts.filter(w => w.type === 'musculation').length;
        document.getElementById('runningCount').textContent =
            thisMonthWorkouts.filter(w => w.type === 'running').length;

        // Load recent workouts
        this.displayRecentWorkouts(completedWorkouts);
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
            running: 'Course / Trail'
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
        const allWorkouts = await this.db.getAllWorkouts();
        // Filter only completed workouts
        const workouts = allWorkouts.filter(w => !w.status || w.status === 'completed');
        this.displayWorkouts(workouts, 'all');
    }

    async filterWorkouts(type) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        this.currentFilter = type;
        const allWorkouts = type === 'all'
            ? await this.db.getAllWorkouts()
            : await this.db.getWorkoutsByType(type);

        // Filter only completed workouts
        const workouts = allWorkouts.filter(w => !w.status || w.status === 'completed');

        this.displayWorkouts(workouts, type);
    }

    displayWorkouts(workouts, type) {
        const container = document.getElementById('allWorkouts');

        // Sort workouts
        let sorted = [...workouts];
        switch(this.currentSort) {
            case 'recent':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'type':
                sorted.sort((a, b) => a.type.localeCompare(b.type));
                break;
        }

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

    async loadProgram() {
        this.renderCalendar();
    }

    async renderCalendar() {
        const { currentMonth, currentYear } = this.calendar;
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        document.getElementById('currentMonth').textContent =
            `${monthNames[currentMonth]} ${currentYear}`;

        const workouts = await this.db.getAllWorkouts();

        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const calendar = document.getElementById('calendar');
        let html = `
            <div class="calendar-days-header">
                ${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day =>
                    `<div class="calendar-day-name">${day}</div>`
                ).join('')}
            </div>
            <div class="calendar-grid">
        `;

        // Adjust for Monday start (0 = Sunday in JS)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        // Previous month days
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = adjustedFirstDay - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month">${prevMonthDays - i}</div>`;
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayWorkouts = workouts.filter(w => w.date === dateStr);
            const plannedSessions = dayWorkouts.filter(w => w.status === 'planned');
            const completedSessions = dayWorkouts.filter(w => w.status === 'completed');

            const isToday = today.getDate() === day &&
                           today.getMonth() === currentMonth &&
                           today.getFullYear() === currentYear;

            const classes = ['calendar-day'];
            if (isToday) classes.push('today');
            if (dayWorkouts.length > 0) classes.push('has-workout');

            html += `
                <div class="${classes.join(' ')}" data-date="${dateStr}">
                    <span>${day}</span>
                    ${completedSessions.length > 0 ? `
                        <div class="workout-dots">
                            ${completedSessions.slice(0, 4).map(w =>
                                `<div class="workout-dot ${w.type}" title="Terminé"></div>`
                            ).join('')}
                        </div>
                    ` : ''}
                    ${plannedSessions.length > 0 ? `
                        <div class="workout-dots">
                            ${plannedSessions.slice(0, 4).map(w =>
                                `<div class="workout-dot ${w.type} planned" title="Planifié: ${w.note || w.type}"></div>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        html += `</div>`;
        calendar.innerHTML = html;

        // Add click handlers to calendar days
        calendar.querySelectorAll('.calendar-day[data-date]').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.dataset.date;
                if (dateStr) {
                    this.openPlanModal(dateStr);
                }
            });
        });
    }

    changeMonth(delta) {
        this.calendar.currentMonth += delta;
        if (this.calendar.currentMonth < 0) {
            this.calendar.currentMonth = 11;
            this.calendar.currentYear--;
        } else if (this.calendar.currentMonth > 11) {
            this.calendar.currentMonth = 0;
            this.calendar.currentYear++;
        }
        this.renderCalendar();
    }

    async loadStats() {
        await this.updateStats();
    }

    async updateStats() {
        const type = document.getElementById('statsType').value;
        const period = document.getElementById('statsPeriod').value;
        const aggregation = document.getElementById('statsAggregation')?.value || 'day';

        const allWorkouts = await this.db.getAllWorkouts();
        // Filter only completed workouts
        const workouts = allWorkouts.filter(w => !w.status || w.status === 'completed');
        let filtered = type === 'all' ? workouts : workouts.filter(w => w.type === type);

        // Filter by period
        const now = new Date();
        const days = period === 'week' ? 7 : period === 'month' ? 30 :
                    period === 'quarter' ? 90 : 365;

        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);

        filtered = filtered.filter(w => new Date(w.date) >= startDate);

        // Update metrics
        document.getElementById('totalVolume').textContent = filtered.length;

        // Calculate progression
        const midDate = new Date(startDate);
        midDate.setDate(midDate.getDate() + days / 2);

        const firstHalf = filtered.filter(w => new Date(w.date) < midDate).length;
        const secondHalf = filtered.filter(w => new Date(w.date) >= midDate).length;
        const progression = firstHalf === 0 ? 100 :
            Math.round(((secondHalf - firstHalf) / firstHalf) * 100);

        document.getElementById('progression').textContent =
            progression > 0 ? `+${progression}%` : `${progression}%`;

        // Update charts
        this.updateFrequencyChart(filtered, aggregation);

        // Show/hide type-specific sections
        const volumeSection = document.getElementById('volumeSection');
        const performanceSection = document.getElementById('performanceSection');

        if (type !== 'all') {
            volumeSection.style.display = 'block';
            performanceSection.style.display = 'block';
            this.updateVolumeChart(filtered, type, aggregation);
            this.updatePerformanceChart(filtered, type);
        } else {
            volumeSection.style.display = 'none';
            performanceSection.style.display = 'none';
        }
    }

    updateFrequencyChart(workouts, aggregation) {
        const canvas = document.getElementById('frequencyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.frequency) {
            this.charts.frequency.destroy();
        }

        const grouped = this.groupWorkoutsByPeriod(workouts, aggregation);

        this.charts.frequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: grouped.labels,
                datasets: [{
                    label: 'Entraînements',
                    data: grouped.data,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: '#6366f1',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#64748b' },
                        grid: { color: '#334155' }
                    },
                    x: {
                        ticks: { color: '#64748b', maxRotation: 45, minRotation: 45 },
                        grid: { color: '#334155' }
                    }
                }
            }
        });
    }

    updateVolumeChart(workouts, type, aggregation) {
        const canvas = document.getElementById('volumeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.volume) {
            this.charts.volume.destroy();
        }

        let data, label;

        if (type === 'musculation') {
            const grouped = this.groupDataByPeriod(workouts, aggregation, 'totalVolume');
            data = grouped.data;
            label = 'Volume (kg)';
        } else if (type === 'running') {
            const grouped = this.groupDataByPeriod(workouts, aggregation, 'distance');
            data = grouped.data;
            label = 'Distance (km)';
        } else {
            const grouped = this.groupWorkoutsByPeriod(workouts, aggregation);
            data = grouped.data;
            label = 'Séances';
        }

        const grouped = this.groupDataByPeriod(workouts, aggregation,
            type === 'musculation' ? 'totalVolume' : type === 'running' ? 'distance' : null);

        this.charts.volume = new Chart(ctx, {
            type: 'line',
            data: {
                labels: grouped.labels,
                datasets: [{
                    label: label,
                    data: grouped.data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, labels: { color: '#cbd5e1' } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#64748b' },
                        grid: { color: '#334155' }
                    },
                    x: {
                        ticks: { color: '#64748b', maxRotation: 45, minRotation: 45 },
                        grid: { color: '#334155' }
                    }
                }
            }
        });
    }

    updatePerformanceChart(workouts, type) {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        // This is a placeholder - real implementation would track specific metrics
        const labels = workouts.map(w => new Date(w.date).toLocaleDateString('fr-FR'));
        const data = workouts.map((w, i) => Math.random() * 100); // Placeholder data

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance',
                    data: data,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, labels: { color: '#cbd5e1' } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#64748b' },
                        grid: { color: '#334155' }
                    },
                    x: {
                        ticks: { color: '#64748b', maxRotation: 45, minRotation: 45 },
                        grid: { color: '#334155' }
                    }
                }
            }
        });
    }

    groupWorkoutsByPeriod(workouts, period) {
        const grouped = {};

        workouts.forEach(w => {
            const date = new Date(w.date);
            let key;

            if (period === 'day') {
                key = date.toLocaleDateString('fr-FR');
            } else if (period === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toLocaleDateString('fr-FR');
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            grouped[key] = (grouped[key] || 0) + 1;
        });

        const labels = Object.keys(grouped).sort((a, b) => {
            if (period === 'month') {
                return a.localeCompare(b);
            }
            return new Date(a.split('/').reverse().join('-')) -
                   new Date(b.split('/').reverse().join('-'));
        });

        return {
            labels: labels,
            data: labels.map(label => grouped[label])
        };
    }

    groupDataByPeriod(workouts, period, field) {
        const grouped = {};

        workouts.forEach(w => {
            const date = new Date(w.date);
            let key;

            if (period === 'day') {
                key = date.toLocaleDateString('fr-FR');
            } else if (period === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toLocaleDateString('fr-FR');
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
            grouped[key].sum += (field && w[field]) ? parseFloat(w[field]) : 1;
            grouped[key].count += 1;
        });

        const labels = Object.keys(grouped).sort((a, b) => {
            if (period === 'month') {
                return a.localeCompare(b);
            }
            return new Date(a.split('/').reverse().join('-')) -
                   new Date(b.split('/').reverse().join('-'));
        });

        return {
            labels: labels,
            data: labels.map(label => grouped[label].sum)
        };
    }

    async loadProfile() {
        const profile = await this.db.getProfile();

        if (profile.name) {
            document.getElementById('userName').textContent = profile.name;
        }

        // Display profile data if available
        if (profile.userInfo) {
            document.getElementById('userInfoDisplay').textContent =
                `${profile.userInfo.name || ''}, ${profile.userInfo.age || ''} ans`;
        }

        if (profile.anthropo) {
            document.getElementById('anthropoDisplay').textContent =
                `${profile.anthropo.weight || ''} kg, ${profile.anthropo.height || ''} cm`;
        }
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

    openPlanModal(dateStr) {
        document.getElementById('planDate').value = dateStr;
        document.getElementById('planSessionModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closePlanModal() {
        document.getElementById('planSessionModal').classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('planSessionForm').reset();
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
            notes,
            status: 'completed'
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
                case 'program':
                    this.loadProgram();
                    break;
                case 'stats':
                    this.loadStats();
                    break;
            }

            this.showToast('Entraînement ajouté avec succès!');
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            this.showToast('Erreur lors de l\'ajout', 'error');
        }
    }

    async handlePlanFormSubmit() {
        const date = document.getElementById('planDate').value;
        const type = document.getElementById('planType').value;
        const note = document.getElementById('planNote').value;

        const plannedSession = {
            type,
            date,
            status: 'planned',
            note,
            plannedAt: new Date().toISOString()
        };

        try {
            await this.db.addWorkout(plannedSession);
            this.closePlanModal();
            this.loadProgram();
            this.showToast('Séance planifiée avec succès!');
        } catch (error) {
            console.error('Erreur lors de la planification:', error);
            this.showToast('Erreur lors de la planification', 'error');
        }
    }

    showToast(message, type = 'success') {
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
