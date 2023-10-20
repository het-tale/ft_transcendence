import React from 'react';
import { RenderContext } from '../RenderContext';
import { LeaderBoard } from './LeaderBoard';

function Home() {
    const renderData = React.useContext(RenderContext);
    // if (renderData.firstTime === true) {
    //     renderData.setRenderData(!renderData.renderData);
    //     renderData.setFirstTime && renderData.setFirstTime(false);
    // }
    return <LeaderBoard />;
}

export default Home;
