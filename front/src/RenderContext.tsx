import React from 'react';

export interface RenderContextType {
    renderData: boolean;
    setRenderData: React.Dispatch<React.SetStateAction<boolean>>;
    notification?: boolean;
    setNotification?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RenderContext = React.createContext<RenderContextType>({
    renderData: false,
    setRenderData: () => {},
    notification: false,
    setNotification: () => {}
});
