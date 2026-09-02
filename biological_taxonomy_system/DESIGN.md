---
name: Biological Taxonomy System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#904821'
  on-tertiary: '#ffffff'
  tertiary-container: '#af5f36'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb693'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#76330d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  scientific-name:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style

The design system is built upon the principles of scientific rigour, archival preservation, and ecological connection. It serves an audience of researchers, entomologists, and educators who require a high-density information environment that remains legible during extended periods of study.

The visual style is a **Modern-Scholarly** hybrid. It combines the clean, systematic efficiency of contemporary SaaS with the authoritative aesthetic of botanical journals. The interface emphasizes:
- **Clarity over Decoration:** Every visual element must serve a functional purpose in data navigation.
- **Natural Order:** A structured hierarchy that mirrors biological classification (Taxonomy).
- **Academic Trust:** A "paper-like" quality achieved through subtle textures and a refined color palette, ensuring the UI feels like a professional tool rather than a consumer app.

## Colors

The palette is derived from the natural habitats of the subjects it catalogs. 

- **Primary (Emerald Green):** Used for primary actions, success states, and indicating active biological "life."
- **Secondary (Slate Gray):** Provides the structural foundation. Used for navigation, headers, and text to ensure high contrast and professional weight.
- **Tertiary (Earth Brown):** Reserved for highlights, specific taxonomic warnings, or specialized data markers (e.g., soil-dwelling species).
- **Neutral (Off-White/Slate):** The background (#f8fafc) reduces eye strain compared to pure white, mimicking high-quality archival paper.

Functional colors (Success, Warning, Error) should be slightly desaturated to maintain the "muted nature" aesthetic while remaining accessible.

## Typography

This system utilizes a dual-type approach to distinguish between the UI framework and the scientific content.

- **Source Serif 4:** Used for headlines and scientific names. Its classical proportions and excellent legibility evoke traditional academic publishing. Scientific names must always be set in the `scientific-name` style (italicized).
- **Source Sans 3:** The workhorse for the UI. It provides a clean, neutral contrast to the serif headings, ensuring that data-heavy tables and forms remain readable.
- **JetBrains Mono:** Employed for metadata, specimen IDs, and technical labels. The monospaced nature helps researchers quickly scan alphanumeric strings (e.g., "ID: ISO-882-2023").

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid Grid** to accommodate dense data visualization.

- **Desktop (1280px+):** A 12-column grid with a 1440px max-width container. Margins are set to 48px to give the content a "journal" feel.
- **Tablet (768px - 1279px):** An 8-column grid with 24px margins. Sidebars for taxonomy filters collapse into off-canvas menus.
- **Mobile (<767px):** A 4-column grid with 16px margins. Data tables must transition to "card-stack" views to maintain readability.

Spacing follows a 4px baseline shift. Use larger gaps (`xl`) between major sections (e.g., between "Order" and "Family" groups) and tighter spacing (`sm`) for related data points within a specimen record.

## Elevation & Depth

To maintain the scholarly aesthetic, this design system avoids heavy shadows. Instead, it uses **Tonal Layering** and **Fine Outlines**:

- **Surface Levels:** The primary background is #f8fafc. Secondary containers (like data tables or cards) use a pure white (#ffffff) background with a 1px solid border in #e2e8f0.
- **Subtle Depth:** When elevation is required (e.g., for dropdowns or modals), use a "Hard Sharp" shadow: 4px offset, 0px blur, in a very light tint of the Secondary color (#1e293b at 10% opacity).
- **Interaction:** Hover states on interactive rows should use a subtle background tint (#f1f5f9) rather than a shadow, maintaining a flat, architectural feel.

## Shapes

The shape language is **Structured and Precise**. 

- **Corners:** Use a `Soft` (4px) radius for most UI elements. This provides a hint of approachability without losing the professional, rigid feel of a database.
- **Full Rounds:** Only used for status indicators (e.g., "Extinct" vs "Extant" badges) to distinguish them from actionable buttons.
- **Borders:** Use consistent 1px strokes. For high-priority data sections, use a 2px left-accent border in the Primary color to draw the eye.

## Components

### Buttons
- **Primary:** Solid #059669 with white text. 4px corner radius.
- **Secondary:** Transparent background with #1e293b border and text.
- **Ghost:** No border, #1e293b text, used for utility actions like "Export" or "Print."

### Data Tables (The Core Component)
- **Header:** Slate Gray (#1e293b) background with white `label-caps` text.
- **Rows:** Zebra-striping using #f8fafc and #ffffff.
- **Cells:** Use `body-sm` for standard data and `data-mono` for IDs and measurements.

### Taxonomic Chips
- Small, rounded-sm components used for classifications (e.g., "Phylum," "Class"). 
- Color-coded by rank using desaturated earth tones (e.g., Sage, Ochre, Terracotta) to avoid visual noise while providing categorical grouping.

### Input Fields
- Structured with a clear 1px border.
- Focus state: 2px border in Emerald Green (#059669) with no outer glow.
- Labels: Always positioned above the input using `label-caps` style for maximum clarity in dense forms.

### Specimen Cards
- Used for visual galleries. Features a large image container with a 1px border, followed by a title section using `headline-sm` for the common name and `scientific-name` for the Latin name.