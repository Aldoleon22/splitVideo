/** @type {import('next').NextConfig} */
const nextConfig = {
  
 
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    ID_ENCRYPTION_KEY: process.env.ID_ENCRYPTION_KEY
  },

}

module.exports = nextConfig

