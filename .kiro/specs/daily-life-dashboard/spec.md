# Daily Life Dashboard — Project Specification

## Overview
A single-page personal productivity dashboard built with HTML5, CSS3, and Vanilla JavaScript.
No frameworks, no backend. All data persisted in `localStorage`.

---

## Goals
- Provide a cheerful, minimalist, responsive daily hub.
- Sections: Header/Greeting, Digital Clock, Focus Timer, Tasks, Quick Links, Theme Toggle.
- Full offline functionality; no external dependencies beyond the Google Fonts CDN.

---

## Folder Structure
```
daily-life-dashboard/
├── index.html
├── css/
│   └── style.css
└── js/
    └── script.js
.kiro/
└── specs/
    └── daily-life-dashboard/
        └── spec.md
```

---

## Color Palette (CSS variables)
| Variable           | Value     | Usage                     |
|--------------------|-----------|---------------------------|
| `--bg`             | `#FFF2A6` | Page background           |
| `--primary`        | `#65B9EA` | Buttons, accents          |
| `--primary-hover`  | `#369BD5` | Button hover state        |
| `--white`          | `#FFFFFF` | Card backgrounds          |
| `--navy`           | `#263B59` | Headings, strong text     |
| `--dark-bg`        | `#1A1F2E` | Dark mode page bg         |
| `--dark-card`      | `#252B3B` | Dark mode card bg         |
| `--dark-text`      | `#E2E8F0` | Dark mode body text       |

---

## Sections

### A. Header & Greeting
- Shows current date (long format).
- Time-based greeting: Good Morning (5–11), Good Afternoon (12–17), Good Evening (18–4).
- Editable name field; name saved and restored from `localStorage`.
- Greeting reads: "Good Morning, [Name]"

### B. Digital Clock
- Displays time as `HH:MM:SS` updated every second via `setInterval`.
- Shows full date beneath the clock.

### C. Focus Timer (Pomodoro)
- Default 25:00 countdown.
- Three buttons: Start, Stop, Reset.
- Guard against duplicate intervals (clear before creating new).
- Native `Notification` API alert when timer reaches 00:00; fallback `alert()` if permission denied.

### D. My Tasks
- Add task via input + button (Enter key also works).
- Edit task inline (prompt or inline editing).
- Toggle completion (checkbox or click).
- Delete individual tasks.
- Counter: "X / Y completed".
- Duplicate prevention (case-insensitive trim comparison).
- Sort: Default Order | Unfinished First | Completed First.
- Tasks array saved to `localStorage` as JSON.

### E. Quick Links
- Add name + URL via two inputs + button.
- URL validation: must start with `http://` or `https://`, or be coerced with `https://` prefix.
- Links open in `target="_blank" rel="noopener"`.
- Delete button per link.
- Links array saved to `localStorage` as JSON.

### F. Light / Dark Mode
- Toggle button in header.
- Light mode: yellow bg, blue accents.
- Dark mode: dark bg, muted accents, comfortable contrast.
- Theme key saved to `localStorage`; restored on page load.

---

## Implementation Plan

1. **HTML** — semantic structure: `<header>`, `<main>` grid, section `<article>` cards.
2. **CSS** — CSS variables, responsive grid, card styles, button animations, dark mode via `[data-theme="dark"]` attribute on `<html>`.
3. **JavaScript** — module-style functions grouped by section:
   - `initGreeting()` / `updateClock()`
   - `initTimer()`
   - `initTasks()`
   - `initLinks()`
   - `initTheme()`
   - `DOMContentLoaded` bootstrapper

---

## Quality Checklist
- [ ] No console errors on load or interaction.
- [ ] `localStorage` persists across page refresh.
- [ ] Timer does not stack intervals.
- [ ] Duplicate tasks blocked.
- [ ] URL validation rejects clearly invalid input.
- [ ] Responsive at 320 px, 768 px, 1280 px.
- [ ] Dark mode covers all elements.
- [ ] All text in English.
