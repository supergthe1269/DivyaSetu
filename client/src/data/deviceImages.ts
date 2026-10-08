import { DeviceCategory } from '../types';

export const CATEGORY_DEFAULT_IMAGES: Record<DeviceCategory, string> = {
  WHEELCHAIR: '/images/devices/wheelchair.jpg',
  HEARING_AID: '/images/devices/hearing_aid.jpg',
  CRUTCH: '/images/devices/crutch.jpg',
  TRICYCLE: '/images/devices/tricycle.jpg',
  BRAILLE_KIT: '/images/devices/braille_kit.jpg',
  PROSTHETIC: '/images/devices/prosthetic.jpg',
};

export interface SamplePhoto {
  title: string;
  category: DeviceCategory;
  typeId: number;
  url: string;
}

export const SAMPLE_DONOR_PHOTOS: SamplePhoto[] = [
  {
    title: 'Manual Folding Hospital Wheelchair',
    category: 'WHEELCHAIR',
    typeId: 1,
    url: '/images/devices/wheelchair.jpg',
  },
  {
    title: 'Digital BTE Hearing Aid with Ear Tube',
    category: 'HEARING_AID',
    typeId: 2,
    url: '/images/devices/hearing_aid.jpg',
  },
  {
    title: 'Adjustable Forearm & Axillary Crutches',
    category: 'CRUTCH',
    typeId: 3,
    url: '/images/devices/crutch.jpg',
  },
  {
    title: 'Hand-Propelled Mobility Tricycle',
    category: 'TRICYCLE',
    typeId: 4,
    url: '/images/devices/tricycle.jpg',
  },
  {
    title: 'Braille Writing Slate & Stylus Kit',
    category: 'BRAILLE_KIT',
    typeId: 5,
    url: '/images/devices/braille_kit.jpg',
  },
  {
    title: 'Modular Transtibial Prosthetic Leg',
    category: 'PROSTHETIC',
    typeId: 6,
    url: '/images/devices/prosthetic.jpg',
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
