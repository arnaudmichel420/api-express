import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app";


describe("Index route", () => {
  it("Should return 'home'", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  it("Should return 404 on unknown pages", async () => {
    const response = await request(app).get("/qsdfqsdfff");

    expect(response.statusCode).toBe(401);
  });
});
