// Parseo de argumentos de línea de comandos pasados al ejecutable.

// Soporta tanto "--screen=2" como "--screen 2". Devuelve un entero (puede
// ser inválido, ej. 0 o negativo) o undefined si no se pasó el argumento.
export const getScreenArg = (argv: string[] = process.argv): number | undefined => {
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        let rawValue: string | undefined;
        if (arg.startsWith('--screen=')) {
            rawValue = arg.slice('--screen='.length);
        } else if (arg === '--screen') {
            rawValue = argv[i + 1];
        }

        if (rawValue !== undefined) {
            const value = Number(rawValue);
            if (Number.isInteger(value)) return value;
        }
    }
    return undefined;
};
