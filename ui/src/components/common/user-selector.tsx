import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Text,
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
  Stack,
  Table,
  Tr,
  Tbody,
  Td,
  HStack,
  Avatar,
  Radio,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { SectionSpinner, variables } from '@koupr/ui'
import UserAPI, { SortOrder, User } from '@/client/api/user'
import { swrConfig } from '@/client/options'
import Pagination from '@/components/common/pagination'
import SearchInput from '@/components/common/search-input'
import userToString from '@/helpers/user-to-string'

type UserSelectorProps = {
  value?: User
  organizationId?: string
  groupId?: string
  nonGroupMembersOnly?: boolean
  onConfirm?: (user: User) => void
}

const UserSelector = ({
  value,
  organizationId,
  groupId,
  nonGroupMembersOnly,
  onConfirm,
}: UserSelectorProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<User>()
  const {
    data: list,
    error,
    mutate,
  } = UserAPI.useList(
    {
      query,
      organizationId,
      groupId,
      nonGroupMembersOnly,
      page,
      size: 5,
      sortOrder: SortOrder.Desc,
    },
    swrConfig(),
  )
  const selectionColor = useColorModeValue('gray.100', 'gray.600')
  const dimmedButtonLabelColor = useColorModeValue('gray.500', 'gray.500')
  const normalButtonLabelColor = useColorModeValue('black', 'white')

  useEffect(() => {
    mutate()
  }, [page, query, mutate])

  useEffect(() => {
    if (!isOpen) {
      setPage(1)
      setSelected(undefined)
      setQuery('')
    }
  }, [isOpen])

  const handleConfirm = useCallback(() => {
    if (selected) {
      onConfirm?.(selected)
      onClose()
    }
  }, [selected, onConfirm, onClose])

  return (
    <>
      <Button
        variant="outline"
        w="100%"
        onClick={onOpen}
        color={value ? normalButtonLabelColor : dimmedButtonLabelColor}
      >
        {value ? userToString(value) : 'Select User'}
      </Button>
      <Modal
        size="xl"
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack direction="column" spacing={variables.spacing}>
              <SearchInput
                query={query}
                onChange={(value) => setQuery(value)}
              />
              {!list && error && (
                <Center h="300px">
                  <Text>Failed to load users.</Text>
                </Center>
              )}
              {!list && !error && <SectionSpinner />}
              {list && list.data.length === 0 && (
                <Center h="300px">
                  <VStack spacing={variables.spacing}>
                    <Text>There are no users.</Text>
                  </VStack>
                </Center>
              )}
              {list && list.data.length > 0 && (
                <Table variant="simple" size="sm">
                  <colgroup>
                    <col style={{ width: '40px' }} />
                    <col style={{ width: 'auto' }} />
                  </colgroup>
                  <Tbody>
                    {list.data.map((u) => (
                      <Tr
                        key={u.id}
                        cursor="pointer"
                        bg={selected?.id === u.id ? selectionColor : 'auto'}
                        onClick={() => setSelected(u)}
                      >
                        <Td px={variables.spacingXs} textAlign="center">
                          <Radio size="md" isChecked={selected?.id === u.id} />
                        </Td>
                        <Td px={variables.spacingXs}>
                          <HStack spacing={variables.spacing}>
                            <Avatar
                              name={u.fullName}
                              size="sm"
                              width="40px"
                              height="40px"
                            />
                            <Text fontSize={variables.bodyFontSize}>
                              {userToString(u)}
                            </Text>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {list && (
                <Box alignSelf="end">
                  {list.totalPages > 1 ? (
                    <Pagination
                      size="md"
                      maxButtons={3}
                      page={page}
                      totalPages={list.totalPages}
                      onPageChange={(value) => setPage(value)}
                    />
                  ) : null}
                </Box>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              colorScheme="blue"
              mr={variables.spacingSm}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="blue"
              isDisabled={!selected}
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UserSelector
