import React, { useContext, useEffect, useState, useCallback, memo } from 'react';
import style from "./style.module.css";
import { planetContext } from '@contexts/planet';
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
    showCollider?: boolean;
    colliderSize?: number;
    playbackRate?: number;
}

const PlanetButton = memo(({ videoSrc, imageSrc, zIndex, position = [0, 0], size, id, rippleColor, imageSize, rotation, growthScale=1.02, showCollider, colliderSize, playbackRate = 1 }: PlanetButtonProps) => {

    const { planetSelectedId, setPlanetSelectedId } = useContext(planetContext)!;
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
    const handleMediaError = useCallback((err) => {
        console.error(`Error loading media for planet: ${id}`, err.message);
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
            <div
                style={{
                    width: `${colliderSize ?? planetSize}px`,
                    height: `${colliderSize ?? planetSize}px`,
                    backgroundColor: showCollider ? "#ff000085" : "transparent"
                }} 
                className={style.planetTouchArea}
                onTouchEnd={handleOnClick}
                onClick={handleOnClick} />
            <div
                style={{
                    transform: `${rotation ? `rotate(${rotation}deg)` : ''} ${isSelected ? `scale(${growthScale})` : ''}`.trim()
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
                            onLoadedData={(e) => {
                                console.log(`Setting playback rate for ${id}:`, e.currentTarget.playbackRate);
                                e.currentTarget.playbackRate = playbackRate;
                                console.log(`New playback rate for ${id}:`, e.currentTarget.playbackRate);
                            }}
                            onPlay={(e) => {
                                // Asegurar que el playback rate se mantenga cuando el video comienza a reproducirse
                                e.currentTarget.playbackRate = playbackRate;
                                console.log(`Video ${id} started playing at rate:`, e.currentTarget.playbackRate);
                            }}
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
});

PlanetButton.displayName = 'PlanetButton';

export default PlanetButton;