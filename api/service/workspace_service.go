// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.

package service

import (
	"errors"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/kouprlabs/voltaserve/api/cache"
	"github.com/kouprlabs/voltaserve/api/config"
	"github.com/kouprlabs/voltaserve/api/errorpkg"
	"github.com/kouprlabs/voltaserve/api/guard"
	"github.com/kouprlabs/voltaserve/api/helper"
	"github.com/kouprlabs/voltaserve/api/infra"
	"github.com/kouprlabs/voltaserve/api/model"
	"github.com/kouprlabs/voltaserve/api/repo"
	"github.com/kouprlabs/voltaserve/api/search"
)

type WorkspaceService struct {
	workspaceRepo   repo.WorkspaceRepo
	workspaceCache  cache.WorkspaceCache
	workspaceGuard  guard.WorkspaceGuard
	workspaceSearch search.WorkspaceSearch
	workspaceMapper WorkspaceMapper
	fileRepo        repo.FileRepo
	fileCache       cache.FileCache
	fileGuard       guard.FileGuard
	fileMapper      FileMapper
	s3              *infra.S3Manager
	config          *config.Config
}

func NewWorkspaceService() *WorkspaceService {
	return &WorkspaceService{
		workspaceRepo:   repo.NewWorkspaceRepo(),
		workspaceCache:  cache.NewWorkspaceCache(),
		workspaceSearch: search.NewWorkspaceSearch(),
		workspaceGuard:  guard.NewWorkspaceGuard(),
		workspaceMapper: newWorkspaceMapper(),
		fileRepo:        repo.NewFileRepo(),
		fileCache:       cache.NewFileCache(),
		fileGuard:       guard.NewFileGuard(),
		fileMapper:      newFileMapper(),
		s3:              infra.NewS3Manager(),
		config:          config.GetConfig(),
	}
}

type WorkspaceCreateOptions struct {
	Name            string  `json:"name"            validate:"required,max=255"`
	Image           *string `json:"image"`
	OrganizationID  string  `json:"organizationId"  validate:"required"`
	StorageCapacity int64   `json:"storageCapacity"`
}

func (svc *WorkspaceService) Create(opts WorkspaceCreateOptions, userID string) (*Workspace, error) {
	workspace, err := svc.createWorkspace(opts, userID)
	if err != nil {
		return nil, err
	}
	root, err := svc.createRoot(workspace, userID)
	if err != nil {
		return nil, err
	}
	workspace, err = svc.associateWorkspaceWithRoot(workspace, root)
	if err != nil {
		return nil, err
	}
	res, err := svc.workspaceMapper.mapOne(workspace, userID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (svc *WorkspaceService) createWorkspace(opts WorkspaceCreateOptions, userID string) (model.Workspace, error) {
	id := helper.NewID()
	bucket := strings.ReplaceAll(uuid.NewString(), "-", "")
	if err := svc.s3.CreateBucket(bucket); err != nil {
		return nil, err
	}
	if opts.StorageCapacity == 0 {
		opts.StorageCapacity = helper.MegabyteToByte(svc.config.Defaults.WorkspaceStorageCapacityMB)
	}
	res, err := svc.workspaceRepo.Insert(repo.WorkspaceInsertOptions{
		ID:              id,
		Name:            opts.Name,
		StorageCapacity: opts.StorageCapacity,
		OrganizationID:  opts.OrganizationID,
		Image:           opts.Image,
		Bucket:          bucket,
	})
	if err != nil {
		return nil, err
	}
	if err := svc.workspaceRepo.GrantUserPermission(res.GetID(), userID, model.PermissionOwner); err != nil {
		return nil, err
	}
	res, err = svc.workspaceRepo.Find(res.GetID())
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (svc *WorkspaceService) createRoot(workspace model.Workspace, userID string) (model.File, error) {
	res, err := svc.fileRepo.Insert(repo.FileInsertOptions{
		Name:        "root",
		WorkspaceID: workspace.GetID(),
		Type:        model.FileTypeFolder,
	})
	if err != nil {
		return nil, err
	}
	if err := svc.fileRepo.GrantUserPermission(res.GetID(), userID, model.PermissionOwner); err != nil {
		return nil, err
	}
	if _, err := svc.fileCache.Refresh(res.GetID()); err != nil {
		return nil, err
	}
	return res, nil
}

func (svc *WorkspaceService) associateWorkspaceWithRoot(workspace model.Workspace, root model.File) (model.Workspace, error) {
	if err := svc.workspaceRepo.UpdateRootID(workspace.GetID(), root.GetID()); err != nil {
		return nil, err
	}
	res, err := svc.workspaceCache.Refresh(workspace.GetID())
	if err != nil {
		return nil, err
	}
	if err = svc.workspaceSearch.Index([]model.Workspace{res}); err != nil {
		return nil, err
	}
	return res, nil
}

func (svc *WorkspaceService) Find(id string, userID string) (*Workspace, error) {
	workspace, err := svc.workspaceCache.Get(id)
	if err != nil {
		return nil, err
	}
	if err = svc.workspaceGuard.Authorize(userID, workspace, model.PermissionViewer); err != nil {
		return nil, err
	}
	res, err := svc.workspaceMapper.mapOne(workspace, userID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

type WorkspaceListOptions struct {
	Query     string
	Page      uint64
	Size      uint64
	SortBy    string
	SortOrder string
}

func (svc *WorkspaceService) List(opts WorkspaceListOptions, userID string) (*WorkspaceList, error) {
	all, err := svc.findAllWithOptions(opts, userID)
	if err != nil {
		return nil, err
	}
	if opts.SortBy == "" {
		opts.SortBy = SortByDateCreated
	}
	if opts.SortOrder == "" {
		opts.SortOrder = SortOrderAsc
	}
	sorted := svc.sort(all, opts.SortBy, opts.SortOrder)
	paged, totalElements, totalPages := svc.paginate(sorted, opts.Page, opts.Size)
	mapped, err := svc.workspaceMapper.mapMany(paged, userID)
	if err != nil {
		return nil, err
	}
	return &WorkspaceList{
		Data:          mapped,
		TotalPages:    totalPages,
		TotalElements: totalElements,
		Page:          opts.Page,
		Size:          uint64(len(mapped)),
	}, nil
}

func (svc *WorkspaceService) Probe(opts WorkspaceListOptions, userID string) (*WorkspaceProbe, error) {
	all, err := svc.findAllWithOptions(opts, userID)
	if err != nil {
		return nil, err
	}
	totalElements := uint64(len(all))
	return &WorkspaceProbe{
		TotalElements: totalElements,
		TotalPages:    (totalElements + opts.Size - 1) / opts.Size,
	}, nil
}

func (svc *WorkspaceService) PatchName(id string, name string, userID string) (*Workspace, error) {
	workspace, err := svc.workspaceCache.Get(id)
	if err != nil {
		return nil, err
	}
	if err = svc.workspaceGuard.Authorize(userID, workspace, model.PermissionEditor); err != nil {
		return nil, err
	}
	if workspace, err = svc.workspaceRepo.UpdateName(id, name); err != nil {
		return nil, err
	}
	if err = svc.sync(workspace); err != nil {
		return nil, err
	}
	res, err := svc.workspaceMapper.mapOne(workspace, userID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (svc *WorkspaceService) PatchStorageCapacity(id string, storageCapacity int64, userID string) (*Workspace, error) {
	workspace, err := svc.workspaceCache.Get(id)
	if err != nil {
		return nil, err
	}
	if err = svc.workspaceGuard.Authorize(userID, workspace, model.PermissionOwner); err != nil {
		return nil, err
	}
	size, err := svc.fileRepo.ComputeSize(workspace.GetRootID())
	if err != nil {
		return nil, err
	}
	if storageCapacity < size {
		return nil, errorpkg.NewInsufficientStorageCapacityError()
	}
	if workspace, err = svc.workspaceRepo.UpdateStorageCapacity(id, storageCapacity); err != nil {
		return nil, err
	}
	if err = svc.sync(workspace); err != nil {
		return nil, err
	}
	res, err := svc.workspaceMapper.mapOne(workspace, userID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (svc *WorkspaceService) Delete(id string, userID string) error {
	workspace, err := svc.workspaceCache.Get(id)
	if err != nil {
		return err
	}
	if err = svc.workspaceGuard.Authorize(userID, workspace, model.PermissionOwner); err != nil {
		return err
	}
	if err = svc.workspaceRepo.Delete(id); err != nil {
		return err
	}
	if err = svc.workspaceSearch.Delete([]string{workspace.GetID()}); err != nil {
		return err
	}
	if err = svc.workspaceCache.Delete(id); err != nil {
		return err
	}
	if err = svc.s3.RemoveBucket(workspace.GetBucket()); err != nil {
		return err
	}
	return nil
}

func (svc *WorkspaceService) HasEnoughSpaceForByteSize(id string, byteSize int64) (*bool, error) {
	workspace, err := svc.workspaceRepo.Find(id)
	if err != nil {
		return nil, err
	}
	root, err := svc.fileRepo.Find(workspace.GetRootID())
	if err != nil {
		return nil, err
	}
	usage, err := svc.fileRepo.ComputeSize(root.GetID())
	if err != nil {
		return nil, err
	}
	expectedUsage := usage + byteSize
	if expectedUsage > workspace.GetStorageCapacity() {
		return helper.ToPtr(false), err
	}
	return helper.ToPtr(true), nil
}

func (svc *WorkspaceService) findAll(userID string) ([]*Workspace, error) {
	ids, err := svc.workspaceRepo.FindIDs()
	if err != nil {
		return nil, err
	}
	authorized, err := svc.authorizeIDs(ids, userID)
	if err != nil {
		return nil, err
	}
	mapped, err := svc.workspaceMapper.mapMany(authorized, userID)
	if err != nil {
		return nil, err
	}
	return mapped, nil
}

func (svc *WorkspaceService) findAllWithOptions(opts WorkspaceListOptions, userID string) ([]model.Workspace, error) {
	var res []model.Workspace
	if opts.Query == "" {
		ids, err := svc.workspaceRepo.FindIDs()
		if err != nil {
			return nil, err
		}
		res, err = svc.authorizeIDs(ids, userID)
		if err != nil {
			return nil, err
		}
	} else {
		hits, err := svc.workspaceSearch.Query(opts.Query, infra.QueryOptions{})
		if err != nil {
			return nil, err
		}
		var workspaces []model.Workspace
		for _, hit := range hits {
			workspace, err := svc.workspaceCache.Get(hit.GetID())
			if err != nil {
				var e *errorpkg.ErrorResponse
				// We don't want to break if the search engine contains workspaces that shouldn't be there
				if errors.As(err, &e) && e.Code == errorpkg.NewWorkspaceNotFoundError(nil).Code {
					continue
				} else {
					return nil, err
				}
			}
			workspaces = append(workspaces, workspace)
		}
		res, err = svc.authorize(workspaces, userID)
		if err != nil {
			return nil, err
		}
	}
	return res, nil
}

func (svc *WorkspaceService) authorize(data []model.Workspace, userID string) ([]model.Workspace, error) {
	var res []model.Workspace
	for _, w := range data {
		if svc.workspaceGuard.IsAuthorized(userID, w, model.PermissionViewer) {
			res = append(res, w)
		}
	}
	return res, nil
}

func (svc *WorkspaceService) authorizeIDs(ids []string, userID string) ([]model.Workspace, error) {
	var res []model.Workspace
	for _, id := range ids {
		var w model.Workspace
		w, err := svc.workspaceCache.Get(id)
		if err != nil {
			var e *errorpkg.ErrorResponse
			if errors.As(err, &e) && e.Code == errorpkg.NewWorkspaceNotFoundError(nil).Code {
				continue
			} else {
				return nil, err
			}
		}
		if svc.workspaceGuard.IsAuthorized(userID, w, model.PermissionViewer) {
			res = append(res, w)
		}
	}
	return res, nil
}

func (svc *WorkspaceService) sort(data []model.Workspace, sortBy string, sortOrder string) []model.Workspace {
	if sortBy == SortByName {
		sort.Slice(data, func(i, j int) bool {
			if sortOrder == SortOrderDesc {
				return data[i].GetName() > data[j].GetName()
			} else {
				return data[i].GetName() < data[j].GetName()
			}
		})
		return data
	} else if sortBy == SortByDateCreated {
		sort.Slice(data, func(i, j int) bool {
			a, _ := time.Parse(time.RFC3339, data[i].GetCreateTime())
			b, _ := time.Parse(time.RFC3339, data[j].GetCreateTime())
			if sortOrder == SortOrderDesc {
				return a.UnixMilli() > b.UnixMilli()
			} else {
				return a.UnixMilli() < b.UnixMilli()
			}
		})
		return data
	} else if sortBy == SortByDateModified {
		sort.Slice(data, func(i, j int) bool {
			if data[i].GetUpdateTime() != nil && data[j].GetUpdateTime() != nil {
				a, _ := time.Parse(time.RFC3339, *data[i].GetUpdateTime())
				b, _ := time.Parse(time.RFC3339, *data[j].GetUpdateTime())
				if sortOrder == SortOrderDesc {
					return a.UnixMilli() > b.UnixMilli()
				} else {
					return a.UnixMilli() < b.UnixMilli()
				}
			} else {
				return false
			}
		})
		return data
	}
	return data
}

func (svc *WorkspaceService) paginate(data []model.Workspace, page, size uint64) ([]model.Workspace, uint64, uint64) {
	totalElements := uint64(len(data))
	totalPages := (totalElements + size - 1) / size
	if page > totalPages {
		return []model.Workspace{}, totalElements, totalPages
	}
	startIndex := (page - 1) * size
	endIndex := startIndex + size
	if endIndex > totalElements {
		endIndex = totalElements
	}
	return data[startIndex:endIndex], totalElements, totalPages
}

func (svc *WorkspaceService) sync(workspace model.Workspace) error {
	if err := svc.workspaceCache.Set(workspace); err != nil {
		return err
	}
	if err := svc.workspaceSearch.Update([]model.Workspace{workspace}); err != nil {
		return err
	}
	return nil
}
