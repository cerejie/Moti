---
name: ui-design-conventions
description: How a Moti screen must look and be composed — shadcn/ui on the aria-vega (React Aria) base, Tailwind v4 tokens in theme.css, styles separated into *.styles.ts, the app primitives in components/common, the shared modal frame, the four data states, and mobile-first PWA layout. Use before building or restyling any page, table, modal, card, form, filter bar or navigation.
---

# UI & Design Conventions

**A new screen must look like it was always here.** Design is inherited, not chosen per
feature. Before drawing anything, open the nearest existing screen and copy how it composes
`components/common/`. The visual and structural reference until Moti has its own is
`Dcwd_Work/dcwd_apps-crm-customer2`.

Also load the official **`shadcn`** skill for any UI work, and run
`npx shadcn@latest docs <component>` before composing a component you have not used yet.

## 1. The library — shadcn/ui on React Aria, nothing else

- `components.json` sets `"style": "aria-vega"`: every primitive is built on
  **react-aria-components**. Never Radix, never Base UI.
- `radix-ui`, `@radix-ui/*`, `@base-ui/react`, `vaul`, `cmdk` and `react-day-picker` are banned
  imports (ESLint `no-restricted-imports`), in `components/ui/` too. A registry item that pulls
  one in is not added — compose the need from aria components instead (a phone drawer is the
  aria `sheet` with `side="bottom"`).
- Primitives are added with `npx shadcn@latest add <name>` — never `yarn add`, never copied by hand.
- `components/ui/` is generated and **never hand-edited**. Icons are `lucide-react`.
- React Aria conventions: buttons default to `type="button"` and use `onPress`; links take `href`
  and route through the aria `RouterProvider` in `RouteRoot`.

## 2. Tokens and styling — non-negotiable

- **`src/styles/common/theme.css` is the single token source**: Tailwind v4 `@import`, the shadcn
  variable set (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, …),
  Moti extras (`--success`, `--warning`, …), the type scale, and the safe-area utilities
  (`pt-safe`, `pb-safe`, `px-safe`, `pb-tabbar`, `h-dvh-safe`).
- **shadcn's default design, Moti colours.** Components render as the registry ships them; the
  only global override is colour, through the tokens. `className` on a shadcn component is for
  layout only.
- **Styles are separated from components.** A `.tsx` file holds structure and behaviour only —
  **no Tailwind class strings in JSX**. Every visual rule is a named constant or a `cva` variant in
  `src/styles/<kind|domain>/<name>.styles.ts`, combined with `cn()` from `utils/cn.utils.ts`.

```ts
// styles/cards/statCard.styles.ts
export const statCard = cva("rounded-xl border bg-card p-4", {
  variants: { tone: { default: "", success: "border-success/40", danger: "border-destructive/40" } },
  defaultVariants: { tone: "default" },
});
export const statValue = "text-2xl font-semibold tabular-nums";
```

- **No hex, px or rgba literals in components or style files** — add a token to `theme.css`.
- No inline `style={{ }}` objects, no `.css` files besides `theme.css`, no CSS-in-JS.
- Dark mode is the `.dark` class on the document (`@custom-variant dark`); every token has a
  dark value. A screen that only works in light mode is not done.
- Semantic tones (success, warning, danger, info, neutral) live in `styles/common/tone.styles.ts`
  and are what `StatusBadge` and enum tone maps use.

## 3. The primitives — reuse before building

`components/common/<kind>/` is the only layer that imports `components/ui/`. Check it first:

| Need | Use |
|---|---|
| Page frame: title, subtitle, back link, actions | `view/ContentView` — every page opens with it |
| Bento / dashboard layout | `view/BentoGrid` + `view/BentoCell` |
| Tabs inside a page | `view/ViewTabs` / `view/SegmentTabs` |
| Content panel / metric tile / action tiles | `card/SectionCard` / `card/StatCard` / `card/ActionCards` |
| Records list | `table/DataTable` inside `table/TablePanel`, with `table/TablePagination` |
| Toolbar above a list | `filter/FilterToolbar` (+ `filter/SegmentedControl`) |
| Row actions | `table/RowActionMenu` |
| Any modal | `modal/AppModal`; forms `form/EntityFormModal`; read-only `modal/DetailModal`; done `modal/SuccessModal` |
| Confirm / delete | `useConfirm()` + the single `modal/ConfirmationModal` in `App.tsx` |
| Form building blocks | `form/FormRoot`, `FormField`, `FormSection`, `TextInput`, `SelectInput`, `TextArea`, `PasswordInput`, `OtpField`, `FileDropzone` |
| Status pill | `status/StatusBadge` fed by an enum label + tone map |
| Loading / empty / error | `status/StateBox`, `status/LoadingBar`, `status/ErrorState` |
| Buttons and links | `button/AppButton` (`href` for navigation) |
| Shell: sidebar, bottom tab bar, topbar | `layout/AppShell`, `AppSidebar`, `TabBar`, `Topbar` |

If a component exists, use it. If it *almost* fits, **add a prop or `cva` variant** with the
current behaviour as default — never fork a copy. If it does not exist and a second screen will
need it, build it in `components/common/<kind>/` from the start.

Never hand-roll a table, dialog, sheet, select, combobox, date picker, tooltip, toast or tabs —
the aria registry has all of them.

## 4. Page shell

A page stays this thin — no queries, no state, no handlers:

```tsx
const TasksView = () => (
  <ContentView title="Tasks" subtitle="Everything due this week" actions={<CreateTaskButton />}>
    <TasksTable />
  </ContentView>
);

export default TasksView;
```

Never nest a card in a card. The content surface is already a surface; one card layer on top of
it is the maximum.

## 5. Data views — four states, always

Every data view renders **loading, empty, error and success**:

- Loading: `StateBox loading` or `LoadingBar`; `DataTable` carries its own skeleton rows.
- Empty: `StateBox` with a title and, where it makes sense, the primary action.
- Error: `ErrorState` with a retry (`onRetry={refetch}`).
- Offline with cached data: show the data plus the offline indicator (`pwa-conventions` § 4).

Dates, money and numbers go through `utils/format.utils.ts` — never format at the call site.

## 6. Modals — one frame, never rebuilt

- Every overlay is `AppModal` (or `EntityFormModal` / `DetailModal` / `SuccessModal`, which sit
  on it) or `useConfirm`. `AppModal` is an aria `dialog` on `md+` and an aria `sheet` from the
  bottom on phones, and it draws the whole frame: ruled header, scrolling body, ruled footer.
- A new modal supplies `title`, `size` (`ModalSize`), `footer` and children — nothing else styles
  the frame, and `className` never overrides it.
- Footer = action buttons only: secondary first (`variant="secondary"`), primary last, default size.
- A modal that draws its own heading passes `hideHeader`; a blocking one passes
  `dismissible={false}`.
- Open state is `useModal<T>(key)` with the key in `keys/modal.keys.ts`; `modal.data` carries the
  whole record, and its presence decides create vs edit.
- Destructive actions go through `useConfirm({ kind: "delete", … })`; critical deletes require
  typing `DELETE` (`confirmPhrase`). Never `window.confirm`, never a second `ConfirmationModal`.

## 7. Forms

- react-hook-form + zod, `use<Thing>Form` in the form hook. Modal forms render through
  `EntityFormModal` with an `IFieldConfig[]`; inline forms use `FormRoot` / `FormField`.
- `FormField` is the only place a field type maps to a control — add a new `type` there, never a
  bespoke input in a feature component.
- API errors render above the fields (`AppAlert`), separate from field errors.
- Submit disabled while `mutation.isPending`; the button shows the pending state.
- Mobile keyboards: set `inputMode` / `autoComplete` / `type` correctly (`tel`, `email`, `numeric`).

## 8. Mobile-first — Moti is a PWA

Design at **360 px first**, then widen. Clean dashboard on desktop, native-app feel on phones.

- Navigation: bottom `TabBar` below `md`, `AppSidebar` from `md` up — both render from
  `routes/protected.view.routes.ts`. Adding a page never touches the nav components.
- Touch targets ≥ 44 px; primary actions reachable by the thumb (bottom of the screen on phones).
- Respect safe areas: shell uses `pt-safe` / `pb-safe` / `pb-tabbar`; full-height screens use
  `h-dvh-safe`, never `100vh`.
- Tables collapse to card rows below `md` (`DataTable` handles this — do not build a second list).
- No hover-only affordances; everything reachable by touch and keyboard (React Aria gives focus
  and keyboard handling for free — do not break it with custom handlers).
- Motion comes from `tw-animate-css` via the registry; respect `prefers-reduced-motion`.
- PWA mechanics (manifest, service worker, offline banner, install/update prompts):
  `pwa-conventions`.

## 9. Verify

A build proves the classes compiled, never that they render as intended. Report a visual change
as compiled and let the user confirm it on a phone-width viewport and in dark mode.
