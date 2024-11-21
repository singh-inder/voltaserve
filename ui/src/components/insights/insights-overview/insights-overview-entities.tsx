// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.
import { useCallback, useEffect, useState } from 'react'
import { Badge, Table, Tbody, Td, Tooltip, Tr } from '@chakra-ui/react'
import {
  Pagination,
  SearchInput,
  SectionError,
  SectionPlaceholder,
  SectionSpinner,
  usePageMonitor,
} from '@koupr/ui'
import cx from 'classnames'
import InsightsAPI, { SortBy, SortOrder } from '@/client/api/insights'
import { swrConfig } from '@/client/options'
import { useAppSelector } from '@/store/hook'

const InsightsOverviewEntities = () => {
  const id = useAppSelector((state) =>
    state.ui.files.selection.length > 0
      ? state.ui.files.selection[0]
      : undefined,
  )
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState<string | undefined>(undefined)
  const { data: metadata } = InsightsAPI.useGetInfo(id, swrConfig())
  const size = 5
  const {
    data: list,
    error: listError,
    isLoading: isListLoading,
    mutate,
  } = InsightsAPI.useListEntities(
    metadata ? id : undefined,
    {
      query,
      page,
      size,
      sortBy: SortBy.Frequency,
      sortOrder: SortOrder.Desc,
    },
    query ? undefined : swrConfig(),
  )
  const { hasPageSwitcher } = usePageMonitor({
    totalPages: list?.totalPages ?? 1,
    totalElements: list?.totalElements ?? 0,
    steps: [size],
  })
  const isListError = !list && listError
  const isListEmpty = list && !listError && list.totalElements === 0
  const isListReady = list && !listError && list.totalElements > 0

  useEffect(() => {
    mutate().then()
  }, [page, query, mutate])

  const handleSearchInputValue = useCallback((value: string) => {
    setPage(1)
    setQuery(value)
  }, [])

  const handleSearchInputClear = useCallback(() => {
    setPage(1)
    setQuery(undefined)
  }, [])

  return (
    <div className={cx('flex', 'flex-col', 'gap-1.5')}>
      <SearchInput
        placeholder="Search Entities"
        query={query}
        onValue={handleSearchInputValue}
        onClear={handleSearchInputClear}
      />
      {isListLoading ? <SectionSpinner /> : null}
      {isListError ? <SectionError text="Failed to load entities." /> : null}
      {isListEmpty ? (
        <SectionPlaceholder text="There are no entities." />
      ) : null}
      {isListReady ? (
        <div
          className={cx(
            'flex',
            'flex-col',
            'justify-between',
            'gap-1.5',
            'h-[320px]',
          )}
        >
          <Table variant="simple" size="sm">
            <colgroup>
              <col className={cx('w-[40px]')} />
              <col className={cx('w-[auto]')} />
            </colgroup>
            <Tbody>
              {list.data.map((entity, index) => (
                <Tr key={index} className={cx('h-[52px]')}>
                  <Td className={cx('px-0.5')}>
                    <div
                      className={cx(
                        'flex',
                        'flex-row',
                        'items-center',
                        'gap-1.5',
                      )}
                    >
                      <span className={cx('text-base')}>{entity.text}</span>
                      {getEntityDescription(entity.label) ? (
                        <Tooltip label={getEntityDescription(entity.label)}>
                          <Badge className={cx('cursor-default')}>
                            {entity.label}
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Badge className={cx('cursor-default')}>
                          {entity.label}
                        </Badge>
                      )}
                      <Badge>{entity.frequency}</Badge>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {hasPageSwitcher ? (
            <div className={cx('self-end')}>
              <Pagination
                maxButtons={3}
                page={page}
                totalPages={list.totalPages}
                onPageChange={(value) => setPage(value)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function getEntityDescription(label: string) {
  switch (label) {
    case 'PER':
      return 'People, including fictional characters.'
    case 'NORP':
      return 'Nationalities or religious or political groups.'
    case 'FAC':
      return 'Buildings, airports, highways, bridges, etc.'
    case 'ORG':
      return 'Companies, agencies, institutions, etc.'
    case 'GPE':
      return 'Countries, cities, states.'
    case 'LOC':
      return 'Non-GPE locations, such as mountain ranges, bodies of water.'
    case 'PRODUCT':
      return 'Objects, vehicles, foods, etc.'
    case 'EVENT':
      return 'Named hurricanes, battles, wars, sports events, etc.'
    case 'WORK_OF_ART':
      return 'Titles of books, songs, etc.'
    case 'LAW':
      return 'Named legal documents.'
    case 'LANGUAGE':
      return 'Any named language.'
    case 'DATE':
      return 'Absolute or relative dates or periods.'
    case 'TIME':
      return 'Times smaller than a day.'
    case 'PERCENT':
      return 'Percentages, including the symbol "%".'
    case 'MONEY':
      return 'Monetary values, including units.'
    case 'QUANTITY':
      return 'Measurements of weight, distance, etc.'
    case 'ORDINAL':
      return '“First”, “second”, etc.'
    case 'CARDINAL':
      return 'Numerals that do not fall under another type.'
    case 'MISC':
      return 'Miscellaneous entities, e.g., events, nationalities, products, etc.'
    default:
      return undefined
  }
}

export default InsightsOverviewEntities
