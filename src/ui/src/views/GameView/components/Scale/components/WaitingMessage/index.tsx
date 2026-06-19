import React, { useEffect, useState } from 'react';
import Text from '@components/Text';
import { FaWeightScale } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";

type WaitingMessageProps = {
    visible: boolean;
};

const WaitingMessage = ({ visible }: WaitingMessageProps) => {
    const [showDescendMessage, setShowDescendMessage] = useState(false);

    useEffect(() => {
        if (!visible) {
            setShowDescendMessage(false);
            return;
        }

        const timerId = setTimeout(() => {
            setShowDescendMessage(true);
        }, 5000);

        return () => {
            clearTimeout(timerId);
        };
    }, [visible]);

    return (
        <div
            style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 180ms ease',
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: "column", 
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}>
            <FaWeightScale size={80} color='#e2b900' opacity={showDescendMessage ? 0 : 1} style={{ marginBottom: 10 }} />
            <IoMdCloseCircle 
            size={80} color='#e2b900' opacity={showDescendMessage ? 1 : 0} 
            style={{ marginTop: -80 }} />
            <Text
                style={{
                    fontFamily: 'Lato Bold',
                    fontSize: 30,
                    color: '#e2b900',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    letterSpacing: '0.08em',
                    lineHeight: "1.2"
                }}>
                {showDescendMessage ? 'Descienda de la balanza' : 'No se mueva'}
            </Text>
        </div>
    );
};

export default WaitingMessage;