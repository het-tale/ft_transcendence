import React from 'react';
import Protection from './Protection';

const ProtectPassword = (props: any) => {
    return <Protection name="password" child={props.children} />;
};

export default ProtectPassword;
