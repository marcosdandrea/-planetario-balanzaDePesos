// ARCHIVO DE TESTING - BORRAR EN PRODUCCIÓN
// Este archivo es solo para verificar que no hay re-renders innecesarios

console.log('=== TESTING DE RE-RENDERS ===');
console.log('Para monitorear re-renders, usar React DevTools Profiler');
console.log('Componentes optimizados: PlanetContainer, PlanetButton, Scale, Game');

export const logRender = (componentName: string) => {
    console.log(`🔄 Re-render: ${componentName}`);
};

export default { logRender };