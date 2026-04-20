const ALLOWED_TYPES = {
  'application/pdf': { extensions: ['pdf'], maxMb: 50 },
  'image/png':       { extensions: ['png'], maxMb: 20 },
  'image/jpeg':      { extensions: ['jpg', 'jpeg'], maxMb: 20 },
  'image/tiff':      { extensions: ['tif', 'tiff'], maxMb: 20 },
  'video/mp4':       { extensions: ['mp4'], maxMb: 500 },
  'video/quicktime': { extensions: ['mov'], maxMb: 500 },
  'application/msword': { extensions: ['doc'], maxMb: 20 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['docx'],
    maxMb: 20,
  },
};

export const validateFile = (file) => {
  const rule = ALLOWED_TYPES[file.type];
  if (!rule) throw new Error(`File type "${file.type}" is not allowed.`);
  const ext = file.name.split('.').pop().toLowerCase();
  if (!rule.extensions.includes(ext))
    throw new Error(`Extension ".${ext}" does not match type "${file.type}".`);
  const mb = file.size / (1024 * 1024);
  if (mb > rule.maxMb)
    throw new Error(`File too large: ${mb.toFixed(1)} MB. Max is ${rule.maxMb} MB.`);
};

export const ACCEPTED_MIME_TYPES = Object.keys(ALLOWED_TYPES).join(',');
