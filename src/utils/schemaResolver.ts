

// Resolve $ref and simplify schema for UI rendering.
export async function resolveSchemaAndDefaults(schema: any) {
    // Schema is already expanded by Pydantic
    return schema
}


// Extract defaults from a dereferenced schema. This function attempts to
// produce a data object matching the schema with sensible defaults.
export function extractDefaultsFromResolved(schema: any): any {
    // If explicit default exists, clone and return
    if (schema && 'default' in schema) {
        return deepClone(schema.default)
    }


    if (!schema) return null


    if (schema.anyOf && Array.isArray(schema.anyOf)) {
        // Prefer an option that has a default, else choose the first non-null
        for (const option of schema.anyOf) {
            if (option && 'default' in option) return deepClone(option.default)
        }
        // pick option with type not 'null'
        const preferred = schema.anyOf.find((o: any) => !(o && o.type === 'null'))
        return extractDefaultsFromResolved(preferred ?? schema.anyOf[0])
    }


    if (schema.type === 'object') {
        const obj: any = {}
        const props = schema.properties ?? {}
        for (const key of Object.keys(props)) {
            obj[key] = extractDefaultsFromResolved(props[key])
        }
        return obj
    }


    if (schema.type === 'array') {
        // If default present was handled above. Otherwise start with empty array.
        return []
    }


    // primitives
    switch (schema.type) {
        case 'string':
            return schema.default ?? ''
        case 'integer':
        case 'number':
            return schema.default ?? null
        case 'boolean':
            return schema.default ?? false
        default:
            return null
    }
}


function deepClone(v: any) {
    return JSON.parse(JSON.stringify(v))
}