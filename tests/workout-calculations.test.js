// Simple Test Framework for WorkoutCalculations
// No external dependencies - can run in browser or Node.js

class TestRunner {
    constructor(name) {
        this.name = name;
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(description, fn) {
        this.tests.push({ description, fn });
    }

    async run() {
        console.log(`\n📋 Running test suite: ${this.name}\n${'='.repeat(60)}`);

        for (const { description, fn } of this.tests) {
            try {
                await fn();
                this.passed++;
                console.log(`✅ ${description}`);
            } catch (error) {
                this.failed++;
                console.error(`❌ ${description}`);
                console.error(`   Error: ${error.message}`);
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 Results: ${this.passed} passed, ${this.failed} failed`);
        console.log(`   Total: ${this.tests.length} tests\n`);

        return { passed: this.passed, failed: this.failed, total: this.tests.length };
    }
}

function assert(condition, message = 'Assertion failed') {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message}\n   Expected: ${expected}\n   Actual: ${actual}`);
    }
}

function assertDeepEqual(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
        throw new Error(`${message}\n   Expected: ${expectedStr}\n   Actual: ${actualStr}`);
    }
}

function assertWithinRange(actual, min, max, message = '') {
    if (actual < min || actual > max) {
        throw new Error(`${message}\n   Value ${actual} is not within range [${min}, ${max}]`);
    }
}

// ============================
// WorkoutCalculations Tests
// ============================

const suite = new TestRunner('WorkoutCalculations');

// Test TRIMP Calculation
suite.test('calculateTRIMP - basic calculation', () => {
    const workout = { duration: 60, rpe: 8 };
    const trimp = WorkoutCalculations.calculateTRIMP(workout);
    assertEqual(trimp, 480, 'TRIMP should be duration × RPE');
});

suite.test('calculateTRIMP - zero duration', () => {
    const workout = { duration: 0, rpe: 8 };
    const trimp = WorkoutCalculations.calculateTRIMP(workout);
    assertEqual(trimp, 0, 'TRIMP should be 0 for zero duration');
});

suite.test('calculateTRIMP - missing RPE defaults to 5', () => {
    const workout = { duration: 60 };
    const trimp = WorkoutCalculations.calculateTRIMP(workout);
    assertEqual(trimp, 300, 'TRIMP should use RPE=5 as default');
});

// Test Pace Calculation
suite.test('calculatePace - basic calculation', () => {
    const pace = WorkoutCalculations.calculatePace('30:00', 5); // 30min for 5km
    assertEqual(pace, '6:00', 'Pace should be 6:00 min/km');
});

suite.test('calculatePace - with hours', () => {
    const pace = WorkoutCalculations.calculatePace('1:00:00', 10); // 1h for 10km
    assertEqual(pace, '6:00', 'Pace should be 6:00 min/km');
});

suite.test('calculatePace - sub-5 pace', () => {
    const pace = WorkoutCalculations.calculatePace('24:00', 5); // 24min for 5km
    assertEqual(pace, '4:48', 'Pace should be 4:48 min/km');
});

suite.test('calculatePace - zero distance', () => {
    const pace = WorkoutCalculations.calculatePace('30:00', 0);
    assertEqual(pace, null, 'Pace should be null for zero distance');
});

// Test Trail Equivalent
suite.test('calculateTrailEquivalent - with elevation', () => {
    const equiv = WorkoutCalculations.calculateTrailEquivalent(10, 500);
    assertEqual(equiv, 15, 'Trail equivalent: 10km + 500m/100 = 15km');
});

suite.test('calculateTrailEquivalent - no elevation', () => {
    const equiv = WorkoutCalculations.calculateTrailEquivalent(10, 0);
    assertEqual(equiv, 10, 'Trail equivalent without elevation equals distance');
});

// Test FC Max (Tanaka Formula)
suite.test('calculateFCMax - age 30', () => {
    const fcMax = WorkoutCalculations.calculateFCMax(30);
    assertEqual(fcMax, 187, 'FC Max for age 30: 208 - 0.7×30 = 187');
});

suite.test('calculateFCMax - age 25', () => {
    const fcMax = WorkoutCalculations.calculateFCMax(25);
    assertEqual(fcMax, 191, 'FC Max for age 25: 208 - 0.7×25 = 190.5 ≈ 191');
});

suite.test('calculateFCMax - age 40', () => {
    const fcMax = WorkoutCalculations.calculateFCMax(40);
    assertEqual(fcMax, 180, 'FC Max for age 40: 208 - 0.7×40 = 180');
});

// Test VO2max Estimation
suite.test('estimateVO2max - basic calculation', () => {
    const profile = { age: 30, gender: 'male' };
    const vo2max = WorkoutCalculations.estimateVO2max(10, '40:00', profile);
    assert(vo2max > 0, 'VO2max should be positive');
    assertWithinRange(vo2max, 40, 70, 'VO2max should be in reasonable range');
});

// Test VMA Calculation
suite.test('calculateVMA - basic calculation', () => {
    const vma = WorkoutCalculations.calculateVMA(60);
    assertEqual(vma.toFixed(2), '17.14', 'VMA = VO2max / 3.5');
});

// Test Heart Rate Zones
suite.test('calculateHeartRateZones - basic zones', () => {
    const zones = WorkoutCalculations.calculateHeartRateZones(190, 60);

    assert(zones.length === 5, 'Should have 5 heart rate zones');
    assert(zones[0].name === 'Zone 1', 'First zone should be Zone 1');
    assert(zones[4].name === 'Zone 5', 'Last zone should be Zone 5');

    // Check that zones are ascending
    for (let i = 0; i < zones.length - 1; i++) {
        assert(zones[i].max < zones[i + 1].min, 'Zones should be in ascending order');
    }
});

// Test Pace Zones
suite.test('calculatePaceZones - basic zones', () => {
    const zones = WorkoutCalculations.calculatePaceZones(15);

    assert(zones.length === 5, 'Should have 5 pace zones');
    assert(zones[0].name === 'Zone 1', 'First zone should be Zone 1');
    assert(zones[4].name === 'Zone 5', 'Last zone should be Zone 5');
});

// Test ACWR Calculation
suite.test('calculateACWR - sufficient data', () => {
    const workouts = [];
    const now = new Date();

    // Create 28 days of workouts with consistent load
    for (let i = 0; i < 28; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        workouts.push({
            date: date.toISOString().split('T')[0],
            trimp: 300,
            status: 'completed'
        });
    }

    const acwr = WorkoutCalculations.calculateACWR(workouts);

    assert(acwr.ratio !== '0.00', 'ACWR ratio should not be zero');
    assert(acwr.zone === 'safe', 'Equal load should be in safe zone');
    assert(acwr.acuteLoad > 0, 'Acute load should be positive');
    assert(acwr.chronicLoad > 0, 'Chronic load should be positive');
});

suite.test('calculateACWR - insufficient data', () => {
    const workouts = [
        { date: new Date().toISOString().split('T')[0], trimp: 300 }
    ];

    const acwr = WorkoutCalculations.calculateACWR(workouts);

    assertEqual(acwr.ratio, '0.00', 'ACWR should be 0 with insufficient data');
    assertEqual(acwr.zone, 'safe', 'Should default to safe zone');
});

suite.test('calculateACWR - high load warning', () => {
    const workouts = [];
    const now = new Date();

    // High acute load (last 7 days)
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        workouts.push({
            date: date.toISOString().split('T')[0],
            trimp: 600, // High load
            status: 'completed'
        });
    }

    // Low chronic load (days 8-28)
    for (let i = 7; i < 28; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        workouts.push({
            date: date.toISOString().split('T')[0],
            trimp: 200, // Low load
            status: 'completed'
        });
    }

    const acwr = WorkoutCalculations.calculateACWR(workouts);
    const ratio = parseFloat(acwr.ratio);

    assert(ratio > 1.3, 'ACWR ratio should be high');
    assert(acwr.zone === 'moderate' || acwr.zone === 'high', 'Should be in warning zone');
});

// Test Overtraining Detection
suite.test('detectOvertraining - no overtraining', () => {
    const workouts = [];
    const now = new Date();

    for (let i = 0; i < 14; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        workouts.push({
            date: date.toISOString().split('T')[0],
            trimp: 300,
            forme: 7,
            rpe: 6,
            status: 'completed'
        });
    }

    const result = WorkoutCalculations.detectOvertraining(workouts);

    assertEqual(result.risk, 'low', 'Should have low risk with good forme');
    assert(result.recommendations.length === 0, 'Should have no recommendations');
});

suite.test('detectOvertraining - low forme warning', () => {
    const workouts = [];
    const now = new Date();

    for (let i = 0; i < 14; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        workouts.push({
            date: date.toISOString().split('T')[0],
            trimp: 300,
            forme: 3, // Low forme
            rpe: 7,
            status: 'completed'
        });
    }

    const result = WorkoutCalculations.detectOvertraining(workouts);

    assertEqual(result.risk, 'high', 'Should have high risk with low forme');
    assert(result.recommendations.length > 0, 'Should have recommendations');
});

// Test Monotony and Strain
suite.test('calculateMonotonyStrain - consistent load', () => {
    const workouts = [];
    const now = new Date();

    // Very consistent load (high monotony)
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        workouts.push({
            date: date.toISOString().split('T')[0],
            trimp: 300,
            status: 'completed'
        });
    }

    const result = WorkoutCalculations.calculateMonotonyStrain(workouts);

    assert(parseFloat(result.monotony) > 0, 'Monotony should be positive');
    assert(result.strain > 0, 'Strain should be positive');
});

suite.test('calculateMonotonyStrain - varied load', () => {
    const workouts = [];
    const now = new Date();
    const loads = [100, 300, 500, 200, 400, 250, 350];

    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        workouts.push({
            date: date.toISOString().split('T')[0],
            trimp: loads[i],
            status: 'completed'
        });
    }

    const result = WorkoutCalculations.calculateMonotonyStrain(workouts);

    assert(parseFloat(result.monotony) > 0, 'Monotony should be positive');
    assert(result.warning === null || typeof result.warning === 'string', 'Warning should be null or string');
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { suite, TestRunner };
}

// Auto-run if in browser with WorkoutCalculations available
if (typeof window !== 'undefined' && typeof WorkoutCalculations !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('🧪 WorkoutCalculations tests loaded. Run suite.run() to execute tests.');
    });
}
