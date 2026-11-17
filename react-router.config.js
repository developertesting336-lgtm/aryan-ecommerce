// react-router.config.js  (project root)
// export default { appDirectory: "src", ssr: true };
// react-router.config.js
import { vercelPreset } from "@vercel/react-router/vite";
export default { appDirectory: "src", ssr: true, presets: [vercelPreset()] };