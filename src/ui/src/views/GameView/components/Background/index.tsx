import React from "react";
import style from "./style.module.css";

const Background = () => {
    return (
        <div className={style.background}>
            <img 
                src="resources/background.jpg"
                className={`${style.backgroundImage} ${style.image1}`} 
            />
            <img 
                src="resources/background.jpg"
                className={`${style.backgroundImage} ${style.image2}`} 
            />
        </div>
    );
}

export default Background;