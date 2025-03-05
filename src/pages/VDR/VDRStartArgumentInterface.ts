export interface ArgumentFileInterface {
    filename: string,
    name: string,
    prio: number,
    enabled: boolean,
    static: boolean,
    args: string,
    help?: string,
    warning?: string,
}

export interface ArgumentSaveInterface {
    name: string,
    prio: number,
    enabled: boolean,
    static: boolean,
    args: string,
}

export interface startArgumentsInterface {
    [name: string]: ArgumentFileInterface[],
}