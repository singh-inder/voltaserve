// Copyright 2024 Mateusz Kaźmierczak.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  IconButtonProps,
  Spacer,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import cx from 'classnames'
import { Helmet } from 'react-helmet-async'
import ConsoleApi, {
  GroupUserManagementList,
  OrganizationUserManagementList,
  WorkspaceUserManagementList,
} from '@/client/console/console'
import UserAPI, { ConsoleUser } from '@/client/idp/user'
import { IconClose, IconEdit, IconWarning } from '@/lib/components/icons'
import PagePagination from '@/lib/components/page-pagination'
import SectionSpinner from '@/lib/components/section-spinner'

const EditButton = (props: IconButtonProps) => (
  <IconButton
    icon={<IconEdit />}
    className={cx('h-[40px]', 'w-[40px]')}
    {...props}
  />
)

const ConsolePanelUser = () => {
  const sectionClassName = cx('flex', 'flex-col', 'gap-1', 'py-1.5')
  const rowClassName = cx(
    'flex',
    'flex-row',
    'items-center',
    'gap-1',
    `h-[40px]`,
  )
  const [userData, setUserData] = useState<ConsoleUser>()
  const [organizationsData, setOrganizationsData] =
    useState<OrganizationUserManagementList>()
  const [workspacesData, setWorkspacesData] =
    useState<WorkspaceUserManagementList>()
  const [groupsData, setGroupsData] = useState<GroupUserManagementList>()
  const { id } = useParams()
  const [workspacesPage, setWorkspacesPage] = useState(1)
  const [groupsPage, setGroupsPage] = useState(1)
  const [organizationsPage, setOrganizationsPage] = useState(1)

  const userFetch = () => {
    if (id) {
      UserAPI.getUserById({ id }).then((value) => {
        setUserData(value)
      })
    }
  }
  const groupsFetch = () => {
    if (id) {
      ConsoleApi.getGroupsByUser({ id: id, page: groupsPage, size: 5 }).then(
        (value) => {
          setGroupsData(value)
        },
      )
    }
  }
  const organizationsFetch = () => {
    ConsoleApi.getOrganizationsByUser({
      id: id,
      page: organizationsPage,
      size: 5,
    }).then((value) => {
      setOrganizationsData(value)
    })
  }

  const workspacesFetch = () => {
    ConsoleApi.getWorkspacesByUser({
      id: id,
      page: workspacesPage,
      size: 5,
    }).then((value) => {
      setWorkspacesData(value)
    })
  }

  useEffect(() => {
    userFetch()
    groupsFetch()
    organizationsFetch()
    workspacesFetch()
  }, [])

  useEffect(() => {
    organizationsFetch()
  }, [organizationsPage])

  useEffect(() => {
    groupsFetch()
  }, [groupsPage])

  useEffect(() => {
    workspacesFetch()
  }, [workspacesPage])

  if (!userData) {
    return <SectionSpinner />
  }

  return (
    <>
      <Helmet>
        <title>User management</title>
      </Helmet>
      <div className={cx('flex', 'flex-col', 'gap-3.5', 'pb-3.5')}>
        <Heading className={cx('text-heading')}>{userData.fullName}</Heading>
      </div>
      <Grid gap={4} templateColumns="repeat(9, 1fr)">
        <GridItem>
          <div className={cx('relative', 'shrink-0')}>
            <Avatar
              name={userData.fullName}
              src={userData.picture}
              size="2xl"
              className={cx(
                'w-[165px]',
                'h-[165px]',
                'border',
                'border-gray-300',
                'dark:border-gray-700',
              )}
            />
            {userData.picture ? (
              <IconButton
                icon={<IconClose />}
                variant="solid"
                colorScheme="red"
                right="5px"
                bottom="10px"
                position="absolute"
                zIndex={1000}
                aria-label=""
                onClick={() => {
                  console.log('remove')
                }}
              />
            ) : null}
          </div>
        </GridItem>
        <GridItem colSpan={8}>
          <div className={cx('flex', 'flex-col', 'gap-0')}>
            <div className={sectionClassName}>
              <span className={cx('font-bold')}>Basics</span>
              <div className={cx(rowClassName)}>
                <span>Full name</span>
                <Spacer />
                <span>{userData.fullName}</span>
                <EditButton
                  aria-label=""
                  onClick={() => {
                    console.log('Rename')
                  }}
                />
              </div>
            </div>
            <Divider />
            <div className={sectionClassName}>
              <span className={cx('font-bold')}>Credentials</span>
              <div className={cx(rowClassName)}>
                <span>Email</span>
                <Spacer />
                {userData.pendingEmail ? (
                  <div
                    className={cx(
                      'flex',
                      'flex-row',
                      'gap-0.5',
                      'items-center',
                    )}
                  >
                    <Tooltip label="Please check your inbox to confirm your email.">
                      <div
                        className={cx(
                          'flex',
                          'items-center',
                          'justify-center',
                          'cursor-default',
                        )}
                      >
                        <IconWarning className={cx('text-yellow-400')} />
                      </div>
                    </Tooltip>
                    <span>{userData.pendingEmail}</span>
                  </div>
                ) : null}
                {!userData.pendingEmail ? (
                  <span>{userData.pendingEmail || userData.email}</span>
                ) : null}
                <EditButton
                  aria-label=""
                  onClick={() => {
                    console.log('edit email')
                  }}
                />
              </div>
              <div className={cx(rowClassName)}>
                <span>Password</span>
                <Spacer />
                <EditButton
                  aria-label=""
                  onClick={() => {
                    console.log('change password')
                  }}
                />
              </div>
            </div>
          </div>
        </GridItem>
        <GridItem colSpan={3}>
          {!organizationsData ? (
            <SectionSpinner />
          ) : (
            <>
              <Flex>
                <span className={cx('font-bold')}>Organizations</span>
                <Spacer />
                {organizationsData.totalElements > 5 ? (
                  <>
                    <PagePagination
                      totalElements={organizationsData.totalElements}
                      totalPages={Math.ceil(
                        organizationsData.totalElements / 5,
                      )}
                      page={organizationsPage}
                      size={5}
                      steps={[]}
                      setPage={setOrganizationsPage}
                      setSize={() => {}}
                      uiSize="xs"
                      disableLastNav
                      disableMiddleNav
                    />
                  </>
                ) : null}
              </Flex>
              <Divider mb={4} />
              <Stack>
                {organizationsData.data && organizationsData.data.length > 0 ? (
                  organizationsData.data.map((organization) => (
                    <Flex key={organization.organizationId}>
                      <Avatar name={organization.organizationName} />
                      <Box ml="3">
                        <Text fontWeight="bold">
                          {organization.organizationName}
                          <Badge ml="1" colorScheme="green">
                            {organization.permission}
                          </Badge>
                        </Text>
                        <Text fontSize="sm">
                          from:{' '}
                          {new Date(
                            organization.createTime,
                          ).toLocaleDateString()}
                        </Text>
                      </Box>
                    </Flex>
                  ))
                ) : (
                  <Text>No organizations found</Text>
                )}
              </Stack>
            </>
          )}
        </GridItem>
        <GridItem colSpan={3}>
          {!workspacesData ? (
            <SectionSpinner />
          ) : (
            <>
              <Flex>
                <span className={cx('font-bold')}>Workspaces</span>
                <Spacer />
                {workspacesData.totalElements > 5 ? (
                  <>
                    <PagePagination
                      totalElements={workspacesData.totalElements}
                      totalPages={Math.ceil(workspacesData.totalElements / 5)}
                      page={workspacesPage}
                      size={5}
                      steps={[]}
                      setPage={setWorkspacesPage}
                      setSize={() => {}}
                      uiSize="xs"
                      disableLastNav
                      disableMiddleNav
                    />
                  </>
                ) : null}
              </Flex>
              <Divider mb={4} />
              <Stack overflowX="auto">
                {workspacesData.data && workspacesData.data.length > 0 ? (
                  workspacesData.data.map((workspace) => (
                    <Flex key={workspace.workspaceId}>
                      <Avatar name={workspace.workspaceName} />
                      <Box ml="3">
                        <Text fontWeight="bold">
                          {workspace.workspaceName}
                          <Badge ml="1" colorScheme="green">
                            {workspace.permission}
                          </Badge>
                        </Text>
                        <Text fontSize="sm">
                          from:{' '}
                          {new Date(workspace.createTime).toLocaleDateString()}
                        </Text>
                      </Box>
                    </Flex>
                  ))
                ) : (
                  <Text>No workspaces found</Text>
                )}
              </Stack>
            </>
          )}
        </GridItem>
        <GridItem colSpan={3}>
          {!groupsData ? (
            <SectionSpinner />
          ) : (
            <>
              <Flex>
                <span className={cx('font-bold')}>Groups</span>
                <Spacer />
                {groupsData.totalElements > 5 ? (
                  <>
                    <PagePagination
                      totalElements={groupsData.totalElements}
                      totalPages={Math.ceil(groupsData.totalElements / 5)}
                      page={groupsPage}
                      size={5}
                      steps={[]}
                      setPage={setGroupsPage}
                      setSize={() => {}}
                      uiSize="xs"
                      disableLastNav
                      disableMiddleNav
                    />
                  </>
                ) : null}
              </Flex>
              <Divider mb={4} />
              <Stack>
                {groupsData.data && groupsData.data.length > 0 ? (
                  groupsData.data.map((group) => (
                    <Flex key={group.groupId}>
                      <Avatar name={group.groupName} />
                      <Box ml="3">
                        <Text fontWeight="bold">
                          {group.groupName}
                          <Badge ml="1" colorScheme="green">
                            {group.permission}
                          </Badge>
                        </Text>
                        <Text fontSize="sm">
                          from:{' '}
                          {new Date(group.createTime).toLocaleDateString()}
                        </Text>
                      </Box>
                    </Flex>
                  ))
                ) : (
                  <Text>No groups found</Text>
                )}
              </Stack>
            </>
          )}
        </GridItem>
      </Grid>
    </>
  )
}

export default ConsolePanelUser
