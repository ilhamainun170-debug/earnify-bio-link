'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Plus, Search, Filter, Link2, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Link, Category } from '@/lib/types'
import { SortableLinkItem } from './sortable-link-item'
import { LinkForm } from './link-form'
import { CategoryForm } from './category-form'

interface LinksViewProps {
  initialLinks: (Link & { categories?: { name: string } | null })[]
  categories: Category[]
}

export function LinksView({ initialLinks, categories: initialCategories }: LinksViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [links, setLinks] = useState(initialLinks)
  const [categories, setCategories] = useState(initialCategories)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [newDialogType, setNewDialogType] = useState<'link' | 'category' | null>(null)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Check for ?new=link query param
  useEffect(() => {
    if (searchParams.get('new') === 'link') {
      setNewDialogType('link')
      setIsNewDialogOpen(true)
      // Clear the query param
      router.replace('/admin/links')
    }
  }, [searchParams, router])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter links
  const filteredLinks = links.filter((link) => {
    const matchesSearch = link.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || 
      (categoryFilter === 'uncategorized' ? !link.category_id : link.category_id === categoryFilter)
    return matchesSearch && matchesCategory
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((item) => item.id === active.id)
      const newIndex = links.findIndex((item) => item.id === over.id)

      const newLinks = arrayMove(links, oldIndex, newIndex)
      setLinks(newLinks)

      // Update sort orders in database
      const updates = newLinks.map((link, index) => ({
        id: link.id,
        sortOrder: index + 1,
      }))

      try {
        await fetch('/api/links/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updates }),
        })
      } catch {
        toast.error('Failed to save order')
        setLinks(initialLinks)
      }
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })

      if (res.ok) {
        setLinks(links.map((link) =>
          link.id === id ? { ...link, is_active: isActive } : link
        ))
        toast.success(isActive ? 'Link activated' : 'Link deactivated')
      }
    } catch {
      toast.error('Failed to update link')
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLinks(links.filter((link) => link.id !== id))
        toast.success('Link deleted')
      }
    } catch {
      toast.error('Failed to delete link')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories(categories.filter((cat) => cat.id !== id))
        // Update links that were in this category
        setLinks(links.map((link) =>
          link.category_id === id ? { ...link, category_id: null, categories: null } : link
        ))
        toast.success('Category deleted')
      }
    } catch {
      toast.error('Failed to delete category')
    }
  }

  const handleLinkSaved = (link: Link) => {
    if (editingLink) {
      setLinks(links.map((l) => (l.id === link.id ? { ...l, ...link } : l)))
    } else {
      setLinks([...links, link])
    }
    setIsNewDialogOpen(false)
    setEditingLink(null)
    router.refresh()
  }

  const handleCategorySaved = (category: Category) => {
    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === category.id ? category : c)))
    } else {
      setCategories([...categories, category])
    }
    setIsNewDialogOpen(false)
    setEditingCategory(null)
    router.refresh()
  }

  const openNewDialog = (type: 'link' | 'category') => {
    setNewDialogType(type)
    setEditingLink(null)
    setEditingCategory(null)
    setIsNewDialogOpen(true)
  }

  const openEditDialog = (link: Link) => {
    setNewDialogType('link')
    setEditingLink(link)
    setIsNewDialogOpen(true)
  }

  const openEditCategoryDialog = (category: Category) => {
    setNewDialogType('category')
    setEditingCategory(category)
    setIsNewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all" className="text-white focus:bg-white/10 focus:text-white">All Categories</SelectItem>
              <SelectItem value="uncategorized" className="text-white focus:bg-white/10 focus:text-white">Uncategorized</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-white focus:bg-white/10 focus:text-white">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => openNewDialog('category')}
            variant="outline"
            className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
          >
            <Folder className="w-4 h-4" />
            New Category
          </Button>
          <Button
            onClick={() => openNewDialog('link')}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
          >
            <Plus className="w-4 h-4" />
            New Link
          </Button>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const linkCount = links.filter((l) => l.category_id === category.id).length
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Folder className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm break-words [overflow-wrap:anywhere] line-clamp-2">{category.name}</p>
                      <p className="text-xs text-slate-500">{linkCount} links</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditCategoryDialog(category)}
                      className="text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-slate-400 hover:text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Links List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Links</h2>
          <span className="text-sm text-slate-400">{filteredLinks.length} links</span>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No links found</p>
            <Button
              onClick={() => openNewDialog('link')}
              variant="link"
              className="mt-2 text-indigo-400"
            >
              Create your first link
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredLinks.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredLinks.map((link) => (
                    <SortableLinkItem
                      key={link.id}
                      link={link}
                      onToggleActive={handleToggleActive}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteLink}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </motion.div>

      {/* New/Edit Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {newDialogType === 'link'
                ? editingLink
                  ? 'Edit Link'
                  : 'Create New Link'
                : editingCategory
                ? 'Edit Category'
                : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>

          {newDialogType === 'link' ? (
            <LinkForm
              link={editingLink}
              categories={categories}
              onSaved={handleLinkSaved}
              onCancel={() => setIsNewDialogOpen(false)}
            />
          ) : (
            <CategoryForm
              category={editingCategory}
              onSaved={handleCategorySaved}
              onCancel={() => setIsNewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => openNewDialog('link')}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
