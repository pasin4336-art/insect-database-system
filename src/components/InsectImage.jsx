'use client';

import { useState } from 'react';

/**
 * InsectImage — A reusable image component with graceful fallback.
 * Shows a beautiful gradient placeholder with an insect icon
 * when the image URL is broken or missing.
 */
export default function InsectImage({ src, alt, className = '', iconSize = 48 }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showFallback = hasError || !src;

  if (showFallback) {
    return (
      <div className={`img-placeholder ${className}`}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: `${iconSize}px`, color: 'rgba(0, 105, 72, 0.2)' }}
        >
          bug_report
        </span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`img-placeholder absolute inset-0 ${className}`}>
          <span
            className="material-symbols-outlined animate-pulse"
            style={{ fontSize: `${iconSize}px`, color: 'rgba(0, 105, 72, 0.2)' }}
          >
            bug_report
          </span>
        </div>
      )}
      <img
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.3s ease' }}
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}
