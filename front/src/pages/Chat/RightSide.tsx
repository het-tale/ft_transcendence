import { Flex } from '@chakra-ui/react';
import '../../css/chat/left.css';
import { Image } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
const RightSide = (props: any) => {
    const location = useLocation();
    const userId = location.pathname.split('/')[3];
    return (
        <Flex w="100%" h="100%" bg="#E9ECEF" justify="space-between">
            <div className="container">
                {props.tabs.map((tab: any, i: any) =>
                    props.firstLoad !== '' || userId !== null ? (
                        <div key={i}>
                            {props.currentTab === `${tab.id}` && (
                                <div>{tab.rightSide}</div>
                            )}
                        </div>
                    ) : (
                        <div key={i}>
                            {props.currentTab === `${tab.id}` && (
                                <div>
                                    <Image
                                        src="/assets/ul_chat.png"
                                        alt="collaboration"
                                        className="hero_img"
                                        width={400}
                                        height={350}
                                        bg={'transparent'}
                                        marginTop={'20%'}
                                        marginLeft={'25%'}
                                        style={{ background: 'transparent' }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </Flex>
    );
};

export default RightSide;
