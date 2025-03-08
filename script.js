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
        case 'normal': return '#A8A77A';
        case 'fire': return '#EE8130';
        case 'water': return '#6390F0';
        case 'electric': return '#F7D02C';
        case 'grass': return '#7AC74C';
        case 'ice': return '#96D9D6';
        case 'fighting': return '#C22E28';
        case 'poison': return '#A33EA1';
        case 'ground': return '#E2BF65';
        case 'flying': return '#A98FF3';
        case 'psychic': return '#F95587';
        case 'bug': return '#A6B91A';
        case 'rock': return '#B6A136';
        case 'ghost': return '#735797';
        case 'dragon': return '#6F35FC';
        case 'dark': return '#705746';
        case 'steel': return '#B7B7CE';
        case 'fairy': return '#D685AD';
        default: return '#d3d3d3';
    }
}

// Update getShapeBorderStyle function to only change border color
function getShapeBorderStyle(shape) {
    // Default border color if shape is unknown
    if (!shape || !shape.name) {
        return 'border-color: #d3d3d3;';
    }

    // Different border colors based on shape
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

// Update displayPokemon to fetch shape data before creating cards
async function displayPokemon(pokemonData) {
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
    
    // First fetch all species data to get shapes
    const shapePromises = pokemonData.map(pokemon => 
        fetch(pokemon.species.url)
            .then(res => res.ok ? res.json() : null)
            .then(species => {
                if (species && species.shape && species.shape.url) {
                    return fetch(species.shape.url)
                        .then(res => res.ok ? res.json() : null);
                }
                return null;
            })
            .catch(() => null)
    );
    
    const shapeData = await Promise.all(shapePromises);
    
    // Now create cards with shape information
    pokemonData.forEach((pokemon, index) => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        
        // Generate type badges HTML for all types
        const typeBadges = pokemon.types.map(t => 
            `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
        ).join('');
        
        // Use official artwork instead of sprite for main display
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
        
        // Apply border style based on shape
        const cardElement = card.querySelector('.pokemon-card');
        cardElement.style = getShapeBorderStyle(shape);
        
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
        const [speciesData, habitatData, shapeData, formsData, locationsData] = await fetchAdditionalData(pokemon);
        
        // Update tab contents with fetched data
        updateTabContents(pokemon, speciesData, habitatData, shapeData, formsData, locationsData);
    } catch (error) {
        console.error('Error displaying Pokémon details:', error);
    }
}

function setLoadingState() {
    document.getElementById('about-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('stats-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('forms-content').innerHTML = '<p>Loading...</p>';
    document.getElementById('locations-content').innerHTML = '<p>Loading...</p>';
}

async function fetchAdditionalData(pokemon) {
    let speciesData = {};
    let habitatData = {};
    let shapeData = {};
    let formsData = [];
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
        if (pokemon.forms.length > 0) {
            const formsPromises = pokemon.forms.map(async (form) => {
                const formRes = await fetch(form.url);
                if (formRes.ok) {
                    const formData = await formRes.json();
                    
                    // For each form, we need to fetch its types and sprites
                    // If it's the default form, we already have this data from the pokemon object
                    if (formData.is_default) {
                        return {
                            ...formData,
                            types: pokemon.types,
                            sprites: pokemon.sprites,
                            description: `This is the standard form of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}.`
                        };
                    }
                    
                    // For other forms, we need to fetch the Pokémon data specifically for that form
                    try {
                        const pokemonFormRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${formData.name}`);
                        if (pokemonFormRes.ok) {
                            const pokemonFormData = await pokemonFormRes.json();
                            
                            // Generate description based on form name
                            let description = `A special form of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}.`;
                            
                            // Try to identify the form type from the name
                            const formName = formData.name.toLowerCase();
                            if (formName.includes('alola')) {
                                description = `The Alolan form of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}, adapted to the unique environment of the Alola region.`;
                            } else if (formName.includes('galar')) {
                                description = `The Galarian form of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}, adapted to the unique environment of the Galar region.`;
                            } else if (formName.includes('hisui')) {
                                description = `The ancient Hisuian form of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} from the Hisui region.`;
                            } else if (formName.includes('mega')) {
                                description = `The Mega Evolution of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}, achieved through Mega Stone and a strong bond with its trainer.`;
                            } else if (formName.includes('gmax') || formName.includes('gigantamax')) {
                                description = `The Gigantamax form of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}, with the power of Dynamax energy.`;
                            }
                            
                            return {
                                ...formData,
                                types: pokemonFormData.types,
                                sprites: pokemonFormData.sprites,
                                description: description
                            };
                        }
                    } catch (err) {
                        console.error('Error fetching specific form data:', err);
                    }
                    
                    // Fallback - use base Pokémon data if we couldn't fetch specific form data
                    return {
                        ...formData,
                        types: pokemon.types,
                        sprites: pokemon.sprites,
                        description: `An alternate form of ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}.`
                    };
                }
                return null;
            });
            formsData = (await Promise.all(formsPromises)).filter(f => f !== null);
        }
    } catch (error) {
        console.error('Error fetching forms data:', error);
    }

    try {
        // Fetch locations where this Pokémon can be encountered
        const locationsRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`);
        if (locationsRes.ok) {
            locationsData = await locationsRes.json();
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
    }

    return [speciesData, habitatData, shapeData, formsData, locationsData];
}

function updateTabContents(pokemon, speciesData, habitatData, shapeData, formsData, locationsData) {
    const speciesName = speciesData.name || 'N/A';
    const displaySpeciesName = speciesName.toLowerCase() === pokemon.name.toLowerCase() ? '' : speciesName;

    // Prepare sprite URLs (both normal and shiny)
    const frontDefault = pokemon.sprites.front_default || '';
    const frontShiny = pokemon.sprites.front_shiny || '';
    const backDefault = pokemon.sprites.back_default || '';
    const backShiny = pokemon.sprites.back_shiny || '';

    // Show sprites in details page (adding data attributes for toggling)
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

    // Generate type badges HTML matching the main view
    const typeBadges = pokemon.types.map(t => 
        `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
    ).join(' ');

    // Format height (convert to meters) and weight (convert to kg)
    const heightInMeters = (pokemon.height / 10).toFixed(1);
    const weightInKg = (pokemon.weight / 10).toFixed(1);

    // Format abilities list
    const abilities = pokemon.abilities
        .map(a => a.ability.name.replace('-', ' '))
        .map(name => name.charAt(0).toUpperCase() + name.slice(1))
        .join(', ');

    // Get Pokédex entry (flavor text)
    let pokedexEntry = 'No Pokédex entry available.';
    if (speciesData.flavor_text_entries && speciesData.flavor_text_entries.length > 0) {
        // Try to find English entry
        const englishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        if (englishEntry) {
            pokedexEntry = englishEntry.flavor_text.replace(/\f/g, ' ');
        }
    }

    // Format and display the about tab with the requested layout
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

    // Add event listeners to sprites to toggle shiny forms
    document.querySelectorAll('#about-content .pokemon-sprite').forEach(sprite => {
        sprite.addEventListener('click', function() {
            const normalSprite = this.getAttribute('data-normal');
            const shinySprite = this.getAttribute('data-shiny');
            
            // Only toggle if shiny sprite exists
            if (shinySprite && shinySprite !== 'null') {
                // Toggle between normal and shiny
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
    
    // Create custom stat bars with stat-specific colors and average indicators
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const maxPossibleTotal = 255 * 6; // 6 stats × 255 max each
    
    document.getElementById('stats-content').innerHTML = `
        <div class="stats-container">
            <div class="stats-header">Base Stats</div>
            <div class="stats-body">
                ${pokemon.stats.map(stat => {
                    const statName = formatStatName(stat.stat.name);
                    const statValue = stat.base_stat;
                    const statPercentage = Math.min(100, (statValue / 255) * 100);
                    const statClass = stat.stat.name.toLowerCase().replace('-', '-');
                    
                    // Calculate position for average value indicator (around 80/255)
                    const avgStatPosition = (80 / 255) * 100;
                    
                    return `
                    <div class="stat-row">
                        <div class="stat-label">${statName}</div>
                        <div class="stat-value" title="Max: 255">${statValue}</div>
                        <div class="stat-bar-container">
                            <div class="stat-average-indicator" style="left: calc(80/255*100%);"></div>
                            <div class="stat-bar ${statClass}" style="width: ${statPercentage}%" 
                                 title="Base ${statName}: ${statValue}/255"></div>
                        </div>
                    </div>
                    `;
                }).join('')}
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
    
    // Enhanced form cards display with descriptions, grid layout, and optional form toggle
    if (formsData && formsData.length > 0) {
        // Group forms by category if there are multiple
        const hasMultipleForms = formsData.length > 1;
        const formCategories = {};
        
        formsData.forEach(form => {
            // Determine form category
            let category = 'Standard';
            const formName = form.name.toLowerCase();
            
            if (formName.includes('alola')) category = 'Alolan';
            else if (formName.includes('galar')) category = 'Galarian';
            else if (formName.includes('hisui')) category = 'Hisuian';
            else if (formName.includes('mega')) category = 'Mega';
            else if (formName.includes('gmax') || formName.includes('gigantamax')) category = 'Gigantamax';
            else if (!form.is_default) category = 'Other';
            
            if (!formCategories[category]) {
                formCategories[category] = [];
            }
            formCategories[category].push(form);
        });
        
        // Create HTML for forms content
        let formsNavHTML = '';
        let formsGridHTML = '';
        
        // If multiple categories, create navigation toggle
        if (hasMultipleForms && Object.keys(formCategories).length > 1) {
            formsNavHTML = `
                <div class="forms-nav">
                    ${Object.keys(formCategories).map((category, index) => 
                        `<button class="form-nav-item ${index === 0 ? 'active' : ''}" 
                                data-category="${category}">${category} Forms</button>`
                    ).join('')}
                </div>
            `;
            
            // Create form cards for each category
            Object.keys(formCategories).forEach((category, index) => {
                const categoryForms = formCategories[category];
                formsGridHTML += `
                    <div class="forms-grid ${index === 0 ? 'd-grid' : 'd-none'}" data-category="${category}">
                        ${renderFormCards(categoryForms, pokemon)}
                    </div>
                `;
            });
        } else {
            // Simple grid without categories
            formsGridHTML = `
                <div class="forms-grid d-grid">
                    ${renderFormCards(formsData, pokemon)}
                </div>
            `;
        }
        
        document.getElementById('forms-content').innerHTML = `
            ${formsNavHTML}
            ${formsGridHTML}
        `;
        
        // Add event listeners to form navigation toggle buttons
        if (hasMultipleForms && Object.keys(formCategories).length > 1) {
            document.querySelectorAll('.form-nav-item').forEach(button => {
                button.addEventListener('click', function() {
                    // Deactivate all buttons and hide all grids
                    document.querySelectorAll('.form-nav-item').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.forms-grid').forEach(grid => grid.classList.remove('d-grid', 'd-none'));
                    document.querySelectorAll('.forms-grid').forEach(grid => grid.classList.add('d-none'));
                    
                    // Activate clicked button and show corresponding grid
                    this.classList.add('active');
                    const category = this.getAttribute('data-category');
                    document.querySelector(`.forms-grid[data-category="${category}"]`).classList.remove('d-none');
                    document.querySelector(`.forms-grid[data-category="${category}"]`).classList.add('d-grid');
                });
            });
        }
    } else {
        document.getElementById('forms-content').innerHTML = `
            <div class="no-forms-message">
                <i class="bi bi-card-image mb-3" style="font-size: 2rem;"></i>
                <p>This Pokémon doesn't have any different forms.</p>
            </div>
        `;
    }
    
    // Format and display the locations
    let locationsHtml = '';
    
    if (locationsData && locationsData.length > 0) {
        // Group locations by region
        const locationsByRegion = {};
        
        locationsData.forEach(encounter => {
            const locationName = encounter.location_area.name
                .replace(/-/g, ' ')
                .replace(/\b\w/g, letter => letter.toUpperCase());
            
            // Extract the region from the URL if possible (not directly provided in the API)
            const locationParts = encounter.location_area.url.split('/');
            const locationAreaId = locationParts[locationParts.length - 2];
            
            // For simplicity, we'll group by the first part of the location name
            // which often indicates the region or major area
            const regionName = locationName.split(' ')[0];
            
            if (!locationsByRegion[regionName]) {
                locationsByRegion[regionName] = [];
            }
            
            // Add version details to the location
            const versionDetails = encounter.version_details.map(detail => {
                return `<span class="badge bg-light text-dark">${detail.version.name}</span>`;
            }).join(' ');
            
            locationsByRegion[regionName].push(`
                <li class="location-item">
                    <div class="location-name">${locationName}</div>
                    <div class="version-tags">${versionDetails}</div>
                </li>
            `);
        });
        
        // Create HTML for each region
        for (const region in locationsByRegion) {
            locationsHtml += `
                <div class="location-region mb-3">
                    <h5>${region}</h5>
                    <ul class="location-list list-unstyled">
                        ${locationsByRegion[region].join('')}
                    </ul>
                </div>
            `;
        }
        
        document.getElementById('locations-content').innerHTML = locationsHtml;
    } else {
        locationsHtml = '<p>No location data available. This Pokémon might be obtained through evolution, trading, or special events.</p>';
    }
    
    document.getElementById('locations-content').innerHTML = locationsHtml;

    // Enhanced format and display for the locations tab
    if (locationsData && locationsData.length > 0) {
        // Group locations by region
        const locationsByRegion = {};
        
        locationsData.forEach(encounter => {
            const locationName = encounter.location_area.name
                .replace(/-/g, ' ')
                .replace(/\b\w/g, letter => letter.toUpperCase());
            
            // For simplicity, we'll group by the first part of the location name
            // which often indicates the region or major area
            const regionName = locationName.split(' ')[0];
            
            if (!locationsByRegion[regionName]) {
                locationsByRegion[regionName] = [];
            }
            
            // Add version details to the location with enhanced styling
            const versionDetails = encounter.version_details.map(detail => {
                const versionName = detail.version.name;
                // Determine generation for badge color
                let genClass = 'gen-1'; // Default
                
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
                
                // Format the version name nicely
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
        
        // Create HTML for each region
        let locationsHtml = '';
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
        // Display a more informative and styled "no locations" message
        document.getElementById('locations-content').innerHTML = `
            <div class="no-locations-message">
                <i class="bi bi-map"></i>
                <p>No location data available for this Pokémon.</p>
                <p class="hint">This Pokémon might be obtained through evolution, trading, special events, or other methods.</p>
            </div>
        `;
    }
}

// Helper function to render form cards
function renderFormCards(forms, basePokemon) {
    return forms.map(form => {
        // Get official artwork or fallback to front_default
        const formArtwork = 
            form.sprites.other?.['official-artwork']?.front_default || 
            form.sprites.front_default ||
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
        
        // Get primary type to determine gradient background
        const primaryType = form.types && form.types.length > 0 
            ? form.types[0].type.name 
            : 'normal';
        
        // Generate type badges
        const formTypeBadges = form.types 
            ? form.types.map(t => 
                `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
              ).join('') 
            : '';
        
        // Format the form name for display
        let displayName = form.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (form.is_default) {
            displayName = `Standard Form`;
        } else {
            // Extract form name without base Pokémon name
            const baseName = basePokemon.name.charAt(0).toUpperCase() + basePokemon.name.slice(1);
            displayName = displayName.replace(baseName, '').trim();
            if (!displayName) {
                displayName = "Alternate Form";
            }
        }
            
        return `
            <div class="form-card" data-form-type="${primaryType}">
                <div class="form-card-header">
                    <h5 class="form-name">${displayName}</h5>
                </div>
                <div class="form-card-body">
                    <div class="form-image-container">
                        <img src="${formArtwork}" alt="${form.name}" class="form-image">
                    </div>
                    <div class="form-types">
                        <p class="form-type-label">Types:</p>
                        ${formTypeBadges}
                    </div>
                    <div class="form-description">
                        <p>${form.description || `A form of ${basePokemon.name.charAt(0).toUpperCase() + basePokemon.name.slice(1)}.`}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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

// This function is no longer used as we're using fixed color classes per stat
// But keeping it in case it's needed elsewhere
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