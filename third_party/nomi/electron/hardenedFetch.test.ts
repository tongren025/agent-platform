import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hardenedFetch } from "./hardenedFetch";

let server: http.Server;
let baseUrl = "";

beforeAll(async () => {
  server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(Buffer.from([1, 2, 3]));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => server?.close());

describe("hardenedFetch 私网边界", () => {
  it("默认继续拒绝 loopback", async () => {
    await expect(hardenedFetch(`${baseUrl}/view`)).rejects.toThrow("private/loopback");
  });

  it("只允许显式配置的精确 origin", async () => {
    await expect(hardenedFetch(`${baseUrl}/view`, { allowedPrivateOrigins: [baseUrl] })).resolves.toMatchObject({
      status: 200,
      contentType: "image/png",
    });
    await expect(
      hardenedFetch(`${baseUrl}/view`, { allowedPrivateOrigins: ["http://127.0.0.1:1"] }),
    ).rejects.toThrow("private/loopback");
  });
});
