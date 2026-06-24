import React from "react";
import "./Hero.css";
import { motion } from "framer-motion";

const Hero = () => {
  const aliens = [
    "/images/alien1.png",
    "/images/alien2.png",
    "/images/alien3.png",
    "/images/alien4.png",
    "/images/alien5.png",
    "/images/alien6.png",
  ];

  const repeatedAliens = [...aliens, ...aliens];

  return (
    <div className="hero">
      <div className="slider-container">
        <motion.div
          className="alien-slider"
          animate={false}
          transition={{ duration: 0 }}
        >
          {repeatedAliens.map((src, i) => (
            <div className="alien-card" key={i}>
              <img src={src} alt={`Alien ${i + 1}`} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;