const BODY = `
  <h2>You know the rules, and so do I</h2>
  <script>
    window.location.replace("https://youtu.be/dQw4w9WgXcQ?autoplay=1");
  </script>
`;

export async function serve(req: Request): Promise<Response> {
  const method = req.method.toLowerCase();
  switch (method) {
    case "head":
      return proxy(req);
    case "get":
      return get(req);
    default:
      return new Response(null, { status: 405 });
  };
}

async function get(req: Request): Promise<Response> {
  const rewriter = new HTMLRewriter().on("body", new BodyRewriter());
  return rewriter.transform(await proxy(req));
}

async function proxy(req: Request): Promise<Response> {
  const b64 = new URL(req.url).pathname.match(/^\/nggyu\/(?<slug>.*)/)?.groups?.["slug"];
  if (!b64) {
    return new Response(null, { status: 400 });
  } else {
    const proxyUrl = atob(b64);
    return fetch(proxyUrl, {
      method: req.method,
    });
  }
}

class BodyRewriter {
  element(el: Element) {
    el.setInnerContent(BODY, { html: true });
  }
}
