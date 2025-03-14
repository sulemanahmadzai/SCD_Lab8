// test/app.test.js
const request = require("supertest");
import * as chai from "chai";

const expect = chai.expect;

// Import the app
const app = require("../app");

describe("Event Planner API", () => {
  let agent = request.agent(app);

  it("should register a new user", (done) => {
    agent
      .post("/register")
      .send({ username: "testuser", password: "password" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).to.equal("User registered successfully");
        done(err);
      });
  });

  it("should login the user", (done) => {
    agent
      .post("/login")
      .send({ username: "testuser", password: "password" })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).to.equal("Logged in successfully");
        done(err);
      });
  });

  it("should create an event", (done) => {
    agent
      .post("/events")
      .send({
        name: "Team Meeting",
        description: "Discuss project updates",
        date: "2025-03-20",
        time: "10:00",
        category: "Meetings",
        reminderMinutesBefore: 30,
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).to.equal("Event created successfully");
        expect(res.body.event).to.have.property("id");
        done(err);
      });
  });

  it("should retrieve events sorted by date", (done) => {
    agent
      .get("/events?sortBy=date")
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.an("array");
        done(err);
      });
  });
});
