# Nivasa Theme System

## 1. Theme architecture (centralized)

### How it works
- **Trigger**: Theme is toggled by adding or removing the `dark` class on `<html>`. The **ThemeService** (`core/services/theme.service.ts`) and the **inline script** in `index.html` both set this class so there is no flash of the wrong theme.
- **Tailwind**: `tailwind.config.js` uses `darkMode: 'class'`, so all `dark:` variants respond to `html.dark`.
- **Global variables**: `src/styles.css` defines CSS custom properties for both themes:
  - **:root** (light): `--color-background`, `--color-surface`, `--color-card`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-input-bg`, `--color-input-border`
  - **.dark**: Same names with dark-theme values.
- **Components**: Use Tailwind’s `dark:` variant (e.g. `bg-white dark:bg-slate-800`, `text-slate-900 dark:text-slate-100`) so the same component works in both themes. Optional utility classes (`.theme-bg`, `.theme-card`, etc.) use the variables for one-off cases.

### Flow
1. On load, `index.html` script reads `localStorage.getItem('nivasa-theme')` or system preference and sets `html` class and `color-scheme`.
2. ThemeService does the same in Angular and keeps state in sync.
3. User clicks the theme toggle → ThemeService calls `setTheme('dark' | 'light')` → updates `localStorage` and `document.documentElement.classList` → all `dark:` styles update.

---

## 2. Files modified

### Global
- **`src/styles.css`** – Theme comment block; added `--color-input-bg`, `--color-input-border`; `.gradient-border` uses `var(--color-card)`; added `.theme-bg`, `.theme-surface`, `.theme-card`, `.theme-border`, `.theme-text`, `.theme-text-muted`.
- **`src/index.html`** – Theme script simplified; sets `color-scheme` and `dark` class without flash.

### Layouts
- No structural changes; layouts already used Tailwind `dark:` where needed.

### Pages – resident
- **`pages/resident/dashboard/dashboard.component.ts`** – Inline template: all hex colors replaced with Tailwind theme classes (e.g. `bg-white dark:bg-slate-800`, `text-slate-900 dark:text-slate-100`).
- **`pages/resident/complaints/complaints.component.html`** – Same replacement pattern.
- **`pages/resident/family/family.component.html`** – Same.
- **`pages/resident/vehicles/vehicles.component.html`** + **`vehicles.component.ts`** – Template and `getVehicleTypeColor()` return values updated to theme classes.
- **`pages/resident/notices/notices.component.html`** – Same replacement pattern.
- **`pages/resident/notifications/notifications.component.html`** + **`notifications.component.ts`** – Template and `getNotificationTypeClass()` use theme classes.
- **`pages/resident/profile/profile.component.html`** – Same replacement pattern.

### Pages – admin
- **`pages/admin/dashboard/dashboard.component.ts`** – Already used `dark:`; no hex changes.
- **`pages/admin/residents/residents.component.html`** – Hex replaced with theme classes.
- **`pages/admin/client-profile/client-profile.component.ts`** – Inline template updated to theme classes.
- **`pages/admin/settings/settings.component.html`** – All `dark:bg-[#...]` and similar replaced with `dark:bg-slate-*` / `dark:border-slate-*`.
- **`pages/admin/settings/settings.component.css`** – Dark scrollbar uses `var(--color-border)` and slate colors.
- **`pages/admin/notifications/notifications.component.html`** – Hex replaced with theme classes.
- **`pages/admin/parking-requests/parking-requests.component.html`** – Same.

### Shared / core
- **`core/services/theme.service.ts`** – Unchanged; already toggles `dark` / `light` on `document.documentElement`.
- **`shared/components/theme-toggle/theme-toggle.component.ts`** – Unchanged; already uses ThemeService and Tailwind for pill/button.

---

## 3. Color mapping used

| Old (hardcoded) | New (theme-aware) |
|-----------------|-------------------|
| `#0f1117`, `#1a1d27` (dark bg) | `bg-white dark:bg-slate-800` or `bg-slate-50 dark:bg-slate-900` |
| `#1e2235` (inputs, surfaces) | `bg-slate-100 dark:bg-slate-800` |
| `#2e3250` (borders) | `border-slate-200 dark:border-slate-700` |
| `#3a3f5c` (borders, hovers) | `border-slate-300 dark:border-slate-600` |
| `#f1f5f9` (text on dark) | `text-slate-900 dark:text-slate-100` |
| `#94a3b8` (muted text) | `text-slate-500 dark:text-slate-400` |
| `#6366f1` (primary) | `primary-600` / `primary-500` (Tailwind config) |
| `#22263a` (hover) | `hover:bg-slate-100 dark:hover:bg-slate-700` |

---

## 4. How to test dark/light switching

1. **Start the app**  
   From project root: `npm run dev` (or run frontend only). Open `http://localhost:4200`.

2. **Toggle in UI**  
   Use the theme toggle (sun/moon or “Light”/“Dark”) in:
   - Auth layout (login/register)
   - Landing navbar
   - Admin top bar
   - Resident top bar  

   Each click should switch the whole app between light and dark.

3. **Check persistence**  
   - Switch to dark → refresh page → page should still be dark.  
   - Switch to light → refresh → should stay light.  
   - Clear `localStorage` (or remove `nivasa-theme`) and refresh → theme should follow system preference.

4. **Visual checks**  
   - **Light**: White/slate-50 backgrounds, dark text, light borders.  
   - **Dark**: Dark slate (800/900) backgrounds, light text, darker borders.  
   - No invisible text; cards, inputs, buttons, modals, and tables should look correct in both modes.  
   - Navigate through: Landing → Login → Admin (dashboard, residents, settings, notifications, parking) and Resident (dashboard, profile, family, vehicles, notices, complaints, notifications).  
   - Confirm no remaining “always dark” or “always light” panels.

5. **Console**  
   - No errors. ThemeService and `document.documentElement.classList` should show `dark` or `light` as expected.

---

## 5. Summary

- **Single source of truth**: `html.dark` + Tailwind `dark:` + optional CSS variables in `styles.css`.
- **No feature or backend changes**: Only UI and theme styling.
- **Consistent palette**: Slate for neutrals, primary (indigo) for accents, semantic colors (success, error, warning) unchanged.
- **Contrast**: Text and backgrounds use theme-aware classes so both modes stay readable.
