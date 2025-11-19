// TrainSmart - Application Constants
// Centralized constants for thresholds, validation limits, and configuration values

/**
 * ACWR (Acute:Chronic Workload Ratio) Thresholds
 * Based on Gabbett et al. (2016) injury risk research
 */
export const ACWR_THRESHOLDS = {
    // Low training load - risk of deconditioning
    LOW: 0.8,
    // Safe training zone (optimal: 0.8-1.3)
    SAFE_MIN: 0.8,
    SAFE_MAX: 1.3,
    // Moderate risk zone
    MODERATE: 1.3,
    MODERATE_MAX: 1.5,
    // High injury risk (>1.5)
    HIGH: 1.5
};

/**
 * Training Monotony and Strain Thresholds
 * Based on Foster et al. (1998) overtraining research
 */
export const MONOTONY_THRESHOLDS = {
    // High monotony indicates lack of training variety
    HIGH: 2.0,
    // Very high strain indicates high overtraining risk
    VERY_HIGH_STRAIN: 10000
};

/**
 * Form (Forme du jour) Thresholds
 * Used to detect declining fitness and fatigue accumulation
 */
export const FORM_THRESHOLDS = {
    // Average form below this indicates general fatigue
    LOW: 4,
    // Decline of this many points triggers warning
    DECLINE_WARNING: 2
};

/**
 * RPE (Rate of Perceived Exertion) Validation
 * Foster scale: 1-10
 */
export const RPE_LIMITS = {
    MIN: 1,
    MAX: 10,
    DEFAULT: 5
};

/**
 * Form (Forme du jour) Validation
 * Subjective wellbeing scale: 1-10
 */
export const FORM_LIMITS = {
    MIN: 1,
    MAX: 10,
    DEFAULT: 5
};

/**
 * Heart Rate Validation Limits
 * Physiologically reasonable ranges for human heart rate
 */
export const HEART_RATE_LIMITS = {
    MIN: 40,  // Resting HR for highly trained athletes
    MAX: 220, // Theoretical maximum (varies by age)
    MIN_MAX: 120, // Minimum reasonable max HR
    MAX_MAX: 220  // Maximum reasonable max HR
};

/**
 * VO2max Validation Limits
 * In ml/kg/min - typical human ranges
 */
export const VO2MAX_LIMITS = {
    MIN: 20,  // Sedentary individuals
    MAX: 90   // Elite endurance athletes
};

/**
 * VMA (Vitesse Maximale Aérobie) Validation Limits
 * In km/h - typical running speeds
 */
export const VMA_LIMITS = {
    MIN: 8,   // Beginner runners
    MAX: 25   // Elite runners
};

/**
 * Anthropometric Data Validation Limits
 */
export const ANTHROPO_LIMITS = {
    WEIGHT: {
        MIN: 30,  // kg
        MAX: 300
    },
    HEIGHT: {
        MIN: 100, // cm
        MAX: 250
    },
    BODY_FAT: {
        MIN: 3,   // % - essential fat
        MAX: 50
    },
    AGE: {
        MIN: 10,
        MAX: 120
    }
};

/**
 * Running Data Validation Limits
 */
export const RUNNING_LIMITS = {
    DISTANCE: {
        MIN: 0,
        MAX: 500  // km - ultra-marathon limit
    },
    ELEVATION: {
        MIN: 0,
        MAX: 10000 // meters
    },
    // Trail equivalent: 100m elevation gain = 1km distance
    TRAIL_EQUIVALENT_RATIO: 100
};

/**
 * Musculation Data Validation Limits
 */
export const MUSCULATION_LIMITS = {
    REPS: {
        MIN: 1,
        MAX: 100
    },
    WEIGHT: {
        MIN: 0,    // Bodyweight exercises
        MAX: 1000  // kg - extreme powerlifting
    },
    SETS: {
        MIN: 1,
        MAX: 20
    }
};

/**
 * ACWR Calculation Windows
 * Number of days for acute and chronic load calculation
 */
export const ACWR_WINDOWS = {
    ACUTE_DAYS: 7,    // Last week
    CHRONIC_DAYS: 28  // Last 4 weeks
};

/**
 * Data Display Limits
 * UI-related constants for data presentation
 */
export const DISPLAY_LIMITS = {
    RECENT_WORKOUTS: 5,       // Number of recent workouts to show
    CHART_ACWR_WEEKS: 12,     // Number of weeks in ACWR trend chart
    CHART_RPE_SESSIONS: 10,   // Number of sessions in RPE trend chart
    MIN_WORKOUTS_FOR_STATS: 3 // Minimum workouts needed for meaningful stats
};

/**
 * Cache Configuration
 * Time-to-live for cached data
 */
export const CACHE_CONFIG = {
    TTL_WORKOUTS: 60000,      // 1 minute
    TTL_PROFILE: 300000,      // 5 minutes
    TTL_GOALS: 60000          // 1 minute
};

/**
 * UI Messages
 * Standardized user-facing messages
 */
export const MESSAGES = {
    ERRORS: {
        GENERIC: 'Une erreur est survenue',
        NETWORK: 'Erreur de connexion au serveur',
        VALIDATION: 'Données invalides',
        NOT_FOUND: 'Élément introuvable',
        UNAUTHORIZED: 'Action non autorisée'
    },
    SUCCESS: {
        WORKOUT_ADDED: 'Entraînement ajouté avec succès!',
        WORKOUT_UPDATED: 'Séance mise à jour avec succès!',
        WORKOUT_DELETED: 'Séance supprimée avec succès!',
        PROFILE_UPDATED: 'Profil mis à jour avec succès!',
        GOAL_ADDED: 'Objectif ajouté avec succès!',
        GOAL_COMPLETED: 'Objectif marqué comme terminé!',
        GOAL_DELETED: 'Objectif supprimé avec succès!'
    },
    WARNINGS: {
        ACWR_LOW: 'Charge très basse - Risque de déconditionnement',
        ACWR_MODERATE: 'Charge élevée - Attention au surmenage',
        ACWR_HIGH: 'ALERTE: Risque élevé de blessure - Réduire la charge',
        FORM_DECLINING: 'Baisse de forme détectée',
        FORM_LOW: 'Forme générale basse',
        MONOTONY_HIGH: 'Monotonie élevée - Varier l\'intensité des entraînements',
        STRAIN_HIGH: 'Strain très élevé - Risque de surmenage'
    },
    CONFIRMATIONS: {
        DELETE_WORKOUT: 'Êtes-vous sûr de vouloir supprimer cette séance ?',
        DELETE_GOAL: 'Êtes-vous sûr de vouloir supprimer cet objectif ?',
        LOGOUT: 'Êtes-vous sûr de vouloir vous déconnecter ?'
    }
};

/**
 * ACWR Zone Colors
 * Visual indicators for training load zones
 */
export const ACWR_COLORS = {
    LOW: '#f59e0b',      // Orange
    SAFE: '#10b981',     // Green
    MODERATE: '#f59e0b', // Orange
    HIGH: '#ef4444'      // Red
};

/**
 * Training Zone Colors
 * Heart rate and pace zone colors
 */
export const ZONE_COLORS = {
    ZONE_1: '#10b981', // Recovery - Green
    ZONE_2: '#3b82f6', // Endurance - Blue
    ZONE_3: '#f59e0b', // Tempo - Orange
    ZONE_4: '#ef4444', // Threshold - Red
    ZONE_5: '#dc2626'  // VO2max - Dark Red
};

/**
 * Chart.js Default Configuration
 * Common settings for all charts
 */
export const CHART_DEFAULTS = {
    FONT_FAMILY: "'Inter', 'SF Pro', -apple-system, system-ui, sans-serif",
    FONT_SIZE: 12,
    GRID_COLOR: '#1f2937',
    TEXT_COLOR: '#9ca3af',
    ANIMATION_DURATION: 750
};

/**
 * API Retry Configuration
 * Settings for failed request retries
 */
export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,    // ms
    BACKOFF_FACTOR: 2       // Exponential backoff
};

// Make constants available globally for non-module usage
if (typeof window !== 'undefined') {
    window.CONSTANTS = {
        ACWR_THRESHOLDS,
        MONOTONY_THRESHOLDS,
        FORM_THRESHOLDS,
        RPE_LIMITS,
        FORM_LIMITS,
        HEART_RATE_LIMITS,
        VO2MAX_LIMITS,
        VMA_LIMITS,
        ANTHROPO_LIMITS,
        RUNNING_LIMITS,
        MUSCULATION_LIMITS,
        ACWR_WINDOWS,
        DISPLAY_LIMITS,
        CACHE_CONFIG,
        MESSAGES,
        ACWR_COLORS,
        ZONE_COLORS,
        CHART_DEFAULTS,
        RETRY_CONFIG
    };
}
