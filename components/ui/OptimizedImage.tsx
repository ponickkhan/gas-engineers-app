'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/utils/cn'
import { LoadingSpinner } from './LoadingStates'

export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  showLoadingSpinner?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  style,
  onLoad,
  onError,
  fallbackSrc,
  showLoadingSpinner = true,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleLoad = () => {
    setLoading(false)
    setError(false)
    if (onLoad) {
      onLoad()
    }
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
    
    // Try fallback image if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setLoading(true)
      setError(false)
      return
    }
    
    if (onError) {
      onError()
    }
  }

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  const imageProps = {
    src: currentSrc,
    alt,
    quality,
    priority,
    placeholder,
    blurDataURL: blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined),
    sizes,
    style,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-opacity duration-300',
      loading ? 'opacity-0' : 'opacity-100',
      error ? 'opacity-50' : '',
      className
    ),
    ...props
  }

  return (
    <div className="relative">
      {fill ? (
        <Image
          {...imageProps}
          fill
        />
      ) : (
        <Image
          {...imageProps}
          width={width}
          height={height}
        />
      )}
      
      {/* Loading spinner */}
      {loading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Avatar component with optimized image
export interface AvatarProps {
  src?: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallbackText?: string
  className?: string
}

export function Avatar({
  src,
  alt,
  size = 'md',
  fallbackText,
  className = ''
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const sizePixels = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  }

  const initials = fallbackText || alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={cn(
      'relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {src && !imageError ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="rounded-full object-cover"
          onError={() => setImageError(true)}
          showLoadingSpinner={false}
        />
      ) : (
        <span className="font-medium text-gray-600">
          {initials}
        </span>
      )}
    </div>
  )
}

// Logo component with optimized loading
export interface LogoProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
}

export function Logo({
  src,
  alt,
  width = 120,
  height = 40,
  priority = true,
  className = ''
}: LogoProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      quality={90}
      className={cn('object-contain', className)}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Sh7Nh9NzqhqWjzTLDKiw2qLLGqjhQoAAHYD2KqeQjGE="
    />
  )
}

// Signature image component
export interface SignatureImageProps {
  src: string
  alt?: string
  maxWidth?: number
  maxHeight?: number
  className?: string
}

export function SignatureImage({
  src,
  alt = 'Signature',
  maxWidth = 200,
  maxHeight = 100,
  className = ''
}: SignatureImageProps) {
  return (
    <div className={cn('relative inline-block', className)} style={{ maxWidth, maxHeight }}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={maxWidth}
        height={maxHeight}
        className="object-contain"
        quality={90}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Sh7Nh9NzqhqWjzTLDKiw2qLLGqjhQoAAHYD2KqeQjGE="
      />
    </div>
  )
}