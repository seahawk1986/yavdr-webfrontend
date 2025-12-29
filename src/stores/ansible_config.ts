import { defineStore } from 'pinia'
// import { resolveSchemaAndDefaults, extractDefaultsFromResolved } from '@/utils/schemaResolver'


// export const useConfigStore = defineStore('config', {
//     state: () => ({
//         rawSchema: null as any,
//         resolvedSchema: null as any,
//         data: {} as Record<string, any>,
//     }),


//     actions: {
//         async loadSchema(schema: any) {
//             this.rawSchema = schema
//             this.resolvedSchema = await resolveSchemaAndDefaults(schema)
//             this.data = extractDefaultsFromResolved(this.resolvedSchema)
//         },


//         updateValue(path: Array<string | number>, value: any) {
//             if (!Array.isArray(path) || path.length === 0) return
//             let target: any = this.data
//             for (let i = 0; i < path.length - 1; i++) {
//                 const key = path[i]
//                 if (target[key] === undefined) {
//                     // create object or array depending on next key
//                     const nextKey = path[i + 1]
//                     target[key] = typeof nextKey === 'number' ? [] : {}
//                 }
//                 target = target[key]
//             }
//             const lastKey = path[path.length - 1]
//             target[lastKey] = value
//         },


//         getValue(path: Array<string | number>) {
//             let target: any = this.data
//             for (const key of path) {
//                 if (target == null) return undefined
//                 target = target[key]
//             }
//             return target
//         },
//     },
// })


export const useConfigStore = defineStore('config', {
    state: () => ({
        schema: null as any,
        data: {} as any,
    }),

    actions: {
        loadSchema(schema: any) {
            this.schema = schema
            this.data = extractDefaults(schema)
        },

        setValue(path: (string | number)[], value: any) {
            let obj = this.data
            for (let i = 0; i < path.length - 1; i++) {
                const k = path[i]
                obj[k] ??= typeof path[i + 1] === 'number' ? [] : {}
                obj = obj[k]
            }
            obj[path[path.length - 1]] = value
        },

        getValue(path: (string | number)[]) {
            return path.reduce((o, k) => o?.[k], this.data)
        },
    },
})

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
