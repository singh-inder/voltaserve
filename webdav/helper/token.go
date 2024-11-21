// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.

package helper

import (
	"time"

	"github.com/kouprlabs/voltaserve/webdav/infra"
)

func NewExpiry(token *infra.Token) time.Time {
	return time.Now().Add(time.Duration(token.ExpiresIn) * time.Second)
}
