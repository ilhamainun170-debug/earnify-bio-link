'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ImageIcon, Sparkles, Loader2, Tag, DollarSign, ExternalLink } from 'lucide-react'
import type { Link, Category } from '@/lib/types'

const linkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().min(1, 'URL is required'),
  description: z.string().optional(),
  price: z.string().optional(),
  variant: z.string().optional(),
  affiliateUrl: z.string().optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
})

type LinkFormValues = z.infer<typeof linkSchema>

interface LinkFormProps {
  link?: Link | null
  categories: Category[]
  onSaved: (link: Link) => void
  onCancel: () => void
}

export function LinkForm({ link, categories, onSaved, onCancel }: LinkFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingMeta, setIsFetchingMeta] = useState(false)
  const [showImage, setShowImage] = useState(!!link?.image_url)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link?.title || '',
      url: link?.url || '',
      description: link?.description || '',
      price: link?.price || '',
      variant: link?.variant || '',
      affiliateUrl: link?.affiliate_url || '',
      categoryId: link?.category_id || undefined,
      imageUrl: link?.image_url || '',
    },
  })

  const categoryId = watch('categoryId')
  const currentUrl = watch('url')

  const handleAutoFetch = async (urlToScrape?: string) => {
    const target = urlToScrape || currentUrl
    if (!target) {
      toast.error('Masukkan URL produk / affiliate terlebih dahulu')
      return
    }

    setIsFetchingMeta(true)
    try {
      const res = await fetch('/api/scrape/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal mengambil data dari URL')
      }

      const data = await res.json()
      let updatedCount = 0

      if (data.title) {
        setValue('title', data.title)
        updatedCount++
      }

      if (data.imageUrl) {
        setValue('imageUrl', data.imageUrl)
        setShowImage(true)
        updatedCount++
      }

      if (!watch('affiliateUrl')) {
        setValue('affiliateUrl', target)
      }

      if (updatedCount > 0) {
        toast.success('Data produk Amazon berhasil diambil otomatis!')
      } else {
        toast.info('Halaman terhubung, silakan lengkapi form di bawah.')
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengambil data'
      toast.error(msg)
    } finally {
      setIsFetchingMeta(false)
    }
  }

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (
      pastedText &&
      (pastedText.includes('amazon.') ||
        pastedText.includes('amzn.to') ||
        pastedText.includes('a.co'))
    ) {
      setTimeout(() => {
        handleAutoFetch(pastedText)
      }, 100)
    }
  }

  const onSubmit = async (data: LinkFormValues) => {
    setIsLoading(true)
    try {
      const url = link ? `/api/links/${link.id}` : '/api/links'
      const method = link ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          url: data.url,
          description: data.description || null,
          price: data.price || null,
          variant: data.variant || null,
          affiliateUrl: data.affiliateUrl || data.url,
          categoryId: data.categoryId === 'none' ? null : data.categoryId,
          imageUrl: showImage && data.imageUrl ? data.imageUrl : null,
        }),
      })

      if (res.ok) {
        const savedLink = await res.json()
        toast.success(link ? 'Link berhasil diperbarui' : 'Link berhasil dibuat')
        onSaved(savedLink)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Gagal menyimpan link')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* URL Input & Auto-fill */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="url" className="text-white text-sm font-medium">
            URL Produk / Link Toko
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isFetchingMeta || !currentUrl}
            onClick={() => handleAutoFetch()}
            className="h-7 px-2.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-1.5"
          >
            {isFetchingMeta ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Mengambil data...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Auto-fill dari Amazon
              </>
            )}
          </Button>
        </div>
        <div className="relative">
          <Input
            id="url"
            {...register('url')}
            onPaste={handleUrlPaste}
            placeholder="https://amzn.to/xxx atau https://amazon.com/dp/..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>
        <p className="text-xs text-slate-400">
          💡 Tempel link produk Amazon (termasuk link affiliate <code className="text-indigo-400">amzn.to</code>) untuk auto-fill.
        </p>
        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        )}
      </div>

      {/* Link Affiliate Khusus (Opsional jika beda dengan URL toko) */}
      <div className="space-y-2">
        <Label htmlFor="affiliateUrl" className="text-white text-sm flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          Link Affiliate (Tautan Tujuan Klik)
        </Label>
        <Input
          id="affiliateUrl"
          {...register('affiliateUrl')}
          placeholder="https://amzn.to/your-tag (kosongkan jika sama dengan URL di atas)"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm"
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white text-sm font-medium">
          Judul / Nama Produk *
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Contoh: Apple AirPods Pro Gen 2"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white text-sm font-medium">
          Deskripsi Produk
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Tulis deskripsi singkat atau keunggulan produk ini..."
          rows={2}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl resize-none"
        />
      </div>

      {/* Grid: Harga & Varian/Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-white text-sm flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Harga (Price)
          </Label>
          <Input
            id="price"
            {...register('price')}
            placeholder="Contoh: $199 atau Rp 2.500.000"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant" className="text-white text-sm flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Varian / Label / Badge
          </Label>
          <Input
            id="variant"
            {...register('variant')}
            placeholder="Contoh: Diskon 30% / Best Seller"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Kategori</Label>
        <Select
          value={categoryId || 'none'}
          onValueChange={(value) => setValue('categoryId', value === 'none' ? undefined : value)}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            <SelectItem value="none" className="text-white focus:bg-white/10 focus:text-white">
              Tanpa Kategori (Standalone)
            </SelectItem>
            {categories.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                className="text-white focus:bg-white/10 focus:text-white"
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Image Toggle */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <Label htmlFor="show-image" className="text-white text-sm cursor-pointer">
              Gunakan Foto Thumbnail Produk
            </Label>
          </div>
          <Switch
            id="show-image"
            checked={showImage}
            onCheckedChange={(checked) => {
              setShowImage(checked)
              if (!checked) {
                setValue('imageUrl', '')
              }
            }}
          />
        </div>

        {showImage && (
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-white text-xs text-slate-400">URL Gambar</Label>
            <Input
              id="imageUrl"
              {...register('imageUrl')}
              placeholder="https://images-na.ssl-images-amazon.com/..."
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-xs"
            />
            {watch('imageUrl') && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-xs mx-auto bg-black/20 p-2">
                <img
                  src={watch('imageUrl')}
                  alt="Preview"
                  className="w-full h-36 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? 'Menyimpan...' : link ? 'Simpan Perubahan' : 'Buat Link Produk'}
        </Button>
      </div>
    </form>
  )
}
