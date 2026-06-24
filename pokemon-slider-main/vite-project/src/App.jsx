import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Pokemon from "./components/Pokemon";
import Slider from "./components/Slider";
import Games from "./components/Games";

function Home() {
  return (
    <>
      <Hero />
      <Slider />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemons" element={<Pokemon />} />
        <Route path="/games" element={<Games />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;