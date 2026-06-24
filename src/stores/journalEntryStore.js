//src\stores\journalEntryStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import journalEntryService from '@/services/journalEntryService'

export const useJournalEntryStore = defineStore('journalEntry', () => {
  // --- State ---
  const journalEntries = ref([])
  const pagination = ref({})
  const currentJournalEntry = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchJournalEntries(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await journalEntryService.get(page, filters)
      journalEntries.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'Failed to fetch journal entries.'
      console.error(err)
      journalEntries.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchJournalEntry(id) {
    loading.value = true
    error.value = null
    currentJournalEntry.value = null
    try {
      const response = await journalEntryService.find(id)
      currentJournalEntry.value = response.data.data
    } catch (err) {
      error.value = 'Failed to fetch journal entry.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createJournalEntry(payload) {
    loading.value = true
    error.value = null
    try {
      await journalEntryService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create journal entry.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateJournalEntry(id, payload) {
    loading.value = true
    error.value = null
    try {
      await journalEntryService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update journal entry.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteJournalEntry(id) {
    loading.value = true
    error.value = null
    try {
      await journalEntryService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete journal entry.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    journalEntries,
    pagination,
    currentJournalEntry,
    loading,
    error,
    fetchJournalEntries,
    fetchJournalEntry,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
  }
})
