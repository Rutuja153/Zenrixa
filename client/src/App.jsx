// App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "./Pages/Splash";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Sos from "./Pages/Sos";
import Tracking from "./Pages/Tracking";
import Contact from "./Pages/Contact";
import Chat from "./Pages/Chat";
import Signup from "./Pages/Signup";
import Profile from "./Pages/Profile";
import Journey from "./Pages/Journey";
import Edit from "./Pages/EditProfile";
import Report from "./Pages/Reports";
import Support from "./Pages/Support";
import Setting from "./Pages/Setting";
import Language from "./Pages/Language";
import Privacy from "./Pages/Privacy";
import Term from "./Pages/Term";
import About from "./Pages/About";
import EmergencyCall from "./Pages/EmergencyCall";
import Map from "./Pages/Map";
import Safety from "./Pages/Safety";
import ReportIssue from "./Pages/ReportIssue";
import LiveMap from "./Pages/LiveMap";
import NotificationBootstrap from "./Component/NotificationBootstrap";

function App() {
  return (
    <BrowserRouter>

      <NotificationBootstrap />

      <Routes>

        <Route path="/" element={<Splash />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<Home />} />

        <Route path="/map" element={<Map />} />

        <Route path="/sos" element={<Sos />} />

        <Route path="/emergency" element={<EmergencyCall />} />

        <Route path="/tracking" element={<Tracking />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/safety" element={<Safety />} />

        <Route path="/chat" element={<Chat />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/journey" element={<Journey />} />

        {/* IMPORTANT */}
        <Route
          path="/edit-profile"
          element={<Edit />}
        />

        <Route path="/report" element={<Report />} />

        <Route path="/setting" element={<Setting />} />

        <Route path="/language" element={<Language />} />

        <Route path="/privacy" element={<Privacy />} />

        <Route path="/terms" element={<Term />} />

        <Route path="/about" element={<About />} />

        <Route
          path="/reportissue"
          element={<ReportIssue />}
        />

        <Route path="/support" element={<Support />} />

        <Route
          path="/live-map"
          element={<LiveMap />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;