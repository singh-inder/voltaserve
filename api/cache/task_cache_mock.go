// Code generated by MockGen. DO NOT EDIT.
// Source: cache/task_cache.go

// Package mocks is a generated GoMock package.
package cache

import (
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"

	model "github.com/kouprlabs/voltaserve/api/model"
)

// MockTaskCache is a mock of TaskCache interface.
type MockTaskCache struct {
	ctrl     *gomock.Controller
	recorder *MockTaskCacheMockRecorder
}

// MockTaskCacheMockRecorder is the mock recorder for MockTaskCache.
type MockTaskCacheMockRecorder struct {
	mock *MockTaskCache
}

// NewMockTaskCache creates a new mock instance.
func NewMockTaskCache(ctrl *gomock.Controller) *MockTaskCache {
	mock := &MockTaskCache{ctrl: ctrl}
	mock.recorder = &MockTaskCacheMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockTaskCache) EXPECT() *MockTaskCacheMockRecorder {
	return m.recorder
}

// Delete mocks base method.
func (m *MockTaskCache) Delete(id string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Delete", id)
	ret0, _ := ret[0].(error)
	return ret0
}

// Delete indicates an expected call of Delete.
func (mr *MockTaskCacheMockRecorder) Delete(id interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Delete", reflect.TypeOf((*MockTaskCache)(nil).Delete), id)
}

// Get mocks base method.
func (m *MockTaskCache) Get(id string) (model.Task, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Get", id)
	ret0, _ := ret[0].(model.Task)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Get indicates an expected call of Get.
func (mr *MockTaskCacheMockRecorder) Get(id interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Get", reflect.TypeOf((*MockTaskCache)(nil).Get), id)
}

// Refresh mocks base method.
func (m *MockTaskCache) Refresh(id string) (model.Task, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Refresh", id)
	ret0, _ := ret[0].(model.Task)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Refresh indicates an expected call of Refresh.
func (mr *MockTaskCacheMockRecorder) Refresh(id interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Refresh", reflect.TypeOf((*MockTaskCache)(nil).Refresh), id)
}

// Set mocks base method.
func (m *MockTaskCache) Set(file model.Task) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Set", file)
	ret0, _ := ret[0].(error)
	return ret0
}

// Set indicates an expected call of Set.
func (mr *MockTaskCacheMockRecorder) Set(file interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Set", reflect.TypeOf((*MockTaskCache)(nil).Set), file)
}
