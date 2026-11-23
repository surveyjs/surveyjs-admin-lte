import type { SurveyModel } from 'survey-core'

// Demo-only file handling. The form JSON sets `storeDataAsText: false`, so
// SurveyJS asks the page to upload files instead of putting base64 into the
// result. Here files stay in this browser tab as object URLs and are never sent
// anywhere. In production, upload `options.files` to your secure storage inside
// onUploadFiles and pass the stored file URLs to `options.callback`.
export function keepFilesInBrowser(model: SurveyModel) {
  model.onUploadFiles.add((_, options) => {
    options.callback(
      options.files.map((file) => ({
        file,
        content: URL.createObjectURL(file),
      })),
    )
  })
  model.onClearFiles.add((_, options) => {
    const files: unknown[] = Array.isArray(options.value)
      ? options.value
      : options.value
        ? [options.value]
        : []
    for (const file of files) {
      if (!file || typeof file !== 'object') continue
      const { name, content } = file as { name?: unknown; content?: unknown }
      if (options.fileName && name !== options.fileName) continue
      revoke(content)
    }
    options.callback('success')
  })
}

// Revokes every object URL found in form data (used before the form is cleared).
export function releaseFiles(value: unknown) {
  if (Array.isArray(value)) value.forEach(releaseFiles)
  else if (value && typeof value === 'object')
    Object.values(value).forEach(releaseFiles)
  else revoke(value)
}

function revoke(content: unknown) {
  if (typeof content === 'string' && content.startsWith('blob:'))
    URL.revokeObjectURL(content)
}
