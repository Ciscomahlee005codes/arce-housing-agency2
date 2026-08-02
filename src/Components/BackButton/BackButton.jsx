// BackButton.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

const BackButton = () => {
  const navigate = useNavigate();

  // Any page rendering BackButton is a "sub-page" — hide the main
  // NavBar on mobile while this component is mounted, since BackButton
  // already provides its own way back, and the two nav elements
  // fighting for space on small screens looks cluttered.
  useEffect(() => {
    document.body.classList.add("has-back-button");
    return () => {
      document.body.classList.remove("has-back-button");
    };
  }, []);

  return (
    <button
      className="back-button"
      onClick={() => navigate(-1)}
    >
      <FaArrowLeft />
      <span>Back</span>
    </button>
  );
};

export default BackButton;