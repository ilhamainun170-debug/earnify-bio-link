'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { GripVertical, ExternalLink, Pencil, Trash2, MousePointerClick, Tag, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Link } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SortableLinkItemProps {
  link: Link & { categories?: { name: string } | null }
  onToggleActive: (id: string, isActive: boolean) => void
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
}

export function SortableLinkItem({ link, onToggleActive, onEdit, onDelete }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5",
        "hover:bg-white/8 transition-all",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing shrink-0"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Thumbnail */}
      {link.image_url && (
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/20 shrink-0 border border-white/10">
          <img
            src={link.image_url}
            alt={link.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Link Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn(
            "font-semibold text-sm break-words [overflow-wrap:anywhere] line-clamp-2 min-w-0",
            link.is_active ? "text-white" : "text-slate-500"
          )}>
            {link.title}
          </p>
          {link.categories?.name && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium shrink-0">
              {link.categories.name}
            </span>
          )}
          {link.variant && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3" />
              {link.variant}
            </span>
          )}
          {link.price && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-medium flex items-center gap-0.5 shrink-0">
              <DollarSign className="w-3 h-3" />
              {link.price}
            </span>
          )}
        </div>

        {link.description && (
          <p className="text-xs text-slate-400 line-clamp-1 break-words">
            {link.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <a
            href={link.affiliate_url || link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 truncate max-w-[180px] sm:max-w-[280px]"
          >
            {link.affiliate_url || link.url}
          </a>
          <span className="flex items-center gap-1 shrink-0">
            <MousePointerClick className="w-3 h-3" />
            {link.clicks || 0} klik
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Switch
          checked={link.is_active}
          onCheckedChange={(checked) => onToggleActive(link.id, checked)}
        />
        
        <a
          href={link.affiliate_url || link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(link)}
          className="text-slate-400 hover:text-white hover:bg-white/10"
        >
          <Pencil className="w-4 h-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-900 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Hapus Link Produk</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Apakah Anda yakin ingin menghapus &quot;{link.title}&quot;? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(link.id)}
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  )
}
