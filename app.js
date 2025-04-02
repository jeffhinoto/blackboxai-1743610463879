// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pointsBalance = document.getElementById('points-balance');
const redeemBtns = document.querySelectorAll('.redeem-btn');

// Constants
const SESSION_DURATION = 10 * 60; // 10 minutes in seconds
const POINTS_PER_SESSION = 10;
let timerInterval;
let remainingTime = SESSION_DURATION;

// Initialize the app
function init() {
    updatePointsDisplay();
    startBtn.addEventListener('click', toggleSession);
    redeemBtns.forEach(btn => {
        btn.addEventListener('click', handleRedeem);
    });
}

// Toggle session start/stop
function toggleSession() {
    if (startBtn.textContent === 'Start Session') {
        startSession();
    } else {
        stopSession();
    }
}

// Start a new viewing session
function startSession() {
    startBtn.textContent = 'Stop Session';
    startBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    startBtn.classList.add('bg-red-600', 'hover:bg-red-700');

    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();

        if (remainingTime <= 0) {
            completeSession();
        }
    }, 1000);
}

// Stop the current session
function stopSession() {
    clearInterval(timerInterval);
    resetTimer();
    startBtn.textContent = 'Start Session';
    startBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
    startBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
}

// Complete a session and award points
function completeSession() {
    stopSession();
    addPoints(POINTS_PER_SESSION);
    logSession();
    showNotification('Session completed! +10 points');
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Reset timer to initial state
function resetTimer() {
    remainingTime = SESSION_DURATION;
    updateTimerDisplay();
}

// Points management
function addPoints(points) {
    const currentPoints = getPoints();
    localStorage.setItem('points', currentPoints + points);
    updatePointsDisplay();
}

function getPoints() {
    return parseInt(localStorage.getItem('points')) || 0;
}

function spendPoints(points) {
    const currentPoints = getPoints();
    if (currentPoints >= points) {
        localStorage.setItem('points', currentPoints - points);
        updatePointsDisplay();
        return true;
    }
    return false;
}

function updatePointsDisplay() {
    pointsBalance.textContent = getPoints();
}

// Session history
function logSession() {
    const history = getSessionHistory();
    history.push({
        date: new Date().toISOString(),
        duration: '10:00',
        pointsEarned: POINTS_PER_SESSION
    });
    localStorage.setItem('sessionHistory', JSON.stringify(history));
}

function getSessionHistory() {
    return JSON.parse(localStorage.getItem('sessionHistory')) || [];
}

// Redemption handling
function handleRedeem(e) {
    const pointsRequired = parseInt(e.target.dataset.points);
    const viewers = parseInt(e.target.dataset.viewers);

    if (spendPoints(pointsRequired)) {
        logRedemption(viewers, pointsRequired);
        showNotification(`Success! ${viewers} viewers added to your queue`);
    } else {
        showNotification('Not enough points!', 'error');
    }
}

function logRedemption(viewers, points) {
    const redemptions = getRedemptionHistory();
    redemptions.push({
        date: new Date().toISOString(),
        viewers: viewers,
        pointsSpent: points
    });
    localStorage.setItem('redemptionHistory', JSON.stringify(redemptions));
}

function getRedemptionHistory() {
    return JSON.parse(localStorage.getItem('redemptionHistory')) || [];
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);