import { Flex, Grid, GridItem } from '@chakra-ui/react';
import NavbarSearch from '../../../components/NavbarSearch';
import Sidebar from '../../../components/Sidebar';
import ChannelCard from './ChannelCard';
import { Channel } from '../../../Types/Channel';
import React, { useEffect } from 'react';
import { GetBrowsedChannels } from './GetBrowsedChannels';
import { render } from '@testing-library/react';

export interface BrowseChannelsProps {
    update?: boolean;
    setUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
}

const BrowseChannels = (props: BrowseChannelsProps) => {
    const [browseChannels, setBrowseChannels] = React.useState<Channel[]>([]);
    useEffect(() => {
        GetBrowsedChannels().then((res) => {
            setBrowseChannels(res);
        });
    }, [props.update]);
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Flex>
                <Sidebar />
                {/* <Grid
                    templateColumns="repeat(5, 1fr)"
                    gap={6}
                    width={'100%'}
                    p={'4rem'}
                >
                    <GridItem w="100%">
                        <ChannelCard ChannelInfo={browseChannels[0]} />
                    </GridItem>
                    <GridItem w="100%" h="100px">
                        <ChannelCard ChannelInfo={browseChannels[0]} />
                    </GridItem>
                    <GridItem w="100%" h="100px">
                        <ChannelCard ChannelInfo={browseChannels[0]} />
                    </GridItem>
                    <GridItem w="100%" h="100px">
                        <ChannelCard ChannelInfo={browseChannels[0]} />
                    </GridItem>
                    <GridItem w="100%" h="100px">
                        <ChannelCard ChannelInfo={browseChannels[0]} />
                    </GridItem>
                    <GridItem w="100%" h="100px">
                        <ChannelCard ChannelInfo={browseChannels[0]} />
                    </GridItem>
                </Grid> */}
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
            </Flex>
        </Flex>
    );
};

export default BrowseChannels;
