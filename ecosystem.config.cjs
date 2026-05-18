module.exports = {
  apps: [
    {
      name: "epios-api",
      script: "./packages/api/src/bin.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
      env: {
        NODE_ENV: "production",
        FRONTEND_URL: "http://localhost:5173",
      },
    },
    {
      name: "epios-ui",
      script: "./packages/api/src/ui-wrapper.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
