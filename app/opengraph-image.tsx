import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1E1B4B",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 20,
            background: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 700,
            color: "white",
            marginBottom: 24,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "white" }}>CampusHub</div>
        <div style={{ fontSize: 28, color: "#C7C6F0", marginTop: 12 }}>
          One Platform For Every College Student
        </div>
      </div>
    ),
    { ...size }
  )
}