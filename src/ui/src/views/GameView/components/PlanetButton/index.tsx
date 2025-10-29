import React, { useContext, useEffect, useState, useCallback } from 'react';
import style from "./style.module.css";
import { scaleContext } from '@contexts/scale';
import { GameContext } from '@contexts/game';

interface PlanetButtonProps {
    videoSrc?: string;
    imageSrc?: string;
    zIndex?: number;
    position?: [number, number];
    size?: number;
    id: string;
    rippleColor?: string;
    imageSize?: string;
    rotation?: number;
    growthScale?: number;
}

const PlanetButton = ({ videoSrc, imageSrc, zIndex, position = [0, 0], size, id, rippleColor, imageSize, rotation, growthScale=1.02 }: PlanetButtonProps) => {

    const { planetSelectedId, setPlanetSelectedId } = useContext(scaleContext)!;
    const {addSprite} = useContext(GameContext)!;
    const [isSelected, setIsSelected] = useState(false);
    const planetSize = size ?? 500;

    // Solo se ejecuta una vez al montar el componente
    useEffect(() => {
        addSprite({
            id,
            src: videoSrc || imageSrc,
            loaded: false
        });
    }, []); // Sin dependencias - solo al montar

    useEffect(() => {
        setIsSelected(planetSelectedId === id);
    }, [planetSelectedId, id])

    // Manejador para cuando la imagen se carga completamente
    const handleImageLoad = useCallback(() => {
        addSprite({
            id,
            src: imageSrc,
            loaded: true
        });
    }, [addSprite, id, imageSrc]);

    // Manejador para cuando el video está listo para reproducirse
    const handleVideoLoad = useCallback(() => {
        addSprite({
            id,
            src: videoSrc,
            loaded: true
        });
    }, [addSprite, id, videoSrc]);

    // Manejadores de error
    const handleMediaError = useCallback(() => {
        console.error(`Error loading media for planet: ${id}`);
        addSprite({
            id,
            src: videoSrc || imageSrc,
            loaded: false
        });
    }, [addSprite, id, videoSrc, imageSrc]);

    if (!videoSrc && !imageSrc)
        throw new Error("PlanetButton requires either a videoSrc or an imageSrc.");

    const handleOnClick = () => {
        setPlanetSelectedId?.(id);
    }

    return (
        <div
            className={style.planetButton}
            style={{
                zIndex: zIndex ?? 1,
                left: `${position[0] ?? 0}px`,
                top: `${position[1] ?? 0}px`,
                width: `${planetSize}px`,
                height: `${planetSize}px`,
            }}>
            <div className={style.planetTouchArea}
                onTouchEnd={handleOnClick}
                onClick={handleOnClick} />
            <div
                style={{
                    transform: `${rotation ? `rotate(${rotation}deg)` : ''} ${isSelected ? `scale(${growthScale})` : ''}`.trim(),
                    filter: isSelected ? 'saturate(1.5)' : 'saturate(.5)',
                }}
                className={style.planetButtonImage}>
                {
                    videoSrc ?
                        <video
                            src={videoSrc}
                            autoPlay
                            loop
                            muted
                            width={imageSize ? `${imageSize}px` : "100%"}
                            height={imageSize ? `${imageSize}px` : "100%"}
                            style={{ pointerEvents: 'none' }}
                            onCanPlayThrough={handleVideoLoad}
                            onError={handleMediaError}
                        />
                        :
                        <img
                            src={imageSrc}
                            alt="Planet"
                            width={imageSize ? `${imageSize}px` : "100%"}
                            height={imageSize ? `${imageSize}px` : "100%"}
                            style={{ pointerEvents: 'none' }}
                            onLoad={handleImageLoad}
                            onError={handleMediaError}
                        />
                }
            </div>
            {
                planetSelectedId === id &&
                <div
                    style={{
                        color: rippleColor,
                        '--ripple-border-width': `${(size ?? 500) / 20}px`
                    } as React.CSSProperties}
                    className={style.planetHighlight} />
            }
        </div>
    );
}

export default PlanetButton;