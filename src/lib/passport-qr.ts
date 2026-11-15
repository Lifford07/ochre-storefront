import QRCode from "qrcode"

/** Print-resolution PNG. High error correction, so a small tag still scans. */
export function passportQrPng(url: string) {
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 2,
    width: 512,
    color: { dark: "#100e0c", light: "#f4efe6" },
  })
}
