import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [snakePokemon, setSnakePokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);

  useEffect(() => {
    const fetchSnakePokemon = async () => {
      try {
        const snakeNames = ['serperior', 'ekans', 'dratini', 'dragonair', 'arbok', 'sandaconda', 'silicobra', 'seviper', 'onix',]
        const snakePromises = snakeNames.map(name =>
          axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
        );

        const snakeData = await Promise.all(snakePromises);
        const formattedSnakeData = snakeData.map(response => ({
          id: response.data.id,
          name: response.data.name,
          image: response.data.sprites.other['official-artwork'].front_default,
          type: response.data.types[0].type.name,
          height: response.data.height / 10,
          weight: response.data.weight / 10,
          abilities: response.data.abilities.map(ability => ability.ability.name).join(', ')
        }));

        setSnakePokemon(formattedSnakeData);
      } catch (error) {
        console.error('Error fetching snake Pokémon:', error);
      }
    };

    const fetchAllPokemons = async () => {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
        setAllPokemons(response.data.results);
      } catch (error) {
        console.error('Error fetching all Pokémon:', error);
      }
    };

    fetchSnakePokemon();
    fetchAllPokemons();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      const pokemon = {
        id: response.data.id,
        name: response.data.name,
        image: response.data.sprites.other['official-artwork'].front_default,
        type: response.data.types[0].type.name,
        height: response.data.height / 10,
        weight: response.data.weight / 10,
        abilities: response.data.abilities.map(ability => ability.ability.name).join(', ')
      };
      setSearchResult(pokemon);
      setSuggestions([]);
    } catch (error) {
      console.error('Error searching Pokémon:', error);
      setSearchResult(null);
    }
  };

  const handleInputChange = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      // Filter suggestions based on the starting letter
      const filteredSuggestions = allPokemons.filter(pokemon => pokemon.name.startsWith(term.toLowerCase()));
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [allPokemons]);

  const handleSuggestionClick = (pokemonName) => {
    setSearchTerm(pokemonName);
    handleSearch();
  };

  return (
    <div className="app">
      <header>
        <h1>Catálogo de Pokémon</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar Pokémon"
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button onClick={handleSearch}>Buscar</button>
          {suggestions.length > 1 && (
            <div className="suggestions">
              {suggestions.map((pokemon) => (
                <div
                  key={pokemon.name}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(pokemon.name)}
                >
                  {pokemon.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
      <main>
        {searchResult ? (
          <div className="search-result">
            <h2>Resultado de la búsqueda:</h2>
            <div className="pokemon-card" onClick={() => setSelectedPokemon(searchResult)}>
              <img src={searchResult.image} alt={searchResult.name} />
              <h3>{searchResult.name}</h3>
            </div>
          </div>
        ) : (
          <div className="pokemon-grid">
            {snakePokemon.map((pokemon) => (
              <div key={pokemon.id} className="pokemon-card" onClick={() => setSelectedPokemon(pokemon)}>
                <img src={pokemon.image} alt={pokemon.name} />
                <h3>{pokemon.name}</h3>
              </div>
            ))}
          </div>
        )}
      </main>
      {selectedPokemon && (
        <div className="modal" onClick={() => setSelectedPokemon(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setSelectedPokemon(null)}>&times;</span>
            <img src={selectedPokemon.image} alt={selectedPokemon.name} />
            <h2>{selectedPokemon.name}</h2>
            <p>Tipo: {selectedPokemon.type}</p>
            <p>Altura: {selectedPokemon.height} m</p>
            <p>Peso: {selectedPokemon.weight} kg</p>
            <p>Habilidades: {selectedPokemon.abilities}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
