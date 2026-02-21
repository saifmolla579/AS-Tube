
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  views: string;
  likes: number;
  duration: string;
  uploadedAt: string;
  creator: string;
  isYoutube?: boolean;
  isGoogleDrive?: boolean;
}

export interface User {
  isAdmin: boolean;
  name: string;
}
