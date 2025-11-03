// global.js
window.App = window.App || {};

App.register = function (name, moduleObj) {
  if (!name || typeof name !== "string") return console.error("Invalid module name");
  if (App[name]) console.warn(`Overwriting App module: ${name}`);
  App[name] = moduleObj;
};

App.use = function (name) {
  return App[name] || null;
};

App.state = {}; // Shared data if needed

console.log("✅ App namespace initialized");
