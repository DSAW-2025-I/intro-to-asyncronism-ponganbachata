document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.getElementById('pokemon-search').value.trim().toLowerCase();
    if (searchInput) {
        fetchPokemonData(searchInput);
    }
});

document.querySelectorAll('[data-gen]').forEach(item => {
    item.addEventListener('click', event => {
        const generation = event.target.getAttribute('data-gen');
        fetchPokemonByGeneration(generation);
    });
});

document.querySelectorAll('[data-type]').forEach(item => {
    item.addEventListener('click', event => {
        const type = event.target.getAttribute('data-type');
        fetchPokemonByType(type);
    });
});

// Add this event listener to initialize the page with some Pokémon
document.addEventListener('DOMContentLoaded', () => {
    // Load first 20 Pokémon on page load
    fetchInitialPokemon();
});

async function fetchInitialPokemon() {
    showLoading();
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        
        const pokemonDetailPromises = data.results.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url);
            return await detailResponse.json();
        });
        
        const pokemonDetails = await Promise.all(pokemonDetailPromises);
        displayPokemon(pokemonDetails);
    } catch (error) {
        showError('There has been a problem with your fetch operation: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function fetchPokemonData(pokemon) {
    showLoading();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        displayPokemon([data]);
    } catch (error) {
        showError('There has been a problem with your fetch operation: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function fetchPokemonByGeneration(generation) {
    showLoading();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        
        // Get first 20 Pokémon from this generation
        const pokemonList = data.pokemon_species.slice(0, 20).map(species => species.name);
        
        const pokemonDetailPromises = pokemonList.map(async (name) => {
            const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!detailResponse.ok) return null;
            return await detailResponse.json();
        });
        
        const pokemonDetails = (await Promise.all(pokemonDetailPromises)).filter(p => p !== null);
        displayPokemon(pokemonDetails);
    } catch (error) {
        showError('There has been a problem with your fetch operation: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function fetchPokemonByType(type) {
    showLoading();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        
        // Get first 20 Pokémon of this type
        const pokemonList = data.pokemon.slice(0, 20).map(p => p.pokemon.name);
        
        const pokemonDetailPromises = pokemonList.map(async (name) => {
            const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!detailResponse.ok) return null;
            return await detailResponse.json();
        });
        
        const pokemonDetails = (await Promise.all(pokemonDetailPromises)).filter(p => p !== null);
        displayPokemon(pokemonDetails);
    } catch (error) {
        showError('There has been a problem with your fetch operation: ' + error.message);
    } finally {
        hideLoading();
    }
}

// The existing fetchPokemonData() and displayPokemon() functions provide behavior similar
// to the official Pokédex's search and card layout, pulling data from the same endpoints.

function getTypeColor(type) {
    switch(type) {
        case 'fire': return '#fd7d24';
        case 'water': return '#4592c4';
        case 'grass': return '#9bcc50';
        // ...add more types...
        default: return '#d3d3d3';
    }
}

function displayPokemon(pokemonData) {
    const container = document.getElementById('pokemon-container');
    container.innerHTML = ''; // Clear previous content
    
    if (pokemonData.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info" role="alert">
                    No Pokémon found matching your criteria.
                </div>
            </div>
        `;
        return;
    }
    
    pokemonData.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        
        // Generate type badges HTML similar to Pokemon.com
        const typeBadges = pokemon.types.map(t => 
            `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="card pokemon-card" data-pokemon-id="${pokemon.id}">
                <picture>
                    <source srcset="${pokemon.sprites.front_default}" media="(min-width: 576px)">
                    <img src="${pokemon.sprites.front_default}" loading="lazy" class="card-img-top img-fluid" alt="${pokemon.name}">
                </picture>
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">${typeBadges}</p>
                </div>
            </div>
        `;
        card.style.background = getTypeColor(pokemon.types[0].type.name);
        container.appendChild(card);

        // Add event listener to the card
        card.addEventListener('click', () => {
            showPokemonDetails(pokemon);
        });
    });
}

async function showPokemonDetails(pokemon) {
    try {
        const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
        document.querySelector('.modal-title').textContent = pokemon.name;
        
        // Show loading state in tabs
        setLoadingState();
        
        modal.show();
        
        // Fetch additional data
        const [speciesData, locationData, habitatData, shapeData, formsData] = await fetchAdditionalData(pokemon);
        
        // Update tab contents with fetched data
        updateTabContents(pokemon, speciesData, locationData, habitatData, shapeData, formsData);
    } catch (error) {
        console.error('Error displaying Pokémon details:', error);
    }
}

function setLoadingState() {
    document.getElementById('about-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('stats-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('forms-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('location-content').innerHTML = '<p>Loading...</p>';
}

async function fetchAdditionalData(pokemon) {
    let speciesData = {};
    let locationData = [];
    let habitatData = {};
    let shapeData = {};
    let formsData = [];
    
    try {
        const speciesRes = await fetch(pokemon.species.url);
        if (speciesRes.ok) {
            speciesData = await speciesRes.json();
        }
    } catch (error) {
        console.error('Error fetching species data:', error);
    }
    
    try {
        const locationRes = await fetch(pokemon.location_area_encounters);
        if (locationRes.ok) {
            locationData = await locationRes.json();
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
    }

    try {
        if (speciesData.habitat) {
            const habitatRes = await fetch(speciesData.habitat.url);
            if (habitatRes.ok) {
                habitatData = await habitatRes.json();
            }
        }
    } catch (error) {
        console.error('Error fetching habitat data:', error);
    }

    try {
        if (speciesData.shape) {
            const shapeRes = await fetch(speciesData.shape.url);
            if (shapeRes.ok) {
                shapeData = await shapeRes.json();
            }
        }
    } catch (error) {
        console.error('Error fetching shape data:', error);
    }

    try {
        if (pokemon.forms.length > 0) {
            const formsPromises = pokemon.forms.map(async (form) => {
                const formRes = await fetch(form.url);
                if (formRes.ok) {
                    return await formRes.json();
                }
                return null;
            });
            formsData = (await Promise.all(formsPromises)).filter(f => f !== null);
        }
    } catch (error) {
        console.error('Error fetching forms data:', error);
    }

    return [speciesData, locationData, habitatData, shapeData, formsData];
}

function updateTabContents(pokemon, speciesData, locationData, habitatData, shapeData, formsData) {
    const speciesName = speciesData.name || 'N/A';
    const displaySpeciesName = speciesName.toLowerCase() === pokemon.name.toLowerCase() ? '' : speciesName;

    document.getElementById('about-content').innerHTML = `
        <p><strong>Name:</strong> ${pokemon.name}</p>
        ${displaySpeciesName ? `<p><strong>Species:</strong> ${displaySpeciesName}</p>` : ''}
        <p><strong>Habitat:</strong> ${habitatData.name || 'N/A'}</p>
        <p><strong>Shape:</strong> ${shapeData.name || 'N/A'}</p>
        <p><strong>Types:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
    `;
    
    // Create custom stat bars without Chart.js
    document.getElementById('stats-content').innerHTML = `
        <div class="stats-container">
            ${pokemon.stats.map(stat => {
                const statName = formatStatName(stat.stat.name);
                const statValue = stat.base_stat;
                const statPercentage = Math.min(100, (statValue / 255) * 100);
                const barColor = getStatColor(statValue);
                
                return `
                <div class="stat-row">
                    <div class="stat-label">${statName}</div>
                    <div class="stat-value">${statValue}</div>
                    <div class="stat-bar-container">
                        <div class="stat-bar" style="width: ${statPercentage}%; background-color: ${barColor};"></div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.getElementById('forms-content').innerHTML = formsData.length > 0 ? `
        <ul>
            ${formsData.map(f => `<li>${f.name}</li>`).join('')}
        </ul>
    ` : '<p>No form data available</p>';
    
    document.getElementById('location-content').innerHTML = locationData.length > 0 ? `
        <ul>
            ${locationData.map(loc => `<li>${loc.location_area.name}</li>`).join('')}
        </ul>
    ` : '<p>No location data available</p>';
}

// Format stat name to be more readable
function formatStatName(statName) {
    return statName
        .replace('special-attack', 'Sp. Atk')
        .replace('special-defense', 'Sp. Def')
        .replace('attack', 'Attack')
        .replace('defense', 'Defense')
        .replace('speed', 'Speed')
        .replace('hp', 'HP');
}

// Get color for stat bar based on value
function getStatColor(value) {
    if (value < 50) {
        return '#FB6C6C'; // Red for low stats
    } else if (value < 80) {
        return '#FFCE4B'; // Yellow for medium stats
    } else if (value < 120) {
        return '#4BC07A'; // Green for good stats
    } else {
        return '#7038F8'; // Purple for excellent stats
    }
}

function showLoading() {
    const container = document.getElementById('pokemon-container');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border loading-spinner text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading Pokémon data...</p>
        </div>
    `;
}

function hideLoading() {
    // This is now handled by displayPokemon
}

function showError(message) {
    const container = document.getElementById('pokemon-container');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        </div>
    `;
}