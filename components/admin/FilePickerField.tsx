"use client";

import { useRef, useState } from "react";

export default function FilePickerField({
  name,
  accept,
  multiple,
  required,
}: {
  name: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
}) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const label =
    fileNames.length === 0
      ? "Choose file…"
      : fileNames.length === 1
        ? fileNames[0]
        : `${fileNames.length} files selected`;

  return (
    <>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        onChange={(e) =>
          setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))
        }
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="field flex items-center text-left cursor-pointer truncate"
      >
        {label}
      </button>
    </>
  );
}
