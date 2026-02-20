import { useBackendStore } from "@/stores/backend"
import i18n from "@/plugins/i18n"

const backend = useBackendStore()

// see https://lokalise.com/blog/vue-i18n/

export const Trans = {
  get defaultLocale() {
    return import.meta.env.VITE_DEFAULT_LOCALE
  },

  get supportedLocales() {
    console.log("environment variables:", import.meta.env)
    const locales: string[] = import.meta.env.VITE_SUPPORTED_LOCALES.split(",")
    console.log("supported locales:", locales)
    return locales
  },

  get currentLocale() {
    return i18n.global.locale.value
  },

  set currentLocale(newLocale) {
    i18n.global.locale.value = newLocale
  },

  async switchLanguage(newLocale: typeof i18n.global.locale.value) {
    await Trans.loadLocaleMessages(newLocale)
    Trans.currentLocale = newLocale
    const htmlTag = document.querySelector("html")
    if (htmlTag) {
      htmlTag.setAttribute("lang", newLocale)
    }
    backend.selectedLocale = newLocale
  },

  async loadLocaleMessages(locale: typeof i18n.global.locale.value) {
    if (!i18n.global.availableLocales.includes(locale)) {
      const messages = await import(`@/i18n/locales/${locale}.json`)
      i18n.global.setLocaleMessage(locale, messages.default)
    }

    return nextTick()
  },

  isLocaleSupported(locale: string) {
    return Trans.supportedLocales.includes(locale)
  },

  getUserLocale() {
    const locale = window.navigator.language ||
      Trans.defaultLocale

    return {
      locale: locale,
      localeNoRegion: locale.split('-')[0]
    }
  },

  getPersistedLocale() {
    const persistedLocale: string | null = backend.selectedLocale

    if (persistedLocale && Trans.isLocaleSupported(persistedLocale)) {
      return persistedLocale
    } else {
      return null
    }
  },

  guessDefaultLocale() { // TODO: call this function when loading the App?
    const userPersistedLocale = Trans.getPersistedLocale()
    if (userPersistedLocale) {
      console.log("locale from local storage is", userPersistedLocale)
      return userPersistedLocale
    }

    const userPreferredLocale = Trans.getUserLocale()

    if (Trans.isLocaleSupported(userPreferredLocale.locale)) {
      return userPreferredLocale.locale
    }

    if (Trans.isLocaleSupported(userPreferredLocale.localeNoRegion)) {
      return userPreferredLocale.localeNoRegion
    }

    return Trans.defaultLocale
  },

  // async routeMiddleware(to, _from, next) {
  //   const paramLocale = to.params.locale

  //   if(!Trans.isLocaleSupported(paramLocale)) {
  //     return next(Trans.guessDefaultLocale())
  //   }

  //   await Trans.switchLanguage(paramLocale)

  //   return next()
  // },

  // i18nRoute(to) {
  //   return {
  //     ...to,
  //     params: {
  //       locale: Trans.currentLocale,
  //       ...to.params
  //     }
  //   }
  // }
}