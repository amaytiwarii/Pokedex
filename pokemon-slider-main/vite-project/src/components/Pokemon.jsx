import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Pokemon.css";

const PAGE_SIZE = 24;

const Pokemon = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [selectedHabitat, setSelectedHabitat] = useState("");

  const [types, setTypes] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [habitats, setHabitats] = useState([]);

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const observerRef = useRef();

  const fetchPokemonData = async (id) => {
    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
      ]);

      const pokemon = await pokemonRes.json();
      const species = await speciesRes.json();

      return {
        id: pokemon.id,
        name: pokemon.name,
        image:
          pokemon.sprites.other["official-artwork"].front_default,
        types: pokemon.types.map((t) => t.type.name),
        habitat: species.habitat?.name || "unknown",
        generation: species.generation?.name || "",
        pokemon,
        species
      };
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      try {
        const pokemonRes = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=151"
        );

        const pokemonData = await pokemonRes.json();

        const detailed = await Promise.all(
          pokemonData.results.map((_, index) =>
            fetchPokemonData(index + 1)
          )
        );

        const valid = detailed.filter(Boolean);

        setPokemonList(valid);

        const typeSet = new Set();
        const generationSet = new Set();
        const habitatSet = new Set();

        valid.forEach((p) => {
          p.types.forEach((t) => typeSet.add(t));
          if (p.generation) generationSet.add(p.generation);
          if (p.habitat) habitatSet.add(p.habitat);
        });

        setTypes([...typeSet].sort());
        setGenerations([...generationSet].sort());
        setHabitats([...habitatSet].sort());
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    initialize();
  }, []);

  const filteredPokemon = useMemo(() => {
    return pokemonList.filter((pokemon) => {
      const searchMatch =
        pokemon.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        pokemon.id.toString().includes(search);

      const typeMatch =
        !selectedType ||
        pokemon.types.includes(selectedType);

      const generationMatch =
        !selectedGeneration ||
        pokemon.generation === selectedGeneration;

      const habitatMatch =
        !selectedHabitat ||
        pokemon.habitat === selectedHabitat;

      return (
        searchMatch &&
        typeMatch &&
        generationMatch &&
        habitatMatch
      );
    });
  }, [
    pokemonList,
    search,
    selectedType,
    selectedGeneration,
    selectedHabitat
  ]);

  const visiblePokemon = filteredPokemon.slice(
    0,
    displayCount
  );

  const lastPokemonRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current)
        observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            displayCount < filteredPokemon.length
          ) {
            setDisplayCount((prev) => prev + PAGE_SIZE);
          }
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, filteredPokemon.length, displayCount]
  );

  const getEvolutionChain = async (species) => {
    const evoUrl = species.evolution_chain.url;

    const res = await fetch(evoUrl);
    const data = await res.json();

    const chain = [];

    let current = data.chain;

    while (current) {
      chain.push(current.species.name);

      current =
        current.evolves_to &&
        current.evolves_to.length > 0
          ? current.evolves_to[0]
          : null;
    }

    return chain;
  };

  const openPokemon = async (pokemon) => {
    const chain = await getEvolutionChain(
      pokemon.species
    );

    const flavor =
      pokemon.species.flavor_text_entries.find(
        (f) => f.language.name === "en"
      )?.flavor_text || "";

    setSelectedPokemon({
      ...pokemon,
      evolutionChain: chain,
      flavorText: flavor
    });
  };

  useEffect(() => {
    document.body.className = darkMode
      ? "dark-theme"
      : "light-theme";
  }, [darkMode]);

  return (
    <div className="pokemon-app">
      <br></br>
      <br></br>
        <div className="logo">
          <h1>Pokédex</h1>
          <p>
            Discover every Pokémon in a beautiful
            encyclopedia.
          </p>
        </div>
      {/* <section className="hero">
        <div>
          <h1>Pokédex</h1>
          <p>
            Discover every Pokémon in a beautiful
            encyclopedia.
          </p>
        </div>

        <button
          className="theme-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </section> */}

      <div className="controls glass">
        <input
          placeholder="Search Pokémon..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={selectedType}
          onChange={(e) =>
            setSelectedType(e.target.value)
          }
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <select
          value={selectedGeneration}
          onChange={(e) =>
            setSelectedGeneration(e.target.value)
          }
        >
          <option value="">All Generations</option>
          {generations.map((gen) => (
            <option key={gen}>{gen}</option>
          ))}
        </select>

        <select
          value={selectedHabitat}
          onChange={(e) =>
            setSelectedHabitat(e.target.value)
          }
        >
          <option value="">All Habitats</option>
          {habitats.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 12 }).map(
            (_, index) => (
              <div
                className="skeleton-card"
                key={index}
              />
            )
          )}
        </div>
      ) : (
        <div className="grid">
          {visiblePokemon.map(
            (pokemon, index) => (
              <motion.div
                ref={
                  index ===
                  visiblePokemon.length - 1
                    ? lastPokemonRef
                    : null
                }
                key={pokemon.id}
                className="card glass"
                whileHover={{
                  y: -10,
                  scale: 1.03
                }}
                onClick={() =>
                  openPokemon(pokemon)
                }
              >
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                />

                <h3>
                  {pokemon.name}
                </h3>

                <span>
                  #{pokemon.id}
                </span>

                <div className="type-list">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className="badge"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedPokemon && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() =>
              setSelectedPokemon(null)
            }
          >
            <motion.div
              className="modal glass"
              initial={{
                scale: 0.8,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0.8,
                opacity: 0
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <button
                className="close-btn"
                onClick={() =>
                  setSelectedPokemon(null)
                }
              >
                ✕
              </button>

              <img
                src={selectedPokemon.image}
                alt={selectedPokemon.name}
                className="modal-image"
              />

              <h2>
                {selectedPokemon.name}
              </h2>

              <p>
                #{selectedPokemon.id}
              </p>

              <div className="section">
                <h4>Types</h4>
                <p>
                  {selectedPokemon.types.join(
                    ", "
                  )}
                </p>
              </div>

              <div className="section">
                <h4>Abilities</h4>
                <p>
                  {selectedPokemon.pokemon.abilities
                    .map(
                      (a) =>
                        a.ability.name
                    )
                    .join(", ")}
                </p>
              </div>

              <div className="section">
                <h4>Stats</h4>

                {selectedPokemon.pokemon.stats.map(
                  (stat) => (
                    <div
                      key={stat.stat.name}
                      className="stat-row"
                    >
                      <span>
                        {stat.stat.name}
                      </span>

                      <span>
                        {stat.base_stat}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="section">
                <h4>Height</h4>
                <p>
                  {selectedPokemon.pokemon.height}
                </p>

                <h4>Weight</h4>
                <p>
                  {selectedPokemon.pokemon.weight}
                </p>
              </div>

              <div className="section">
                <h4>Evolution Chain</h4>

                <div className="evolution">
                  {selectedPokemon.evolutionChain.map(
                    (evo) => (
                      <span
                        key={evo}
                        className="badge"
                      >
                        {evo}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="section">
                <h4>Description</h4>
                <p>
                  {
                    selectedPokemon.flavorText
                  }
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pokemon;