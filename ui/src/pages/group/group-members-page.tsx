// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.
import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Button, Avatar } from '@chakra-ui/react'
import {
  DataTable,
  IconLogout,
  Text,
  IconPersonAdd,
  PagePagination,
  SectionSpinner,
  usePagePagination,
  SectionError,
  SectionPlaceholder,
  usePageMonitor,
} from '@koupr/ui'
import cx from 'classnames'
import { GroupAPI } from '@/client/api/group'
import { geEditorPermission } from '@/client/api/permission'
import { UserAPI, UserSortBy, UserSortOrder } from '@/client/api/user'
import { errorToString } from '@/client/error'
import { AuthUser } from '@/client/idp/user'
import { swrConfig } from '@/client/options'
import GroupAddMember from '@/components/group/group-add-member'
import GroupRemoveMember from '@/components/group/group-remove-member'
import { groupMemberPaginationStorage } from '@/infra/pagination'
import { getPictureUrlById } from '@/lib/helpers/picture'
import { decodeQuery } from '@/lib/helpers/query'
import { truncateEnd } from '@/lib/helpers/truncate-end'
import truncateMiddle from '@/lib/helpers/truncate-middle'
import { useAppDispatch } from '@/store/hook'
import { mutateUpdated } from '@/store/ui/group-members'

const GroupMembersPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { id } = useParams()
  const {
    data: group,
    error: groupError,
    isLoading: groupIsLoading,
  } = GroupAPI.useGet(id, swrConfig())
  const { page, size, steps, setPage, setSize } = usePagePagination({
    navigateFn: navigate,
    searchFn: () => location.search,
    storage: groupMemberPaginationStorage(),
  })
  const [searchParams] = useSearchParams()
  const query = decodeQuery(searchParams.get('q') as string)
  const {
    data: list,
    error: listError,
    isLoading: listIsLoading,
    mutate,
  } = UserAPI.useList(
    {
      query,
      groupId: id,
      page,
      size,
      sortBy: UserSortBy.FullName,
      sortOrder: UserSortOrder.Asc,
    },
    swrConfig(),
  )
  const [userToRemove, setUserToRemove] = useState<AuthUser>()
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false)
  // prettier-ignore
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState<boolean>(false)
  const { hasPagination } = usePageMonitor({
    totalPages: list?.totalPages ?? 1,
    totalElements: list?.totalElements ?? 0,
    steps,
  })
  const groupIsReady = group && !groupError
  const listIsEmpty = list && !listError && list.totalElements === 0
  const listIsReady = list && !listError && list.totalElements > 0

  useEffect(() => {
    if (mutate) {
      dispatch(mutateUpdated(mutate))
    }
  }, [mutate])

  return (
    <>
      {groupIsLoading ? <SectionSpinner /> : null}
      {groupError ? <SectionError text={errorToString(groupError)} /> : null}
      {groupIsReady ? (
        <>
          {listIsLoading ? <SectionSpinner /> : null}
          {listError ? <SectionError text={errorToString(listError)} /> : null}
          {listIsEmpty ? (
            <SectionPlaceholder
              text="This group has no members."
              content={
                geEditorPermission(group.permission) ? (
                  <Button
                    leftIcon={<IconPersonAdd />}
                    onClick={() => {
                      setIsAddMembersModalOpen(true)
                    }}
                  >
                    Add Members
                  </Button>
                ) : undefined
              }
            />
          ) : null}
          {listIsReady ? (
            <DataTable
              items={list.data}
              columns={[
                {
                  title: 'Full name',
                  renderCell: (u) => (
                    <div
                      className={cx(
                        'flex',
                        'flex-row',
                        'gap-1.5',
                        'items-center',
                      )}
                    >
                      <Avatar
                        name={u.fullName}
                        src={
                          u.picture
                            ? getPictureUrlById(u.id, u.picture, {
                                groupId: group.id,
                              })
                            : undefined
                        }
                        className={cx(
                          'border',
                          'border-gray-300',
                          'dark:border-gray-700',
                        )}
                      />
                      <span>{truncateEnd(u.fullName, 50)}</span>
                    </div>
                  ),
                },
                {
                  title: 'Email',
                  renderCell: (u) => <Text>{truncateMiddle(u.email, 50)}</Text>,
                },
              ]}
              actions={[
                {
                  label: 'Remove From Group',
                  icon: <IconLogout />,
                  isDestructive: true,
                  onClick: (u) => {
                    setUserToRemove(u)
                    setIsRemoveMemberModalOpen(true)
                  },
                },
              ]}
              pagination={
                hasPagination ? (
                  <PagePagination
                    totalElements={list.totalElements}
                    totalPages={list.totalPages}
                    page={page}
                    size={size}
                    steps={steps}
                    setPage={setPage}
                    setSize={setSize}
                  />
                ) : undefined
              }
            />
          ) : null}
          {userToRemove ? (
            <GroupRemoveMember
              isOpen={isRemoveMemberModalOpen}
              user={userToRemove}
              group={group}
              onCompleted={() => mutate()}
              onClose={() => setIsRemoveMemberModalOpen(false)}
            />
          ) : null}
          <GroupAddMember
            open={isAddMembersModalOpen}
            group={group}
            onClose={() => setIsAddMembersModalOpen(false)}
          />
        </>
      ) : null}
    </>
  )
}

export default GroupMembersPage
