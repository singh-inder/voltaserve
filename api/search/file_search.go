// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.

package search

import (
	"encoding/json"

	"github.com/minio/minio-go/v7"

	"github.com/kouprlabs/voltaserve/api/infra"
	"github.com/kouprlabs/voltaserve/api/model"
	"github.com/kouprlabs/voltaserve/api/repo"
)

type FileSearch interface {
	Index(files []model.File) error
	Update(files []model.File) error
	Delete(ids []string) error
	Query(query string, opts infra.QueryOptions) ([]model.File, error)
}

func NewFileSearch() FileSearch {
	return newFileSearch()
}

type fileSearch struct {
	search       infra.SearchManager
	index        string
	s3           infra.S3Manager
	snapshotRepo repo.SnapshotRepo
}

type fileEntity struct {
	ID          string  `json:"id"`
	WorkspaceID string  `json:"workspaceId"`
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	ParentID    *string `json:"parentId,omitempty"`
	Text        *string `json:"text,omitempty"`
	SnapshotID  *string `json:"snapshotId,omitempty"`
	CreateTime  string  `json:"createTime"`
	UpdateTime  *string `json:"updateTime,omitempty"`
}

func (f fileEntity) GetID() string {
	return f.ID
}

func newFileSearch() *fileSearch {
	return &fileSearch{
		index:        infra.FileSearchIndex,
		search:       infra.NewSearchManager(),
		s3:           infra.NewS3Manager(),
		snapshotRepo: repo.NewSnapshotRepo(),
	}
}

func (s *fileSearch) Index(files []model.File) (err error) {
	if len(files) == 0 {
		return nil
	}
	if err = s.populateTextField(files); err != nil {
		return err
	}
	var res []infra.SearchModel
	for _, f := range files {
		res = append(res, s.mapEntity(f))
	}
	if err := s.search.Index(s.index, res); err != nil {
		return err
	}
	return nil
}

func (s *fileSearch) Update(files []model.File) (err error) {
	if len(files) == 0 {
		return nil
	}
	if err = s.populateTextField(files); err != nil {
		return err
	}
	var res []infra.SearchModel
	for _, f := range files {
		res = append(res, s.mapEntity(f))
	}
	if err := s.search.Update(s.index, res); err != nil {
		return err
	}
	return nil
}

func (s *fileSearch) Delete(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	if err := s.search.Delete(s.index, ids); err != nil {
		return err
	}
	return nil
}

func (s *fileSearch) Query(query string, opts infra.QueryOptions) ([]model.File, error) {
	hits, err := s.search.Query(s.index, query, opts)
	if err != nil {
		return nil, err
	}
	var res []model.File
	for _, v := range hits {
		var b []byte
		b, err = json.Marshal(v)
		if err != nil {
			return nil, err
		}
		file := repo.NewFile()
		if err = json.Unmarshal(b, &file); err != nil {
			return nil, err
		}
		res = append(res, file)
	}
	return res, nil
}

func (s *fileSearch) populateTextField(files []model.File) error {
	for _, f := range files {
		if f.GetType() == model.FileTypeFile && f.GetSnapshotID() != nil {
			snapshot, err := s.snapshotRepo.Find(*f.GetSnapshotID())
			if err != nil {
				return err
			}
			if snapshot.HasText() {
				text, err := s.s3.GetText(snapshot.GetText().Key, snapshot.GetText().Bucket, minio.GetObjectOptions{})
				if err != nil {
					return err
				}
				f.SetText(&text)
			}
		}
	}
	return nil
}

func (s *fileSearch) mapEntity(file model.File) *fileEntity {
	return &fileEntity{
		ID:          file.GetID(),
		WorkspaceID: file.GetWorkspaceID(),
		Name:        file.GetName(),
		Type:        file.GetType(),
		ParentID:    file.GetParentID(),
		Text:        file.GetText(),
		SnapshotID:  file.GetSnapshotID(),
		CreateTime:  file.GetCreateTime(),
		UpdateTime:  file.GetUpdateTime(),
	}
}
