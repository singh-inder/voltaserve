// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { IconButton } from '@chakra-ui/react'
import {
  IconEdit,
  IconLogout,
  IconDelete,
  IconPersonAdd,
  SectionSpinner,
  Form,
} from '@koupr/ui'
import { Helmet } from 'react-helmet-async'
import OrganizationAPI from '@/client/api/organization'
import { geEditorPermission, geOwnerPermission } from '@/client/api/permission'
import { swrConfig } from '@/client/options'
import OrganizationDelete from '@/components/organization/organization-delete'
import OrganizationEditName from '@/components/organization/organization-edit-name'
import OrganizationInviteMembers from '@/components/organization/organization-invite-members'
import OrganizationLeave from '@/components/organization/organization-leave'
import { truncateEnd } from '@/lib/helpers/truncate-end'

const OrganizationSettingsPage = () => {
  const { id } = useParams()
  const { data: org, error } = OrganizationAPI.useGet(id, swrConfig())
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [isInviteMembersModalOpen, setIsInviteMembersModalOpen] =
    useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  if (error) {
    return null
  }

  if (!org) {
    return <SectionSpinner />
  }

  return (
    <>
      <Helmet>
        <title>{org.name}</title>
      </Helmet>
      <Form
        sections={[
          {
            title: 'Basics',
            rows: [
              {
                label: 'Name',
                content: (
                  <>
                    <span>{truncateEnd(org.name, 50)}</span>
                    <IconButton
                      icon={<IconEdit />}
                      isDisabled={!geEditorPermission(org.permission)}
                      title="Edit name"
                      aria-label="Edit name"
                      onClick={() => setIsNameModalOpen(true)}
                    />
                  </>
                ),
              },
            ],
          },
          {
            title: 'Membership',
            rows: [
              {
                label: 'Invite members',
                content: (
                  <IconButton
                    icon={<IconPersonAdd />}
                    isDisabled={!geOwnerPermission(org.permission)}
                    title="Invite members"
                    aria-label="Invite members"
                    onClick={() => setIsInviteMembersModalOpen(true)}
                  />
                ),
              },
              {
                label: 'Leave',
                content: (
                  <IconButton
                    icon={<IconLogout />}
                    variant="solid"
                    colorScheme="red"
                    title="Leave"
                    aria-label="Leave"
                    onClick={() => setIsLeaveModalOpen(true)}
                  />
                ),
              },
            ],
          },
          {
            title: 'Advanced',
            rows: [
              {
                label: 'Delete organization',
                content: (
                  <IconButton
                    icon={<IconDelete />}
                    variant="solid"
                    colorScheme="red"
                    isDisabled={!geEditorPermission(org.permission)}
                    title="Delete organization"
                    aria-label="Delete organization"
                    onClick={() => setIsDeleteModalOpen(true)}
                  />
                ),
              },
            ],
          },
        ]}
      />
      <OrganizationEditName
        open={isNameModalOpen}
        organization={org}
        onClose={() => setIsNameModalOpen(false)}
      />
      <OrganizationInviteMembers
        open={isInviteMembersModalOpen}
        id={org.id}
        onClose={() => setIsInviteMembersModalOpen(false)}
      />
      <OrganizationLeave
        open={isLeaveModalOpen}
        id={org.id}
        onClose={() => setIsLeaveModalOpen(false)}
      />
      <OrganizationDelete
        open={isDeleteModalOpen}
        organization={org}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}

export default OrganizationSettingsPage
