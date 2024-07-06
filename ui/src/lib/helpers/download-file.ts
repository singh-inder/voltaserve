// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.

import { File } from '@/client/api/file'
import { getAccessTokenOrRedirect } from '@/infra/token'

export default async function downloadFile(file: File) {
  if (!file.snapshot?.original || file.type !== 'file') {
    return
  }
  const a: HTMLAnchorElement = document.createElement('a')
  a.href = `/proxy/api/v2/files/${file.id}/original${
    file.snapshot?.original.extension
  }?${new URLSearchParams({
    access_token: getAccessTokenOrRedirect(),
    download: 'true',
  })}`
  a.download = file.name
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
