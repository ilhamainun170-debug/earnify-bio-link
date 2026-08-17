'use client'

import { useEffect, useState } from 'react'
import { Plus, GripVertical, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryForm } from './category-form'
import { SortableCategoryItem } from './sortable-category-item'
import type { Category } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      } else {
        toast.error('Failed to load categories')
      }
    } catch (error) {
      toast.error('Something went wrong')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)

      const newOrder = arrayMove(categories, oldIndex, newIndex)
      setCategories(newOrder)

      // Update sort order on server
      try {
        setIsReordering(true)
        const items = newOrder.map((cat, index) => ({
          id: cat.id,
          sortOrder: index + 1,
        }))

        const res = await fetch('/api/categories/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })

        if (res.ok) {
          toast.success('Categories reordered successfully')
        } else {
          toast.error('Failed to reorder categories')
          fetchCategories() // Revert
        }
      } catch (error) {
        toast.error('Something went wrong')
        console.error(error)
        fetchCategories() // Revert
      } finally {
        setIsReordering(false)
      }
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (category: Category) => {
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== category.id))
        toast.success('Category deleted successfully')
        setDeletingCategory(null)
      } else {
        toast.error('Failed to delete category')
      }
    } catch (error) {
      toast.error('Something went wrong')
      console.error(error)
    }
  }

  const handleSaveCategory = (savedCategory: Category) => {
    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === savedCategory.id ? savedCategory : c
        )
      )
    } else {
      setCategories([...categories, savedCategory])
    }
    setShowForm(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-slate-400 mt-1">
            Manage and organize your link categories. Drag to reorder.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null)
            setShowForm(true)
          }}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Form Card */}
      {showForm && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              category={editingCategory}
              onSaved={handleSaveCategory}
              onCancel={() => {
                setShowForm(false)
                setEditingCategory(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">No categories yet</p>
              <Button
                onClick={() => {
                  setEditingCategory(null)
                  setShowForm(true)
                }}
                variant="outline"
                className="border-slate-700 text-white hover:bg-white/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Category
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {categories.map((category) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      onEdit={handleEdit}
                      onDelete={() => setDeletingCategory(category)}
                      isReordering={isReordering}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<span className="font-semibold text-white">{deletingCategory?.name}</span>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel className="border-slate-700 text-white hover:bg-white/5">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletingCategory && handleDelete(deletingCategory)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
