export interface UploadFormats {
  thumbnail_150?: string;
  thumbnail_300?: string;
  sm?: string;  // 640px
  md?: string;  // 768px
  lg?: string;  // 1024px
  xl?: string;  // 1280px
}

export interface Upload {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  key?: string;
  mimetype: string;
  size: number;
  
  // Metadata
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  
  // Generated formats
  formats?: UploadFormats;
  
  // Custom metadata fields
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
