import React from 'react';
import style from './style.module.css';

const Header = () => {
    return (
        <div className={style.header}>
            <div className={style.logos}>
                <div className={style.logoPlanetario}/>
                <div className={style.logoLab}/>
            </div>
            <div className={style.title}>
                ¿Peso más o menos <br/>que en la tierra?
            </div>
            <div className={style.subtitle}>
                Subí a la balanza <br/> y tocá los planetas.
            </div>
        </div>);
}

export default Header;