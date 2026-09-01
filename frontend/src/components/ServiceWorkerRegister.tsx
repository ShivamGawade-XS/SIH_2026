"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        })
        .catch(() => {});

      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => {
            for (const key of keys) {
              caches.delete(key).catch(() => {});
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  return null;
}
