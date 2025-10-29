import React from 'react';
import style from './style.module.css';
import PlanetButton from '../PlanetButton';

const PlanetContainer = () => {
    return (
        <div className={style.planetContainer}>
            <PlanetButton
                id="sun"
                zIndex={10}
                position={[-2560, -100]}
                size={3000}
                rippleColor={"#db771a"}
                imageSrc="resources/sun.png"
            /> 
            <PlanetButton
                zIndex={9}
                growthScale={1.1}
                id="mercury"
                position={[423, 1822]}
                size={80}
                rippleColor={"#f09f5dff"}
                imageSrc="resources/mercury.png"
            />
            <PlanetButton
                zIndex={7}
                growthScale={1.2}
                id="venus"
                position={[560, 1785]}
                size={190}
                rippleColor={"#ff5e00ff"}
                imageSrc="resources/venus.png"
            />
            <PlanetButton
                zIndex={8}
                growthScale={1.1}
                id="moon"
                position={[860, 1725]}
                size={70}
                rippleColor={"#ffffffff"}
                imageSrc="resources/moon.png"
            />
            <PlanetButton
                zIndex={7}
                growthScale={1.2}
                id="earth"
                position={[700, 1600]}
                size={190}
                rippleColor={"#00a2ff"}
                imageSrc="resources/earth.png"
            />
            <PlanetButton
                zIndex={6}
                growthScale={1.1}
                id="mars"
                position={[820, 1440]}
                size={128}
                rotation={-50}
                rippleColor={"#d64a12ff"}
                imageSrc="resources/mars.png"
            />
            <PlanetButton
                zIndex={5}
                id="jupiter"
                position={[250, 780]}               
                size={633}
                rippleColor={"#c06d3dff"}
                imageSrc="resources/jupiter.png"
            />
            <PlanetButton
                zIndex={4}
                id="saturn"
                position={[780, 820]}               
                size={570}
                imageSize={"200%"}
                rippleColor={"#ffcc99"}
                imageSrc="resources/saturn.png"
            /> 
            <PlanetButton
                zIndex={3}
                id="uranus"
                position={[680, 680]}               
                size={225}
                rippleColor={"#20e4c3ff"}
                imageSrc="resources/uranus.png"
            /> 
            <PlanetButton
                zIndex={2}
                id="neptune"
                position={[890, 580]}               
                size={210}
                rippleColor={"#0f57b4ff"}
                imageSrc="resources/neptune.png"
            /> 
        </div>);
}

export default PlanetContainer;