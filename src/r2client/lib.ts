import { mimetype } from "./mimetype";

export class R2Client {
  bucket: R2Bucket;
  secret: string | null;

  constructor(bucket: R2Bucket, secret: string | null) {
    this.bucket = bucket;
    this.secret = secret;
  }

  async serve(req: Request): Promise<Response> {
    const method = req.method.toLowerCase();
    switch (method) {
      case "head":
        return this.head(req);
      case "get":
        return this.get(req);
      case "put":
        return this.put(req);
      case "delete":
        return this.delete(req);
      default:
        return new Response(null, { status: 405 });
    };
  }

  async head(req: Request): Promise<Response> {
    for (const key of this.variantKeys(req)) {
      const object = await this.bucket.get(key);
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

  async get(req: Request): Promise<Response> {
    for (const key of this.variantKeys(req)) {
      const object = await this.bucket.get(key);
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

  async put(req: Request): Promise<Response> {
    if (!this.hasSecret(req)) return new Response(null, { status: 401 });
    const key = this.canonicalKey(req);
    try {
      await this.bucket.put(key, req.body);
      return new Response(null, { status: 201 });
    } catch (e: any) {
      return new Response(`error: ${e}`, { status: 500 });
    }
  }

  async delete(req: Request): Promise<Response> {
    if (!this.hasSecret(req)) return new Response(null, { status: 401 });
    const key = this.canonicalKey(req);
    try {
      await this.bucket.delete(key);
      return new Response(null, { status: 200 });
    } catch (e: any) {
      return new Response(`error: ${e}`, { status: 500 });
    }
  }

  hasSecret(req: Request): boolean {
    return req.headers.get("X-BUCKET-SECRET") === this.secret;
  }

  canonicalKey(req: Request): string {
    const url = new URL(req.url);
    return `oefd-net/${url.pathname.slice(1)}`;
  }

  variantKeys(req: Request): string[] {
    const key = this.canonicalKey(req);
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
}
