let offset = 0; // Initial offset for loading more Pokémon
const limit = 18; // Number of Pokémon to load per request

let currentFetchType = 'initial'; // Track the current fetch type
let currentGeneration = ''; // Track the current generation
let currentType = ''; // Track the current type

document.getElementById('search-form').addEventListener('submit', () => {
    const searchInputElement = document.getElementById('pokemon-search');
    const searchInputValue = searchInputElement.value.trim().toLowerCase();
    if (searchInputValue) {
        currentFetchType = 'search';
        fetchPokemonData(searchInputValue);
        searchInputElement.value = '';
        if (window.innerWidth < 992) { // Check if the screen width is less than 992px (Bootstrap's lg breakpoint)
            const navMenu = document.getElementById('navMenu');
            const bsCollapse = new bootstrap.Collapse(navMenu, {
                toggle: true
            });
            bsCollapse.hide();
        }
    }
});

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth < 992) { // Check if the screen width is less than 992px (Bootstrap's lg breakpoint)
            const navMenu = document.getElementById('navMenu');
            const bsCollapse = new bootstrap.Collapse(navMenu, {
                toggle: true
            });
            bsCollapse.hide();
        }
    });
});

document.querySelector('.navbar-brand').addEventListener('click', () => {
    currentFetchType = 'initial';
    offset = 0;
    fetchInitialPokemon();
});

document.querySelectorAll('[data-gen]').forEach(item => {
    item.addEventListener('click', event => {
        const generation = event.target.getAttribute('data-gen');
        currentFetchType = 'generation';
        currentGeneration = generation;
        offset = 0;
        fetchPokemonByGeneration(generation);
    });
});

document.querySelectorAll('[data-type]').forEach(item => {
    item.addEventListener('click', event => {
        const type = event.target.getAttribute('data-type');
        currentFetchType = 'type';
        currentType = type;
        offset = 0;
        fetchPokemonByType(type);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    fetchInitialPokemon();
    window.addEventListener('scroll', debounce(handleScroll, 200));
});

async function fetchInitialPokemon() {
    showLoading();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
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

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 1 && currentFetchType != "search") {
        console.log('Reached the bottom of the page!');
        offset += limit;
        if (currentFetchType === 'initial') {
            fetchInitialPokemon();
        } else if (currentFetchType === 'generation') {
            fetchPokemonByGeneration(currentGeneration);
        } else if (currentFetchType === 'type') {
            fetchPokemonByType(currentType);
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
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
        const pokemonList = data.pokemon_species.slice(offset, offset + limit).map(species => species.name);
        
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
        const pokemonList = data.pokemon.slice(offset, offset + limit).map(p => p.pokemon.name);
        
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

function getShapeBorderStyle(shape) {
    if (!shape?.name) {
        return 'border-color: #d3d3d3;';
    }

    switch(shape.name) {
        case 'ball': 
            return 'border-color: #e91e63;';
        case 'squiggle': 
            return 'border-color: #9c27b0;';
        case 'fish': 
            return 'border-color: #2196f3;';
        case 'arms': 
            return 'border-color: #ff9800;';
        case 'blob': 
            return 'border-color: #4caf50;';
        case 'upright': 
            return 'border-color: #673ab7;';
        case 'legs': 
            return 'border-color: #3f51b5;';
        case 'quadruped': 
            return 'border-color: #009688;';
        case 'wings': 
            return 'border-color: #00bcd4;';
        case 'tentacles': 
            return 'border-color: #607d8b;';
        case 'heads': 
            return 'border-color: #f44336;';
        case 'humanoid': 
            return 'border-color: #795548;';
        case 'bug-wings': 
            return 'border-color: #8bc34a;';
        case 'armor': 
            return 'border-color: #78909c;';
        default: 
            return 'border-color: #d3d3d3;';
    }
}

async function displayPokemon(pokemonData) {
    const container = document.getElementById('pokemon-container');    
    container.innerHTML = ''; // Clear previous content if not appending
    
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
    
    const shapePromises = pokemonData.map(pokemon => 
        fetch(pokemon.species.url)
            .then(res => res.ok ? res.json() : null)
            .then(species => {
                if (species?.shape?.url) {
                    return fetch(species.shape.url)
                        .then(res => res.ok ? res.json() : null);
                }
                return null;
            })
            .catch(() => null)
    );
    
    const shapeData = await Promise.all(shapePromises);
    
    pokemonData.forEach((pokemon, index) => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        
        const typeBadges = pokemon.types.map(t => 
            `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
        ).join('');
        
        const officialArtwork = pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default;
        
        const shape = shapeData[index];
        const shapeName = shape ? shape.name : 'unknown';
        
        card.innerHTML = `
            <div class="card pokemon-card shape-${shapeName}" data-pokemon-id="${pokemon.id}">
                <picture>
                    <img src="${officialArtwork}" loading="lazy" class="card-img-top img-fluid" alt="${pokemon.name}">
                </picture>
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">
                        ${typeBadges}
                    </p>
                </div>
            </div>
        `;
        
        const cardElement = card.querySelector('.pokemon-card');
        cardElement.style = getShapeBorderStyle(shape);
        
        container.appendChild(card);

        card.addEventListener('click', () => {
            showPokemonDetails(pokemon);
        });
    });
}

async function showPokemonDetails(pokemon) {
    try {
        const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
        document.querySelector('.modal-title').textContent = pokemon.name;
        
        setLoadingState();
        
        modal.show();
        
        const [speciesData, habitatData, shapeData, locationsData] = await fetchAdditionalData(pokemon);
        
        updateTabContents(pokemon, speciesData, habitatData, shapeData, locationsData);
    } catch (error) {
        console.error('Error displaying Pokémon details:', error);
    }
}

function setLoadingState() {
    document.getElementById('about-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('stats-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('locations-content').innerHTML = '<p>Loading...</p>';
}

async function fetchAdditionalData(pokemon) {
    let speciesData = {};
    let habitatData = {};
    let shapeData = {};
    let locationsData = [];
    
    try {
        const speciesRes = await fetch(pokemon.species.url);
        if (speciesRes.ok) {
            speciesData = await speciesRes.json();
        }
    } catch (error) {
        console.error('Error fetching species data:', error);
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
        const locationsRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`);
        if (locationsRes.ok) {
            locationsData = await locationsRes.json();
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
    }

    return [speciesData, habitatData, shapeData, locationsData];
}

function updateTabContents(pokemon, speciesData, habitatData, shapeData, locationsData) {
    updateAboutTab(pokemon, speciesData);
    updateStatsTab(pokemon);
    updateLocationsTab(locationsData);
}

function updateAboutTab(pokemon, speciesData) {
    const speciesName = speciesData.name || 'N/A';
    const displaySpeciesName = speciesName.toLowerCase() === pokemon.name.toLowerCase() ? '' : speciesName;

    const frontDefault = pokemon.sprites.front_default || '';
    const frontShiny = pokemon.sprites.front_shiny || '';
    const backDefault = pokemon.sprites.back_default || '';
    const backShiny = pokemon.sprites.back_shiny || '';

    const spriteHtml = frontDefault ? `
        <div class="text-center mb-3">
            <div class="sprite-container">
                <img src="${frontDefault}" 
                     data-normal="${frontDefault}" 
                     data-shiny="${frontShiny}" 
                     class="pokemon-sprite" 
                     alt="${pokemon.name} front sprite"
                     title="Click to toggle shiny form">
                ${backDefault ? `
                <img src="${backDefault}" 
                     data-normal="${backDefault}" 
                     data-shiny="${backShiny}" 
                     class="pokemon-sprite"
                     alt="${pokemon.name} back sprite"
                     title="Click to toggle shiny form">` : ''}
            </div>
        </div>
    ` : '';

    const typeBadges = pokemon.types.map(t => 
        `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
    ).join(' ');

    const heightInMeters = (pokemon.height / 10).toFixed(1);
    const weightInKg = (pokemon.weight / 10).toFixed(1);

    const abilities = pokemon.abilities
        .map(a => a.ability.name.replace('-', ' '))
        .map(name => name.charAt(0).toUpperCase() + name.slice(1))
        .join(', ');

    let pokedexEntry = 'No Pokédex entry available.';
    if (speciesData.flavor_text_entries && speciesData.flavor_text_entries.length > 0) {
        const englishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        if (englishEntry) {
            pokedexEntry = englishEntry.flavor_text.replace(/\f/g, ' ');
        }
    }

    document.getElementById('about-content').innerHTML = `
        ${spriteHtml}
        <div class="pokemon-details">
            <p class="detail-item"><strong>Name:</strong> ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
            <p class="detail-item"><strong>National №:</strong> ${pokemon.id}</p>
            <p class="detail-item"><strong>Type:</strong> ${typeBadges}</p>
            ${displaySpeciesName ? `<p class="detail-item"><strong>Species:</strong> ${displaySpeciesName.charAt(0).toUpperCase() + displaySpeciesName.slice(1)}</p>` : ''}
            <p class="detail-item"><strong>Height:</strong> ${heightInMeters} m</p>
            <p class="detail-item"><strong>Weight:</strong> ${weightInKg} kg</p>
            <p class="detail-item"><strong>Abilities:</strong> ${abilities}</p>
        </div>
        <div class="pokedex-entry mt-4 pt-3 border-top">
            <p class="pokedex-text">${pokedexEntry}</p>
        </div>
    `;

    document.querySelectorAll('#about-content .pokemon-sprite').forEach(sprite => {
        sprite.addEventListener('click', function() {
            const normalSprite = this.getAttribute('data-normal');
            const shinySprite = this.getAttribute('data-shiny');
            
            if (shinySprite && shinySprite !== 'null') {
                if (this.src.includes(normalSprite)) {
                    this.src = shinySprite;
                    this.classList.add('shiny-active');
                } else {
                    this.src = normalSprite;
                    this.classList.remove('shiny-active');
                }
            }
        });
    });
}

function updateStatsTab(pokemon) {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const averageStat = totalStats / pokemon.stats.length;
    const averageStatPercentage = (averageStat / 255) * 100;
    const maxPossibleTotal = 255 * 6;

    document.getElementById('stats-content').innerHTML = `
        <div class="stats-container">
            <div class="stats-header">Base Stats</div>
            <div class="stats-body">
                ${pokemon.stats.map(stat => {
                    const statName = formatStatName(stat.stat.name);
                    const statValue = stat.base_stat;
                    const statPercentage = Math.min(100, (statValue / 255) * 100);
                    const statClass = stat.stat.name.toLowerCase().replace('-', '-');

                    return `
                    <div class="stat-row">
                        <div class="stat-label">${statName}</div>
                        <div class="stat-value" title="Max: 255">${statValue}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar ${statClass}" style="width: ${statPercentage}%" 
                                 title="Base ${statName}: ${statValue}/255"></div>
                        </div>
                    </div>
                    `;
                }).join('')}
                <div class="stat-average-indicator" style="left: ${averageStatPercentage}%;"></div>
            </div>
            <div class="stats-total">
                <span>Total</span>
                <span class="total-value">
                    ${totalStats}
                    <span class="max-possible">(max: ${maxPossibleTotal})</span>
                </span>
            </div>
        </div>
    `;
}

function updateLocationsTab(locationsData) {
    let locationsHtml = '';
    
    if (locationsData && locationsData.length > 0) {
        const locationsByRegion = {};
        
        locationsData.forEach(encounter => {
            const locationName = encounter.location_area.name
                .replace(/-/g, ' ')
                .replace(/\b\w/g, letter => letter.toUpperCase());
            
            const regionName = locationName.split(' ')[0];
            
            if (!locationsByRegion[regionName]) {
                locationsByRegion[regionName] = [];
            }
            
            const versionDetails = encounter.version_details.map(detail => {
                const versionName = detail.version.name;
                let genClass;
                
                if (['red', 'blue', 'yellow'].includes(versionName)) {
                    genClass = 'gen-1';
                } else if (['gold', 'silver', 'crystal'].includes(versionName)) {
                    genClass = 'gen-2';
                } else if (['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'].includes(versionName)) {
                    genClass = 'gen-3';
                } else if (['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'].includes(versionName)) {
                    genClass = 'gen-4';
                } else if (['black', 'white', 'black-2', 'white-2'].includes(versionName)) {
                    genClass = 'gen-5';
                } else if (['x', 'y', 'omega-ruby', 'alpha-sapphire'].includes(versionName)) {
                    genClass = 'gen-6';
                } else if (['sun', 'moon', 'ultra-sun', 'ultra-moon'].includes(versionName)) {
                    genClass = 'gen-7';
                } else if (['sword', 'shield'].includes(versionName)) {
                    genClass = 'gen-8';
                } else if (['scarlet', 'violet'].includes(versionName)) {
                    genClass = 'gen-9';
                }
                
                const displayName = versionName
                    .replace('-', ' ')
                    .replace(/\b\w/g, letter => letter.toUpperCase());
                
                return `<span class="version-badge ${genClass}">${displayName}</span>`;
            }).join('');
            
            locationsByRegion[regionName].push(`
                <li class="location-item">
                    <div class="location-name">${locationName}</div>
                    <div class="version-tags">${versionDetails}</div>
                </li>
            `);
        });
        
        for (const region in locationsByRegion) {
            locationsHtml += `
                <div class="location-region">
                    <h5>${region}</h5>
                    <ul class="location-list list-unstyled">
                        ${locationsByRegion[region].join('')}
                    </ul>
                </div>
            `;
        }
        
        document.getElementById('locations-content').innerHTML = locationsHtml;
    } else {
        document.getElementById('locations-content').innerHTML = `
            <div class="no-locations-message">
                <i class="bi bi-map"></i>
                <p>No location data available for this Pokémon.</p>
                <p class="hint">This Pokémon might be obtained through evolution, trading, special events, or other methods.</p>
            </div>
        `;
    }
}

function formatStatName(statName) {
    return statName
        .replace('special-attack', 'Sp. Atk')
        .replace('special-defense', 'Sp. Def')
        .replace('attack', 'Attack')
        .replace('defense', 'Defense')
        .replace('speed', 'Speed')
        .replace('hp', 'HP');
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