// Cargar variables de entorno
import * as dotenv from 'dotenv';
import * as path from 'path';
import { z } from 'zod';

// Determinar el path del .env basado en si existe NODE_ENV
const isDev = process.env.NODE_ENV === 'development'
// En Electron empaquetado, el .env vive en la carpeta resources (fuera del asar)
// para que el usuario pueda editarlo. En dev y en el build headless se usa el
// comportamiento previo.
const envPath = isDev
  ? path.join(process.cwd(), '.env')
  : process.resourcesPath
    ? path.join(process.resourcesPath, '.env')
    : path.join(__dirname, "..", '.env');

console.log(`[envLoader] Environment path: ${envPath}`);

// PRIMERO cargar las variables
dotenv.config({ path: envPath });

// Validar variables de entorno (convirtiendo strings a los tipos correctos)
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  USE_AUTHENTICATION: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  USE_UI_TESTER: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  LOCALHOST_ONLY: z.string().transform(val => val === 'true').pipe(z.boolean()).default(true),
  USE_CONTEXT_ISOLATION: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  PUBLIC_ENDPOINTS: z.string().optional(),
  // 3000 es un puerto muy usado por otras apps de desarrollo (React, Grafana, etc.),
  // por eso el default queda en un puerto poco común.
  MAIN_SERVER_PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(50123),
  SCALE_SERIAL_ENABLED: z.string().transform(val => val === 'true').pipe(z.boolean()).default(true),
  SCALE_SERIAL_PORT: z.string().default('auto'),
  SCALE_SERIAL_BAUD_RATE: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(9600),
  SCALE_SERIAL_DATA_BITS: z.string().transform(val => parseInt(val, 10)).pipe(z.union([z.literal(7), z.literal(8)])).default(8),
  SCALE_SERIAL_STOP_BITS: z.string().transform(val => parseInt(val, 10)).pipe(z.union([z.literal(1), z.literal(2)])).default(1),
  SCALE_SERIAL_PARITY: z.union([
    z.literal('none'),
    z.literal('even'),
    z.literal('odd'),
    z.literal('mark'),
    z.literal('space')
  ]).default('none'),
  SCALE_SERIAL_REQUEST_COMMAND: z.string().optional(),
  SCALE_SERIAL_POLL_INTERVAL_MS: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(0),
  SCALE_SERIAL_MIN_DELTA: z.string().transform(val => parseFloat(val)).pipe(z.number()).default(0.5),
  SCALE_DEBOUNCING_TIME_MS: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(0),
  SCALE_SERIAL_WACK_WAIT_MS: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(5000),
  SCALE_SERIAL_IDLE_WACK_WAIT_MS: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(1000),
  WRITE_LOGS_TO_FILE: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  WRITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  INCREMENT_PATCH_VERSION_ON_BUILD: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
});

const envValidation = envSchema.safeParse(process.env);
if (!envValidation.success) {
  console.error(`[envLoader] Invalid environment variables: ${JSON.stringify(envValidation.error.format())}`);
  process.exit(1);
}

// Exportar las variables validadas y tipadas
export const env = envValidation.data;

console.log(`[envLoader] USE_CONTEXT_ISOLATION loaded: ${env.USE_CONTEXT_ISOLATION}`);
