export interface Manga {
  id: string;
  title: string;
  description?: string;
  author: string;
  coverImage: string;
  genres?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus';
  chapterCount?: number;
  rating?: number;
  views?: number;
  uploaderId?: string;
  uploaderType?: 'creator' | 'admin';
  isPublished?: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}