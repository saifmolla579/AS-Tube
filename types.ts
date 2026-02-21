
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  views: string;
  duration: string;
  uploadedAt: string;
  category: string;
  creator: string;
  isYoutube?: boolean;
}

export interface User {
  isAdmin: boolean;
  name: string;
}
