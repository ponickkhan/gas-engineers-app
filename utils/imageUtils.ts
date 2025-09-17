/**
 * Image utility functions for handling uploads, compression, and validation
 */

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: string
}

/**
 * Compress an image file to reduce size while maintaining quality
 */
export const compressImage = (
  file: File, 
  options: ImageCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = file.type
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw image on canvas with new dimensions
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        }, format, quality)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validate image file type and size
 */
export const validateImageFile = (file: File, maxSizeBytes: number = 5 * 1024 * 1024): string | null => {
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)'
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024)
    return `File size must be less than ${maxSizeMB}MB`
  }

  return null
}

/**
 * Generate a unique filename for uploads
 */
export const generateUniqueFileName = (originalName: string, userId?: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  
  const prefix = userId ? `${userId}/` : ''
  return `${prefix}${timestamp}_${random}.${extension}`
}

/**
 * Create a thumbnail from an image file
 */
export const createThumbnail = (
  file: File,
  maxSize: number = 150
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate thumbnail dimensions (square)
        const size = Math.min(img.width, img.height)
        const startX = (img.width - size) / 2
        const startY = (img.height - size) / 2

        canvas.width = maxSize
        canvas.height = maxSize

        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          startX, startY, size, size,
          0, 0, maxSize, maxSize
        )

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Convert image to base64 data URL
 */
export const imageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert image to data URL'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Check if a URL is a valid image
 */
export const isValidImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    
    img.src = url
  })
}

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}