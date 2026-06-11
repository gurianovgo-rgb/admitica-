import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

// Shared legacy modules — single source of data for both the live site and this app.
// They assign window.AdmiticaData / window.buildRoadmapStages as side effects.
import "../../data/programs.js"
import "../../src/roadmapData.js"

import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
