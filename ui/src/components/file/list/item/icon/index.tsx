// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.

import cx from 'classnames'
import { FileCommonProps } from '@/types/file'
import { computeScale } from '../scale'
import IconFile from './icon-file'
import IconFolder from './icon-folder'

export type ItemIconProps = {
  isLoading?: boolean
} & FileCommonProps

const ItemIcon = ({ file, scale, viewType, isLoading }: ItemIconProps) => (
  <>
    <div
      className={cx('z-0', 'text-gray-500', 'dark:text-gray-300', 'relative')}
    >
      {file.type === 'file' ? (
        <IconFile
          file={file}
          scale={computeScale(scale, viewType)}
          viewType={viewType}
        />
      ) : file.type === 'folder' ? (
        <IconFolder
          file={file}
          scale={computeScale(scale, viewType)}
          viewType={viewType}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  </>
)

export default ItemIcon
