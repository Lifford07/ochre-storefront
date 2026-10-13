import assert from "node:assert/strict"
import { test } from "node:test"
import { parseContact } from "./shipping.ts"

const good = {
  email: "ada@example.com",
  fullName: "Ada Lovelace",
  address: "1 Analytical Street",
  city: "Birmingham",
  postcode: "B1 1AA",
  country: "GB",
}

test("contact requires a real email, name, and a full address", () => {
  assert.equal("contact" in parseContact(good), true)
  assert.equal("error" in parseContact({ ...good, email: "" }), true)
  assert.equal("error" in parseContact({ ...good, address: "" }), true)
  assert.equal("error" in parseContact({ ...good, city: "" }), true)
  assert.equal("error" in parseContact({ ...good, country: "ZZ" }), true)
  assert.equal("error" in parseContact({ ...good, postcode: "<b>B1</b>" }), true)
})
