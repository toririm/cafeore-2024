/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  const rootElement = document.querySelector("#app");
  if (!rootElement) {
    throw new Error(
      'Could not find an element with the id of "app" in the document',
    );
  }
  hydrateRoot(
    rootElement,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
