// Scientific calculations for workout analysis

class WorkoutCalculations {
    /**
     * Calculate TRIMP (Training Impulse)
     * @param {Object} workout - Workout data
     * @returns {number} - TRIMP value
     */
    static calculateTRIMP(workout) {
        const duration = workout.duration || 0;
        const rpe = workout.rpe || 5;

        // Simple TRIMP = Duration × RPE
        // This is the session RPE method (Foster et al.)
        return duration * rpe;
    }

    /**
     * Calculate trail equivalent distance
     * Rule: 100m D+ = ~1km distance
     * @param {number} distance - Distance in km
     * @param {number} elevation - Elevation gain in meters
     * @returns {number} - Equivalent flat distance in km
     */
    static calculateTrailEquivalent(distance, elevation) {
        const distanceKm = parseFloat(distance) || 0;
        const elevationM = parseInt(elevation) || 0;

        // 100m D+ = 1km equivalent
        const elevationEquivalent = elevationM / 100;

        return distanceKm + elevationEquivalent;
    }

    /**
     * Calculate ACWR (Acute:Chronic Workload Ratio)
     * @param {Array} workouts - All workouts sorted by date
     * @param {Date} referenceDate - Date to calculate ACWR for
     * @returns {Object} - ACWR data with acute, chronic, ratio, and zone
     */
    static calculateACWR(workouts, referenceDate = new Date()) {
        const refDate = new Date(referenceDate);

        // Filter only completed workouts with valid dates
        const completedWorkouts = workouts.filter(w =>
            (!w.status || w.status === 'completed') && w.date
        );

        // Calculate date ranges
        const acuteStart = new Date(refDate);
        acuteStart.setDate(acuteStart.getDate() - 7);

        const chronicStart = new Date(refDate);
        chronicStart.setDate(chronicStart.getDate() - 28);

        // Get workouts in each window
        const acuteWorkouts = completedWorkouts.filter(w => {
            const wDate = new Date(w.date);
            return wDate >= acuteStart && wDate <= refDate;
        });

        const chronicWorkouts = completedWorkouts.filter(w => {
            const wDate = new Date(w.date);
            return wDate >= chronicStart && wDate <= refDate;
        });

        // Calculate total TRIMP for each window
        const acuteLoad = acuteWorkouts.reduce((sum, w) => {
            return sum + this.calculateTRIMP(w);
        }, 0);

        const chronicLoad = chronicWorkouts.reduce((sum, w) => {
            return sum + this.calculateTRIMP(w);
        }, 0);

        // Calculate ACWR
        // To avoid division by zero, require minimum chronic load
        let ratio = 0;
        if (chronicLoad > 0) {
            ratio = acuteLoad / chronicLoad;
        }

        // Determine zone
        let zone = 'safe';
        let zoneColor = '#10b981'; // green
        let warning = null;

        if (ratio < 0.8 && acuteLoad > 0) {
            zone = 'low';
            zoneColor = '#f59e0b'; // yellow
            warning = 'Charge très basse - Risque de déconditionnement';
        } else if (ratio >= 0.8 && ratio <= 1.3) {
            zone = 'safe';
            zoneColor = '#10b981'; // green
            warning = null;
        } else if (ratio > 1.3 && ratio <= 1.5) {
            zone = 'moderate';
            zoneColor = '#f59e0b'; // yellow/orange
            warning = 'Charge élevée - Attention au surmenage';
        } else if (ratio > 1.5) {
            zone = 'high';
            zoneColor = '#ef4444'; // red
            warning = 'ALERTE: Risque élevé de blessure - Réduire la charge';
        }

        return {
            acuteLoad: Math.round(acuteLoad),
            chronicLoad: Math.round(chronicLoad),
            ratio: ratio.toFixed(2),
            zone,
            zoneColor,
            warning,
            acuteCount: acuteWorkouts.length,
            chronicCount: chronicWorkouts.length
        };
    }

    /**
     * Estimate VO2max from running performance
     * Using Cooper formula and other approximations
     * @param {Object} performance - Running performance data
     * @returns {number} - Estimated VO2max in ml/kg/min
     */
    static estimateVO2max(performance) {
        // If manual entry exists, use it (priority)
        if (performance.manual) {
            return performance.manual;
        }

        // Try to estimate from recent running workouts
        if (performance.distance && performance.timeMinutes) {
            const distance = performance.distance; // km
            const time = performance.timeMinutes; // minutes

            // Cooper formula for distances around 3-5km
            if (distance >= 2 && distance <= 6 && time > 0) {
                const speed = (distance / time) * 60; // km/h
                // VO2max ≈ (speed - 7.0) × 5.5
                const vo2max = (speed - 7.0) * 5.5;
                return Math.max(20, Math.min(80, vo2max)); // Clamp to realistic values
            }
        }

        return null;
    }

    /**
     * Estimate VMA (Maximal Aerobic Speed) from VO2max
     * VMA (km/h) ≈ VO2max / 3.5
     * @param {number} vo2max - VO2max in ml/kg/min
     * @returns {number} - VMA in km/h
     */
    static estimateVMA(vo2max) {
        if (!vo2max) return null;
        return (vo2max / 3.5).toFixed(1);
    }

    /**
     * Calculate average pace from time and distance
     * @param {string} timeStr - Time in format HH:MM:SS or MM:SS
     * @param {number} distance - Distance in km
     * @returns {string} - Pace in format M:SS per km
     */
    static calculatePace(timeStr, distance) {
        if (!timeStr || !distance || distance === 0) return null;

        // Parse time string
        const parts = timeStr.split(':');
        let totalSeconds = 0;

        if (parts.length === 3) {
            // HH:MM:SS
            totalSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        } else if (parts.length === 2) {
            // MM:SS
            totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else {
            return null;
        }

        // Calculate pace (seconds per km)
        const paceSeconds = totalSeconds / distance;
        const paceMinutes = Math.floor(paceSeconds / 60);
        const paceRemainingSeconds = Math.floor(paceSeconds % 60);

        return `${paceMinutes}:${paceRemainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Detect overtraining patterns
     * @param {Array} workouts - Recent workouts
     * @returns {Object} - Overtraining indicators
     */
    static detectOvertraining(workouts) {
        const recent = workouts
            .filter(w => (!w.status || w.status === 'completed') && w.forme)
            .slice(0, 7); // Last 7 workouts

        if (recent.length < 5) {
            return { risk: 'insufficient_data', message: 'Données insuffisantes' };
        }

        // Calculate average "forme du jour"
        const avgForme = recent.reduce((sum, w) => sum + (w.forme || 5), 0) / recent.length;

        // Check for declining forme trend
        const recentForme = recent.slice(0, 3);
        const olderForme = recent.slice(3, 6);

        const recentAvg = recentForme.reduce((sum, w) => sum + (w.forme || 5), 0) / recentForme.length;
        const olderAvg = olderForme.reduce((sum, w) => sum + (w.forme || 5), 0) / olderForme.length;

        const decline = olderAvg - recentAvg;

        // Check ACWR
        const acwr = this.calculateACWR(workouts);

        let risk = 'low';
        let message = 'Pas de signe de surmenage';
        let recommendations = [];

        if (avgForme < 4) {
            risk = 'high';
            message = 'Forme générale basse';
            recommendations.push('Envisager une semaine de récupération');
        } else if (decline > 2) {
            risk = 'moderate';
            message = 'Baisse de forme détectée';
            recommendations.push('Réduire l\'intensité cette semaine');
        }

        if (acwr.zone === 'high') {
            risk = 'high';
            message = 'Charge trop élevée + ' + message;
            recommendations.push('Réduire le volume de 20-30%');
            recommendations.push('Ajouter des séances de récupération active');
        }

        return {
            risk,
            message,
            recommendations,
            avgForme: avgForme.toFixed(1),
            formeTrend: decline > 0 ? 'declining' : 'stable',
            acwr: acwr.ratio
        };
    }

    /**
     * Calculate training monotony and strain
     * Monotony = average load / standard deviation of load
     * Strain = weekly load × monotony
     * @param {Array} workouts - Last 7 days of workouts
     * @returns {Object} - Monotony and strain metrics
     */
    static calculateMonotonyAndStrain(workouts) {
        const recent = workouts
            .filter(w => (!w.status || w.status === 'completed'))
            .slice(0, 7);

        if (recent.length < 3) {
            return { monotony: null, strain: null, warning: null };
        }

        // Get TRIMP values
        const trimps = recent.map(w => this.calculateTRIMP(w));
        const totalLoad = trimps.reduce((sum, t) => sum + t, 0);
        const avgLoad = totalLoad / trimps.length;

        // Calculate standard deviation
        const squaredDiffs = trimps.map(t => Math.pow(t - avgLoad, 2));
        const variance = squaredDiffs.reduce((sum, sd) => sum + sd, 0) / trimps.length;
        const stdDev = Math.sqrt(variance);

        // Calculate monotony (avoid division by zero)
        const monotony = stdDev > 0 ? avgLoad / stdDev : 0;

        // Calculate strain
        const strain = totalLoad * monotony;

        let warning = null;
        if (monotony > 2.0) {
            warning = 'Monotonie élevée - Varier l\'intensité des entraînements';
        }
        if (strain > 10000) {
            warning = 'Strain très élevé - Risque de surmenage';
        }

        return {
            monotony: monotony.toFixed(2),
            strain: Math.round(strain),
            avgLoad: Math.round(avgLoad),
            totalLoad: Math.round(totalLoad),
            warning
        };
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.WorkoutCalculations = WorkoutCalculations;
}
