import React from 'react';

type ProductDetailLayoutProps = {
  imageUrl: string;
  imageAlt: string;
  children: React.ReactNode;
};

export function ProductDetailLayout({
  imageUrl,
  imageAlt,
  children
}: ProductDetailLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      <div className="space-y-4">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-sm bg-surface-alt flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="h-full w-full object-cover transition-all duration-500"
            />
          ) : (
            <span className="text-sm text-text-secondary">No image</span>
          )}
        </div>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
