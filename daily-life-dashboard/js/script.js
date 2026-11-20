/* ═══════════════════════════════════════════════
   Daily Life Dashboard — script.js
   Sections:
     1. Utility helpers
     2. Theme
     3. Greeting & header date
     4. Digital clock
     5. Focus timer
     6. Tasks
     7. Quick links
     8. Bootstrap
═══════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   1. UTILITY HELPERS
───────────────────────────────────────────── */

/**
 * Display a brief toast message at the bottom-right of the screen.
 * @param {string} message
 * @param {number} [duration=2800] ms before the toast disappears
 */
function showToast(message, duration = 2800) {
  // Reuse an existing toast element if present, otherwise create one.
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * Save a value to localStorage as JSON.
 * @param {string} key
 * @param {*} value
 */
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

/**
 * Read and parse a value from localStorage.
 * Returns `defaultValue` when the key is absent or the JSON is invalid.
 * @param {string} key
 * @param {*} [defaultValue=null]
 */
function lsGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? defaultValue : JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Zero-pad a number to two digits.
 * @param {number} n
 * @returns {string}
 */
function pad2(n) {
  return String(n).padStart(2, '0');
}


/* ─────────────────────────────────────────────
   2. THEME (Light / Dark)
───────────────────────────────────────────── */

const LS_THEME = 'ddash_theme';

function initTheme() {
  const btn = document.getElementById('themeToggleBtn');
  const icon = document.getElementById('themeIcon');

  // Restore saved theme on load
  const saved = lsGet(LS_THEME, 'light');
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    lsSet(LS_THEME, next);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}


/* ─────────────────────────────────────────────
   3. GREETING & HEADER DATE
───────────────────────────────────────────── */

const LS_NAME = 'ddash_name';

function initGreeting() {
  const greetingEl  = document.getElementById('greeting');
  const headerDate  = document.getElementById('headerDate');
  const nameInput   = document.getElementById('nameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');

  // Show today's date in the header
  const now = new Date();
  headerDate.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Restore saved name
  const savedName = lsGet(LS_NAME, '');
  if (savedName) {
    nameInput.value = savedName;
    updateGreeting(savedName);
  } else {
    updateGreeting('');
  }

  // Save name on button click
  saveNameBtn.addEventListener('click', saveName);

  // Also save name when Enter is pressed in the input
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveName();
  });

  function saveName() {
    const name = nameInput.value.trim();
    lsSet(LS_NAME, name);
    updateGreeting(name);
    if (name) showToast(`Name saved: ${name}`);
  }

  function updateGreeting(name) {
    const hour = new Date().getHours();
    let part;
    if (hour >= 5 && hour < 12)       part = 'Good Morning';
    else if (hour >= 12 && hour < 18) part = 'Good Afternoon';
    else                               part = 'Good Evening';

    greetingEl.textContent = name ? `${part}, ${name}` : part;
  }
}


/* ─────────────────────────────────────────────
   4. DIGITAL CLOCK
───────────────────────────────────────────── */

function initClock() {
  const clockTime = document.getElementById('clockTime');
  const clockDate = document.getElementById('clockDate');

  function tick() {
    const now = new Date();
    clockTime.textContent =
      `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    clockDate.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  tick();                           // paint immediately
  setInterval(tick, 1000);
}


/* ─────────────────────────────────────────────
   5. FOCUS TIMER
───────────────────────────────────────────── */

const TIMER_MINUTES = 25;

function initTimer() {
  const display   = document.getElementById('timerDisplay');
  const startBtn  = document.getElementById('timerStartBtn');
  const stopBtn   = document.getElementById('timerStopBtn');
  const resetBtn  = document.getElementById('timerResetBtn');
  const labelEl   = document.getElementById('timerLabel');

  let totalSeconds = TIMER_MINUTES * 60;
  let intervalId   = null;        // only ever one interval at a time
  let isRunning    = false;

  renderDisplay();

  // ── Start ──
  startBtn.addEventListener('click', () => {
    if (isRunning) return;         // guard against double-start

    // Request notification permission proactively
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    isRunning = true;
    labelEl.textContent = 'Stay focused!';
    startBtn.disabled = true;

    intervalId = setInterval(() => {
      totalSeconds -= 1;
      renderDisplay();

      if (totalSeconds <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        isRunning = false;
        startBtn.disabled = false;
        labelEl.textContent = 'Session complete!';
        notifyDone();
      }
    }, 1000);
  });

  // ── Stop ──
  stopBtn.addEventListener('click', () => {
    if (!isRunning) return;
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    startBtn.disabled = false;
    labelEl.textContent = 'Paused';
  });

  // ── Reset ──
  resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    startBtn.disabled = false;
    totalSeconds = TIMER_MINUTES * 60;
    renderDisplay();
    labelEl.textContent = 'Ready to focus';
  });

  // ── Helpers ──
  function renderDisplay() {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    display.textContent = `${pad2(m)}:${pad2(s)}`;
  }

  function notifyDone() {
    showToast('Focus session complete! Take a break.', 5000);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Timer', {
        body: 'Your 25-minute session is complete. Take a short break!',
      });
    } else {
      // Fallback when notifications are not available
      alert('Focus session complete! Take a short break.');
    }
  }
}


/* ─────────────────────────────────────────────
   6. TASKS
───────────────────────────────────────────── */

const LS_TASKS = 'ddash_tasks';

function initTasks() {
  const taskInput  = document.getElementById('taskInput');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskList   = document.getElementById('taskList');
  const taskSort   = document.getElementById('taskSort');
  const taskCounter = document.getElementById('taskCounter');

  // tasks: [{ id, text, completed }]
  let tasks = lsGet(LS_TASKS, []);

  // ── Render ──
  function renderTasks() {
    taskList.innerHTML = '';

    const sorted = getSortedTasks();

    if (sorted.length === 0) {
      taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above.</li>';
      updateCounter();
      return;
    }

    sorted.forEach((task) => {
      const li = document.createElement('li');
      li.className = `task-item${task.completed ? ' completed' : ''}`;
      li.dataset.id = task.id;

      // Checkbox
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'task-checkbox';
      cb.checked = task.completed;
      cb.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
      cb.addEventListener('change', () => toggleTask(task.id));

      // Text
      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-edit';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
      editBtn.addEventListener('click', () => startEditTask(li, task));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.textContent = 'Delete';
      delBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
      delBtn.addEventListener('click', () => deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(actions);
      taskList.appendChild(li);
    });

    updateCounter();
  }

  // ── Sorting ──
  function getSortedTasks() {
    const mode = taskSort.value;
    const copy = [...tasks];
    if (mode === 'unfinished') {
      return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
    }
    if (mode === 'completed') {
      return copy.sort((a, b) => Number(b.completed) - Number(a.completed));
    }
    return copy; // default: insertion order
  }

  // ── Counter ──
  function updateCounter() {
    const total = tasks.length;
    const done  = tasks.filter((t) => t.completed).length;
    taskCounter.textContent = `${done} / ${total} completed`;
  }

  // ── Add ──
  function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    // Duplicate check (case-insensitive)
    const isDuplicate = tasks.some(
      (t) => t.text.toLowerCase() === text.toLowerCase()
    );
    if (isDuplicate) {
      showToast('A task with that name already exists.');
      return;
    }

    tasks.push({ id: Date.now(), text, completed: false });
    lsSet(LS_TASKS, tasks);
    taskInput.value = '';
    renderTasks();
  }

  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // ── Toggle ──
  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      lsSet(LS_TASKS, tasks);
      renderTasks();
    }
  }

  // ── Delete ──
  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    lsSet(LS_TASKS, tasks);
    renderTasks();
  }

  // ── Edit (inline) ──
  function startEditTask(li, task) {
    // Replace text span with an input
    const span = li.querySelector('.task-text');
    const actions = li.querySelector('.task-actions');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.text;
    input.maxLength = 120;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.style.padding = '4px 12px';
    saveBtn.style.fontSize = '0.78rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '4px 10px';
    cancelBtn.style.fontSize = '0.78rem';

    li.replaceChild(input, span);
    // Temporarily swap actions
    actions.innerHTML = '';
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    input.focus();
    input.select();

    function commitEdit() {
      const newText = input.value.trim();
      if (!newText) {
        showToast('Task text cannot be empty.');
        return;
      }
      // Duplicate check ignoring the task being edited
      const isDuplicate = tasks.some(
        (t) => t.id !== task.id && t.text.toLowerCase() === newText.toLowerCase()
      );
      if (isDuplicate) {
        showToast('Another task with that name already exists.');
        return;
      }
      task.text = newText;
      lsSet(LS_TASKS, tasks);
      renderTasks();
    }

    saveBtn.addEventListener('click', commitEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') renderTasks(); // cancel
    });
    cancelBtn.addEventListener('click', () => renderTasks());
  }

  // ── Sort change ──
  taskSort.addEventListener('change', renderTasks);

  // ── Initial render ──
  renderTasks();
}


/* ─────────────────────────────────────────────
   7. QUICK LINKS
───────────────────────────────────────────── */

const LS_LINKS = 'ddash_links';

function initLinks() {
  const nameInput = document.getElementById('linkNameInput');
  const urlInput  = document.getElementById('linkUrlInput');
  const addBtn    = document.getElementById('addLinkBtn');
  const linkList  = document.getElementById('linkList');

  // links: [{ id, name, url }]
  let links = lsGet(LS_LINKS, []);

  // ── Render ──
  function renderLinks() {
    linkList.innerHTML = '';

    if (links.length === 0) {
      linkList.innerHTML = '<li class="empty-state">No links saved yet.</li>';
      return;
    }

    links.forEach((link) => {
      const li = document.createElement('li');
      li.className = 'link-item';
      li.dataset.id = link.id;

      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'link-anchor';
      a.innerHTML = `${escapeHtml(link.name)}<span class="link-url-hint">${escapeHtml(link.url)}</span>`;

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.textContent = 'Delete';
      delBtn.setAttribute('aria-label', `Delete link: ${link.name}`);
      delBtn.addEventListener('click', () => deleteLink(link.id));

      li.appendChild(a);
      li.appendChild(delBtn);
      linkList.appendChild(li);
    });
  }

  // ── Validate & normalise URL ──
  function normaliseUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // If no protocol, prepend https://
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      const parsed = new URL(withProtocol);
      // Must have a valid hostname with at least one dot
      if (!parsed.hostname.includes('.')) return null;
      return parsed.href;
    } catch {
      return null;
    }
  }

  // ── Add ──
  function addLink() {
    const name = nameInput.value.trim();
    const rawUrl = urlInput.value.trim();

    if (!name) {
      showToast('Please enter a site name.');
      return;
    }

    const url = normaliseUrl(rawUrl);
    if (!url) {
      showToast('Please enter a valid URL (e.g. https://example.com).');
      return;
    }

    links.push({ id: Date.now(), name, url });
    lsSet(LS_LINKS, links);

    nameInput.value = '';
    urlInput.value = '';
    renderLinks();
  }

  addBtn.addEventListener('click', addLink);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink();
  });
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink();
  });

  // ── Delete ──
  function deleteLink(id) {
    links = links.filter((l) => l.id !== id);
    lsSet(LS_LINKS, links);
    renderLinks();
  }

  // ── Initial render ──
  renderLinks();
}

/**
 * Escape HTML special characters to prevent XSS when inserting untrusted
 * strings into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/* ─────────────────────────────────────────────
   8. BOOTSTRAP
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGreeting();
  initClock();
  initTimer();
  initTasks();
  initLinks();
});
