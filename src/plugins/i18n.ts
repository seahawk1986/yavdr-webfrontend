import { createI18n } from "vue-i18n";

export default createI18n({
    locale: 'de',
    fallbackLocale: 'en',
    messages: {
        en: {
            actions: {
                reload: 'reload',
                loadingData: 'loading {what} ...',
                openNavbar: 'toggle navigation menu',
            },
            category: {
                timer: 'Timer | Timers',
                recording: 'Recording | Recordings',
                setup: 'Setup',
                channels: 'Channels',
                epg: 'EPG',
            },
            channels: {
                channelGroup: "channel group",
                createGroup: "New channel group",
                editGroup: "Edit channel group",
                moveToPosition: 'insert channel "{name}" on position',
                appendChannel: "append to vdr channel list",
                insertChannel: "insert channel",
                channelNumber: "channel number",
            },
            errors: {
                loadingFailed: 'loading {what} failed'
            },
            info: {
                state: 'state',
                date: 'date',
                duration: 'duration',
                title: 'title',
                channel: 'channel',
            },
            systeminfo: {
                SystemInfo: 'System Info',
                Memory: 'Memory',
                CPU: 'CPU',
                DiskUsage: 'Disk Usage',
                Fans: 'Fans',
                Temperature: 'Temperature | Temperatures',
                Core: 'Core',
                Usage: 'Usage',
                Type: 'Type',
                Device: 'Device | Devices',
                Mount: 'Mountpoint | Mountpoints',
                Sensor: 'Sensor',
                RPM: 'RPM'
            },
            recording: {
                isEdited: 'edited',
                isNew: 'new'
            },
            timer: {
                status: {
                    inactive: 'disabled',
                    recording: 'recording',
                    pending: 'pending',
                    unknown: 'unknown'
                },
                noTimers: 'no timers'
            }
        },
        de: {
            actions: {
                reload: 'neu laden',
                loadingData: 'Lade {what} ...',
                openNavbar: 'Navigationsmenü',
            },
            channels: {
                channelGroup: "Kanalgruppe",
                createGroup: "Neue Kanalgruppe erstellen",
                editGroup: "Kanalgruppe bearbeiten",
                moveToPosition: 'Kanal "{name}" an Position einfügen',
                appendChannel: "An Kanalliste des VDR anfügen",
                insertChannel: "in Kanalliste einfügen",
                channelNumber: "Kanalnummer",
            },
            errors: {
                loadingFailed: 'Laden der {what} fehlgeschlagen'
            },
            category: {
                timer: 'Timer',
                recording: 'Aufnahme | Aufnahmen',
                setup: 'Setup',
                channels: 'Kanäle',
                epg: 'EPG',
            },
            info: {
                state: 'Status',
                date: 'Datum',
                duration: 'Länge',
                title: 'Titel',
                channel: 'Kanal | Kanäle',
            },
            systeminfo: {
                SystemInfo: 'System Info',
                Memory: 'Speicher',
                CPU: 'CPU',
                DiskUsage: 'Plattenbelegung',
                Fans: 'Lüfter',
                Temperature: 'Temperatur | Temperaturen',
                Core: 'Kern',
                Usage: 'Auslastung',
                Type: 'Typ',
                Device: 'Gerät | Geräte',
                Mount: 'Einhängepunkt | Einhängepunkte',
                Sensor: 'Sensor',
                RPM: 'U/min'
            },
            recording: {
                isEdited: 'geschnitten',
                isNew: 'neu'
            },
            timer: {
                status: {
                    inactive: 'deaktiviert',
                    recording: 'Aufnahme läuft',
                    pending: 'anstehend',
                    unknown: 'unbekannt'
                },
                noTimers: 'keine Timer'
            }
        }
    }
})