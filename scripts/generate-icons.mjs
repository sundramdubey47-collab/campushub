import sharp from "sharp"
import fs from "fs"

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" rx="10" fill="#3730a3" />
  <path d="M20 9L31 14.5V15.5L20 21L9 15.5V14.5L20 9Z" fill="#fafaf8" />
  <path d="M13 18.5V25.5C13 25.5 15.5 28 20 28C24.5 28 27 25.5 27 25.5V18.5L20 22L13 18.5Z" fill="#b8860b" />
  <circle cx="30" cy="17" r="1.6" fill="#fafaf8" />
</svg>
`

const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" fill="#3730a3" />
  <path d="M20 12L28 16.5V17.3L20 21.8L12 17.3V16.5L20 12Z" fill="#fafaf8" />
  <path d="M15 19.5V24.5C15 24.5 17 26.5 20 26.5C23 26.5 25 24.5 25 24.5V19.5L20 22.2L15 19.5Z" fill="#b8860b" />
</svg>
`

async function generate() {
  await sharp(Buffer.from(svgIcon)).resize(192, 192).png().toFile("public/icon-192.png")
  await sharp(Buffer.from(svgIcon)).resize(512, 512).png().toFile("public/icon-512.png")
  await sharp(Buffer.from(svgMaskable)).resize(512, 512).png().toFile("public/icon-maskable.png")
  console.log("Icons generated successfully!")
}

generate()