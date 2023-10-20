import React from 'react';
import { UserType } from './Types/User';

export interface RenderContextType {
    renderData: boolean;
    setRenderData: React.Dispatch<React.SetStateAction<boolean>>;
    notification?: boolean;
    setNotification?: React.Dispatch<React.SetStateAction<boolean>>;
    buttonClicked?: React.MutableRefObject<HTMLButtonElement | null>;
    user?: UserType;
    firstTime?: boolean;
    setFirstTime?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RenderContext = React.createContext<RenderContextType>({
    renderData: false,
    setRenderData: () => {},
    notification: false,
    setNotification: () => {},
    user: undefined,
    firstTime: true,
    setFirstTime: () => {}
});
