import { useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook for managing database operations
 * Provides CRUD operations (Create, Read, Update, Delete)
 */
export function useDatabase(tableName) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const select = async (query = '*') => {
    try {
      setError(null)
      setLoading(true)
      const { data, error: err } = await supabase
        .from(tableName)
        .select(query)

      if (err) throw err
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const insert = async (records) => {
    try {
      setError(null)
      setLoading(true)
      const { data, error: err } = await supabase
        .from(tableName)
        .insert(records)
        .select()

      if (err) throw err
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id, updates) => {
    try {
      setError(null)
      setLoading(true)
      const { data, error: err } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()

      if (err) throw err
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    try {
      setError(null)
      setLoading(true)
      const { error: err } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (err) throw err
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const query = async (queryBuilder) => {
    try {
      setError(null)
      setLoading(true)
      const { data, error: err } = await queryBuilder

      if (err) throw err
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    select,
    insert,
    update,
    remove,
    query
  }
}
