# Moti PWA — Native Mobile UX Audit, Redesign & Implementation Roadmap

You are acting as a **senior product designer, mobile UX architect, and frontend engineer** specializing in modern native-feeling web applications and responsive PWAs.

Your task is to investigate the **existing Moti project/codebase** and determine how it should be redesigned for **mobile-size screens** so that it feels like a deliberately designed native mobile business application rather than a desktop website compressed into a phone.

Do **NOT** immediately start coding.

First investigate the existing implementation, understand the current architecture and UI patterns, identify what should stay, what should be modified, what should be replaced, and what should be redesigned completely.

The final goal is:

> **Desktop remains a productive web application. Mobile becomes a compact, touch-first, native-feeling PWA experience.**

---

# 1. CORE DESIGN DIRECTION

The design direction should combine the best qualities of:

* Apple Human Interface Guidelines
* Material Design 3
* Linear
* Stripe Dashboard
* Vercel
* Notion
* modern iOS / Android productivity apps
* modern inventory / POS / ERP mobile applications

The design should feel:

* modern
* premium
* minimal
* highly usable
* compact
* information-dense without feeling crowded
* touch-friendly
* professional
* fast
* calm
* visually consistent
* native-like

Avoid making Moti look like:

* a desktop website squeezed into 375px
* a collection of cards
* an oversized dashboard
* a generic Bootstrap admin panel
* an old ERP application
* a heavily rounded "everything is a card" interface
* a UI with excessive shadows
* a UI with excessive gradients
* a UI with oversized typography
* a UI where every row becomes a card

---

# 2. MOST IMPORTANT MOBILE PRINCIPLE

### DO NOT TURN DESKTOP TABLES INTO MOBILE CARDS.

For mobile screens, use:

## Compact Native List / Row Pattern

Example conceptual structure:

Product Name                         24  >
SKU                                  In Stock
────────────────────────────────────────────
Another Product                       8  >
SKU                                  Low Stock

Each row should expose only the most important information.

When the user taps the row:

* open a bottom sheet for quick inspection when appropriate
* or navigate to a dedicated detail screen for complex records

The mobile experience should follow a **list → detail** interaction model.

The desktop table may contain many columns.

The mobile representation should intentionally contain fewer fields.

Do NOT try to fit every desktop column into the mobile screen.

---

# 3. FIRST TASK: AUDIT THE EXISTING PROJECT

Before changing anything, inspect the actual codebase.

Investigate:

### Project architecture

Identify:

* framework
* routing
* component architecture
* styling system
* design tokens
* UI library
* state management
* form system
* table implementation
* modal/drawer/sheet implementation
* navigation implementation
* authentication UI
* PWA setup
* responsive utilities
* breakpoint strategy
* layout primitives
* reusable components

### Inspect all major screens

Find and inspect:

* Login
* Dashboard
* Inventory
* Products
* Purchases
* Sales
* Customers
* Suppliers
* Users
* Reports
* Settings
* Profile/account
* Notifications
* Search
* Filters
* Create forms
* Edit forms
* Detail views
* Tables
* Modals
* Drawers
* Dialogs
* Empty states
* Loading states
* Error states
* Confirmation actions

Do not assume the application structure.

Discover the actual structure from the codebase.

---

# 4. RESPONSIVE AUDIT

Test the existing UI mentally and structurally against at least these widths:

* 320px
* 360px
* 375px
* 390px
* 412px
* 430px
* tablet width
* desktop width

Identify:

* horizontal overflow
* clipped content
* oversized components
* tables that become unusable
* excessive spacing
* navigation problems
* buttons that become too small
* forms that are difficult to use
* dialogs that do not fit
* excessive page height
* poor hierarchy
* duplicated information
* unnecessary desktop controls
* controls that should become bottom sheets
* components that should become full-screen mobile pages

---

# 5. CREATE A MOBILE UX REPLACEMENT MATRIX

Create a table with:

| Existing Component | Current Behavior | Mobile Problem | Recommended Pattern | Keep / Modify / Replace | Priority |
| ------------------ | ---------------- | -------------- | ------------------- | ----------------------- | -------- |

Do this for every important component.

Example:

| Component          | Current            | Mobile Recommendation                                  |
| ------------------ | ------------------ | ------------------------------------------------------ |
| Desktop Data Table | many columns       | compact mobile list                                    |
| Sidebar            | desktop navigation | bottom navigation + More                               |
| Modal              | centered dialog    | bottom sheet / full page                               |
| Filters            | horizontal toolbar | filter sheet                                           |
| Search             | desktop input      | sticky mobile search                                   |
| Detail drawer      | side drawer        | bottom sheet/full detail                               |
| Bulk actions       | toolbar            | contextual action bar                                  |
| Pagination         | desktop pagination | compact pagination / infinite scroll where appropriate |

Do not blindly apply the example above.

Inspect the actual Moti implementation and make recommendations based on the project.

---

# 6. MOBILE APP SHELL

Design a dedicated mobile application shell.

Investigate whether the current sidebar should become:

* bottom navigation
* top navigation
* navigation drawer
* More screen
* contextual navigation

Recommended direction:

### Bottom navigation

Prefer approximately 4–5 high-value destinations.

Example:

Home
Inventory
Sales
Purchases
More

Less frequently used sections should move under More.

Do not place 8–12 items inside the bottom navigation.

The navigation should feel like a native mobile app.

---

# 7. MOBILE HEADER

Design a consistent mobile header system.

Possible structure:

[Back]     Page Title                    [Action]

or:

Page Title                             [+]

Subtitle / count

Search / filter below when required.

Investigate which screens require:

* back button
* search
* filter
* add
* notification
* overflow
* profile

Do not put every possible action into every header.

Prioritize the primary action.

---

# 8. LOGIN SCREEN

Redesign the Moti mobile login.

The login should be:

* minimal
* premium
* focused
* comfortable on one hand
* vertically balanced
* touch friendly
* visually branded
* native-feeling

Recommended hierarchy:

Logo

Welcome back

Short supporting text

Email

Password

Forgot password

Primary Sign In button

Optional supporting information

Avoid:

* oversized hero illustrations
* excessive decorative elements
* huge gradients
* excessive cards
* unnecessary social login buttons
* desktop-oriented layouts

Investigate the existing login and explain exactly what should change.

---

# 9. DASHBOARD ON MOBILE

Do NOT simply shrink the desktop dashboard.

Determine which dashboard information is actually useful on mobile.

Prioritize:

* critical KPIs
* low stock
* urgent actions
* sales summary
* recent activity
* notifications
* actionable insights

Avoid presenting every desktop metric.

The mobile dashboard should be:

## glance → understand → act

rather than:

## look at 20 different widgets.

Use compact sections and horizontal scrolling only when genuinely useful.

---

# 10. TABLE / LIST DESIGN

This is one of the highest-priority areas.

Desktop:

Full table with columns, sorting, filtering, bulk actions, pagination.

Mobile:

Compact list rows.

Example:

```text
Honda Oil Filter                    24   >
OF-102                              In Stock

Yamaha Spark Plug                    8   >
SP-204                              Low Stock
```

Recommended characteristics:

* 1–2 line hierarchy
* compact vertical rhythm
* subtle divider
* optional leading icon/image
* primary information first
* secondary information second
* status/value on trailing side
* disclosure indicator where applicable
* touch target approximately 44px minimum
* no giant card container around each row

Determine the correct information hierarchy for every actual Moti table.

Do not assume every table should use the same fields.

For example:

Inventory may show:

* product
* SKU
* quantity
* stock state

Sales may show:

* transaction/reference
* customer
* total
* date/status

Users may show:

* name
* role
* status

Adapt the mobile row according to the purpose of each data set.

---

# 11. DETAIL INTERACTION

When a user taps a mobile row, determine whether the correct interaction is:

### Bottom Sheet

For:

* quick inspection
* compact information
* simple actions

or:

### Full Detail Page

For:

* complex records
* editing
* long information
* multiple sections
* history
* related records

Do NOT use a giant desktop modal on mobile unless there is a strong reason.

---

# 12. FORMS ON MOBILE

Audit every create/edit form.

Mobile forms should:

* use one clear vertical flow
* group logically related fields
* minimize unnecessary field density
* use full-width controls
* use large touch targets
* avoid multiple columns unless extremely appropriate
* keep the primary action visible
* use sticky bottom action areas when useful

Example:

```text
Product

Product Name
[_____________________]

SKU
[_____________________]

Category
[ Select category       ]

Selling Price
[ ₱____________________ ]

Stock
[ ____________________ ]

────────────────────────

[ Save Product ]
```

Investigate every actual Moti form rather than applying a generic template.

---

# 13. FILTERS

Desktop filters may be:

* inline toolbar filters
* dropdowns
* multiple table controls

Mobile should generally consolidate complex filters into:

### Filter Bottom Sheet

Example:

Filters

Category
[ All Categories       ]

Stock Status
[ In Stock              ]

Supplier
[ All Suppliers         ]

Price Range
[ Min ] — [ Max ]

[ Reset ]        [ Apply ]

Do not overload the main mobile screen with filtering controls.

---

# 14. SEARCH

Search should be intentionally designed for mobile.

Consider:

* sticky search field
* search icon
* recent searches
* keyboard-friendly input
* clear button
* filter button beside search
* search result count

Avoid making search unnecessarily tall or visually dominant.

---

# 15. ACTIONS

Determine the primary action for every screen.

Examples:

Inventory → Add Product

Sales → New Sale

Purchases → New Purchase

Users → Add User

Do not present 5 equal-priority buttons.

Use one clear primary action.

Secondary actions can live in:

* overflow menu
* bottom sheet
* contextual toolbar

---

# 16. BOTTOM SHEETS

Use bottom sheets intentionally.

Good use cases:

* filters
* quick details
* sort
* actions
* selection menus
* confirmation
* contextual actions

Analyze every current modal and determine whether it should become:

* bottom sheet
* dialog
* full-screen page
* inline expansion

---

# 17. MOBILE INFORMATION DENSITY

The goal is NOT to make everything large.

The goal is:

> **High information density + strong hierarchy + comfortable touch targets**

Use hierarchy instead of visual noise.

Primary text should be obvious.

Secondary metadata should be quieter.

Status should be recognizable but not dominant.

Avoid adding containers around every field.

---

# 18. SPACING SYSTEM

Audit the existing spacing.

Propose a consistent spacing system.

Use a restrained scale such as:

4
8
12
16
20
24
32

Do not randomly use different spacing everywhere.

---

# 19. TYPOGRAPHY

Define:

* page title
* section title
* primary row text
* secondary row text
* metadata
* labels
* buttons
* navigation labels
* helper text

Typography should feel modern and compact.

Avoid oversized SaaS marketing typography inside operational screens.

---

# 20. COLORS

Audit the existing Moti color system.

Create a clear semantic system for:

* primary
* background
* surface
* border
* text
* muted text
* success
* warning
* danger
* informational

Status colors should be restrained.

Avoid relying exclusively on color to communicate meaning.

---

# 21. TOUCH TARGETS

Audit every interactive element.

Target at least approximately:

44px touch area.

Inspect:

* icon buttons
* row clicks
* tabs
* filters
* selects
* checkboxes
* toggles
* navigation
* buttons

Make sure compactness does not make the interface difficult to operate.

---

# 22. SAFE AREAS / MOBILE PWA

Investigate:

* safe-area insets
* bottom navigation spacing
* iPhone home indicator area
* keyboard appearance
* viewport behavior
* sticky bottom actions
* browser/PWA display mode
* scrolling behavior
* fixed headers
* fixed navigation

The application should remain comfortable when installed as a PWA.

---

# 23. PWA-SPECIFIC UX

Inspect the existing PWA implementation and identify whether mobile UI should account for:

* standalone mode
* install state
* offline states
* loading state
* update notification
* connectivity problems
* push notifications
* permission prompts

Do not introduce unnecessary PWA UI.

Only surface it where it improves the application.

---

# 24. ACCESSIBILITY

Audit:

* contrast
* focus states
* keyboard navigation
* semantic buttons
* aria labels
* screen-reader labels
* form labels
* touch size
* error messaging
* status indicators

Mobile-first must not mean accessibility is ignored.

---

# 25. PERFORMANCE

Do not solve mobile problems with excessive JavaScript or duplicated components without reason.

Inspect:

* rendering cost
* large tables
* unnecessary rerenders
* image loading
* bundle size
* heavy dependencies
* expensive components

Recommend improvements where mobile performance could be affected.

---

# 26. COMPONENT ARCHITECTURE

Determine which responsive behaviors should be shared and which should have dedicated mobile components.

For example:

```text
DataTable
MobileDataList
MobileListRow
DetailSheet
MobileDetailPage
FilterSheet
MobileHeader
MobileBottomNav
```

Do not create duplicated logic unnecessarily.

Prefer shared:

* data
* state
* business logic
* validation
* actions

while allowing desktop/mobile to have different presentation components where appropriate.

---

# 27. DO NOT OVER-ENGINEER RESPONSIVENESS

Do not make every component dynamically behave in 15 different ways.

Identify meaningful responsive layouts.

A component can intentionally have:

Desktop version
Tablet behavior
Mobile version

That is acceptable.

Do not sacrifice UX just to avoid creating a mobile-specific presentation component.

---

# 28. DESIGN SYSTEM DELIVERABLE

After auditing the existing project, propose a mobile design system containing:

### Layout

* page padding
* section spacing
* row height
* header height
* bottom navigation height
* sheet dimensions

### Typography

* font sizes
* font weights
* line heights

### Controls

* button heights
* input heights
* select heights
* icon button sizes

### Surfaces

* backgrounds
* borders
* sheets
* dialogs
* cards where actually necessary

### States

* loading
* empty
* error
* success
* warning
* disabled

---

# 29. SCREEN-BY-SCREEN REDESIGN PLAN

Produce a detailed plan for every major screen.

Use this structure:

## Screen: Inventory

### Current implementation

Describe what exists now.

### Mobile problems

List actual problems found in the codebase.

### Recommended mobile UX

Describe the target design.

### Components to modify

List exact components/files.

### Components to create

List exact components/files.

### Components to remove

List anything obsolete.

### Interaction behavior

Describe tap, swipe, sheet, navigation, filtering, etc.

### Acceptance criteria

Describe how we know the redesign is successful.

Repeat this for all major screens.

---

# 30. IMPLEMENTATION PRIORITIES

Classify each change:

### P0 — Critical

Must be fixed before mobile redesign is considered usable.

### P1 — High

Strongly improves usability.

### P2 — Medium

Polish and consistency.

### P3 — Optional

Nice-to-have improvements.

---

# 31. CREATE A ROADMAP

Create an implementation roadmap in phases.

Recommended structure:

## Phase 0 — Discovery

Audit current project.

Output:

* architecture map
* mobile UX audit
* component inventory
* responsive problems
* design system proposal

## Phase 1 — Mobile Foundation

Implement:

* breakpoints
* mobile shell
* spacing
* typography
* responsive utilities
* mobile header
* bottom navigation
* safe areas

## Phase 2 — Core Components

Implement:

* MobileDataList
* MobileListRow
* DetailSheet
* MobileDetailPage
* FilterSheet
* mobile search
* mobile actions

## Phase 3 — Authentication

Redesign:

* login
* password handling
* loading
* errors
* session states

## Phase 4 — Core Business Screens

Redesign the highest-use areas first:

* dashboard
* inventory
* sales
* purchases

## Phase 5 — Secondary Screens

Then:

* customers
* suppliers
* users
* reports
* settings
* profile
* notifications

## Phase 6 — Quality Pass

Test:

* 320px
* 360px
* 375px
* 390px
* 412px
* 430px
* tablet
* desktop

Test:

* light/dark mode if supported
* keyboard
* touch
* long content
* empty states
* loading
* errors
* slow network
* PWA standalone mode

## Phase 7 — Final Polish

Fix:

* spacing inconsistencies
* typography inconsistencies
* visual hierarchy
* animation
* transitions
* accessibility
* performance
* unnecessary components

---

# 32. IMPORTANT IMPLEMENTATION RULE

Do not redesign everything simultaneously.

Recommend the safest incremental implementation order.

Prefer:

```text
Foundation
    ↓
Navigation
    ↓
Shared Mobile Components
    ↓
One Core Screen
    ↓
Validate Pattern
    ↓
Apply Pattern to Other Screens
    ↓
Polish
```

Instead of:

```text
Rewrite the entire application
```

The redesign should minimize regression risk.

---

# 33. REQUIRED FINAL OUTPUT FROM YOU

After investigating the project, do NOT immediately code.

Return a comprehensive design and implementation proposal containing:

## A. Executive Summary

What is wrong with the current mobile experience and what the new direction should be.

## B. Current Architecture

What the project currently uses and how responsive behavior is currently implemented.

## C. Mobile UX Audit

Problems discovered.

## D. Component Replacement Matrix

Exact components that should be:

* kept
* modified
* replaced
* created

## E. Mobile Design System

Spacing, typography, colors, surfaces, controls and interaction patterns.

## F. Screen-by-Screen Redesign

Detailed target layout for each page.

## G. Mobile Navigation Architecture

Explain the proposed bottom navigation and secondary navigation.

## H. Data/Table Strategy

Explain exactly how every important desktop table transforms into a mobile list.

## I. Modal / Drawer / Sheet Strategy

Explain which existing dialogs should become sheets or pages.

## J. Component Architecture

Recommend reusable components and where they should live.

## K. File-Level Implementation Plan

Identify the likely files/components that need modification or creation.

## L. Phased Roadmap

Give the implementation order from foundation → core screens → polish.

## M. Priority Matrix

P0 / P1 / P2 / P3.

## N. Acceptance Criteria

Define what "mobile redesign complete" means.

## O. Risks

Identify architectural or UX risks before implementation.

## P. Recommended First Task

Finish with ONE clearly defined first implementation task that should be started immediately.

---

# 34. CRITICAL RULES

Do not:

* blindly rewrite the current UI
* assume the existing implementation
* destroy working desktop behavior
* turn every mobile component into a card
* blindly copy Apple's design
* blindly copy Material Design
* add unnecessary animations
* add unnecessary gradients
* add decorative UI with no functional value
* introduce new dependencies without justification
* create duplicated business logic
* redesign based only on screenshots
* skip accessibility
* skip small-screen testing

Do:

* inspect the actual code
* understand existing architecture
* preserve existing functionality
* redesign presentation where necessary
* favor native-feeling interaction patterns
* favor compact lists over mobile cards for data-heavy interfaces
* use bottom sheets where appropriate
* use full detail pages for complex records
* maintain a strong visual hierarchy
* reuse business logic
* create reusable responsive components
* document exactly why each major change is recommended

---

# 35. FINAL DESIGN PHILOSOPHY

The final Moti mobile experience should feel like:

> "A professional inventory/business application that was designed for mobile from the beginning."

Not:

> "A desktop ERP that was made responsive."

The key principles are:

**Compact, not cramped.**

**Minimal, not empty.**

**Dense, but highly readable.**

**Native-feeling, not platform-dependent.**

**Touch-first, but still information-rich.**

**Consistent, but not repetitive.**

**Responsive, but intentionally designed for each screen size.**

Start by investigating the current project thoroughly.

**Do not write implementation code until the audit, redesign proposal, component strategy, and roadmap are complete.**
