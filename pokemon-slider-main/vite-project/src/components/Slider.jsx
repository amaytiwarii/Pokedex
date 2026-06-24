import React, { useState } from "react";
import "./Slider.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Slider = () => {
  const aliens = [
    {
        name: "Mew",
        img: "/images/slider4.png",
        description:
          "A mythical Pokémon known for its playful nature and boundless psychic power. " +
          "Mew can learn any move, making it one of the most versatile Pokémon in existence. " +
          "It floats gracefully through the air, surrounded by a soft aura of energy that shimmers like stardust. " +
          "Despite its immense strength, Mew prefers peace and curiosity over conflict, often hiding from humans in lush forests or ancient ruins. " +
          "Its presence radiates calmness and wonder, embodying the essence of all Pokémon DNA.",
          background: "linear-gradient(135deg, #001020, #002b5c, #8a007a, #000)",
      },
      
      {
        name: "Eevee",
        img: "/images/slider6.png",
        description:
          "A small and affectionate Pokémon known for its incredible potential to evolve into many different forms. " +
          "Eevee’s DNA is highly adaptable, allowing it to transform based on its environment or bond with its trainer. " +
          "Though timid at first, it’s deeply loyal and brave when protecting those it trusts. " +
          "Its fur glows with a soft golden shimmer under the moonlight, symbolizing endless possibilities. " +
          "Eevee embodies curiosity, warmth, and the spirit of change — the heart of every new beginning.",
        background: "linear-gradient(135deg, #2b1a0e, #5a3a1e, #b57f3b, #0d0a05)",
      },
      
      {
        name: "Charmander",
        img: "/images/slider1.png",
        description:
          "A spirited Fire-type Pokémon with a flame burning brightly at the tip of its tail. " +
          "Charmander’s fire reflects its emotions — it blazes stronger when it’s happy and flares wildly when it’s angry. " +
          "Despite its small size, it’s full of determination and courage, always eager to grow stronger. " +
          "It prefers warmth and sunlight, often seen basking in the glow of its own tail. " +
          "Legend says that if the flame ever goes out, its life energy fades — a true symbol of passion and perseverance.",
          background: "linear-gradient(135deg, #1a0800, #5c1402, #b23a0e, #000)",
        },
      
      {
        name: "Bulbasaur",
        img: "/images/slider2.png",
        description:
          "A Grass- and Poison-type Pokémon known for the plant bulb on its back that grows as it stores energy from the sun. " +
          "Bulbasaur is gentle, loyal, and often found basking in sunlight to fuel its strength. " +
          "As it matures, the bulb blossoms into a magnificent flower, symbolizing growth and balance. " +
          "It uses its vines to defend itself or to help friends in need, showing both strength and compassion. " +
          "Bulbasaur’s connection to nature makes it a symbol of harmony between life and the earth.",
          background: "linear-gradient(135deg, #021a10, #084229, #0f5b35, #000)",
        },
        {
            name: "Pikachu",
            img: "/images/slider3.png",
            description:
              "An Electric-type Pokémon known for its boundless energy and cheerful personality. " +
              "Pikachu can generate powerful electric shocks to defend itself and help friends. " +
              "Small yet agile, it zips around with incredible speed, showing courage far beyond its size. " +
              "Its iconic lightning-shaped tail and glowing cheeks make it instantly recognizable and beloved. " +
              "Pikachu embodies playfulness, loyalty, and the spark of adventure in every battle.",
              background: "linear-gradient(135deg, #1a1200, #603800, #8b5e00, #000)",
            },
        {
            name: "Squirtle",
            img: "/images/slider5.png",
            description:
              "A Water-type Pokémon known for its playful nature and loyalty. " +
              "Squirtle can shoot powerful jets of water from its shell to protect itself and its friends. " +
              "Despite its small size, it’s brave and quick-thinking, often using strategy over strength in battles. " +
              "Its shell provides both defense and a sleek aquatic form, allowing it to swim with incredible agility. " +
              "Squirtle embodies fun, friendship, and the calming yet powerful essence of water.",
            background: "linear-gradient(135deg, #00162c, #00375c, #006080, #000)",
          },
          
          
          
  ];

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState("next");

  const handlePrev = () => {
    setDirection("prev");
    setIndex((prev) => (prev - 1 + aliens.length) % aliens.length);
  };

  const handleNext = () => {
    setDirection("next");
    setIndex((prev) => (prev + 1) % aliens.length);
  };

  return (
    <div
      className="slider"
      style={{ background: aliens[index].background }}
    >
      <button className="arrow left-arrow" onClick={handlePrev}>
        <FaChevronLeft size={28} />
      </button>

      <div className="slider-images">
        {aliens.map((alien, i) => {
          const offset = (i - index + aliens.length) % aliens.length;
          let x = 0,
            y = 0,
            scale = 1,
            opacity = 1,
            blur = "none",
            zIndex = 1;

          if (offset === 0) {
            x = 0;
            y = 0;
            scale = 1.1;
            opacity = 1;
            blur = "none";
            zIndex = 3;
          } else if (offset === 1) {
            x = 220;
            y = -90;
            scale = 0.85;
            opacity = 0.4;
            blur = "blur(3px)";
            zIndex = 2;
          } else if (offset === aliens.length - 1) {
            x = -290;
            y = 200;
            scale = 0.65;
            opacity = 0.4;
            blur = "blur(6px)";
            zIndex = 2;
          } else {
            x = 0;
            y = 0;
            scale = 0.9;
            opacity = 0;
            blur = "blur(10px)";
            zIndex = 0;
          }

          return (
            <img
              key={i}
              src={alien.img}
              alt={alien.name}
              className="alien-img"
              style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                opacity,
                filter: blur,
                zIndex,
              }}
            />
          );
        })}
      </div>

      <button className="arrow right-arrow" onClick={handleNext}>
        <FaChevronRight size={28} />
      </button>

      <div className="slider-info-wrapper">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            className="slider-info"
            custom={direction}
            initial={{ y: direction === "next" ? -80 : 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit = {{y:direction === "next" ? 80 : -80 , opacity:0}}
            transition={{duration:0.6, ease : "easeInOut"}}
          >
            <h1>{aliens[index].name}</h1>
            {aliens[index].description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Slider;