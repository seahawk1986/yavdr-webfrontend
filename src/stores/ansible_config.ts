import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
    state: () => ({
        schema: null as any,
        data: {} as any,
    }),

    actions: {
        loadSchema(schema: any) {
            this.schema = schema;
            this.data = extractDefaults(schema);
        },

        setValue(path: (string | number)[], value: any) {
            if (path.length === 0) return;

            // Den letzten Key isolieren, um TS-Sicherheit zu garantieren
            const lastKey = path.pop()!;

            // Mit reduce zum Ziel-Objekt navigieren (und Struktur aufbauen)
            const target = path.reduce((obj, key, i) => {
                const nextKey = path[i + 1] ?? lastKey;
                obj[key] ??= typeof nextKey === 'number' ? [] : {};
                return obj[key];
            }, this.data);

            target[lastKey] = value;
        },

        getValue(path: (string | number)[]) {
            // Nutzt den Optional-Chaining-Ansatz, den du bereits hattest
            return path.reduce((o, k) => o?.[k], this.data);
        },
    },
});


function extractDefaults(schema: any): any {
    if (schema.default !== undefined) {
        return structuredClone(schema.default)
    }

    if (schema.anyOf) {
        const preferred = schema.anyOf.find((s: any) => s.type !== 'null')
        return extractDefaults(preferred)
    }

    if (schema.type === 'object') {
        const o: any = {}
        for (const k in schema.properties ?? {}) {
            o[k] = extractDefaults(schema.properties[k])
        }
        return o
    }

    if (schema.type === 'array') return []

    if (schema.type === 'boolean') return false
    if (schema.type === 'number' || schema.type === 'integer') return null
    if (schema.type === 'string') return ''

    return null
}
