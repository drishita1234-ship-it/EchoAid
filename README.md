# EchoAid 🆘 🛰️

**EchoAid** is a world-class, AI-powered decentralized disaster response platform designed to bridge the gap between those in distress and immediate help. Built with a focus on high-urgency triage, real-time crisis mapping, and verified intelligence, EchoAid empowers communities to respond faster when every second counts.

---

## 🌟 Core Pillars

### 🤖 AI-Driven Triage (The "Aegis" Engine)
*   **Intelligent Analysis:** Powered by **Google Gemini 2.5 Flash**, every SOS request is automatically analyzed for urgency (1-10) and summarized for rapid scanning by responders.
*   **Aegis Verification:** A sophisticated verification system that cross-references user reports with sensor data, seismic activity, and location-based clusters to prevent false alarms and prioritize high-confidence crises.
*   **Search & Map Grounding:** Real-time retrieval of official safety protocols and hospital availability using Google Search and Google Maps grounding within the **Gemini API**.

### 🗺️ Real-Time Crisis Intelligence
*   **Interactive Crisis Map:** A live visualization of emergencies across the Indian subcontinent, featuring custom SVG mapping and Bhuvan-inspired data layers.
*   **Rumor Control:** An intelligence widget dedicated to investigating, confirming, or debunking viral rumors in disaster zones to prevent panic.
*   **Official Agency Feed:** A direct pipeline of alerts from the **IMD** (Weather), **CWC** (Floods), and **NCS** (Seismology).

### 🧘 Humanitarian UX
*   **The Calm Protocol:** An interactive, AI-guided interface for victims that provides reassurance, breathing exercises, and immediate safety tips based on their specific emergency type.
*   **Offline Resilience:** Built-in queuing system that allows users to submit SOS reports even with zero connectivity; reports are automatically synchronized once a signal is detected.
*   **Safe Helper (Surakshit Sahayak):** A unique role for community members who are safe and wish to offer local resources like shelter, food, or battery charging.

---

## 🛠️ Technical Architecture

*   **Frontend:** React 19 (High-performance UI)
*   **Styling:** Tailwind CSS (Accessible, responsive, and theme-aware)
*   **Intelligence Layer:** Google Gemini API (Generative AI with Search/Map Grounding)
*   **Visualization:** Recharts (Data-driven triage analytics)
*   **Persistence:** LocalStorage-backed session management and offline request queuing.
*   **Icons:** Lucide-React for semantic, high-contrast iconography.

---

## 🚀 Key Features for Responders

1.  **Triage Feed:** High-urgency alerts are prioritized at the top of the volunteer dashboard.
2.  **Mission Management:** Digital handshake between requesters and responders with unique verification codes.
3.  **Local Context:** Grounded search allows volunteers to ask "Where are the nearest open shelters?" and get up-to-the-minute web-grounded answers.

## ⚙️ Requirements & Permissions

*   **API Key:** Requires a valid `process.env.API_KEY` for Gemini AI features.
*   **Geolocation:** Required for accurate SOS placement and Map Grounding.
*   **Permissions:** Metadata configured for `geolocation` access as per standard browser safety protocols.

---

*EchoAid is a humanitarian tech initiative focused on leveraging decentralized networks and Generative AI for global good.*
