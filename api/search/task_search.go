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

	"github.com/kouprlabs/voltaserve/api/infra"
	"github.com/kouprlabs/voltaserve/api/model"
	"github.com/kouprlabs/voltaserve/api/repo"
)

type TaskSearch interface {
	Index(tasks []model.Task) error
	Update(tasks []model.Task) error
	Delete(ids []string) error
	Query(query string, opts infra.QueryOptions) ([]model.Task, error)
}

func NewTaskSearch() TaskSearch {
	return newTaskSearch()
}

type taskSearch struct {
	index    string
	search   infra.SearchManager
	taskRepo repo.TaskRepo
}

type taskEntity struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Error           *string `json:"error,omitempty"`
	Percentage      *int    `json:"percentage,omitempty"`
	IsIndeterminate bool    `json:"isIndeterminate"`
	UserID          string  `json:"userId"`
	Status          string  `json:"status"`
	CreateTime      string  `json:"createTime"`
	UpdateTime      *string `json:"updateTime,omitempty"`
}

func (t taskEntity) GetID() string {
	return t.ID
}

func newTaskSearch() *taskSearch {
	return &taskSearch{
		index:    infra.TaskSearchIndex,
		search:   infra.NewSearchManager(),
		taskRepo: repo.NewTaskRepo(),
	}
}

func (s *taskSearch) Index(tasks []model.Task) error {
	if len(tasks) == 0 {
		return nil
	}
	var res []infra.SearchModel
	for _, t := range tasks {
		res = append(res, s.mapEntity(t))
	}
	if err := s.search.Index(s.index, res); err != nil {
		return err
	}
	return nil
}

func (s *taskSearch) Update(orgs []model.Task) error {
	if len(orgs) == 0 {
		return nil
	}
	var res []infra.SearchModel
	for _, t := range orgs {
		res = append(res, s.mapEntity(t))
	}
	if err := s.search.Update(s.index, res); err != nil {
		return err
	}
	return nil
}

func (s *taskSearch) Delete(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	if err := s.search.Delete(s.index, ids); err != nil {
		return err
	}
	return nil
}

func (s *taskSearch) Query(query string, opts infra.QueryOptions) ([]model.Task, error) {
	hits, err := s.search.Query(s.index, query, opts)
	if err != nil {
		return nil, err
	}
	var res []model.Task
	for _, v := range hits {
		var b []byte
		b, err = json.Marshal(v)
		if err != nil {
			return nil, err
		}
		org := repo.NewTask()
		if err = json.Unmarshal(b, &org); err != nil {
			return nil, err
		}
		res = append(res, org)
	}
	return res, nil
}

func (s *taskSearch) mapEntity(task model.Task) *taskEntity {
	return &taskEntity{
		ID:              task.GetID(),
		Name:            task.GetName(),
		Error:           task.GetError(),
		Percentage:      task.GetPercentage(),
		IsIndeterminate: task.GetIsIndeterminate(),
		UserID:          task.GetUserID(),
		Status:          task.GetStatus(),
		CreateTime:      task.GetCreateTime(),
		UpdateTime:      task.GetUpdateTime(),
	}
}
