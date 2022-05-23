import { mimetype } from "./mimetype";

export async function serve(req: Request, bucket: R2Bucket, secret: string): Promise<Response> {
  const method = req.method.toLowerCase();
  switch (method) {
    case "head":
      return head(req, bucket);
    case "get":
      return get(req, bucket);
    case "put":
      return put(req, bucket, secret);
    case "delete":
      return delete_(req, bucket, secret);
    default:
      return new Response(null, { status: 405 });
  };
}

async function head(req: Request, bucket: R2Bucket): Promise<Response> {
  for (const key of variantKeys(req)) {
    const object = await bucket.get(key);
    if (object) {
      return new Response(null, {
        status: 200,
        headers: new Headers({
          "content-type": mimetype(key),
        }),
      });
    }
  }
  return new Response(null, { status: 404 });
}

async function get(req: Request, bucket: R2Bucket): Promise<Response> {
  for (const key of variantKeys(req)) {
    const object = await bucket.get(key);
    if (object) {
      return new Response(object.body, {
        status: 200,
        headers: new Headers({
          "content-type": mimetype(key),
        }),
      });
    }
  }
  return new Response(null, { status: 404 });
}

async function put(req: Request, bucket: R2Bucket, secret: string): Promise<Response> {
  if (!hasSecret(req, secret)) return new Response(null, { status: 401 });
  const key = canonicalKey(req);
  try {
    await bucket.put(key, req.body);
    return new Response(null, { status: 201 });
  } catch (e: any) {
    return new Response(`error: ${e}`, { status: 500 });
  }
}

async function delete_(req: Request, bucket: R2Bucket, secret: string): Promise<Response> {
  if (!hasSecret(req, secret)) return new Response(null, { status: 401 });
  const key = canonicalKey(req);
  try {
    await bucket.delete(key);
    return new Response(null, { status: 200 });
  } catch (e: any) {
    return new Response(`error: ${e}`, { status: 500 });
  }
}

function hasSecret(req: Request, secret: string): boolean {
  return req.headers.get("X-BUCKET-SECRET") === secret;
}

function canonicalKey(req: Request): string {
  const url = new URL(req.url);
  return `oefd-net/${url.pathname.slice(1)}`;
}

function variantKeys(req: Request): string[] {
  const key = canonicalKey(req);
  const keys = [];
  if (key !== "") keys.push(key);
  if (key.endsWith("/")) {
    keys.push(`${key}index.html`);
  } else {
    keys.push(`${key}/index.html`);
    keys.push(`${key}.html`);
  }
  return keys;
}
