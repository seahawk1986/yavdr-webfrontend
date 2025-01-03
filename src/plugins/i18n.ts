import { createI18n } from "vue-i18n";

export default createI18n({
    locale: import.meta.env.VITE_DEFAULT_LOCALE,
    fallbackLocale: import.meta.env.VITE_FALLBACK_LOCALE,
    legacy: false,
    messages: {
        en: {
            actions: {
                reload: 'reload',
                loadingData: 'loading {what} ...',
                openNavbar: 'toggle navigation menu',
                close: 'close',
                open: 'öffnen',
                uploadLabel: 'upload file',
                uploadSuccessful: 'Upload successful',
                cancel: 'Cancel',
                save: 'save',
                saveChanges: 'save changes',
                commit: 'commit',
                search: "search",
                searchObj: "search {what}",
                download: "download",
                upload: "upload",
                uploadSth: "upload {what}",
                loadSth: "load {what}",
                logout: "logout",
                shutdown: "Poweroff",
                delete: "delete",
            },
            category: {
                SystemInfo: 'System Info',
                displaySettings: 'Display Settings',
                audioSettings: 'Audio Settings',
                timer: 'Timer | Timers',
                recording: 'Recording | Recordings',
                setup: 'Setup',
                channels: 'Channels',
                epg: 'EPG',
                entry: 'Entry',
                editor: "{what} Editor",
            },
            channels: {
                channelNumberN: "channel number {number}",
                channelGroup: "channel group",
                createGroup: "New channel group",
                createNewChannelGroup: "Create new channel group",
                editGroup: "Edit channel group",
                group: "Group",
                location: "Location",
                source: "Source",
                changePosition: 'move channel {name} to a new position',
                moveToPosition: 'insert channel "{name}" on position',
                appendChannel: "append to vdr channel list",
                insertChannel: "insert channel",
                moveChannel: "move channel",
                channelNumber: "channel number",
                scrollToNewPosition: "scroll to new position",
                reloadVDRChannels: "reload VDR channels",
                deleteChannel: "delete channel {what}",
                selection: "choose a channel",
                switchto: "witch to channel {channel}",
            },
            errors: {
                loadingFailed: 'loading {what} failed'
            },
            descriptions: {
                draghandle: 'handle to drag and drop the channel {name}'
            },
            info: {
                state: 'state',
                date: 'date',
                duration: 'duration',
                title: 'title',
                channel: 'channel',
            },
            log: {
                autoscroll: 'automatically scroll to newest log entry',
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
            remote: {
                hideRemote: "hide remote control",
                showRemote: "show remote control",
            },
            timer: {
                status: {
                    inactive: 'disabled',
                    recording: 'recording',
                    pending: 'pending',
                    unknown: 'unknown'
                },
                createTimer: "create timer for {entry} from {start} to {end}",
                noTimers: 'no timers'
            },
        },
        de: {
            actions: {
                reload: 'neu laden',
                loadingData: 'Lade {what} ...',
                openNavbar: 'Navigationsmenü',
                close: 'Schließen',
                open: 'öffnen',
                uploadSuccessful: 'Upload erfolgreich',
                cancel: 'Abbrechen',
                save: 'Speichern',
                saveChanges: 'Änderungen übernehmen',
                commit: 'Übernehmen',
                search: "Suchen",
                searchObj: "Suche {what}",
                download: "Herunterladen",
                upload: "Hochladen",
                uploadSth: "{what} hochladen",
                loadSth: "{what} laden",
                logout: "Abmelden",
                shutdown: "Herunterfahren",
                delete: "Löschen",
            },
            channels: {
                channelNumberN: "Kanalnummer {number}",
                channelGroup: "Kanalgruppe",
                createGroup: "Kanalgruppe erstellen",
                createNewChannelGroup: "Neue Kanalgruppe erstellen",
                editGroup: "Kanalgruppe bearbeiten",
                group: "Gruppe",
                location: "Position",
                source: "Quelle",
                moveToPosition: 'Kanal "{name}" verschieben',
                changePosition: 'Kanal {name} an eine neue Position verschieben',
                appendChannel: "An Kanalliste des VDR anfügen",
                insertChannel: "in Kanalliste einfügen",
                moveChannel: "Kanal verschieben",
                channelNumber: "Kanalnummer",
                scrollToNewPosition: "An neue Position scrollen",
                reloadVDRChannels: "VDR Kanäle neu laden",
                deleteChannel: "Kanal {what} löschen",
                selection: "Kanal auswählen",
                switchto: "Zum Kanal {channel} umschalten",
            },
            descriptions: {
                draghandle: 'Anfasser, um den Kanal {name} auszuwählen oder per Drag and Drop zu bewegen'
            },
            errors: {
                loadingFailed: 'Laden der {what} fehlgeschlagen'
            },
            category: {
                displaySettings: 'Anzeige',
                audioSettings: 'Audio',
                timer: 'Timer',
                recording: 'Aufnahme | Aufnahmen',
                setup: 'Setup',
                channels: 'Kanäle',
                epg: 'EPG',
                entry: 'Eintrag',
                editor: "{what} Editor",
            },
            info: {
                state: 'Status',
                date: 'Datum',
                duration: 'Länge',
                title: 'Titel',
                channel: 'Kanal | Kanäle',
            },
            log: {
                autoscroll: 'Automatisch zum neuesten Eintrag scrollen',
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
            remote: {
                hideRemote: "Fernbedienung ausblenden",
                showRemote: "Fernbedienung einblenden",
            },
            timer: {
                status: {
                    inactive: 'deaktiviert',
                    recording: 'Aufnahme läuft',
                    pending: 'anstehend',
                    unknown: 'unbekannt'
                },
                noTimers: 'keine Timer',
                createTimer: "Timer für {entry} von {start} bis {end} anlegen",
            },
        }
    }
})