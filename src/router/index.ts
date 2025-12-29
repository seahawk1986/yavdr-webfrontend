/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import {
  createRouter,
  createWebHistory,
  type NavigationFailure,
  type RouteLocationNormalizedLoaded,
} from "vue-router";
import { setupLayouts } from "virtual:generated-layouts";
import { routes } from "vue-router/auto-routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError(
  (err: NavigationFailure | Error, to?: RouteLocationNormalizedLoaded) => {
    if (
      err?.message?.includes?.("Failed to fetch dynamically imported module")
    ) {
      if (!localStorage.getItem("vuetify:dynamic-reload")) {
        console.log("Reloading page to fix dynamic import error");
        localStorage.setItem("vuetify:dynamic-reload", "true");

        if (to) {
          location.assign(to.fullPath);
        } else {
          // fallback if route info isn’t available
          location.reload();
        }
      } else {
        console.error(
          "Dynamic import error, reloading page did not fix it",
          err
        );
      }
    } else {
      console.error(err);
    }
  }
);

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
