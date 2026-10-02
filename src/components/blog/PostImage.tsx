import Image from "next/image";
import type { FeaturedImage } from "@/types/wordpress";

interface PostImageProps {
  image: FeaturedImage | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}

// Fills its parent box, so the parent decides the aspect ratio
export default function PostImage({ image, sizes, priority = false, className = "" }: PostImageProps) {
  if (!image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-sm font-medium text-brand-600">
        BabyMD Blog
      </div>
    );
  }

  return (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
