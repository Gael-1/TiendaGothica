"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
export default function ImagePicker({ current = "" }) {
  const [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    queueMicrotask(() => setPreview(url));
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <div>
      <label>
        Fotografía de la prenda
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files[0];
            setError("");
            if (
              f &&
              (!["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
                f.size > 5 * 1024 * 1024)
            ) {
              e.target.value = "";
              setFile(null);
              setPreview("");
              setError("Selecciona JPG, PNG o WebP de máximo 5 MB.");
              return;
            }
            setFile(f || null);
            setPreview("");
          }}
        />
      </label>
      <p className="muted">
        Selecciona una imagen de tu computadora. Se subirá al guardar la prenda.
        Máximo 5 MB.
      </p>
      {error && <p role="alert">{error}</p>}
      {(preview || current) && (
        <Image
          src={preview || current}
          alt="Vista previa de la prenda"
          width={240}
          height={300}
          unoptimized
          className="image-preview"
        />
      )}
    </div>
  );
}
