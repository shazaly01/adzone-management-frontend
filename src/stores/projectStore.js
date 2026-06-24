// src/stores/projectStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import projectService from '@/services/projectService'

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const projects = ref([])
  const pagination = ref({})
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchProjects(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await projectService.get(page, filters)
      projects.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'Failed to fetch projects.'
      console.error(err)
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id) {
    loading.value = true
    error.value = null
    currentProject.value = null
    try {
      const response = await projectService.find(id)
      currentProject.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch project.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload) {
    loading.value = true
    error.value = null
    try {
      await projectService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create project.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, payload) {
    loading.value = true
    error.value = null
    try {
      await projectService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update project.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    loading.value = true
    error.value = null
    try {
      await projectService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete project.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    projects,
    pagination,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  }
})
