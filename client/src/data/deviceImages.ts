import { DeviceCategory } from '../types';

export const CATEGORY_DEFAULT_IMAGES: Record<DeviceCategory, string> = {
  WHEELCHAIR: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
  HEARING_AID: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
  CRUTCH: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
  TRICYCLE: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
  BRAILLE_KIT: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  PROSTHETIC: 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&w=800&q=80',
};

export interface SamplePhoto {
  title: string;
  category: DeviceCategory;
  typeId: number;
  url: string;
}

export const SAMPLE_DONOR_PHOTOS: SamplePhoto[] = [
  {
    title: 'Standard Folding Wheelchair',
    category: 'WHEELCHAIR',
    typeId: 1,
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Ergonomic Hospital Wheelchair',
    category: 'WHEELCHAIR',
    typeId: 1,
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Digital BTE Hearing Aid',
    category: 'HEARING_AID',
    typeId: 2,
    url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Adjustable Forearm Crutches',
    category: 'CRUTCH',
    typeId: 3,
    url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Hand-Operated Mobility Tricycle',
    category: 'TRICYCLE',
    typeId: 4,
    url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Braille Slate & Tactile Reader',
    category: 'BRAILLE_KIT',
    typeId: 5,
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Below-Knee Modular Prosthetic',
    category: 'PROSTHETIC',
    typeId: 6,
    url: 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * Resolves the display image URL for any device:
 * 1. If device has a custom uploaded image (`imageUrl`), uses it.
 * 2. Otherwise falls back to the high-resolution category photo.
 */
export function getDeviceImageUrl(device?: {
  imageUrl?: string | null;
  type?: { category?: string } | null;
  category?: string;
}): string {
  if (device?.imageUrl && device.imageUrl.trim().length > 0) {
    return device.imageUrl;
  }
  const rawCat = (device?.type?.category || device?.category || 'WHEELCHAIR') as DeviceCategory;
  return CATEGORY_DEFAULT_IMAGES[rawCat] || CATEGORY_DEFAULT_IMAGES.WHEELCHAIR;
}
