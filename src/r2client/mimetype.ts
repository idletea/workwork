export function mimetype(path: string): string {
  const type = normalizeToType(path);
  if (type === null) return "application/octet-stream";

  switch (type) {
    case "html":
    case "htm":
      return "text/html";
    case "css":
      return "text/css";
    case "xml":
      return "text/xml";
    case "gif":
      return "image/gif";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "js":
      return "application/javascript";
    case "txt":
      return "text/plain";
    case "png":
      return "image/png";
    case "ico":
      return "image/x-icon";
    case "bmp":
      return "image/x-ms-bmp";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  };
};

function normalizeToType(path: string): string | null {
  const filename = path.split("/").reverse()[0];
  const parts = filename.split(".");
  if (parts.length === 1) return null;

  let extension = parts.reverse()[0].toLowerCase();
  if (extension.startsWith(".")) {
    extension = extension.slice(1);
  }
  return extension;
}
