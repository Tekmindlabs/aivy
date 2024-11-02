module.exports = {
  apps: [{
    name: "Aivy",
    script: "bun",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}