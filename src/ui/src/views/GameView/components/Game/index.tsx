import React, { useContext, useEffect, useState } from 'react';
import Header from '../Header';
import PlanetContainer from '../PlanetsContainer';
import Background from '../Background';
import style from './stye.module.css';
import { GameContext } from '@contexts/game';

const Game = () => {

    const {sprites} = useContext(GameContext)
    const [allSpritesLoaded, setAllSpritesLoaded] = useState(false);

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
            <Header />
            <PlanetContainer />
            <Background />
        </div>
    );
}

export default Game;