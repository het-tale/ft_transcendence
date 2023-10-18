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

interface AchievementUnlockedProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    achievement?: Achievement;
}

export const AchievementUnlocked = (props: AchievementUnlockedProps) => {
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
                                src={props.achievement?.icon}
                                marginTop={'10px'}
                            />
                            <Flex flexDirection={'column'} marginLeft={'15px'}>
                                <Text
                                    fontSize={'lg'}
                                    color={'#a435f0'}
                                    fontFamily={'sans-serif'}
                                >
                                    {props.achievement?.name}
                                </Text>
                                <Text fontSize={'lg'}>
                                    {props.achievement?.description}
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
                            onClick={() => props.setIsModalOpen(false)}
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
