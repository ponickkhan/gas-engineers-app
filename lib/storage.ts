import { supabase } from './supabase'
import { compressImage, validateImageFile, generateUniqueFileName } from '@/utils/imageUtils'

export interface UploadOptions {
  bucket: string
  folder?: string
  compress?: boolean
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeBytes?: number
}

export interface UploadResult {
  url: string
  path: string
  size: number
}

/**
 * Upload a file to Supabase Storage with optional compression
 */
export const uploadFile = async (
  file: File,
  userId: string,
  options: UploadOptions
): Promise<UploadResult> => {
  const {
    bucket,
    folder = '',
    compress = true,
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    maxSizeBytes = 5 * 1024 * 1024
  } = options

  // Validate file
  const validationError = validateImageFile(file, maxSizeBytes)
  if (validationError) {
    throw new Error(validationError)
  }

  // Compress image if requested
  let fileToUpload = file
  if (compress && file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality
      })
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error)
      fileToUpload = file
    }
  }

  // Generate unique filename
  const fileName = generateUniqueFileName(file.name, userId)
  const filePath = folder ? `${folder}/${fileName}` : fileName

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
    size: fileToUpload.size
  }
}

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Upload signature image
 */
export const uploadSignature = async (file: File, userId: string): Promise<UploadResult> => {
  return uploadFile(file, userId, {
    bucket: 'signatures',
    folder: userId,
    compress: true,
    maxWidth: 400,
    maxHeight: 200,
    quality: 0.9,
    maxSizeBytes: 2 * 1024 * 1024 // 2MB for signatures
  })
}

/**
 * Upload company logo
 */
export const uploadLogo = async (file: File, userId: string): Promise<UploadResult> => {
  return uploadFile(file, userId, {
    bucket: 'logos',
    folder: userId,
    compress: true,
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.9,
    maxSizeBytes: 1 * 1024 * 1024 // 1MB for logos
  })
}

/**
 * Get signed URL for private files (if needed)
 */
export const getSignedUrl = async (
  bucket: string, 
  path: string, 
  expiresIn: number = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * List files in a bucket/folder
 */
export const listFiles = async (
  bucket: string,
  folder?: string,
  limit: number = 100
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}

/**
 * Get file info
 */
export const getFileInfo = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path.split('/').slice(0, -1).join('/'), {
      search: path.split('/').pop()
    })

  if (error) {
    throw new Error(`Failed to get file info: ${error.message}`)
  }

  return data[0] || null
}