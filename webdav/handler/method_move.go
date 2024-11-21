// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.

package handler

import (
	"fmt"
	"net/http"
	"path"
	"strings"

	"github.com/kouprlabs/voltaserve/webdav/client/api_client"
	"github.com/kouprlabs/voltaserve/webdav/helper"
	"github.com/kouprlabs/voltaserve/webdav/infra"
)

/*
This method moves or renames a resource from a source URL to a destination URL.

Example implementation:

- Extract the source and destination paths from the headers or request body.
- Move or rename the file from the source to the destination.
- Set the response status code to 204 if successful or an appropriate error code if the source file is not found or encountered an error.
- Return the response.
*/
func (h *Handler) methodMove(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value("token").(*infra.Token)
	if !ok {
		infra.HandleError(fmt.Errorf("missing token"), w)
		return
	}
	cl := api_client.NewFileClient(token)
	sourcePath := helper.DecodeURIComponent(r.URL.Path)
	targetPath := helper.DecodeURIComponent(helper.GetTargetPath(r))
	sourceFile, err := cl.GetByPath(sourcePath)
	if err != nil {
		infra.HandleError(err, w)
		return
	}
	targetDir := helper.DecodeURIComponent(helper.Dirname(helper.GetTargetPath(r)))
	targetFile, err := cl.GetByPath(targetDir)
	if err != nil {
		infra.HandleError(err, w)
		return
	}
	if sourceFile.WorkspaceID != targetFile.WorkspaceID {
		w.WriteHeader(http.StatusBadRequest)
		if _, err := w.Write([]byte("Source and target files are in different workspaces")); err != nil {
			infra.HandleError(err, w)
			return
		}
	} else {
		sourcePathParts := strings.Split(sourcePath, "/")
		targetPathParts := strings.Split(targetPath, "/")
		if len(sourcePathParts) == len(targetPathParts) && helper.Dirname(sourcePath) == helper.Dirname(targetPath) {
			if _, err := cl.PatchName(sourceFile.ID, api_client.FilePatchNameOptions{
				Name: helper.DecodeURIComponent(path.Base(targetPath)),
			}); err != nil {
				infra.HandleError(err, w)
				return
			}
		} else {
			if err := cl.MoveOne(sourceFile.ID, targetFile.ID); err != nil {
				infra.HandleError(err, w)
				return
			}
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
