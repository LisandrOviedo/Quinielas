module.exports = {
  apps: [
    {
      name: "quinielas",
      script: "index.js",
      watch: ".",
      ignore_watch: ["node_modules"],
      restart_delay: 1000,
      time: true,
      max_memory_restart: "500M",
    },
  ],
};
