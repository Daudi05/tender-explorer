/*
  fileHelpers.js — pure utility functions for file handling.
  No React, no API calls. Safe to import anywhere.

  Why this file exists: file validation and download logic gets reused across
  DocumentUploader (upload flow) and MyDocuments (download flow). Keeping it
  here avoids duplicating the same rules in multiple components and makes it
  easy to tighten the rules in one place if the backend changes.
*/

// Whitelist of allowed file extensions.
// Why a whitelist instead of a blacklist? Blacklists are easy to bypass with
// unexpected extensions. A whitelist means unknown types are blocked by default.
// These are the only types the backend accepts (see /api/documents/upload validation).
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']

// Maximum file size in megabytes.
// Why 10MB? The server enforces the same limit. We validate here too so the user
// gets instant feedback instead of waiting for a full upload to fail server-side.
const MAX_FILE_SIZE_MB = 10

/**
 * Formats raw byte count into a human-readable string.
 * @param {number} bytes
 * @returns {string}  e.g. "2.4 MB", "856 KB", "340 B"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Validates that a file is within the allowed size limit.
 * Throws an Error (not returns false) so callers can catch it and show a message.
 * @param {File} file
 * @param {number} maxMB  — override the default 10MB cap if needed
 * @throws {Error}
 */
export function validateFileSize(file, maxMB = MAX_FILE_SIZE_MB) {
  const maxBytes = maxMB * 1024 * 1024
  if (file.size > maxBytes) {
    // Give the user both numbers so they understand what they need to reduce
    throw new Error(
      `File is too large (${formatFileSize(file.size)}). Maximum allowed is ${maxMB} MB.`
    )
  }
}

/**
 * Validates that a file's extension is in the allowed list.
 * Why check extension AND not MIME type? Extension is easier to display to users.
 * The backend does its own MIME check as a second layer.
 * @param {File} file
 * @throws {Error}
 */
export function validateFileType(file) {
  // Extract the extension from the filename, lowercase for comparison
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `File type ".${ext || 'unknown'}" is not allowed. ` +
      `Accepted types: ${ALLOWED_EXTENSIONS.join(', ')}.`
    )
  }
}

/**
 * Triggers a browser download for a Blob received from a fetch() call.
 *
 * Why use blob + createObjectURL instead of a plain <a href>?
 * Because the download endpoint requires an Authorization header. A plain
 * anchor tag cannot send custom headers, so we must fetch the file ourselves
 * (with our auth token) and then hand the result to the browser as a
 * temporary object URL.
 *
 * @param {Blob} blob       — the raw file data from the response
 * @param {string} filename — the name the downloaded file should have
 */
export function downloadFile(blob, filename) {
  // Create a temporary URL that points to the blob in memory
  const url = URL.createObjectURL(blob)

  // Create a hidden <a> tag, simulate a click, then clean up
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  // Clean up: revoke the URL to free memory, remove the element
  // We delay slightly so the browser has time to start the download
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 100)
}
