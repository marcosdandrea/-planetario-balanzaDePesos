import React, { useRef } from 'react';
import style from './style.module.css';
import { message } from 'antd';

const AspectRatio = ({ children, aspectRatio, aspectRatioString }: { children: React.ReactNode; aspectRatio: number, aspectRatioString: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleResize = () => {
        if (ref.current) {
            const { clientWidth, clientHeight } = ref.current;
            const currentAspectRatio = clientWidth / clientHeight;
            if(Math.abs(currentAspectRatio - aspectRatio) < 0.01){
                message.destroy()
            } else {
                message.warning(`La ventana no mantiene la relación de aspecto ${aspectRatioString}. Puede que algunas partes de la interfaz no se muestren correctamente.`, 0);
            }
        }
    };

    React.useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [aspectRatio]);  

    return (
        <div 
            ref={ref}
            className={style.aspectRatio}>
        <div
            className={style.content} 
            style={{ aspectRatio: aspectRatio}}>
            {children}
        </div>
        </div>
    );
}

export default AspectRatio;
