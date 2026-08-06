"use client";
import { useEffect, useState } from "react";
import { getBrand } from "../../lib/brandIcons";

export default function BrandIcon({ name, size = 32 }) {
  const [attempt, setAttempt] = useState(0);
  const brand = getBrand(name);
  const sources = brand.iconSources;
  const currentSrc = sources[attempt];
  const showLogo = Boolean(currentSrc);

  // Start over from the first icon source whenever the matched brand
  // changes (e.g. as the user types a different name into the form).
  useEffect(() => {
    setAttempt(0);
  }, [brand.domain]);

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
          key={currentSrc}
          src={currentSrc}
          alt=""
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          style={{ objectFit: "contain" }}
          onError={() => setAttempt((a) => a + 1)}
        />
      ) : (
        brand.letter
      )}
    </span>
  );
}
