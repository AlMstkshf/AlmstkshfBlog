import { getStore } from "@netlify/blobs";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  key: string;
}

export class CloudStorageService {
  private store: ReturnType<typeof getStore> | null = null;
  private useLocalStorage: boolean = false;
  private localStoragePath: string;

  constructor() {
    this.localStoragePath = path.join(process.cwd(), 'uploads');
    
    try {
      // Try to initialize Netlify Blobs store
      this.store = getStore("uploads");
      console.log("✅ Netlify Blobs initialized successfully");
    } catch (error) {
      console.log("⚠️  Netlify Blobs not available, falling back to local storage");
      this.useLocalStorage = true;
      this.ensureLocalDirectories();
    }
  }

  private async ensureLocalDirectories() {
    const dirs = ['images', 'documents', 'pdfs', 'files'];
    for (const dir of dirs) {
      const dirPath = path.join(this.localStoragePath, dir);
      if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }
  }

  /**
   * Upload a file to cloud storage (Netlify Blobs) or local storage
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
      
      if (this.useLocalStorage) {
        // Local storage implementation
        await this.ensureLocalDirectories();
        const filePath = path.join(this.localStoragePath, key);
        await fs.writeFile(filePath, buffer);
        
        return {
          filename,
          originalName,
          size: buffer.length,
          mimetype,
          url: `/uploads/${key}`,
          key
        };
      } else {
        // Netlify Blobs implementation
        await this.store!.set(key, buffer, {
          metadata: {
            originalName,
            mimetype,
            size: buffer.length.toString(),
            uploadedAt: new Date().toISOString()
          }
        });
        
        // Generate public URL
        const url = await this.store!.getURL(key);
        
        return {
          filename,
          originalName,
          size: buffer.length,
          mimetype,
          url: url || `/api/files/${key}`,
          key
        };
      }
    } catch (error) {
      console.error('Error uploading file to storage:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Get file from storage
   */
  async getFile(key: string): Promise<{ buffer: Buffer; metadata: any } | null> {
    try {
      if (this.useLocalStorage) {
        // Local storage implementation
        const filePath = path.join(this.localStoragePath, key);
        if (!existsSync(filePath)) return null;
        
        const buffer = await fs.readFile(filePath);
        const stats = await fs.stat(filePath);
        
        return {
          buffer,
          metadata: {
            size: stats.size.toString(),
            uploadedAt: stats.mtime.toISOString(),
            originalName: path.basename(key),
            mimetype: this.getMimetypeFromExtension(path.extname(key))
          }
        };
      } else {
        // Netlify Blobs implementation
        const blob = await this.store!.get(key, { type: "arrayBuffer" });
        if (!blob) return null;
        
        const metadata = await this.store!.getMetadata(key);
        return {
          buffer: Buffer.from(blob),
          metadata
        };
      }
    } catch (error) {
      console.error('Error getting file from storage:', error);
      return null;
    }
  }

  private getMimetypeFromExtension(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      if (this.useLocalStorage) {
        // Local storage implementation
        const filePath = path.join(this.localStoragePath, key);
        if (existsSync(filePath)) {
          await fs.unlink(filePath);
        }
        return true;
      } else {
        // Netlify Blobs implementation
        await this.store!.delete(key);
        return true;
      }
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      return false;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder?: string): Promise<string[]> {
    try {
      if (this.useLocalStorage) {
        // Local storage implementation
        const searchPath = folder ? path.join(this.localStoragePath, folder) : this.localStoragePath;
        if (!existsSync(searchPath)) return [];
        
        const files = await fs.readdir(searchPath, { recursive: true });
        return files
          .filter(file => typeof file === 'string')
          .map(file => folder ? `${folder}/${file}` : file as string);
      } else {
        // Netlify Blobs implementation
        const { blobs } = await this.store!.list({
          prefix: folder ? `${folder}/` : undefined
        });
        return blobs.map(blob => blob.key);
      }
    } catch (error) {
      console.error('Error listing files from storage:', error);
      return [];
    }
  }

  /**
   * Get file URL for serving
   */
  async getFileUrl(key: string): Promise<string | null> {
    try {
      if (this.useLocalStorage) {
        // Local storage implementation - return relative URL
        return `/uploads/${key}`;
      } else {
        // Netlify Blobs implementation
        return await this.store!.getURL(key);
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cloudStorage = new CloudStorageService();