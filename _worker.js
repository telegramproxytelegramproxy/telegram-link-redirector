export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    url.hostname = "t.me";
    url.protocol = "https:";

    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow"
    });

    return fetch(modifiedRequest);
  }
};
