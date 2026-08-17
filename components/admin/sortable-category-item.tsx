'use client'

import { GripVertical, Pencil, Trash2, Link2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SortableCategoryItemProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  isReordering: boolean
}

export function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
  isReordering,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-all duration-200",
        isDragging
          ? "bg-slate-700/50 border-indigo-500/50 shadow-lg"
          : "bg-slate-700/20 border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600/50"
      )}
    >
      {/* Drag Handle and Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          disabled={isReordering}
          className="p-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-white font-medium break-words [overflow-wrap:anywhere] line-clamp-2">{category.name}</p>
          {category.links && category.links.length > 0 && (
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
              <Link2 className="w-3 h-3" />
              {category.links.length} link{category.links.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
          disabled={isReordering}
          className="text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(category)}
          disabled={isReordering}
          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
