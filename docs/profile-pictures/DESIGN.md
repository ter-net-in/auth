---
name: ter.net.in shared profile presentation
description: Auth-managed identity within the inherited blue operational UI.
colors:
  primary: "#0047ff"
  primary-dark: "#8aabff"
  background: "#f8fafc"
  background-dark: "#101217"
  foreground: "#0b1020"
  foreground-dark: "#f8fafc"
  card: "#ffffff"
  card-dark: "#181b22"
  muted: "#f3f6fb"
  muted-dark: "#20252e"
  muted-foreground: "#5f6b7a"
  muted-foreground-dark: "#a7afbc"
  border: "rgba(15, 23, 42, 0.14)"
  border-dark: "rgba(226, 232, 240, 0.14)"
  ring: "#0047ff"
  ring-dark: "#7aa2ff"
  action: "#216ce1"
  action-end: "#0854cc"
  action-border: "#064aba"
  action-foreground: "#ffffff"
typography:
  title:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
    lineHeight: 1.5
  label:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  control: "0.375rem"
  surface: "0.5rem"
spacing:
  inline: "0.5rem"
  identity: "0.75rem"
  group: "1rem"
  section: "1.5rem"
components:
  button-primary:
    textColor: "{colors.action-foreground}"
    rounded: "{rounded.control}"
    height: "2.25rem"
    padding: "0 0.875rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: "2.25rem"
    padding: "0 0.875rem"
  profile-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.surface}"
    padding: "1.5rem"
  avatar:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    width: "2.5rem"
    height: "2.5rem"
---

# Design System: ter.net.in shared profile presentation

## Overview

**Creative North Star: "Operate"**

This scoped record captures the finished shared-picture extension inside the established compact, Cloudflare-inspired blue application UI. It extends the approved shared UI specification; it does not establish a new product-wide visual identity. Source values below are shared by Auth, Mail, and Rok. Light and dark frontmatter entries record the existing theme counterparts; components consume the active semantic CSS variables.

Pictures add recognition to existing account and sender information. Auth owns editing, while Mail and Rok keep their familiar task layouts. The avatar is supporting identity information rather than a badge of trust.

**Key Characteristics:**

- Compact sans typography and sentence-case actions.
- Blue actions and focus on neutral, bordered surfaces.
- Circular pictures and initials with equivalent layout footprints.
- One Auth editor with quiet reuse in each application.

## Colors

### Primary

House blue marks links, focus, and native crop controls. The existing primary-button gradient uses the action, action-end, action-border, and action-foreground tokens; its full treatment is preserved in the sidecar. Keep this incumbent gradient when composing picture actions.

### Neutral

Background and card distinguish the page from its static surfaces. Muted supplies the avatar fallback ground, muted-foreground supplies initials and supporting copy, and the translucent border defines edges. Dark counterparts retain the same roles. Existing success and danger alerts continue to use the applications' semantic feedback tokens; this extension adds no status palette.

## Typography

**Body Font:** Inter with the shipped system sans fallbacks.

Card titles use the compact title role; instructions, identity names, and actions use body and label roles. Mail sender metadata keeps its existing smaller text. Crop percentages use tabular numerals so changing values do not disturb alignment. Pictures introduce no display face or new heading hierarchy.

## Layout

Use the existing application containers and navigation. Auth places a single profile card before the account or administration content. Its saved-picture row pairs the image with name and help; the editor replaces that row with a circular preview and labelled ranges. The crop stacks on narrow screens and pairs preview with controls at the existing small-screen breakpoint. Footer actions wrap.

Mail uses a small account-trigger image, a normal account identity in settings, and a sender image beside existing list and detail content. Rok places its own identity and edit link in the Workspace header. Preserve the text's available width with shrinking text containers; long addresses wrap in detail and retain their full-address title in the list.

## Elevation & Depth

Profile cards and avatars have borders without ambient shadows. Mail settings inherits the existing modal surface. The only recorded elevation vocabulary is the incumbent popup and modal roles, with theme-specific values in the sidecar.

**The Role-Owned Depth Rule.** Elevation belongs to the floating component role; picture presence does not add elevation.

## Shapes

Controls retain the control radius and cards/dialogs retain the surface radius. Avatars and the crop preview remain fully circular. Images fill their bounds with cover cropping. The initials fallback has the same border, background, circle, and dimensions as its image state.

## Components

### Buttons and edit links

Choose/Replace uses outline, Save uses the existing primary gradient, and Cancel crop/Remove uses ghost. Busy states disable the controls and replace action copy with progress text. Auth footer actions and Mail/Rok edit links provide a minimum mobile height of 44px and return to the existing compact height on wider screens. Edit links are blue and underlined, open Auth in a new tab, and retain visible keyboard focus.

### Profile avatar

The shared source-owned Avatar defaults to 40px; Mail's account trigger uses 28px and sender rows use 36px. Auth's saved editor preview uses 96px and its crop preview uses 160px. These are placement sizes rather than a new global size scale. Photos refresh when the app regains visible focus. Missing or unavailable pictures show up to two uppercase initials, with a question mark when no name is available. The avatar is decorative to assistive technology; nearby text and named parent controls provide identity and purpose.

**The Equivalent Footprint Rule.** Loading, missing, failed, and removed pictures retain the image state's circle and allocated space.

### Picture editor

One bordered Auth card contains selection, preview, crop controls, feedback, and actions. Native ranges expose Zoom, Horizontal position, and Vertical position with visible percentages and keyboard focus. Reading/saving/removing provides text feedback. A failed save keeps the current crop available for retry; confirmed save or removal returns to the identity row.

### Sender identity

Known ter.net.in members may have a picture beside the existing sender name and original address. Keep the original address in the information hierarchy and preserve plain-text message presentation.

**The Address Remains Rule.** A sender picture supplements the sender address and never indicates sender verification.

## Do's and Don'ts

### Do:

- **Do** reuse the same circular Avatar and equivalent initials fallback across all three apps.
- **Do** keep Auth as the single editor and link to it from Mail settings and the Rok Workspace header.
- **Do** preserve labelled native crop controls, visible focus, inline feedback, and the pending crop after a failed save.
- **Do** retain sender addresses beside pictures and preserve the active theme's semantic colors.

### Don't:

- **Don't** turn a user picture into a verified-sender badge.
- **Don't** add decorative elevation or public-page corner brackets to profile surfaces.
- **Don't** treat the synthetic solid-color screenshot fixtures as product assets or brand colors.

Evidence: [Auth editor](../../apps/web/src/components/profile-picture-editor.tsx), [crop controls](../../apps/web/src/components/picture-crop.tsx), [Avatar](../../apps/web/src/ui/avatar.tsx), [theme](../../apps/web/src/theme/globals.css), [Mail settings](https://github.com/ter-net-in/mail/blob/main/apps/web/src/components/settings.tsx), [Mail workspace](https://github.com/ter-net-in/mail/blob/main/apps/web/src/components/webmail.tsx), and [Rok Workspace](https://github.com/ter-net-in/rok/blob/main/apps/web/src/app/page.tsx). [Feature contract](../../SPEC-profile-pictures.md) and [independent finish review](FINISH-REVIEW.md) provide the scoped acceptance context. Existing technical docs remain at each repository's `docs/profile-pictures.md`.
