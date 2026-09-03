/**
 * Project-wide default variants.
 *
 * The `internet-ui` CLI substitutes these values from the `defaults` block of your
 * internet-ui.json when it writes this file, so a project can pick its own house
 * style once instead of passing `radius`/`shadow` at every call site. Editing this
 * file by hand afterwards is expected and supported — it's your code.
 *
 * To re-apply internet-ui.json after changing it: `internet-ui add ui-defaults -o`
 *
 * Every component leaves its `radius`/`shadow` prop undefined by default, which makes
 * cva fall back to the `defaultVariants` in utils.ts — and those read from here.
 */
export const UI_DEFAULTS = {
  /** default for pill/circle-friendly controls: none | sm | md | lg | full */
  radius: 'md',
  /** default for boxy surfaces (dialogs, menus, cards): none | sm | md | lg */
  containerRadius: 'md',
  /** default for raised surfaces (dialogs, popovers, toasts): none | sm | md | lg | xl */
  shadow: 'md'
} as const;
