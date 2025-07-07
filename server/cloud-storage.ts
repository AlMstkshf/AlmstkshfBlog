import { getStore } from "@netlify/blobs";
import crypto from "crypto";
import path from "path";

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  key: string;
}

export class CloudStorageService {
  private store: ReturnType<typeof getStore>;

  constructor() {
    // Initialize Netlify Blobs store
    this.store = getStore("uploads");
  }

  /**
   * Upload a file to Netlify Blobs
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string
  ): Promise<UploadedFile> {
    try {
      // Generate unique filename
      const ext = path.extname(originalName);
      const name = path.basename(originalName, ext);
      const timestamp = Date.now();
      const hash = crypto.randomBytes(8).toString('hex');
      const filename = `${name}-${timestamp}-${hash}${ext}`;
      
      // Determine folder based on mimetype
      let folder = 'files';
      if (mimetype.startsWith('image/')) {
        folder = 'images';
      } else if (mimetype === 'application/pdf') {
        folder = 'pdfs';
      } else if (mimetype.includes('document') || mimetype.includes('text')) {
        folder = 'documents';
      }
      
      const key = `${folder}/${filename}`;
      
      // Upload to Netlify Blobs
      await this.store.set(key, buffer, {
        metadata: {
          originalName,
          mimetype,
          size: buffer.length.toString(),
          uploadedAt: new Date().toISOString()
        }
      });
      
      // Generate public URL
      const url = await this.store.getURL(key);
      
      return {
        filename,
        originalName,
        size: buffer.length,
        mimetype,
        url: url || `/api/files/${key}`,
        key
      };
    } catch (error) {
      console.error('Error uploading file to cloud storage:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Get file from Netlify Blobs
   */
  async getFile(key: string): Promise<{ buffer: Buffer; metadata: any } | null> {
    try {
      const blob = await this.store.get(key, { type: "arrayBuffer" });
      if (!blob) return null;
      
      const metadata = await this.store.getMetadata(key);
      return {
        buffer: Buffer.from(blob),
        metadata
      };
    } catch (error) {
      console.error('Error getting file from cloud storage:', error);
      return null;
    }
  }

  /**
   * Delete file from Netlify Blobs
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.store.delete(key);
      return true;
    } catch (error) {
      console.error('Error deleting file from cloud storage:', error);
      return false;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder?: string): Promise<string[]> {
    try {
      const { blobs } = await this.store.list({
        prefix: folder ? `${folder}/` : undefined
      });
      return blobs.map(blob => blob.key);
    } catch (error) {
      console.error('Error listing files from cloud storage:', error);
      return [];
    }
  }

  /**
   * Get file URL for serving
   */
  async getFileUrl(key: string): Promise<string | null> {
    try {
      return await this.store.getURL(key);
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cloudStorage = new CloudStorageService();