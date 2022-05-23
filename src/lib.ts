import { serve as r2 } from "./r2client/lib";
import { serve as nggyu } from "./nggyu/lib";

interface Env {
  BUCKET: R2Bucket;
  BUCKET_SECRET: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const path = new URL(req.url).pathname;

    if (path.match(/^\/nggyu\//)) {
      return nggyu(req);
    } else {
      return r2(req, env.BUCKET, env.BUCKET_SECRET);
    }
  },
};
