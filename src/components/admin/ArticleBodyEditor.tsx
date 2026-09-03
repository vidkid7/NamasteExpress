"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
} from "lucide-react";
import { articleContentToEditorHtml } from "@/lib/article-content";

interface ArticleBodyEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function normalizeEditorHtml(value: string) {
  // Chromium emits div blocks from Enter in contenteditable surfaces. Store
  // them as paragraphs so the public renderer applies the same spacing.
  return value
    .replace(/<div\b[^>]*>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>");
}

function normalizeEditorDom(editor: HTMLDivElement) {
  Array.from(editor.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent?.trim()) {
        node.remove();
        return;
      }

      const paragraph = document.createElement("p");
      paragraph.textContent = node.textContent;
      node.replaceWith(paragraph);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "DIV") {
      const paragraph = document.createElement("p");
      paragraph.innerHTML = (node as HTMLElement).innerHTML;
      node.replaceWith(paragraph);
    }
  });
}

function toEditorImageUrl(url: string) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin === window.location.origin) return `${parsed.pathname}${parsed.search}`;
    if (parsed.hostname === "res.cloudinary.com") {
      return `/_next/image?url=${encodeURIComponent(parsed.toString())}&w=640&q=75`;
    }
  } catch {
    // Keep the returned URL if it is not an absolute URL that can be optimized.
  }

  return url;
}

export function ArticleBodyEditor({
  id,
  label,
  value,
  onChange,
  placeholder = "Write the article here...",
  required = false,
}: ArticleBodyEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;

    const nextHtml = articleContentToEditorHtml(value);
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
  }, [value]);

  useEffect(() => {
    if (uploading) return;

    const editor = editorRef.current;
    const range = savedSelectionRef.current;
    const selection = window.getSelection();
    if (!editor || !range || !selection || !editor.contains(range.commonAncestorContainer)) return;

    selection.removeAllRanges();
    selection.addRange(range);
    editor.focus();
    selection.removeAllRanges();
    selection.addRange(range);
    savedSelectionRef.current = range.cloneRange();
  }, [uploading]);

  function rememberSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount || !selection.anchorNode) return;
    if (!editor.contains(selection.anchorNode)) return;
    savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
  }

  function focusSavedSelection() {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    const range = savedSelectionRef.current;
    if (!selection) return;

    selection.removeAllRanges();
    if (range && editor.contains(range.commonAncestorContainer)) {
      selection.addRange(range);
      return;
    }

    const endRange = document.createRange();
    endRange.selectNodeContents(editor);
    endRange.collapse(false);
    selection.addRange(endRange);
  }

  function emitChange() {
    const editor = editorRef.current;
    if (editor) onChange(normalizeEditorHtml(editor.innerHTML));
  }

  function insertInlineImage(url: string, alt: string) {
    const editor = editorRef.current;
    if (!editor) return;

    focusSavedSelection();
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const insertRange = range && editor.contains(range.commonAncestorContainer)
      ? range
      : document.createRange();

    if (!range || !editor.contains(range.commonAncestorContainer)) {
      insertRange.selectNodeContents(editor);
      insertRange.collapse(false);
    }

    insertRange.deleteContents();

    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = toEditorImageUrl(url);
    image.alt = alt;
    image.loading = "lazy";
    figure.appendChild(image);

    const spacer = document.createElement("p");
    spacer.appendChild(document.createElement("br"));

    const fragment = document.createDocumentFragment();
    fragment.append(figure, spacer);
    insertRange.insertNode(fragment);

    const nextRange = document.createRange();
    nextRange.setStartAfter(spacer);
    nextRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(nextRange);
  }

  function runCommand(command: string, commandValue?: string) {
    focusSavedSelection();
    document.execCommand(command, false, commandValue);
    emitChange();
    rememberSelection();
  }

  async function handleInlineImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    rememberSelection();
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt_text", imageAlt.trim() || file.name.replace(/\.[^/.]+$/, ""));

    try {
      const res = await fetch("/api/v1/media", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !data.data?.url) {
        throw new Error(data?.error || "Image upload failed");
      }

      insertInlineImage(
        data.data.url,
        imageAlt.trim() || file.name.replace(/\.[^/.]+$/, "")
      );
      if (editorRef.current) normalizeEditorDom(editorRef.current);
      emitChange();
      rememberSelection();
      setImageAlt("");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label} {required ? "*" : ""}
      </label>

      <div className="overflow-hidden rounded-md" style={{ border: "1px solid var(--border)" }}>
        <div
          className="flex flex-wrap items-center gap-1 p-2"
          style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--border)" }}
          onMouseDown={(event) => {
            event.preventDefault();
            rememberSelection();
          }}
        >
          <button type="button" className="btn-secondary btn-sm" onClick={() => runCommand("formatBlock", "<p>")} aria-label="Paragraph" title="Paragraph">
            <Pilcrow className="h-4 w-4" />
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => runCommand("bold")} aria-label="Bold" title="Bold">
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => runCommand("italic")} aria-label="Italic" title="Italic">
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => runCommand("insertUnorderedList")} aria-label="Bulleted list" title="Bulleted list">
            <List className="h-4 w-4" />
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => runCommand("insertOrderedList")} aria-label="Numbered list" title="Numbered list">
            <ListOrdered className="h-4 w-4" />
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => runCommand("formatBlock", "<blockquote>")} aria-label="Quote" title="Quote">
            <Quote className="h-4 w-4" />
          </button>

          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
            <input
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-xs sm:w-44 sm:flex-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              placeholder="Image description"
              aria-label="Image description"
            />
            <input
              ref={imageInputRef}
              id={`${id}-image-upload`}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
              className="hidden"
              onChange={handleInlineImageUpload}
            />
            <button
              type="button"
              className="btn-secondary btn-sm shrink-0"
              onClick={() => {
                rememberSelection();
                imageInputRef.current?.click();
              }}
              disabled={uploading}
              aria-label="Upload image into article"
              title="Upload image at cursor"
              style={{ opacity: uploading ? 0.6 : 1 }}
            >
              <ImagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">{uploading ? "Uploading..." : "Image"}</span>
            </button>
          </div>
        </div>

        <div
          ref={editorRef}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-required={required}
          aria-label={label}
          data-placeholder={placeholder}
          contentEditable={!uploading}
          suppressContentEditableWarning
          className="article-editor-content prose-news min-h-[280px] px-3 py-3 text-sm outline-none sm:min-h-[360px]"
          style={{ background: "var(--surface)", color: "var(--foreground)" }}
          onInput={emitChange}
          onFocus={rememberSelection}
          onKeyUp={rememberSelection}
          onMouseUp={rememberSelection}
          onBlur={() => {
            if (editorRef.current) normalizeEditorDom(editorRef.current);
            emitChange();
          }}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            emitChange();
          }}
        />
      </div>

      {uploadError && <p className="text-xs" style={{ color: "#dc2626" }}>{uploadError}</p>}
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Press Enter for a new paragraph. Place the cursor where the image belongs, then use Image to upload it.
      </p>
    </div>
  );
}
