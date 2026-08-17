'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Upload,
  X,
  AtSign,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { SiteSettings } from '@/lib/types'

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  youtube: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  medium: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  threads: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  pinterest: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface CustomizationViewProps {
  initialSettings: SiteSettings
}

const socialFields = [
  { key: 'twitter', icon: Twitter, label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
  { key: 'instagram', icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'youtube', icon: Youtube, label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { key: 'medium', icon: null, label: 'Medium', placeholder: 'https://medium.com/@username' },
  { key: 'threads', icon: null, label: 'Threads', placeholder: 'https://threads.net/@username' },
  { key: 'pinterest', icon: null, label: 'Pinterest', placeholder: 'https://pinterest.com/username' },
  { key: 'facebook', icon: Facebook, label: 'Facebook', placeholder: 'https://facebook.com/username' },
] as const

export function CustomizationView({ initialSettings }: CustomizationViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [logo, setLogo] = useState<string | null>(initialSettings.logo)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings.logo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialSettings.name,
      description: initialSettings.description || '',
      twitter: initialSettings.twitter || '',
      instagram: initialSettings.instagram || '',
      youtube: initialSettings.youtube || '',
      medium: initialSettings.medium || '',
      threads: initialSettings.threads || '',
      pinterest: initialSettings.pinterest || '',
      facebook: initialSettings.facebook || '',
    },
  })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        setLogo(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogo(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          logo,
          twitter: data.twitter || null,
          instagram: data.instagram || null,
          youtube: data.youtube || null,
          medium: data.medium || null,
          threads: data.threads || null,
          pinterest: data.pinterest || null,
          facebook: data.facebook || null,
        }),
      })

      if (res.ok) {
        toast.success('Settings saved successfully')
        router.refresh()
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Branding Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Branding</h2>

        {/* Logo Upload */}
        <div className="mb-6">
          <Label className="text-white mb-3 block">Logo</Label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/10">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center ring-4 ring-white/10">
                <AtSign className="w-10 h-10 text-white" />
              </div>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Recommended: Square image, max 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="name" className="text-white">Brand Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="My Brand"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="A short description about you or your brand"
            rows={3}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
          />
        </div>
      </motion.div>

      {/* Social Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Social Links</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {socialFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-white flex items-center gap-2">
                {field.icon && <field.icon className="w-4 h-4 text-slate-400" />}
                {field.label}
              </Label>
              <Input
                id={field.key}
                {...register(field.key as keyof SettingsFormValues)}
                placeholder={field.placeholder}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              {errors[field.key as keyof SettingsFormValues] && (
                <p className="text-sm text-destructive">
                  {errors[field.key as keyof SettingsFormValues]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
        <p className="text-sm text-slate-400 mb-4">
          This is how your page header will look to visitors.
        </p>

        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-xl p-8">
          <div className="flex flex-col items-center text-center">
            {logoPreview ? (
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/10 mb-4">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center ring-4 ring-white/10 mb-4">
                <AtSign className="w-8 h-8 text-white" />
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-2 break-words [overflow-wrap:anywhere] max-w-sm">
              {watch('name') || 'Your Brand'}
            </h3>
            {watch('description') && (
              <p className="text-slate-400 text-sm max-w-sm break-words whitespace-pre-wrap">
                {watch('description')}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
