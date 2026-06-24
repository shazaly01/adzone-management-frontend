import { defineStore } from 'pinia'
import userService from '@/services/userService'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    user: null,
    pagination: {},
    loading: false,
  }),

  actions: {
    /**
     * جلب قائمة المستخدمين مع دعم حقن الفلاتر المباشرة (مثل تصفية المصممين) لحظيّاً
     */
    async fetchUsers(page = 1, filters = {}) {
      this.loading = true
      try {
        const response = await userService.get(page, filters)
        // [تحصين مالي]: إسناد مصفوفة البيانات المستلمة بأمان عالي
        this.users = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch users in store:', error)
        this.users = [] // إجراء وقائي لمنع انهيار المنسدلات في الواجهة
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOneUser(id) {
      this.loading = true
      try {
        const response = await userService.find(id)
        this.user = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch user ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(payload) {
      try {
        await userService.create(payload)
      } catch (error) {
        console.error('Failed to create user:', error)
        throw error
      }
    },

    async updateUser(id, payload) {
      try {
        await userService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update user ${id}:`, error)
        throw error
      }
    },

    async deleteUser(id) {
      try {
        await userService.delete(id)
      } catch (error) {
        console.error(`Failed to delete user ${id}:`, error)
        throw error
      }
    },
  },
})
