import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Splash.css";
import logo from "../assets/logo.jpeg";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">

      <div className="logo-box">

        <img src={logo} alt="Zenrixa Logo" className="logo" />

        <h1>Zenrixa</h1>

        <p>Your Safety, Our Priority</p>

        <h3>
          A Safer Tomorrow for <br />
          Every Woman. 💜
        </h3>

      </div>

    </div>
  );
}

export default Splash;