// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.

import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools'
import variables from '../../variables'

const button = {
  baseStyle: {
    borderRadius: variables.borderRadiusMd,
    fontWeight: variables.bodyFontWeight,
  },
  sizes: {
    md: {
      fontSize: variables.bodyFontSize,
    },
    xs: {
      fontSize: '12px',
    },
  },
  variants: {
    'solid-gray': (props: StyleFunctionProps) => ({
      bg: mode('gray.100', 'gray.700')(props),
      _hover: {
        bg: mode('gray.200', 'gray.600')(props),
      },
    }),
  },
}

export default button
