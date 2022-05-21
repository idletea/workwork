import { R2Client } from "./r2client/lib";

interface Env {
  BUCKET: R2Bucket;
  BUCKET_SECRET: string;
}

export default {
  async fetch(req: Request, env: Env) {
    const bucket = new R2Client(env.BUCKET, env.BUCKET_SECRET);
    return bucket.serve(req);
  },
};
