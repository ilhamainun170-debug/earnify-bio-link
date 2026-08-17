'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Facebook,
  ChevronDown,
  ExternalLink,
  AtSign,
  X
} from 'lucide-react'
import type { Link, Category, SiteSettings } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

// Custom icon components for platforms not in lucide
function MediumIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
    </svg>
  )
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.88-.73 2.082-1.146 3.476-1.202 1.02-.04 1.97.027 2.862.202l.003-.014c-.012-.7-.126-1.288-.34-1.766-.283-.636-.752-1.095-1.394-1.365-.773-.324-1.78-.465-2.992-.419l-.068-2.12c1.534-.059 2.863.126 3.95.55 1.036.406 1.834 1.06 2.373 1.943.514.843.786 1.87.806 3.053.57.135 1.094.317 1.57.55 1.157.564 2.035 1.378 2.608 2.42.635 1.157.876 2.625.697 4.247-.244 2.21-1.257 4.066-2.93 5.373C18.037 23.152 15.39 24.001 12.186 24zm.757-9.967c-.825.033-1.464.257-1.848.65-.345.353-.502.79-.467 1.3.033.482.254.862.66 1.128.488.32 1.16.456 1.943.394 1.058-.057 1.855-.445 2.37-1.154.323-.444.545-.99.666-1.63-.812-.193-1.694-.299-2.628-.299a10.9 10.9 0 00-.696.011z"/>
    </svg>
  )
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
    </svg>
  )
}

interface PublicViewProps {
  settings: SiteSettings
  standaloneLinks: Link[]
  categories: (Category & { links: Link[] })[]
}

export function PublicView({ settings, standaloneLinks, categories }: PublicViewProps) {
  const socialLinks = [
    { key: 'twitter', icon: Twitter, url: settings.twitter, label: 'Twitter / X' },
    { key: 'instagram', icon: Instagram, url: settings.instagram, label: 'Instagram' },
    { key: 'youtube', icon: Youtube, url: settings.youtube, label: 'YouTube' },
    { key: 'medium', icon: MediumIcon, url: settings.medium, label: 'Medium' },
    { key: 'threads', icon: ThreadsIcon, url: settings.threads, label: 'Threads' },
    { key: 'pinterest', icon: PinterestIcon, url: settings.pinterest, label: 'Pinterest' },
    { key: 'facebook', icon: Facebook, url: settings.facebook, label: 'Facebook' },
  ].filter(link => link.url)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-12 md:py-20 max-w-2xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-10"
        >
          {/* Logo */}
          {settings.logo ? (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-white/10 mb-6 shadow-2xl">
              <img
                src={settings.logo}
                alt={settings.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center ring-4 ring-white/10 mb-6 shadow-2xl">
              <AtSign className="w-12 h-12 text-white" />
            </div>
          )}

          {/* Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance break-words max-w-full">
            {settings.name}
          </h1>

          {/* Description */}
          {settings.description && (
            <p className="text-slate-400 text-base md:text-lg max-w-lg text-pretty break-words whitespace-pre-wrap">
              {settings.description}
            </p>
          )}

          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.key}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Links Section */}
        <div className="w-full space-y-4">
          {/* Standalone Links */}
          {standaloneLinks.map((link, index) => (
            <LinkCard key={link.id} link={link} index={index} />
          ))}

          {/* Category Dropdowns */}
          {categories.map((category, index) => (
            <CategoryDropdown 
              key={category.id} 
              category={category} 
              index={standaloneLinks.length + index}
            />
          ))}

          {/* Empty State */}
          {standaloneLinks.length === 0 && categories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-slate-500">No links available yet.</p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 text-sm">
            Powered by LinkHub
          </p>
        </motion.footer>
      </div>
    </main>
  )
}

function LinkCard({ link, index }: { link: Link; index: number }) {
  const [isClicked, setIsClicked] = useState(false)
  const [showImagePopup, setShowImagePopup] = useState(false)

  const handleClick = async () => {
    setIsClicked(true)
    
    // Track the click
    try {
      await fetch(`/api/links/${link.id}/click`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to track click:', error)
    }

    // Open the link
    window.open(link.url, '_blank', 'noopener,noreferrer')
    
    setTimeout(() => setIsClicked(false), 300)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowImagePopup(true)
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        onClick={handleClick}
        className={cn(
          "w-full group relative overflow-hidden",
          "bg-white/5 backdrop-blur-lg border border-white/10",
          "rounded-2xl",
          link.image_url ? "pl-3 pr-6 py-3" : "px-6 py-4",
          "text-white font-medium",
          "transition-all duration-300",
          "hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]",
          "hover:shadow-xl hover:shadow-indigo-500/10",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
          isClicked && "scale-95"
        )}
      >
        <div className="flex items-center gap-3">
          {link.image_url && (
            <div 
              onClick={handleImageClick}
              className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden cursor-zoom-in hover:ring-2 hover:ring-indigo-500/50 transition-all"
            >
              <img
                src={link.image_url}
                alt={link.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="text-left break-words [overflow-wrap:anywhere] line-clamp-2 min-w-0 pr-2 leading-snug">{link.title}</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0 ml-2 text-slate-400 group-hover:text-white transition-colors" />
          </div>
        </div>
        
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.button>

      {/* Image Popup Dialog */}
      {link.image_url && (
        <Dialog open={showImagePopup} onOpenChange={setShowImagePopup}>
          <DialogContent className="max-w-2xl p-0 bg-transparent border-none shadow-none">
            <VisuallyHidden>
              <DialogTitle>{link.title}</DialogTitle>
            </VisuallyHidden>
            <div className="relative">
              <button
                onClick={() => setShowImagePopup(false)}
                className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={link.image_url}
                alt={link.title}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white font-medium">{link.title}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function CategoryDropdown({ category, index }: { category: Category & { links: Link[] }; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="w-full"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full group relative overflow-hidden",
          "bg-white/5 backdrop-blur-lg border border-white/10",
          "rounded-2xl px-6 py-4",
          "text-white font-medium",
          "transition-all duration-300",
          "hover:bg-white/10 hover:border-white/20",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
          isOpen && "bg-white/10 border-white/20"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-left break-words [overflow-wrap:anywhere] min-w-0 pr-2 leading-snug">{category.name}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pl-4 space-y-2">
              {category.links.map((link, linkIndex) => (
                <CategoryLinkCard key={link.id} link={link} index={linkIndex} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CategoryLinkCard({ link, index }: { link: Link; index: number }) {
  const [isClicked, setIsClicked] = useState(false)
  const [showImagePopup, setShowImagePopup] = useState(false)

  const handleClick = async () => {
    setIsClicked(true)
    
    // Track the click
    try {
      await fetch(`/api/links/${link.id}/click`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to track click:', error)
    }

    // Open the link
    window.open(link.url, '_blank', 'noopener,noreferrer')
    
    setTimeout(() => setIsClicked(false), 300)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowImagePopup(true)
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        onClick={handleClick}
        className={cn(
          "w-full group relative overflow-hidden",
          "bg-white/3 backdrop-blur-lg border border-white/5",
          "rounded-xl",
          link.image_url ? "pl-2 pr-5 py-2" : "px-5 py-3",
          "text-white/90 font-medium text-sm",
          "transition-all duration-300",
          "hover:bg-white/8 hover:border-white/10 hover:scale-[1.01]",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
          isClicked && "scale-95"
        )}
      >
        <div className="flex items-center gap-2">
          {link.image_url && (
            <div 
              onClick={handleImageClick}
              className="relative flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden cursor-zoom-in hover:ring-2 hover:ring-indigo-500/50 transition-all"
            >
              <img
                src={link.image_url}
                alt={link.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="text-left break-words [overflow-wrap:anywhere] line-clamp-2 min-w-0 pr-2 leading-snug">{link.title}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-2 text-slate-500 group-hover:text-white/80 transition-colors" />
          </div>
        </div>
      </motion.button>

      {/* Image Popup Dialog */}
      {link.image_url && (
        <Dialog open={showImagePopup} onOpenChange={setShowImagePopup}>
          <DialogContent className="max-w-2xl p-0 bg-transparent border-none shadow-none">
            <VisuallyHidden>
              <DialogTitle>{link.title}</DialogTitle>
            </VisuallyHidden>
            <div className="relative">
              <button
                onClick={() => setShowImagePopup(false)}
                className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={link.image_url}
                alt={link.title}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white font-medium">{link.title}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
