"use client";
import { useState } from "react";
import { getBrand } from "../../lib/brandIcons";

export default function BrandIcon({ name, size = 32 }) {
  const [failed, setFailed] = useState(false);
  const brand = getBrand(name);
  const showLogo = Boolean(brand.iconUrl) && !failed;

  return (
    <span
      className="brand-icon"
      style={{
        width: size,
        height: size,
        background: showLogo ? "#fff" : brand.color,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {showLogo ? (
        <img
          src={brand.iconUrl}
          alt=""
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.6)}
          onError={() => setFailed(true)}
        />
      ) : (
        brand.letter
      )}
    </span>
  );
}
