/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autorise le serveur de dev à être ouvert depuis le téléphone (même Wi-Fi)
  allowedDevOrigins: ["192.168.1.15"],
  typescript: {
    ignoreBuildErrors: true,
  },
};
module.exports = nextConfig;