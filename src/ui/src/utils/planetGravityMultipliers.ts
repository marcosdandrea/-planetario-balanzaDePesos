export const PLANET_GRAVITY_MULTIPLIERS = {
    sol: 27.94,
    mercurio: 0.38,
    venus: 0.91,
    tierra: 1,
    luna: 0.165,
    marte: 0.38,
    jupiter: 2.34,
    saturno: 1.06,
    urano: 0.92,
    neptuno: 1.19,
} as const;

export type CelestialBodyId = keyof typeof PLANET_GRAVITY_MULTIPLIERS;

export const getGravityMultiplierByBody = (bodyId: string | null): number => {
    if (!bodyId) return PLANET_GRAVITY_MULTIPLIERS.tierra;
    return PLANET_GRAVITY_MULTIPLIERS[bodyId as CelestialBodyId] ?? PLANET_GRAVITY_MULTIPLIERS.tierra;
};