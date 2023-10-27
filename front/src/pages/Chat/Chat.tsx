import React, { useEffect } from 'react';
import Dms from './Dms';
import { SocketContext } from '../../socket';
import { useToast } from '@chakra-ui/react';
import GetDms from './GetDms';
import { UserType } from '../../Types/User';
import GetRoomDms from './GetRoomDms';
import { Channel } from '../../Types/Channel';
import { BrowseChannelsProps } from './Channels/BrowseChannels';
import { RenderContext } from '../../RenderContext';

export default function Chat(props: BrowseChannelsProps) {
    const socket = React.useContext(SocketContext);
    const renderData = React.useContext(RenderContext);
    const toast = useToast();
    const [dms, setDms] = React.useState<UserType[]>([]);
    const [roomDms, setRoomDms] = React.useState<Channel[]>([]);
    // const [updateDm, setUpdateDm] = React.useState(false);

    useEffect(() => {
        GetDms().then((data) => {
            setDms(data);
        });
        GetRoomDms().then((data) => {
            setRoomDms(data);
        });
    }, [props.update, renderData.renderData]);

    return (
        <Dms
            socket={socket}
            render={renderData.renderData}
            setRender={renderData.setRenderData}
            toast={toast}
            dms={dms}
            setDms={setDms}
            roomDms={roomDms}
            setRoomDms={setRoomDms}
            update={props.update}
            setUpdate={props.setUpdate}
        />
    );
}
