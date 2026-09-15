import { router } from "expo-router";

type Href = Parameters<typeof router.push>[0];
type PushOptions = Parameters<typeof router.push>[1];

// Time windows for dropping accidental double-taps.
const PUSH_WINDOW_MS = 800;
const BACK_WINDOW_MS = 500;

let installed = false;
let lastPushKey = "";
let lastPushAt = 0;
let lastBackAt = 0;

function hrefKey(href: Href): string {
  if (typeof href === "string") return href;
  try {
    return JSON.stringify(href);
  } catch {
    return String(href);
  }
}

type MutableRouter = {
  push: typeof router.push;
  replace: typeof router.replace;
  back: typeof router.back;
  dismiss: typeof router.dismiss;
};

// Wraps the expo-router singleton so a rapid double-tap navigates once.
// Same-target push/replace within the window is dropped; back/dismiss share
// a short global window. Idempotent — safe to call more than once
// (e.g. Fast Refresh re-evaluating the root layout module).
export function installNavigationGuard() {
  if (installed) return;
  installed = true;

  const mutable = router as unknown as MutableRouter;
  const origPush = router.push.bind(router);
  const origReplace = router.replace.bind(router);
  const origBack = router.back.bind(router);
  const origDismiss = router.dismiss.bind(router);

  const shouldDropPush = (kind: "push" | "replace", href: Href): boolean => {
    const now = Date.now();
    const key = `${kind}:${hrefKey(href)}`;
    if (key === lastPushKey && now - lastPushAt < PUSH_WINDOW_MS) return true;
    lastPushKey = key;
    lastPushAt = now;
    return false;
  };

  mutable.push = ((href: Href, options?: PushOptions) => {
    if (shouldDropPush("push", href)) return;
    origPush(href, options);
  }) as typeof router.push;

  mutable.replace = ((href: Href, options?: PushOptions) => {
    if (shouldDropPush("replace", href)) return;
    origReplace(href, options);
  }) as typeof router.replace;

  const shouldDropBack = (): boolean => {
    const now = Date.now();
    if (now - lastBackAt < BACK_WINDOW_MS) return true;
    lastBackAt = now;
    return false;
  };

  mutable.back = (() => {
    if (shouldDropBack()) return;
    origBack();
  }) as typeof router.back;

  mutable.dismiss = ((count?: number) => {
    if (shouldDropBack()) return;
    origDismiss(count);
  }) as typeof router.dismiss;
}
