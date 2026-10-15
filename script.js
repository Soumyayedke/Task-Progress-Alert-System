/**
 * =============================================================================
 * Task Progress & Deadline Alert System
 * JavaScript Laboratory Assignment
 * 
 * Demonstrates:
 * - DOM Manipulation & Dynamic Element Creation
 * - Event Listeners (Form Submit, Clicks, Presets)
 * - Real-time Timers using setInterval() and Date Math
 * - Array Management & Object Manipulation
 * - Conditional Logic for Dynamic Color Coding & Warnings
 * =============================================================================
 */

// ==========================================
// 1. STATE VARIABLES
// ==========================================

// Staged work units before creating the task
let stagedWorkUnits = [];

// Active task state
let activeTask = {
    name: "",
    totalDurationSeconds: 0,
    timeRemainingSeconds: 0,
    workUnits: [], // Array of { id: number, text: string, completed: boolean }
    isRunning: false,
    isCompleted: false,
    isExpired: false
};

// Interval reference for live countdown timer
let timerInterval = null;


// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================

// Form and Staging Elements
const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name-input");
const deadlineInput = document.getElementById("deadline-input");
const workUnitInput = document.getElementById("work-unit-input");
const addUnitBtn = document.getElementById("add-unit-btn");
const stagedUnitsList = document.getElementById("staged-units-list");
const stagedCountSpan = document.getElementById("staged-count");
const loadSampleBtn = document.getElementById("load-sample-btn");
const presetButtons = document.querySelectorAll(".btn-preset");

// Monitor & Dashboard Elements
const noTaskPlaceholder = document.getElementById("no-task-placeholder");
const activeTaskPanel = document.getElementById("active-task-panel");
const systemStatusBadge = document.getElementById("system-status-badge");
const displayTaskName = document.getElementById("display-task-name");
const countdownTimer = document.getElementById("countdown-timer");
const alertBox = document.getElementById("alert-box");

// Progress Elements
const progressPercentText = document.getElementById("progress-percent-text");
const progressBarFill = document.getElementById("progress-bar-fill");
const completedUnitsCount = document.getElementById("completed-units-count");
const liveUnitsList = document.getElementById("live-units-list");
const resetTaskBtn = document.getElementById("reset-task-btn");


// ==========================================
// 3. INITIALIZATION & EVENT LISTENERS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Add work unit button click
    addUnitBtn.addEventListener("click", handleAddStagedUnit);

    // Allow pressing 'Enter' inside the work unit text input
    workUnitInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddStagedUnit();
        }
    });

    // Load demo sample button
    loadSampleBtn.addEventListener("click", loadSampleData);

    // Preset minute buttons
    presetButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const minutes = btn.getAttribute("data-min");
            deadlineInput.value = minutes;
        });
    });

    // Form submit -> Start Task
    taskForm.addEventListener("submit", handleCreateTask);

    // Reset button
    resetTaskBtn.addEventListener("click", resetSystem);
});


// ==========================================
// 4. STAGED WORK UNITS HANDLING
// ==========================================

/**
 * Adds a new work unit to the staging list
 */
function handleAddStagedUnit() {
    const unitText = workUnitInput.value.trim();

    if (unitText === "") {
        alert("Please enter a description for the work unit.");
        workUnitInput.focus();
        return;
    }

    // Add to staged list
    stagedWorkUnits.push({
        id: Date.now() + Math.random(),
        text: unitText,
        completed: false
    });

    // Clear input field and refresh UI
    workUnitInput.value = "";
    workUnitInput.focus();
    renderStagedUnits();
}

/**
 * Removes a staged work unit by its ID
 */
function removeStagedUnit(id) {
    stagedWorkUnits = stagedWorkUnits.filter(unit => unit.id !== id);
    renderStagedUnits();
}

/**
 * Renders the preview list of staged work units in the creation form
 */
function renderStagedUnits() {
    stagedUnitsList.innerHTML = "";
    stagedCountSpan.textContent = stagedWorkUnits.length;

    if (stagedWorkUnits.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "empty-hint";
        emptyLi.textContent = 'No work units added yet. Add at least one unit above or click "Load Demo Sample".';
        stagedUnitsList.appendChild(emptyLi);
        return;
    }

    stagedWorkUnits.forEach((unit, index) => {
        const li = document.createElement("li");
        
        const span = document.createElement("span");
        span.textContent = `${index + 1}. ${unit.text}`;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-btn";
        removeBtn.innerHTML = "&times;";
        removeBtn.title = "Remove this work unit";
        removeBtn.addEventListener("click", () => removeStagedUnit(unit.id));

        li.appendChild(span);
        li.appendChild(removeBtn);
        stagedUnitsList.appendChild(li);
    });
}

/**
 * Loads standard demo data for quick faculty demonstration
 */
function loadSampleData() {
    taskNameInput.value = "Complete JavaScript Assignment";
    deadlineInput.value = "3";

    stagedWorkUnits = [
        { id: Date.now() + 1, text: "Create HTML structure", completed: false },
        { id: Date.now() + 2, text: "Add CSS styling & layout", completed: false },
        { id: Date.now() + 3, text: "Write JavaScript countdown & progress logic", completed: false },
        { id: Date.now() + 4, text: "Test real-time alert triggers", completed: false },
        { id: Date.now() + 5, text: "Complete final submission", completed: false }
    ];

    renderStagedUnits();
}


// ==========================================
// 5. TASK CREATION & TIMER LOGIC
// ==========================================

/**
 * Handles creating and starting the active task
 */
function handleCreateTask(e) {
    e.preventDefault();

    const taskName = taskNameInput.value.trim();
    const deadlineMinutes = parseFloat(deadlineInput.value);

    // Validation
    if (!taskName) {
        alert("Please enter a valid task name.");
        return;
    }

    if (isNaN(deadlineMinutes) || deadlineMinutes <= 0) {
        alert("Please enter a valid deadline in minutes (greater than 0).");
        return;
    }

    if (stagedWorkUnits.length === 0) {
        alert("Please add at least one work unit/subtask before starting the task.");
        return;
    }

    // Stop any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Initialize active task state
    const totalSeconds = Math.round(deadlineMinutes * 60);
    activeTask = {
        name: taskName,
        totalDurationSeconds: totalSeconds,
        timeRemainingSeconds: totalSeconds,
        // Deep copy of staged work units
        workUnits: stagedWorkUnits.map(unit => ({ ...unit, completed: false })),
        isRunning: true,
        isCompleted: false,
        isExpired: false
    };

    // Update UI elements for monitoring
    displayTaskName.textContent = activeTask.name;
    updateBadge("RUNNING", "badge-active");
    noTaskPlaceholder.classList.add("hidden");
    activeTaskPanel.classList.remove("hidden");
    hideAlert();

    // Render the live checklist and initial progress
    renderLiveChecklist();
    updateProgress();
    updateTimerDisplay();

    // Start live countdown timer (1-second tick)
    startRealTimeCountdown();
}

/**
 * Starts the setInterval countdown
 */
function startRealTimeCountdown() {
    timerInterval = setInterval(() => {
        if (!activeTask.isRunning) {
            clearInterval(timerInterval);
            return;
        }

        activeTask.timeRemainingSeconds--;

        // Update timer display
        updateTimerDisplay();

        // Check for 50% half-time warning
        checkHalfDeadlineWarning();

        // Check if deadline reached zero
        if (activeTask.timeRemainingSeconds <= 0) {
            handleDeadlineExpired();
        }
    }, 1000);
}

/**
 * Formats and updates the MM:SS timer display
 */
function updateTimerDisplay() {
    const secondsLeft = Math.max(0, activeTask.timeRemainingSeconds);
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    countdownTimer.textContent = `${formattedMinutes}:${formattedSeconds}`;

    // Visual color shift on timer text if running low
    if (secondsLeft <= 30 && secondsLeft > 0) {
        countdownTimer.className = "timer-display timer-danger";
    } else if (secondsLeft <= activeTask.totalDurationSeconds / 2) {
        countdownTimer.className = "timer-display timer-warning";
    } else {
        countdownTimer.className = "timer-display";
    }
}


// ==========================================
// 6. PROGRESS & CHECKLIST LOGIC
// ==========================================

/**
 * Renders the live checklist items inside the Active Task Monitor
 */
function renderLiveChecklist() {
    liveUnitsList.innerHTML = "";

    activeTask.workUnits.forEach((unit, index) => {
        const li = document.createElement("li");
        li.className = `checklist-item ${unit.completed ? "completed" : ""}`;

        // Left section (checkbox + text)
        const leftDiv = document.createElement("div");
        leftDiv.className = "item-left";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = unit.completed;
        checkbox.disabled = !activeTask.isRunning;
        checkbox.addEventListener("change", () => toggleUnitCompletion(unit.id));

        const textSpan = document.createElement("span");
        textSpan.className = "item-text";
        textSpan.textContent = `${index + 1}. ${unit.text}`;

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(textSpan);

        // Right section (action button)
        const rightDiv = document.createElement("div");
        rightDiv.className = "item-right";

        const actionBtn = document.createElement("button");
        actionBtn.type = "button";
        actionBtn.className = "btn-complete-item";
        actionBtn.textContent = unit.completed ? "✓ Done" : "Mark as Done";
        actionBtn.disabled = !activeTask.isRunning;
        actionBtn.addEventListener("click", () => toggleUnitCompletion(unit.id));

        rightDiv.appendChild(actionBtn);

        li.appendChild(leftDiv);
        li.appendChild(rightDiv);
        liveUnitsList.appendChild(li);
    });
}

/**
 * Toggles a work unit's completed status
 */
function toggleUnitCompletion(id) {
    if (!activeTask.isRunning) return;

    const unit = activeTask.workUnits.find(u => u.id === id);
    if (unit) {
        unit.completed = !unit.completed;
        renderLiveChecklist();
        updateProgress();

        // Check if half-time warning needs to be re-evaluated
        checkHalfDeadlineWarning();
    }
}

/**
 * Calculates current progress and applies color thresholds
 * Rules:
 * - 0–49%  -> RED
 * - 50–79% -> YELLOW
 * - 80–99% -> GREEN
 * - 100%   -> GREEN + Complete Task
 */
function updateProgress() {
    const total = activeTask.workUnits.length;
    if (total === 0) return;

    const completed = activeTask.workUnits.filter(u => u.completed).length;
    const percentage = Math.round((completed / total) * 100);

    // Update text indicators
    progressPercentText.textContent = `${percentage}%`;
    completedUnitsCount.textContent = `${completed} of ${total}`;

    // Update width
    progressBarFill.style.width = `${percentage}%`;

    // Clear previous color classes
    progressBarFill.classList.remove("progress-red", "progress-yellow", "progress-green");

    // Apply color according to specified percentage brackets
    if (percentage < 50) {
        progressBarFill.classList.add("progress-red");
    } else if (percentage < 80) {
        progressBarFill.classList.add("progress-yellow");
    } else {
        progressBarFill.classList.add("progress-green");
    }

    // Check if task is 100% complete
    if (percentage === 100 && activeTask.isRunning) {
        handleTaskCompleted();
    }
}


// ==========================================
// 7. DEADLINE & ALERT SYSTEM
// ==========================================

/**
 * Checks for the 50% deadline threshold
 * If 50% or more time has passed and progress is < 50%, show warning
 */
function checkHalfDeadlineWarning() {
    if (!activeTask.isRunning || activeTask.isCompleted || activeTask.isExpired) {
        return;
    }

    const total = activeTask.workUnits.length;
    const completed = activeTask.workUnits.filter(u => u.completed).length;
    const progressPercent = total > 0 ? (completed / total) * 100 : 0;

    const timePassedSeconds = activeTask.totalDurationSeconds - activeTask.timeRemainingSeconds;
    const halfTime = activeTask.totalDurationSeconds / 2;

    // Trigger condition: at least half the time has passed and work progress is < 50%
    if (timePassedSeconds >= halfTime && progressPercent < 50) {
        showAlert(
            "⚠️ Half of the deadline has passed. Work has not progressed enough.",
            "alert-warning"
        );
        updateBadge("WARNING", "badge-warning");
    } else if (timePassedSeconds >= halfTime && progressPercent >= 50) {
        // If they caught up to >= 50%, remove warning if currently displayed
        if (alertBox.classList.contains("alert-warning")) {
            hideAlert();
            updateBadge("RUNNING", "badge-active");
        }
    }
}

/**
 * Triggered when all work units reach 100% before the deadline
 */
function handleTaskCompleted() {
    activeTask.isRunning = false;
    activeTask.isCompleted = true;

    // Stop countdown
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Keep bar green
    progressBarFill.classList.remove("progress-red", "progress-yellow");
    progressBarFill.classList.add("progress-green");

    // Show Success Alert
    showAlert("✓ TASK COMPLETED", "alert-success");
    updateBadge("COMPLETED", "badge-success");

    // Re-render to disable checklist inputs
    renderLiveChecklist();
}

/**
 * Triggered when the countdown timer hits 00:00
 */
function handleDeadlineExpired() {
    activeTask.isRunning = false;
    activeTask.isExpired = true;

    // Stop countdown
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    const total = activeTask.workUnits.length;
    const completed = activeTask.workUnits.filter(u => u.completed).length;
    const isFull = total > 0 && completed === total;

    if (!isFull) {
        // DEADLINE MISSED:
        // 1. Show DEADLINE MISSED message
        showAlert("DEADLINE MISSED", "alert-danger");

        // 2. Make progress bar completely RED to indicate failure
        progressBarFill.classList.remove("progress-yellow", "progress-green");
        progressBarFill.classList.add("progress-red");

        // 3. Update status badge
        updateBadge("DEADLINE MISSED", "badge-danger");

        // 4. Disable all work unit completion buttons
        renderLiveChecklist();
    } else {
        handleTaskCompleted();
    }
}


// ==========================================
// 8. HELPER UI UTILITIES
// ==========================================

/**
 * Shows an alert banner with a specific message and CSS class
 */
function showAlert(message, typeClass) {
    alertBox.textContent = message;
    alertBox.className = `alert-box ${typeClass}`;
    alertBox.classList.remove("hidden");
}

/**
 * Hides the alert banner
 */
function hideAlert() {
    alertBox.textContent = "";
    alertBox.className = "alert-box hidden";
}

/**
 * Updates the top right status badge in the Live Monitor
 */
function updateBadge(text, badgeClass) {
    systemStatusBadge.textContent = text;
    systemStatusBadge.className = `badge ${badgeClass}`;
}

/**
 * Resets the entire system to initial state
 */
function resetSystem() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    activeTask = {
        name: "",
        totalDurationSeconds: 0,
        timeRemainingSeconds: 0,
        workUnits: [],
        isRunning: false,
        isCompleted: false,
        isExpired: false
    };

    hideAlert();
    updateBadge("Awaiting Task", "badge-neutral");
    noTaskPlaceholder.classList.remove("hidden");
    activeTaskPanel.classList.add("hidden");
}
