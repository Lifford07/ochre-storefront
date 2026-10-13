import assert from "node:assert/strict"
import { test } from "node:test"
import { DEVNET_USDC_MINT, MAINNET_USDC_MINT, usdcMintFor } from "../config/solana.ts"

test("mainnet uses Circle USDC, including when a devnet mint is still set", () => {
  assert.equal(MAINNET_USDC_MINT, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
  assert.equal(usdcMintFor("mainnet-beta"), MAINNET_USDC_MINT)
  assert.equal(usdcMintFor("mainnet-beta", DEVNET_USDC_MINT), MAINNET_USDC_MINT)
  assert.equal(usdcMintFor("mainnet-beta", "  "), MAINNET_USDC_MINT)
  assert.equal(usdcMintFor("mainnet-beta", MAINNET_USDC_MINT), MAINNET_USDC_MINT)
})

test("devnet stays on the devnet Circle mint unless another mint is set", () => {
  assert.equal(usdcMintFor("devnet"), DEVNET_USDC_MINT)
  assert.equal(usdcMintFor("devnet", undefined), DEVNET_USDC_MINT)
})
