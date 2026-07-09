declare module "next-pwa" {
  import { NextConfig } from "next"

  type PWAConfig = {
    dest?: string
    disable?: boolean
    register?: boolean
    skipWaiting?: boolean
    [key: string]: any
  }

  export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
}