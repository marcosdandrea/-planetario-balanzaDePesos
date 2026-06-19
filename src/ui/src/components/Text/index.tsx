import React from 'react';
import styles from './style.module.css';

const Text = ({children, style}: {children: React.ReactNode, style?: React.CSSProperties}) => {
    return (
        <div className={styles.text} style={style}>
            {children}
        </div>
    );
}
 
export default Text;