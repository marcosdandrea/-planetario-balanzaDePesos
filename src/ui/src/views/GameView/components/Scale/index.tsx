import React, { useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import style from './style.module.css';
import { FaArrowLeft } from "react-icons/fa6";
import { scaleValueContext } from '@contexts/scaleValue';
import { planetContext } from '@contexts/planet';
import Text from '@components/Text';
import NumberFlowComponent from './components/NumberFlow';
import WaitingMessage from './components/WaitingMessage';
import { getGravityMultiplierByBody } from '@utils/planetGravityMultipliers';

const Scale = React.memo(() => {
    const pointerRef = useRef<HTMLDivElement>(null);
    const { scaleValue, maxValue, isAwaitingScale } = useContext(scaleValueContext)!;
    const { planetSelectedId } = useContext(planetContext)!;
    const gravityMultiplier = useMemo(
        () => getGravityMultiplierByBody(planetSelectedId),
        [planetSelectedId]
    );
    const transformedWeight = useMemo(
        () => Number((scaleValue * gravityMultiplier).toFixed(2)),
        [scaleValue, gravityMultiplier]
    );

    // Memoizar los ticks para que no se recalculen nunca
    const ticks = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => {
            const tickDeg = 360 / 50;
            return (
                <div
                    key={i}
                    className={style.tick}
                    style={{
                        transform: `rotate(${i * tickDeg}deg)` // 360 / 50 = 7.2 grados por tick
                    }}
                />
            )
        });
    }, []);

    // Usar useCallback para optimizar la función de rotación
    const updateRotation = useCallback((value: number) => {
        if (!pointerRef.current) return;
        const rotationDeg = (value / maxValue) * 360;
        pointerRef.current.style.setProperty('--rotation', `${rotationDeg}deg`);
    }, [maxValue]);

    // Solo actualizar rotación cuando cambie el peso transformado
    useEffect(() => {
        updateRotation(transformedWeight);
    }, [transformedWeight, updateRotation]);

    return (
        <div className={style.scale}>
            <div className={style.container}>
                <div className={style.ticks}>
                    {ticks}
                </div>
                <div
                    style={{ opacity: isAwaitingScale ? 0 : 1, transition: 'opacity 180ms ease' }}
                    className={style.planetAndWeight}>
                    <div
                        ref={pointerRef}
                        className={style.pointer}>
                        <FaArrowLeft
                            style={{ transform: 'rotate(90deg)' }}
                            size={30} />
                    </div>
                    <Text
                        style={{
                            fontFamily: "Lato Bold",
                            fontSize: 50,
                            color: "#009fe2",
                            textTransform: 'capitalize'
                        }}>
                        {planetSelectedId ?? 'tierra'}
                    </Text>
                    <div style={{ position: 'relative', width: '100%', minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <NumberFlowComponent value={transformedWeight} />
                    </div>
                </div>
                <WaitingMessage visible={isAwaitingScale} />
            </div>
        </div>
    );
});

Scale.displayName = 'Scale';

export default Scale;