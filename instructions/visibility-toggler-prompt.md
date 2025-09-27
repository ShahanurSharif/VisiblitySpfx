# SPFx Application Customizer — **Visibility Toggler** (Prompt)

> Goal: Build an SPFx **Application Customizer** that renders a draggable floating button (FAB). Clicking it opens a dialog with toggles to hide/show key SharePoint chrome (Site Header, Command Bar, Left Nav, etc.).  
> Persist FAB **position** in browser storage (per site) and toggle **settings** in **Site Assets/visibilityToggler.json**. Must auto-apply on load and across client-side navigations, and recover after DOM churn via **MutationObserver**. Small hints only—no large code blocks.

---

## Deliverables
- `src/extensions/visibilityToggler/*` (Application Customizer)
- Lightweight React UI: FAB + Dialog
- `IVisibilitySettings` model + persistence service
- Site Assets CRUD for `visibilityToggler.json`
- `localStorage` for FAB position (per site)
- README with manual test checklist

---

## Plan (sequence)
1. **Scaffold**
   - `yo @microsoft/sharepoint` → Extension → **Application Customizer** → `VisibilityToggler`.
   - In `onInit` register:  
     - `this.context.application.navigatedEvent` → re-apply settings on route changes.  
     - `MutationObserver` on `document.body` (debounced) → re-apply after re-renders.
2. **Mount & UI**
   - Append a root `<div id="vt-root">` to `document.body` and render React there (shadow DOM optional).
   - **FAB**: draggable via Pointer events; clamp to viewport; persist `{left, top, edge?}` to `localStorage` key `vt:pos:<siteId>`.
   - **Dialog**: switches for each target, Save / Cancel; focus-trap, `Esc` closes.
3. **Targets (selectors registry)**
   - Prefer **data-automationid**; fallback to ids/classes. Start with:
     - **Site Header**: `['[data-automationid="SiteHeader"]','.spSiteHeader','#SuiteNavWrapper']`
     - **Command Bar**: `['[data-automationid="CommandBar"]','.spCommandBar','#spCommandBar']`
     - **Left Nav**: `['[data-automationid="LeftNav"]','#spLeftNav']` (classic fallback)
   - Implement `queryFirst(selectors: string[]): HTMLElement | null` to resolve at runtime.
4. **Apply logic**
   - `applySettings(settings)`:
     - For each registry item, resolve element, then show/hide with **scoped style** (`el.style.display = visible ? '' : 'none'`).
     - Cache resolved nodes; if null, retry on next debounced observer tick.
5. **Persistence**
   - **Site-wide** (settings): `visibilityToggler.json` in **Site Assets**:
     ```ts
     interface IVisibilitySettings {
       version: 1;
       updatedUtc: string;
       toggles: Record<string, boolean>; // e.g. { siteHeader:false, commandBar:true, leftNav:true }
     }
     ```
   - Load on init: try GET; if 404, use defaults; create on first Save.
   - Save from Dialog via `spHttpClient` (overwrite ok v1). Handle read-only users: show toast + apply session-only.
   - **Local-only** (FAB position): `localStorage` per site; restore on load and on `navigatedEvent`.
6. **Resilience & UX**
   - Debounce observer (~200ms). Don’t rely on brittle deep selectors.
   - Minimal console diagnostics: `console.debug('[VT]', ...)`.
   - Feature flag: if `VT_DISABLE` present → no-op.
   - A11y: keyboard nudge for FAB (arrows), `aria-label` on controls, consistent TAB order.

---

## Small Hints (implementation)
- **Dragging**: pointerdown → capture; pointermove → set absolute `top/left`; pointerup → persist.
- **Mount style**: keep CSS scoped to `#vt-root` to avoid leakage.
- **Navigation**: call `applySettings()` inside `onNavigated` and after dialog Save.
- **Retry strategy**: if a target is missing, schedule a limited retry loop plus observer re-apply.

---

## Manual Test Checklist
1. Load home/list/library/settings pages → FAB visible.
2. Drag FAB; refresh + navigate within site (no full reload) → position persists.
3. Toggle Site Header / Command Bar / Left Nav → hide/show persists across navigations.
4. Open in another browser after saving → site-wide settings apply.
5. With read-only user → Save blocked gracefully; session-only application works.
6. Switch list views, open panels, change folders → toggles re-apply (observer works).
7. A11y: Dialog focus trap; `Esc` closes; FAB operable via keyboard.

---

## Acceptance Criteria
- FAB position persists per site; restored on load and navigations.
- Toggles persist in **Site Assets/visibilityToggler.json** and auto-apply for all readers.
- Works on modern pages, lists/libs, and settings panes; survives DOM churn via MutationObserver.
- Minimal dependencies; clear separation: UI, selectors, persistence, apply engine.
