import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertDownloadSchema } from "@shared/schema";
import { 
  asyncHandler, 
  successResponse, 
  ValidationError, 
  NotFoundError 
} from "../errors";
import { 
  DTOTransformer, 
  DownloadListDTO, 
  DownloadDetailDTO 
} from "../dtos";
import { cacheService, CACHE_TTL, cacheInvalidation } from "../cache";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

export function createDownloadsRoutes() {
  const router = Router();

  // Import authentication utilities dynamically
  let authUtils: any;
  
  const getAuthUtils = async () => {
    if (!authUtils) {
      authUtils = await import("../auth");
    }
    return authUtils;
  };

  // Ensure upload directories exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  const downloadDirs = ['pdfs', 'images', 'documents'].map(dir => path.join(uploadDir, dir));
  
  [uploadDir, ...downloadDirs].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Serve static files from uploads directory
  router.use('/uploads', express.static(uploadDir));

  // Configure multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fileType = req.body.fileType || 'documents';
      const destDir = path.join(uploadDir, fileType === 'pdf' ? 'pdfs' : fileType === 'image' ? 'images' : 'documents');
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_');
      cb(null, uniqueSuffix + '-' + sanitizedName);
    }
  });

  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    }
  });

  // Get downloads with caching
  router.get("/", asyncHandler(async (req: Request, res: Response) => {
    const { category, fileType, featured, limit, offset } = req.query;
    
    const options = {
      category: category as string | undefined,
      fileType: fileType as string | undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    // Generate cache key
    const cacheKey = cacheService.generateDownloadKey(options);
    
    // Try cache first
    const cachedDownloads = cacheService.get(cacheKey);
    if (cachedDownloads) {
      res.set({
        'Cache-Control': 'public, max-age=900', // 15 minutes
        'X-Cache': 'HIT'
      });
      return successResponse(res, cachedDownloads, "Downloads retrieved successfully");
    }

    const downloads = await storage.getDownloads(options);
    
    // Transform to DTOs
    const downloadDTOs: DownloadListDTO[] = downloads.map(download => 
      DTOTransformer.toDownloadListDTO(download)
    );
    
    // Cache the result
    cacheService.set(cacheKey, downloadDTOs, CACHE_TTL.DOWNLOADS_LIST);
    
    res.set({
      'Cache-Control': 'public, max-age=900',
      'X-Cache': 'MISS'
    });

    successResponse(res, downloadDTOs, "Downloads retrieved successfully");
  }));

  // Get download by ID with caching
  router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid download ID");
    }
    
    const cacheKey = cacheService.generateItemKey('download', id);
    
    // Try cache first
    const cachedDownload = cacheService.get(cacheKey);
    if (cachedDownload) {
      res.set({
        'Cache-Control': 'public, max-age=900',
        'X-Cache': 'HIT'
      });
      return successResponse(res, cachedDownload, "Download retrieved successfully");
    }
    
    const download = await storage.getDownloadById(id);
    if (!download) {
      throw new NotFoundError("Download");
    }
    
    // Transform to DTO
    const downloadDTO: DownloadDetailDTO = DTOTransformer.toDownloadDetailDTO(download);
    
    // Cache the result
    cacheService.set(cacheKey, downloadDTO, CACHE_TTL.DOWNLOAD_DETAIL);
    
    res.set({
      'Cache-Control': 'public, max-age=900',
      'X-Cache': 'MISS'
    });
    
    successResponse(res, downloadDTO, "Download retrieved successfully");
  }));

  // Increment download count
  router.post("/:id/download", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid download ID");
    }
    
    await storage.incrementDownloadCount(id);
    
    // Invalidate download caches after count increment
    cacheInvalidation.downloads();
    
    successResponse(res, { success: true }, "Download count incremented successfully");
  }));

  // Create download (admin only)
  router.post("/", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const downloadData = insertDownloadSchema.parse(req.body);
          const newDownload = await storage.createDownload(downloadData);
          
          // Invalidate download caches after creation
          cacheInvalidation.downloads();
          
          // Transform to DTO for response
          const downloadDTO: DownloadDetailDTO = DTOTransformer.toDownloadDetailDTO(newDownload);
          
          successResponse(res, downloadDTO, "Download created successfully", 201);
        })(req, res, next);
      });
    });
  });

  // Update download (admin only)
  router.put("/:id", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const id = parseInt(req.params.id);
          if (isNaN(id)) {
            throw new ValidationError("Invalid download ID");
          }
          
          const downloadData = insertDownloadSchema.partial().parse(req.body);
          const updatedDownload = await storage.updateDownload(id, downloadData);
          
          // Invalidate download caches after update
          cacheInvalidation.downloads();
          
          // Transform to DTO for response
          const downloadDTO: DownloadDetailDTO = DTOTransformer.toDownloadDetailDTO(updatedDownload);
          
          successResponse(res, downloadDTO, "Download updated successfully");
        })(req, res, next);
      });
    });
  });

  // Delete download (admin only)
  router.delete("/:id", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const id = parseInt(req.params.id);
          if (isNaN(id)) {
            throw new ValidationError("Invalid download ID");
          }
          
          await storage.deleteDownload(id);
          
          // Invalidate download caches after deletion
          cacheInvalidation.downloads();
          
          res.status(204).send();
        })(req, res, next);
      });
    });
  });

  // General file upload endpoint (for article images, etc.)
  router.post("/upload", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return upload.single('file')(req, res, (err) => {
          if (err) {
            return next(err);
          }
          
          return asyncHandler(async (req: Request, res: Response) => {
            if (!req.file) {
              throw new ValidationError("No file uploaded");
            }

            const fileUrl = `/uploads/${req.file.filename}`;
            
            successResponse(res, {
              url: fileUrl,
              filename: req.file.filename,
              originalName: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype
            }, "File uploaded successfully", 201);
          })(req, res, next);
        });
      });
    });
  });

  // File upload endpoint for downloads
  router.post("/upload-download", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return upload.single('file')(req, res, (err) => {
          if (err) {
            return next(err);
          }
          
          return asyncHandler(async (req: Request, res: Response) => {
            if (!req.file) {
              throw new ValidationError("No file uploaded");
            }

            const {
              title,
              titleAr,
              description,
              descriptionAr,
              category,
              categoryAr,
              fileType,
              featured,
              tags
            } = req.body;

            // Parse tags if it's a JSON string
            let parsedTags: string[] = [];
            if (tags) {
              try {
                parsedTags = JSON.parse(tags);
              } catch {
                parsedTags = [tags];
              }
            }

            const downloadData = {
              title,
              titleAr: titleAr || null,
              description,
              descriptionAr: descriptionAr || null,
              category,
              categoryAr: categoryAr || null,
              fileType: fileType as "pdf" | "image" | "document",
              fileName: req.file.filename,
              originalFileName: req.file.originalname,
              filePath: req.file.path,
              fileSize: req.file.size,
              featured: featured === 'true',
              tags: parsedTags
            };

            const newDownload = await storage.createDownload(downloadData);
            
            // Invalidate download caches after creation
            cacheInvalidation.downloads();
            
            // Transform to DTO for response
            const downloadDTO: DownloadDetailDTO = DTOTransformer.toDownloadDetailDTO(newDownload);
            
            successResponse(res, downloadDTO, "File uploaded and download created successfully", 201);
          })(req, res, next);
        });
      });
    });
  });

  // Download guide endpoint (legacy)
  router.get("/media-monitoring-guide", (req, res) => {
    res.json({ 
      message: "Media monitoring guide download", 
      note: "Contact rased@almstkshf.com for the complete guide",
      email: "rased@almstkshf.com"
    });
  });

  return router;
}