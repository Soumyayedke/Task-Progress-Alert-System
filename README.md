# Task Progress & Deadline Alert System

A simple, interactive task management system built using **HTML, CSS, and JavaScript**. It helps users track task completion, monitor deadlines, and receive warnings when progress falls behind schedule.

## Features

- **Task Creation:** Create tasks with a custom name, deadline, and work units.
- **Interactive Progress Tracking:** Mark individual work units as complete and automatically update the progress bar.
- **Color-Coded Progress Bar:** Track progress visually using red, yellow, and green.
- **Half-Deadline Warning:** Receive a warning when the halfway point is reached and the task has insufficient progress.
- **Live Countdown:** View the remaining time until the task deadline.
- **Deadline Alerts:** Get notified when a deadline passes before the task is completed.
- **Completion Status:** Completed tasks are marked clearly, with a green progress bar.
- **Minute-Based Deadlines:** Use short deadlines to demonstrate the system in real time.

## How It Works

1. Create a task and set its deadline.
2. Add work units representing the steps required to finish the task.
3. Mark work units as complete as you make progress.
4. Monitor the progress bar and countdown.
5. Receive a warning if progress is insufficient at the halfway point.
6. Complete all work units before the deadline to finish successfully.

If the deadline passes before the task is completed, the system marks the task as overdue.

## Technologies Used

- **HTML5** — Page structure
- **CSS3** — Styling and responsive layout
- **JavaScript** — Task management, progress calculations, countdowns, and deadline alerts

## Getting Started

No installation or additional libraries are required.

1. Clone this repository:

   ```bash
   git clone https://github.com/Soumyayedke/Task-Progress-Alert-System.git
   ```

2. Open the project folder.
3. Open `index.html` in your browser.

You can also open the folder in Visual Studio Code and use the Live Server extension to run the project locally.

## Project Structure

```text
Task-Progress-Alert-System/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Project Purpose

This project demonstrates how JavaScript can be used to build an interactive task management system with real-time progress tracking, deadline monitoring, and visual alerts.

It is suitable for learning and demonstrating DOM manipulation, event handling, timers, and dynamic UI updates.

## Future Improvements

- Save tasks between browser sessions using local storage.
- Support multiple tasks with separate deadlines.
- Add browser notifications for important deadline alerts.
- Improve accessibility and mobile responsiveness.

## Author

**Soumya Yedke**

---

If you find this project useful, feel free to explore the code and suggest improvements.