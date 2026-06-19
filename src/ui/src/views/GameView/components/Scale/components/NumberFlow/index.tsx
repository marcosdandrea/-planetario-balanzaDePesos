import React from 'react';
import NumberFlow from "@number-flow/react";

type NumberFlowProps = {
    value: number;
};

const NumberFlowComponent = ({ value }: NumberFlowProps) => {
    return ( 
        <NumberFlow 
            style={{
                fontSize: 60,  
                fontFamily: "Lato Bold"
            }}
            spinTiming={{ duration: 2000, easing: 'ease' }}
            suffix='kg'
            value={value} />
     );
}

export default NumberFlowComponent;
