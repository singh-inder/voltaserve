import { DragOverlay } from '@dnd-kit/core'
import cx from 'classnames'
import { useAppSelector } from '@/store/hook'
import { FileCommonProps } from '@/types/file'
import ListItem from './item'

type ListDragOverlayProps = FileCommonProps

const ListDragOverlay = ({ file, scale, viewType }: ListDragOverlayProps) => {
  const selectionCount = useAppSelector(
    (state) => state.ui.files.selection.length,
  )

  return (
    <DragOverlay>
      <div className={cx('relative')}>
        <ListItem
          file={file}
          scale={scale}
          isPresentational={true}
          isDragging={true}
          viewType={viewType}
        />
        {selectionCount > 1 ? (
          <div
            className={cx(
              'absolute',
              'flex',
              'items-center',
              'justify-center',
              'bottom-[-5px]',
              'right-[-5px]',
              'text-white',
              'rounded-xl',
              'min-w-[30px]',
              'h-[30px]',
              'px-1',
              'bg-blue-500',
            )}
          >
            {selectionCount}
          </div>
        ) : null}
      </div>
    </DragOverlay>
  )
}

export default ListDragOverlay
