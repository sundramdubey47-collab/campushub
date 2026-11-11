import sharp from "sharp"

const svg = `
<svg width="72" height="72" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 9L31 14.5V15.5L20 21L9 15.5V14.5L20 9Z" fill="#ffffff"/>
  <path d="M13 18.5V25.5C13 25.5 15.5 28 20 28C24.5 28 27 25.5 27 25.5V18.5L20 22L13 18.5Z" fill="#ffffff"/>
</svg>`

await sharp(Buffer.from(svg)).resize(72, 72).png().toFile("public/badge-72.png")
console.log("badge-72.png ban gaya")