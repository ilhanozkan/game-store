import { RefObject, useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type OpenDialog = { panel: HTMLElement; close: () => void };

// Open dialogs, innermost last. Only the top one reacts to Escape and Tab, so
// one key press never closes several overlays at once.
const openDialogs: OpenDialog[] = [];
let scrollLocks = 0;
let savedOverflow = "";

export const isDialogOpen = () => openDialogs.length > 0;

const lockScroll = () => {
  if (scrollLocks === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLocks += 1;
};

const unlockScroll = () => {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
};

const handleKeyDown = (event: KeyboardEvent) => {
  const top = openDialogs[openDialogs.length - 1];
  if (!top) return;

  if (event.key === "Escape") {
    event.preventDefault();
    top.close();
    return;
  }
  if (event.key !== "Tab") return;

  const items = Array.from(top.panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) {
    event.preventDefault();
    top.panel.focus();
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const insideItem =
    active instanceof HTMLElement &&
    active !== top.panel &&
    top.panel.contains(active);

  // Focus is on the panel itself, or escaped it (e.g. the focused button
  // was removed): bring it back to the first or last control.
  if (!insideItem) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
};

type Options = {
  // Where focus goes on close when the element that opened the dialog no
  // longer exists (e.g. a toast's button).
  returnFocusTo?: () => HTMLElement | null;
};

/**
 * Modal behaviour for drawers: moves focus inside when opened, keeps Tab
 * within the panel, closes on Escape, locks page scrolling, and returns
 * focus to whatever was focused before. The panel should have tabIndex={-1}.
 */
const useDialog = (
  ref: RefObject<HTMLElement>,
  active: boolean,
  onClose: () => void,
  { returnFocusTo }: Options = {}
) => {
  // Latest callbacks, so a new onClose identity doesn't re-run the effect
  // (which would move focus back to the first control).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const returnFocusRef = useRef(returnFocusTo);
  returnFocusRef.current = returnFocusTo;

  useEffect(() => {
    const panel = ref.current;
    if (!active || !panel) return undefined;

    const opener =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;
    const dialog = { panel, close: () => onCloseRef.current() };
    openDialogs.push(dialog);
    if (openDialogs.length === 1) {
      document.addEventListener("keydown", handleKeyDown);
    }
    lockScroll();
    (panel.querySelector<HTMLElement>(FOCUSABLE) || panel).focus();

    // When the focused control disappears (e.g. "Clear cart", or a quantity
    // stepped down to zero), keep focus inside the dialog.
    const keepFocus = () => {
      window.setTimeout(() => {
        if (document.activeElement === document.body && panel.isConnected) {
          panel.focus();
        }
      });
    };
    panel.addEventListener("click", keepFocus);
    panel.addEventListener("keyup", keepFocus);

    return () => {
      panel.removeEventListener("click", keepFocus);
      panel.removeEventListener("keyup", keepFocus);
      const index = openDialogs.indexOf(dialog);
      if (index !== -1) openDialogs.splice(index, 1);
      if (openDialogs.length === 0) {
        document.removeEventListener("keydown", handleKeyDown);
      }
      unlockScroll();

      // Only restore focus if it was lost with the dialog; navigation may
      // already have moved it to the new page.
      const current = document.activeElement;
      const focusLost =
        !current || current === document.body || panel.contains(current);
      if (!focusLost) return;
      const target =
        opener && opener.isConnected ? opener : returnFocusRef.current?.();
      target?.focus();
    };
  }, [ref, active]);
};

export default useDialog;
