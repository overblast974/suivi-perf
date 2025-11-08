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

    async getWorkout(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readonly');
            const store = transaction.objectStore('workouts');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateWorkout(id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readwrite');
            const store = transaction.objectStore('workouts');
            const request = store.put({ ...data, id });

            request.onsuccess = () => resolve();
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
        this.currentStatusFilter = 'all';
        this.currentSort = 'recent';
        this.editingWorkoutId = null;
        this.currentExercises = [];
        this.currentSets = [];
        this.charts = {
            frequency: null,
            volume: null,
            performance: null,
            acwrTrend: null,
            rpeTrend: null
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
            this.setupExerciseForm();
            this.setupSliders();
            this.populateExercisesSuggestions();
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

        // Type filter tabs
        document.querySelectorAll('.tab[data-type]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.filterWorkouts(type);
            });
        });

        // Status filter tabs
        document.querySelectorAll('.tab[data-status]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                document.querySelectorAll('.status-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.status === status);
                });
                this.filterWorkouts(this.currentFilter, status);
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
        if (editMetricsBtn) editMetricsBtn.addEventListener('click', () => this.openMetricsModal());
        if (editGoalsBtn) editGoalsBtn.addEventListener('click', () => this.showToast('Fonctionnalité en développement'));

        // Metrics modal controls
        const closeMetricsModalBtn = document.getElementById('closeMetricsModalBtn');
        const cancelMetricsBtn = document.getElementById('cancelMetricsBtn');
        if (closeMetricsModalBtn) closeMetricsModalBtn.addEventListener('click', () => this.closeMetricsModal());
        if (cancelMetricsBtn) cancelMetricsBtn.addEventListener('click', () => this.closeMetricsModal());

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

        const metricsForm = document.getElementById('metricsForm');
        if (metricsForm) {
            metricsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleMetricsFormSubmit();
            });
        }
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('workoutDate').value = today;
    }

    populateExercisesSuggestions() {
        const datalist = document.getElementById('exercisesSuggestions');
        if (!datalist || typeof ALL_EXERCISES === 'undefined') return;

        datalist.innerHTML = ALL_EXERCISES.map(ex =>
            `<option value="${ex}">`
        ).join('');
    }

    setupExerciseForm() {
        const addExerciseBtn = document.getElementById('addExerciseBtn');
        const addExerciseForm = document.getElementById('addExerciseForm');
        const addSetBtn = document.getElementById('addSetBtn');
        const saveExerciseBtn = document.getElementById('saveExerciseBtn');
        const cancelExerciseBtn = document.getElementById('cancelExerciseBtn');

        if (!addExerciseBtn) return;

        addExerciseBtn.addEventListener('click', () => {
            addExerciseForm.style.display = 'block';
            addExerciseBtn.style.display = 'none';
            this.currentSets = [];
            this.addSet();
        });

        cancelExerciseBtn.addEventListener('click', () => {
            this.cancelExercise();
        });

        addSetBtn.addEventListener('click', () => {
            this.addSet();
        });

        saveExerciseBtn.addEventListener('click', () => {
            this.saveExercise();
        });
    }

    addSet() {
        const setsList = document.getElementById('setsList');
        const setIndex = this.currentSets.length;

        const setItem = document.createElement('div');
        setItem.className = 'set-item';
        setItem.innerHTML = `
            <label>Série ${setIndex + 1}</label>
            <input type="number" class="input set-reps" placeholder="Reps" min="1" step="1" data-index="${setIndex}">
            <span>×</span>
            <input type="number" class="input set-weight" placeholder="Poids (kg)" min="0" step="0.5" data-index="${setIndex}">
            <button type="button" class="btn-remove-set" data-index="${setIndex}">×</button>
        `;

        setsList.appendChild(setItem);

        this.currentSets.push({ reps: 0, weight: 0 });

        // Add event listeners for the remove button
        setItem.querySelector('.btn-remove-set').addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            this.removeSet(index);
        });

        // Add input listeners
        setItem.querySelector('.set-reps').addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            this.currentSets[index].reps = parseInt(e.target.value) || 0;
        });

        setItem.querySelector('.set-weight').addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            this.currentSets[index].weight = parseFloat(e.target.value) || 0;
        });
    }

    removeSet(index) {
        this.currentSets.splice(index, 1);
        this.renderSets();
    }

    renderSets() {
        const setsList = document.getElementById('setsList');
        setsList.innerHTML = '';

        this.currentSets.forEach((set, index) => {
            const setItem = document.createElement('div');
            setItem.className = 'set-item';
            setItem.innerHTML = `
                <label>Série ${index + 1}</label>
                <input type="number" class="input set-reps" placeholder="Reps" min="1" step="1" value="${set.reps || ''}" data-index="${index}">
                <span>×</span>
                <input type="number" class="input set-weight" placeholder="Poids (kg)" min="0" step="0.5" value="${set.weight || ''}" data-index="${index}">
                <button type="button" class="btn-remove-set" data-index="${index}">×</button>
            `;

            setsList.appendChild(setItem);

            setItem.querySelector('.btn-remove-set').addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.removeSet(idx);
            });

            setItem.querySelector('.set-reps').addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.currentSets[idx].reps = parseInt(e.target.value) || 0;
            });

            setItem.querySelector('.set-weight').addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.currentSets[idx].weight = parseFloat(e.target.value) || 0;
            });
        });
    }

    saveExercise() {
        const exerciseName = document.getElementById('exerciseName').value.trim();

        if (!exerciseName) {
            this.showToast('Veuillez entrer un nom d\'exercice', 'error');
            return;
        }

        if (this.currentSets.length === 0 || !this.currentSets.some(s => s.reps > 0 && s.weight > 0)) {
            this.showToast('Veuillez ajouter au moins une série valide', 'error');
            return;
        }

        // Calculate volume for this exercise
        const volume = this.currentSets.reduce((sum, set) => {
            return sum + (set.reps * set.weight);
        }, 0);

        const exercise = {
            name: exerciseName,
            sets: [...this.currentSets],
            volume: volume
        };

        this.currentExercises.push(exercise);
        this.renderExercises();
        this.updateTotalVolume();
        this.cancelExercise();
    }

    cancelExercise() {
        const addExerciseForm = document.getElementById('addExerciseForm');
        const addExerciseBtn = document.getElementById('addExerciseBtn');

        addExerciseForm.style.display = 'none';
        addExerciseBtn.style.display = 'block';

        document.getElementById('exerciseName').value = '';
        document.getElementById('setsList').innerHTML = '';
        this.currentSets = [];
    }

    renderExercises() {
        const exercisesList = document.getElementById('exercisesList');

        exercisesList.innerHTML = this.currentExercises.map((exercise, index) => {
            const setsText = exercise.sets.map((set, i) =>
                `S${i + 1}: ${set.reps} × ${set.weight}kg`
            ).join(' • ');

            return `
                <div class="exercise-item">
                    <div class="exercise-header">
                        <span class="exercise-name">${exercise.name}</span>
                        <div>
                            <span class="exercise-volume">${exercise.volume.toFixed(1)} kg</span>
                            <button type="button" class="btn-remove-exercise" data-index="${index}">Supprimer</button>
                        </div>
                    </div>
                    <div class="exercise-sets">${setsText}</div>
                </div>
            `;
        }).join('');

        // Add event listeners for remove buttons
        exercisesList.querySelectorAll('.btn-remove-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.currentExercises.splice(index, 1);
                this.renderExercises();
                this.updateTotalVolume();
            });
        });
    }

    updateTotalVolume() {
        const totalVolume = this.currentExercises.reduce((sum, ex) => sum + ex.volume, 0);
        document.getElementById('totalVolumeDisplay').value = totalVolume.toFixed(1) + ' kg';
    }

    setupSliders() {
        // Musculation RPE
        const rpeMuscu = document.getElementById('rpeMuscu');
        const rpeValue = document.getElementById('rpeValue');
        if (rpeMuscu && rpeValue) {
            rpeMuscu.addEventListener('input', (e) => {
                rpeValue.textContent = e.target.value;
            });
        }

        // Musculation Forme
        const formeMuscu = document.getElementById('formeMuscu');
        const formeValueMuscu = document.getElementById('formeValueMuscu');
        if (formeMuscu && formeValueMuscu) {
            formeMuscu.addEventListener('input', (e) => {
                formeValueMuscu.textContent = e.target.value;
            });
        }

        // Running RPE
        const rpeRun = document.getElementById('rpeRun');
        const rpeValueRun = document.getElementById('rpeValueRun');
        if (rpeRun && rpeValueRun) {
            rpeRun.addEventListener('input', (e) => {
                rpeValueRun.textContent = e.target.value;
            });
        }

        // Running Forme
        const formeRun = document.getElementById('formeRun');
        const formeValueRun = document.getElementById('formeValueRun');
        if (formeRun && formeValueRun) {
            formeRun.addEventListener('input', (e) => {
                formeValueRun.textContent = e.target.value;
            });
        }
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

        const isPlanned = workout.status === 'planned';
        const statusBadge = isPlanned
            ? '<span class="status-badge planned">À faire</span>'
            : '<span class="status-badge completed">Terminé</span>';

        let details = '';
        if (isPlanned) {
            // Planned session - show note if available
            if (workout.note) {
                details = `<span class="workout-detail">📝 ${workout.note}</span>`;
            } else {
                details = '<span class="workout-detail">Cliquer pour valider</span>';
            }
        } else {
            // Completed session - show details
            details = `<span class="workout-detail">⏱️ ${workout.duration} min</span>`;
            if (workout.type === 'musculation' && workout.totalVolume) {
                details += `<span class="workout-detail">💪 ${workout.totalVolume.toFixed(0)} kg</span>`;
            }
            if (workout.type === 'running' && workout.distance) {
                details += `<span class="workout-detail">📍 ${workout.distance} km</span>`;
                if (workout.elevation && workout.distanceEquivalent) {
                    details += `<span class="workout-detail">⛰️ ${workout.distanceEquivalent.toFixed(1)} km éq.</span>`;
                }
                if (workout.pace) {
                    details += `<span class="workout-detail">⚡ ${workout.pace} min/km</span>`;
                }
            }
            if (workout.rpe) {
                details += `<span class="workout-detail">RPE ${workout.rpe}/10</span>`;
            }
            if (workout.forme) {
                details += `<span class="workout-detail">Forme ${workout.forme}/10</span>`;
            }
        }

        const clickHandler = isPlanned ? `data-workout-id="${workout.id}"` : '';
        const cursorStyle = isPlanned ? 'cursor: pointer;' : '';

        return `
            <div class="workout-card ${isPlanned ? 'planned' : ''}" ${clickHandler} style="${cursorStyle}">
                <div class="workout-header">
                    <div class="workout-type">
                        <span class="workout-type-badge ${workout.type}"></span>
                        <span class="workout-title">${typeLabels[workout.type]}</span>
                        ${statusBadge}
                    </div>
                    <span class="workout-date">${formattedDate}</span>
                </div>
                <div class="workout-details">
                    ${details}
                </div>
                ${!isPlanned && workout.notes ? `<p style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">${workout.notes}</p>` : ''}
            </div>
        `;
    }

    async loadWorkouts() {
        const workouts = await this.db.getAllWorkouts();
        this.displayWorkouts(workouts, 'all', 'all');
    }

    async filterWorkouts(type, status = null) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        this.currentFilter = type;
        if (status !== null) {
            this.currentStatusFilter = status;
        }

        let workouts = await this.db.getAllWorkouts();

        // Filter by type
        if (type !== 'all') {
            workouts = workouts.filter(w => w.type === type);
        }

        // Filter by status
        if (this.currentStatusFilter === 'planned') {
            workouts = workouts.filter(w => w.status === 'planned');
        } else if (this.currentStatusFilter === 'completed') {
            workouts = workouts.filter(w => !w.status || w.status === 'completed');
        }
        // 'all' shows everything

        this.displayWorkouts(workouts, type, this.currentStatusFilter);
    }

    displayWorkouts(workouts, type, status) {
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

        // Add click handlers for planned workout cards
        container.querySelectorAll('.workout-card.planned').forEach(card => {
            card.addEventListener('click', async (e) => {
                const workoutId = parseInt(e.currentTarget.dataset.workoutId);
                if (workoutId) {
                    await this.openValidationModal(workoutId);
                }
            });
        });
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

        // Calculate and display ACWR
        this.displayACWR(workouts);

        // Detect and display overtraining warnings
        this.displayOvertrainingAlerts(workouts);

        // Display monotony and strain
        this.displayMonotonyStrain(workouts);

        // Display advanced charts
        this.updateACWRTrendChart(workouts);
        this.updateRPETrendChart(workouts);

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

    displayACWR(workouts) {
        if (typeof WorkoutCalculations === 'undefined') return;

        const acwr = WorkoutCalculations.calculateACWR(workouts);

        document.getElementById('acwrValue').textContent = acwr.ratio;
        document.getElementById('acuteLoad').textContent = acwr.acuteLoad;
        document.getElementById('chronicLoad').textContent = acwr.chronicLoad;

        const statusEl = document.getElementById('acwrStatus');
        statusEl.textContent = acwr.zone === 'safe' ? 'Zone sûre' :
                               acwr.zone === 'moderate' ? 'Attention' :
                               acwr.zone === 'high' ? 'Risque élevé' : 'Charge basse';
        statusEl.className = `acwr-status ${acwr.zone}`;

        const warningEl = document.getElementById('acwrWarning');
        if (acwr.warning) {
            warningEl.textContent = acwr.warning;
            warningEl.className = 'alert-box ' + (acwr.zone === 'high' ? 'danger' : 'warning');
            warningEl.style.display = 'block';
        } else {
            warningEl.style.display = 'none';
        }
    }

    displayOvertrainingAlerts(workouts) {
        if (typeof WorkoutCalculations === 'undefined') return;

        const overtraining = WorkoutCalculations.detectOvertraining(workouts);

        const sectionEl = document.getElementById('overtrainingSection');
        const alertEl = document.getElementById('overtrainingAlert');
        const recommendationsEl = document.getElementById('recommendations');

        if (overtraining.risk === 'insufficient_data') {
            sectionEl.style.display = 'none';
            return;
        }

        if (overtraining.risk === 'low') {
            sectionEl.style.display = 'none';
            return;
        }

        sectionEl.style.display = 'block';

        alertEl.textContent = overtraining.message;
        alertEl.className = 'alert-box ' + (overtraining.risk === 'high' ? 'danger' : 'warning');

        if (overtraining.recommendations && overtraining.recommendations.length > 0) {
            recommendationsEl.innerHTML = `
                <h4>Recommandations</h4>
                <ul>
                    ${overtraining.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            `;
        } else {
            recommendationsEl.innerHTML = '';
        }
    }

    displayMonotonyStrain(workouts) {
        if (typeof WorkoutCalculations === 'undefined') return;

        const ms = WorkoutCalculations.calculateMonotonyAndStrain(workouts);

        const sectionEl = document.getElementById('monotonySection');
        const warningEl = document.getElementById('monotonyWarning');

        if (ms.monotony === null) {
            sectionEl.style.display = 'none';
            return;
        }

        sectionEl.style.display = 'block';

        document.getElementById('monotonyValue').textContent = ms.monotony;
        document.getElementById('strainValue').textContent = ms.strain;

        if (ms.warning) {
            warningEl.textContent = ms.warning;
            warningEl.className = 'alert-box warning';
            warningEl.style.display = 'block';
        } else {
            warningEl.style.display = 'none';
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

    updateACWRTrendChart(workouts) {
        const canvas = document.getElementById('acwrTrendChart');
        if (!canvas || typeof WorkoutCalculations === 'undefined') return;

        const ctx = canvas.getContext('2d');

        if (this.charts.acwrTrend) {
            this.charts.acwrTrend.destroy();
        }

        // Calculate ACWR for each week over the last 12 weeks
        const now = new Date();
        const weeks = [];
        const acwrData = [];
        const safeZoneMin = [];
        const safeZoneMax = [];

        for (let i = 11; i >= 0; i--) {
            const weekDate = new Date(now);
            weekDate.setDate(weekDate.getDate() - (i * 7));

            const acwr = WorkoutCalculations.calculateACWR(workouts, weekDate);

            weeks.push(`S-${i}`);
            acwrData.push(parseFloat(acwr.ratio));
            safeZoneMin.push(0.8);
            safeZoneMax.push(1.3);
        }

        this.charts.acwrTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeks,
                datasets: [
                    {
                        label: 'ACWR',
                        data: acwrData,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Zone sûre min (0.8)',
                        data: safeZoneMin,
                        borderColor: '#10b981',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Zone sûre max (1.3)',
                        data: safeZoneMax,
                        borderColor: '#10b981',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: '-1',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#cbd5e1', font: { size: 11 } }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 2.0,
                        ticks: {
                            color: '#64748b',
                            stepSize: 0.2
                        },
                        grid: { color: '#334155' }
                    },
                    x: {
                        ticks: { color: '#64748b' },
                        grid: { color: '#334155' }
                    }
                }
            }
        });
    }

    updateRPETrendChart(workouts) {
        const canvas = document.getElementById('rpeTrendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.rpeTrend) {
            this.charts.rpeTrend.destroy();
        }

        // Get last 30 workouts with RPE and Forme data
        const workoutsWithData = workouts
            .filter(w => w.rpe && w.forme)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-30);

        if (workoutsWithData.length === 0) {
            return;
        }

        const labels = workoutsWithData.map(w => {
            const date = new Date(w.date);
            return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        });

        const rpeData = workoutsWithData.map(w => w.rpe);
        const formeData = workoutsWithData.map(w => w.forme);

        this.charts.rpeTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'RPE (Effort perçu)',
                        data: rpeData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3,
                        fill: false,
                        borderWidth: 2,
                        pointRadius: 3
                    },
                    {
                        label: 'Forme du jour',
                        data: formeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: false,
                        borderWidth: 2,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 10,
                        ticks: {
                            color: '#64748b',
                            stepSize: 1
                        },
                        grid: { color: '#334155' }
                    },
                    x: {
                        ticks: {
                            color: '#64748b',
                            maxRotation: 45,
                            minRotation: 45,
                            maxTicksLimit: 15
                        },
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

        // Display metrics
        if (profile.metrics) {
            const metricsText = [];
            if (profile.metrics.vo2max) metricsText.push(`VO2max: ${profile.metrics.vo2max} ml/kg/min`);
            if (profile.metrics.vma) metricsText.push(`VMA: ${profile.metrics.vma} km/h`);
            if (profile.metrics.fcMax) metricsText.push(`FCmax: ${profile.metrics.fcMax} bpm`);

            if (metricsText.length > 0) {
                document.getElementById('metricsDisplay').textContent = metricsText.join(' • ');
            }
        }
    }

    openModal() {
        this.editingWorkoutId = null;
        document.getElementById('addWorkoutModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    async openValidationModal(workoutId) {
        const workout = await this.db.getWorkout(workoutId);
        if (!workout) return;

        this.editingWorkoutId = workoutId;

        // Pre-fill the form
        document.getElementById('workoutType').value = workout.type;
        document.getElementById('workoutDate').value = workout.date;
        this.toggleConditionalFields(workout.type);

        // Open modal
        document.getElementById('addWorkoutModal').classList.add('active');
        document.body.style.overflow = 'hidden';

        // Show a message that this is a validation
        this.showToast('Validation de séance planifiée', 'success');
    }

    closeModal() {
        document.getElementById('addWorkoutModal').classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('workoutForm').reset();
        this.toggleConditionalFields('');
        this.setTodayDate();
        this.editingWorkoutId = null;

        // Reset exercises
        this.currentExercises = [];
        this.currentSets = [];
        document.getElementById('exercisesList').innerHTML = '';
        document.getElementById('totalVolumeDisplay').value = '';
        this.cancelExercise();

        // Reset sliders
        const rpeMuscu = document.getElementById('rpeMuscu');
        const formeMuscu = document.getElementById('formeMuscu');
        const rpeRun = document.getElementById('rpeRun');
        const formeRun = document.getElementById('formeRun');

        if (rpeMuscu) { rpeMuscu.value = 5; document.getElementById('rpeValue').textContent = '5'; }
        if (formeMuscu) { formeMuscu.value = 5; document.getElementById('formeValueMuscu').textContent = '5'; }
        if (rpeRun) { rpeRun.value = 5; document.getElementById('rpeValueRun').textContent = '5'; }
        if (formeRun) { formeRun.value = 5; document.getElementById('formeValueRun').textContent = '5'; }
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

    async openMetricsModal() {
        const profile = await this.db.getProfile();

        // Pre-fill existing metrics
        if (profile.metrics) {
            if (profile.metrics.vo2max) document.getElementById('vo2maxInput').value = profile.metrics.vo2max;
            if (profile.metrics.vma) document.getElementById('vmaInput').value = profile.metrics.vma;
            if (profile.metrics.fcMax) document.getElementById('fcMaxInput').value = profile.metrics.fcMax;
            if (profile.metrics.fcRepos) document.getElementById('fcReposInput').value = profile.metrics.fcRepos;
        }

        document.getElementById('metricsModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMetricsModal() {
        document.getElementById('metricsModal').classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('metricsForm').reset();
    }

    async handleMetricsFormSubmit() {
        const vo2max = parseFloat(document.getElementById('vo2maxInput').value) || null;
        const vma = parseFloat(document.getElementById('vmaInput').value) || null;
        const fcMax = parseInt(document.getElementById('fcMaxInput').value) || null;
        const fcRepos = parseInt(document.getElementById('fcReposInput').value) || null;

        // Auto-calculate VMA from VO2max if VMA not provided
        let finalVMA = vma;
        if (!vma && vo2max && typeof WorkoutCalculations !== 'undefined') {
            finalVMA = parseFloat(WorkoutCalculations.estimateVMA(vo2max));
        }

        const profile = await this.db.getProfile();

        const updatedProfile = {
            ...profile,
            metrics: {
                vo2max,
                vma: finalVMA,
                fcMax,
                fcRepos,
                updatedAt: new Date().toISOString()
            }
        };

        try {
            await this.db.saveProfile(updatedProfile);
            this.closeMetricsModal();
            this.loadProfile();
            this.showToast('Marqueurs physiologiques enregistrés!');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
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
            status: 'completed',
            completedAt: new Date().toISOString()
        };

        // Add type-specific fields
        if (type === 'musculation') {
            if (this.currentExercises.length === 0) {
                this.showToast('Veuillez ajouter au moins un exercice', 'error');
                return;
            }

            workout.exercisesDetailed = this.currentExercises;
            workout.totalVolume = this.currentExercises.reduce((sum, ex) => sum + ex.volume, 0);

            const rpe = document.getElementById('rpeMuscu').value;
            const forme = document.getElementById('formeMuscu').value;
            workout.rpe = parseInt(rpe);
            workout.forme = parseInt(forme);
        } else if (type === 'running') {
            workout.distance = parseFloat(document.getElementById('distance').value) || 0;
            workout.runTime = document.getElementById('runTime').value;
            workout.elevation = parseInt(document.getElementById('elevation').value) || 0;

            // Calculate pace if not provided
            if (!document.getElementById('pace').value && workout.runTime && workout.distance) {
                workout.pace = WorkoutCalculations.calculatePace(workout.runTime, workout.distance);
            } else {
                workout.pace = document.getElementById('pace').value;
            }

            // Calculate trail equivalent distance
            if (workout.elevation > 0) {
                workout.distanceEquivalent = WorkoutCalculations.calculateTrailEquivalent(
                    workout.distance,
                    workout.elevation
                );
            }

            const rpe = document.getElementById('rpeRun').value;
            const forme = document.getElementById('formeRun').value;
            workout.rpe = parseInt(rpe);
            workout.forme = parseInt(forme);
        }

        // Calculate TRIMP for all workouts
        if (typeof WorkoutCalculations !== 'undefined') {
            workout.trimp = WorkoutCalculations.calculateTRIMP(workout);
        }

        try {
            if (this.editingWorkoutId) {
                // Updating an existing planned workout
                await this.db.updateWorkout(this.editingWorkoutId, workout);
                this.showToast('Séance validée avec succès!');
            } else {
                // Adding a new workout
                await this.db.addWorkout(workout);
                this.showToast('Entraînement ajouté avec succès!');
            }

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
        } catch (error) {
            console.error('Erreur lors de l\'opération:', error);
            this.showToast('Erreur lors de l\'opération', 'error');
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
        const profile = await this.db.getProfile();
        const completedWorkouts = workouts.filter(w => !w.status || w.status === 'completed');

        // Calculate current metrics
        const acwr = typeof WorkoutCalculations !== 'undefined'
            ? WorkoutCalculations.calculateACWR(completedWorkouts)
            : null;

        const overtraining = typeof WorkoutCalculations !== 'undefined'
            ? WorkoutCalculations.detectOvertraining(completedWorkouts)
            : null;

        const monotonyStrain = typeof WorkoutCalculations !== 'undefined'
            ? WorkoutCalculations.calculateMonotonyStrain(completedWorkouts)
            : null;

        // Create comprehensive export
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            profile: profile,
            statistics: {
                totalWorkouts: workouts.length,
                completedWorkouts: completedWorkouts.length,
                plannedWorkouts: workouts.filter(w => w.status === 'planned').length,
                musculationWorkouts: completedWorkouts.filter(w => w.type === 'musculation').length,
                runningWorkouts: completedWorkouts.filter(w => w.type === 'running').length,
                totalVolume: completedWorkouts
                    .filter(w => w.type === 'musculation' && w.totalVolume)
                    .reduce((sum, w) => sum + w.totalVolume, 0),
                totalDistance: completedWorkouts
                    .filter(w => w.type === 'running' && w.distance)
                    .reduce((sum, w) => sum + w.distance, 0),
                totalDuration: completedWorkouts
                    .filter(w => w.duration)
                    .reduce((sum, w) => sum + w.duration, 0),
                avgRPE: completedWorkouts.filter(w => w.rpe).length > 0
                    ? (completedWorkouts.reduce((sum, w) => sum + (w.rpe || 0), 0) /
                       completedWorkouts.filter(w => w.rpe).length).toFixed(1)
                    : null,
                avgForme: completedWorkouts.filter(w => w.forme).length > 0
                    ? (completedWorkouts.reduce((sum, w) => sum + (w.forme || 0), 0) /
                       completedWorkouts.filter(w => w.forme).length).toFixed(1)
                    : null
            },
            currentMetrics: {
                acwr: acwr,
                overtrainingRisk: overtraining,
                monotonyStrain: monotonyStrain
            },
            workouts: workouts
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `suivi-perf-rapport-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        this.showToast('Rapport complet exporté avec succès!');
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
