import React, { useContext, useEffect, useState, memo } from 'react';
import Header from '../Header';
import PlanetContainer from '../PlanetsContainer';
import Background from '../Background';
import style from './stye.module.css';
import { GameContext } from '@contexts/game';
import Scale from '../Scale';
import ScaleTester from '@components/ScaleTester';
import useIpc from '@hooks/useIpc';

// Componentes separados y memoizados para evitar re-renders cruzados
const ScaleArea = memo(() => <Scale />);
const PlanetArea = memo(() => <PlanetContainer />);
const StaticElements = memo(() => (
    <>
        <Header />
        <Background />
    </>
));

ScaleArea.displayName = 'ScaleArea';
PlanetArea.displayName = 'PlanetArea';
StaticElements.displayName = 'StaticElements';

const Game = memo(() => {
    const {sprites} = useContext(GameContext);
    const [allSpritesLoaded, setAllSpritesLoaded] = useState(false);
    const { useUiTester } = useIpc();

    useEffect(() => {
        if (sprites) {
            const allLoaded = Object.values(sprites).every(sprite => sprite.loaded);
            setAllSpritesLoaded(allLoaded);
        }
    }, [sprites]);

    return (
        <div 
            style={{ opacity: allSpritesLoaded ? 1 : 0 }}
            className={style.gameView}>
            <ScaleArea />
            <PlanetArea />
            <StaticElements />
            {useUiTester && <ScaleTester />}
        </div>
    );
});

Game.displayName = 'Game';

export default Game;