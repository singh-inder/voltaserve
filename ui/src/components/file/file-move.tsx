import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { useSWRConfig } from 'swr'
import cx from 'classnames'
import FileAPI, { List } from '@/client/api/file'
import useFileListSearchParams from '@/hooks/use-file-list-params'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { moveModalDidClose, selectionUpdated } from '@/store/ui/files'
import FileBrowse from './file-browse'

const FileMove = () => {
  const { mutate } = useSWRConfig()
  const { fileId } = useParams()
  const dispatch = useAppDispatch()
  const selection = useAppSelector((state) => state.ui.files.selection)
  const isModalOpen = useAppSelector((state) => state.ui.files.isMoveModalOpen)
  const [isLoading, setIsLoading] = useState(false)
  const [targetId, setTargetId] = useState<string>()
  const fileListSearchParams = useFileListSearchParams()

  const handleMove = useCallback(async () => {
    if (!targetId) {
      return
    }
    try {
      setIsLoading(true)
      await FileAPI.move(targetId, { ids: selection })
      await mutate<List>(`/files/${fileId}/list?${fileListSearchParams}`)
      dispatch(selectionUpdated([]))
      dispatch(moveModalDidClose())
    } finally {
      setIsLoading(false)
    }
  }, [targetId, fileId, selection, fileListSearchParams, mutate, dispatch])

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => dispatch(moveModalDidClose())}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move {selection.length} Item(s) to…</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FileBrowse onChange={(id) => setTargetId(id)} />
        </ModalBody>
        <ModalFooter>
          <div className={cx('flex', 'flex-row', 'items-center', 'gap-1')}>
            <Button
              type="button"
              variant="outline"
              colorScheme="blue"
              disabled={isLoading}
              onClick={() => dispatch(moveModalDidClose())}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="blue"
              isDisabled={targetId === fileId}
              isLoading={isLoading}
              onClick={handleMove}
            >
              Move Here
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FileMove
