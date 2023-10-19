import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    Button,
    Flex,
    Avatar,
    Text
} from '@chakra-ui/react';
import { Achievement } from '../Types/Achievement';
import React from 'react';

interface AchievementUnlockedProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    achievements?: Achievement[];
}

export const AchievementUnlocked = (props: AchievementUnlockedProps) => {
    const [id, setId] = React.useState<number>(0);
    return (
        <>
            <Modal
                isOpen={props.isModalOpen}
                onClose={() => props.setIsModalOpen(false)}
                motionPreset="slideInTop"
                isCentered
                size={'3xl'}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign={'center'} fontWeight={'light'}>
                        Achievement Unlocked !
                    </ModalHeader>

                    <ModalBody
                        border={'1px solid #ccc'}
                        margin={'12px'}
                        borderRadius={'md'}
                    >
                        <Flex flexDirection={'row'}>
                            <Avatar
                                src={props.achievements![id]?.icon}
                                marginTop={'10px'}
                            />
                            <Flex flexDirection={'column'} marginLeft={'15px'}>
                                <Text
                                    fontSize={'lg'}
                                    color={'#a435f0'}
                                    fontFamily={'sans-serif'}
                                >
                                    {props.achievements![id]?.name}
                                </Text>
                                <Text fontSize={'lg'}>
                                    {props.achievements![id]?.description}
                                </Text>
                            </Flex>
                        </Flex>
                    </ModalBody>

                    <ModalFooter
                        border={'1px solid #ccc'}
                        margin={'12px'}
                        borderRadius={'md'}
                    >
                        <Button
                            backgroundColor={'white'}
                            color={'#a435f0'}
                            mr={3}
                            onClick={
                                id < props.achievements!.length - 1
                                    ? () => setId(id + 1)
                                    : () => props.setIsModalOpen(false)
                            }
                            w={'100%'}
                            _hover={{
                                backgroundColor: '#a435f0',
                                color: 'white'
                            }}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
