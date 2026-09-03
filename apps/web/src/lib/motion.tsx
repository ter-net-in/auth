'use client';

import { type HTMLMotionProps, motion, type Transition, useReducedMotion, type Variants } from 'motion/react';
import * as React from 'react';

/**
 * Shared motion language for internet-ui.
 *
 * Every component here is still a Base UI component: Motion is applied through
 * Base UI's `render` prop, so the primitive keeps its behaviour, accessibility and
 * state attributes, and only gains an animated element to render into.
 *
 * The house style is crisp, not bouncy: short ease-out curves for surfaces that
 * appear, springs reserved for controls the user toggles or drags. Sharp corners
 * and Helvetica don't want overshoot.
 *
 * HOW POPUP EXIT ANIMATIONS WORK — read this before changing anything here.
 *
 * Base UI unmounts a closed popup only once `element.getAnimations()` reports
 * nothing running. That one behaviour is what lets these components animate out
 * while staying uncontrolled — no `AnimatePresence`, no `keepMounted`, and no
 * `open` state lifted into the consumer's component. Two rules fall out of it:
 *
 *  1. Every exit animation must include `opacity`. It's the property Base UI can
 *     reliably see, because Motion drives it through the Web Animations API. A
 *     transform-only or height-only animation is invisible to that check, and the
 *     element gets torn out of the DOM on the frame it starts leaving.
 *  2. Popups use duration-based tweens, never springs. Springs settle
 *     asymptotically, so `getAnimations()` stays non-empty for ~250ms after a
 *     spring *looks* done — leaving an invisible popup mounted, still holding its
 *     focus scope. Springs are free to use anywhere that stays mounted.
 *
 * WHAT DELIBERATELY ISN'T HERE
 *
 * A few parts animate in CSS instead, and not for lack of trying:
 *
 *  - Accordion and Collapsible panels. Base UI tears an in-flow panel out of the
 *    DOM as soon as its CSS transition ends, and checks for one earlier than
 *    Motion — which starts animating in an effect after paint — can register. A
 *    Motion panel expands correctly and then vanishes instead of collapsing.
 *  - Drawer and Toast. Both implement swipe gestures by publishing the pointer
 *    delta as CSS variables and expecting `transform` to be composed from them.
 *    A `motion.div` owns `transform`, so the sheet would stop tracking the finger.
 *  - The Tabs indicator, and Progress/Meter fills. Their target geometry arrives
 *    as a CSS variable or an inline style. Motion can't re-run an animation when
 *    the value behind a `var()` changes, because the target string it compares
 *    never changes.
 *
 * Each of those files says so at the point of use.
 */

/** Cubic-bezier curves used across the library. */
export const easings = {
  /** Decelerate hard. Default for anything entering. */
  out: [0.22, 1, 0.36, 1],
  /**
   * Accelerate away. Default for anything leaving. Kept mild on purpose — a
   * steeper ease-in barely moves for the first half of a 150ms exit, which reads
   * as the popup hesitating before it closes.
   */
  in: [0.4, 0, 1, 1],
  /** Symmetric. For size and position changes on things already on screen. */
  inOut: [0.32, 0.72, 0, 1]
} as const satisfies Record<string, [number, number, number, number]>;

/** Seconds. Deliberately short — this library should feel immediate. */
export const durations = {
  instant: 0.1,
  fast: 0.15,
  base: 0.2,
  slow: 0.28
} as const;

export const transitions = {
  /** A surface appearing: popovers, menus, dialogs, tooltips. */
  enter: { duration: durations.base, ease: easings.out },
  /** The same surface leaving. Quicker than entering — get out of the way. */
  exit: { duration: durations.fast, ease: easings.in },
  /** Opacity-only crossfades: backdrops, indicators, text swaps. */
  fade: { duration: durations.fast, ease: 'linear' },
  /** Height and width changes: accordion and collapsible panels. */
  size: { duration: durations.slow, ease: easings.inOut },
  /** Toggle controls that stay mounted: switch thumb, checkbox tick. */
  control: { type: 'spring', stiffness: 700, damping: 32, mass: 0.5 },
  /** Indicators that travel between siblings: tabs, toggle groups. */
  indicator: { type: 'spring', stiffness: 550, damping: 42, mass: 0.9 },
  /** Larger surfaces sliding into place: toasts. */
  surface: { type: 'spring', stiffness: 420, damping: 38, mass: 0.9 }
} as const satisfies Record<string, Transition>;

/**
 * Minimal shape of the state Base UI passes to a `render` callback. `side` is
 * typed loosely so this stays assignable to every component's own state type.
 */
export interface PopupMotionState {
  open: boolean;
  side?: string;
}

export interface PopupMotionOptions {
  /**
   * Scale the surface grows from. `1` opts out of scaling.
   * @default 0.96
   */
  scale?: number;
  /**
   * Distance in px the surface travels toward its anchor as it appears. The
   * direction comes from the `side` the positioner reports, so a popup anchored
   * below its trigger slides down into place.
   * @default 4
   */
  offset?: number;
  /** Overrides the enter transition. */
  transition?: Transition;
  /** Overrides the exit transition. */
  exitTransition?: Transition;
}

/** Motion props derived from a Base UI open state. */
export interface StateMotionProps {
  initial: string;
  animate: string;
  variants: Variants;
}

function offsetFor(side: string | undefined, offset: number) {
  switch (side) {
    case 'top':
      return { y: offset };
    case 'bottom':
      return { y: -offset };
    case 'left':
    case 'inline-start':
      return { x: offset };
    case 'right':
    case 'inline-end':
      return { x: -offset };
    default:
      return {};
  }
}

/**
 * Enter/exit animation for a popup surface, driven by Base UI's open state.
 *
 * Prefer {@link useMotionPopupRender}, which wires this into a `render` prop.
 * Reach for this hook directly when a popup needs extra motion props of its own.
 *
 * Honours `prefers-reduced-motion` by collapsing to a plain crossfade — which
 * keeps unmount deferral intact, since opacity is still animated.
 */
export function usePopupMotion(options: PopupMotionOptions = {}) {
  const { scale = 0.96, offset = 4, transition = transitions.enter, exitTransition = transitions.exit } = options;
  const reduceMotion = useReducedMotion();

  return React.useCallback(
    (state: PopupMotionState): StateMotionProps => ({
      initial: 'closed',
      animate: state.open ? 'open' : 'closed',
      variants: {
        closed: reduceMotion
          ? { opacity: 0, transition: exitTransition }
          : { opacity: 0, scale, ...offsetFor(state.side, offset), transition: exitTransition },
        open: { opacity: 1, scale: 1, x: 0, y: 0, transition }
      }
    }),
    [reduceMotion, scale, offset, transition, exitTransition]
  );
}

/**
 * `render` prop that animates a popup surface in and out.
 *
 * ```tsx
 * const renderPopup = useMotionPopupRender();
 * return <Popover.Popup render={renderPopup} className="..." />;
 * ```
 */
export function useMotionPopupRender(options?: PopupMotionOptions) {
  const popupMotion = usePopupMotion(options);

  return React.useCallback(
    (props: React.HTMLAttributes<HTMLElement>, state: PopupMotionState) => (
      <motion.div {...(props as HTMLMotionProps<'div'>)} {...popupMotion(state)} />
    ),
    [popupMotion]
  );
}

/**
 * `render` prop for backdrops and scrims, where scaling or sliding would be
 * wrong and only a crossfade is wanted.
 */
export function useMotionBackdropRender(transition: Transition = transitions.fade) {
  const backdropMotion = React.useCallback(
    (state: { open: boolean }): StateMotionProps => ({
      initial: 'closed',
      animate: state.open ? 'open' : 'closed',
      variants: {
        closed: { opacity: 0, transition },
        open: { opacity: 1, transition }
      }
    }),
    [transition]
  );

  return React.useCallback(
    (props: React.HTMLAttributes<HTMLElement>, state: { open: boolean }) => (
      <motion.div {...(props as HTMLMotionProps<'div'>)} {...backdropMotion(state)} />
    ),
    [backdropMotion]
  );
}

/**
 * Press feedback for buttons and other pressable controls.
 *
 * Returns props for a `motion` element. Disabled entirely under reduced motion —
 * a scale on press is exactly the kind of movement that setting asks us to drop.
 */
export function useTapMotion(scale = 0.97) {
  const reduceMotion = useReducedMotion();

  return React.useMemo(
    () =>
      reduceMotion
        ? {}
        : {
            whileTap: { scale },
            transition: { duration: durations.instant, ease: easings.out } satisfies Transition
          },
    [reduceMotion, scale]
  );
}

/**
 * Spring config for a control that stays mounted, softened to a quick fade when
 * the user asks for reduced motion.
 */
export function useControlTransition(transition: Transition = transitions.control): Transition {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? transitions.fade : transition;
}
