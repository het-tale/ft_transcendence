import { Grid, GridItem } from '@chakra-ui/react';
import ChannelCard from './ChannelCard';
import { Channel } from '../../../Types/Channel';
import React, { useEffect } from 'react';
import { GetBrowsedChannels } from './GetBrowsedChannels';
import { RenderContext } from '../../../RenderContext';

export interface BrowseChannelsProps {
    update?: boolean;
    setUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
}

const BrowseChannels = (props: BrowseChannelsProps) => {
    const [browseChannels, setBrowseChannels] = React.useState<Channel[]>([]);
    const renderData = React.useContext(RenderContext);
    useEffect(() => {
        GetBrowsedChannels().then((res) => {
            setBrowseChannels(res);
        });
    }, [props.update, renderData.renderData]);
    return (
        <Grid
            templateColumns="repeat(5, 1fr)"
            gap={6}
            width={'100%'}
            p={'4rem'}
        >
            {browseChannels ? (
                browseChannels.map((channel: Channel) => {
                    return (
                        <GridItem w="100%">
                            <ChannelCard
                                ChannelInfo={channel}
                                updateChannel={props.update}
                                setUpdateChannel={props.setUpdate}
                            />
                        </GridItem>
                    );
                })
            ) : (
                <></>
            )}
        </Grid>
    );
};

export default BrowseChannels;
