'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Loader2, AlertCircle, X, Globe, Heart, Star } from 'lucide-react';
import Image from 'next/image';

interface Breed {
  id: string;
  name: string;
  description?: string;
  origin?: string;
  temperament?: string;
}

interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export default function CatBreedsGallery() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [images, setImages] = useState<CatImage[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState<boolean>(true);
  const [loadingImages, setLoadingImages] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [originDropdownOpen, setOriginDropdownOpen] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<CatImage | null>(null);
  const [favorites, setFavorites] = useState<CatImage[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  // Fetch breeds on component mount
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        setLoadingBreeds(true);
        setError('');
        const response = await fetch('https://api.thecatapi.com/v1/breeds');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: Breed[] = await response.json();
        setBreeds(data);
      } catch (err) {
        console.error('Error fetching breeds:', err);
        setError('Oops! Our kitties are hiding. Please try again later. 🐱');
      } finally {
        setLoadingBreeds(false);
      }
    };

    fetchBreeds();
  }, []);

  // Load favorites from local storage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('cat-favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('cat-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Get unique origins for filter
  const uniqueOrigins = useMemo(() => {
    const origins = breeds
      .map(breed => breed.origin)
      .filter(Boolean)
      .flatMap(origin => origin!.split(',').map(o => o.trim()))
      .filter((origin, index, array) => array.indexOf(origin) === index)
      .sort();
    return origins;
  }, [breeds]);

  // Filter breeds based on search term and selected origin
  const filteredBreeds = useMemo(() => {
    return breeds.filter(breed => {
      const matchesOrigin = !selectedOrigin || 
        (breed.origin && breed.origin.toLowerCase().includes(selectedOrigin.toLowerCase()));
      return matchesOrigin;
    });
  }, [breeds, selectedOrigin]);

  // Fetch images for selected breed
  const fetchImages = async (breedId: string) => {
    if (!breedId) {
      setImages([]);
      return;
    }

    try {
      setLoadingImages(true);
      setError('');
      
      const response = await fetch(
        `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CatImage[] = await response.json();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Our furry friends are camera shy right now! Please try again. 📸🐾');
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleBreedSelect = (breedId: string) => {
    setSelectedBreed(breedId);
    setDropdownOpen(false);
    setShowFavorites(false);
    fetchImages(breedId);
  };

  const handleOriginSelect = (origin: string) => {
    setSelectedOrigin(origin);
    setOriginDropdownOpen(false);
    // Reset selected breed when origin changes
    setSelectedBreed('');
    setImages([]);
    setShowFavorites(false);
  };

  const openModal = (image: CatImage) => {
    setModalImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalImage(null);
    document.body.style.overflow = 'unset';
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (modalImage) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [modalImage]);

  const toggleFavorite = (image: CatImage) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(fav => fav.id === image.id);
      if (isFavorite) {
        return prevFavorites.filter(fav => fav.id !== image.id);
      } else {
        return [...prevFavorites, image];
      }
    });
  };

  const selectedBreedInfo = breeds.find(breed => breed.id === selectedBreed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 paw-pattern">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-6xl float-animation">🐱</div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent font-fredoka">
              Cat Breeds Gallery
            </h1>
            <div className="text-6xl float-animation" style={{ animationDelay: '1s' }}>🐾</div>
          </div>
          <p className="text-xl text-amber-700 max-w-3xl mx-auto font-medium leading-relaxed">
            Welcome to the most purrfect place on the internet! 🌟 Discover adorable cats from around the world, 
            filter by their homeland, and click on photos to see these beautiful felines up close. 
            <span className="inline-block heart-pulse">💕</span>
          </p>
          <div className="whisker-divider mt-8"></div>
        </header>

        {/* Filters Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Filter */}
            <div className="relative">
              <label htmlFor="origin-selector" className="block text-lg font-semibold text-amber-800 mb-3 font-fredoka">
                🌍 Choose Origin
              </label>
              <button
                id="origin-selector"
                onClick={() => setOriginDropdownOpen(!originDropdownOpen)}
                className="w-full bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-2xl px-6 py-4 text-left shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300 flex items-center justify-between paw-hover group"
                aria-haspopup="listbox"
                aria-expanded={originDropdownOpen}
                aria-label="Filter by origin"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-500 wiggle-hover" />
                  <span className={`font-medium ${selectedOrigin ? 'text-amber-900' : 'text-amber-600'}`}>
                    {selectedOrigin || 'All origins'}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-orange-500 transition-transform duration-300 ${originDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {originDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-orange-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
                  <ul role="listbox" aria-label="Origins">
                    <li
                      role="option"
                      aria-selected={selectedOrigin === ''}
                      className="px-6 py-4 hover:bg-orange-50 cursor-pointer transition-colors duration-200 border-b border-orange-100 first:rounded-t-2xl"
                      onClick={() => handleOriginSelect('')}
                    >
                      <div className="font-semibold text-amber-900 flex items-center gap-2">
                        <span>🌎</span> All origins
                      </div>
                    </li>
                    {uniqueOrigins.map((origin) => (
                      <li
                        key={origin}
                        role="option"
                        aria-selected={selectedOrigin === origin}
                        className="px-6 py-4 hover:bg-orange-50 cursor-pointer transition-colors duration-200 border-b border-orange-100 last:border-b-0 last:rounded-b-2xl"
                        onClick={() => handleOriginSelect(origin)}
                      >
                        <div className="font-medium text-amber-900 flex items-center gap-2">
                          <span>📍</span> {origin}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Breed Selector */}
            <div className="relative">
              <label htmlFor="breed-selector" className="block text-lg font-semibold text-amber-800 mb-3 font-fredoka">
                🐾 Pick Your Favorite Breed
              </label>
              <button
                id="breed-selector"
                onClick={() => !loadingBreeds && setDropdownOpen(!dropdownOpen)}
                className="w-full bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-2xl px-6 py-4 text-left shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between paw-hover group"
                disabled={loadingBreeds}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                aria-label="Select cat breed"
              >
                {loadingBreeds ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                    <span className="font-medium text-amber-700">Finding adorable breeds...</span>
                  </div>
                ) : selectedBreed ? (
                  <span className="font-medium text-amber-900 flex items-center gap-2">
                    <span>😸</span> {breeds.find(breed => breed.id === selectedBreed)?.name}
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium flex items-center gap-2">
                    <span>🤔</span> Choose your purrfect breed
                  </span>
                )}
                <ChevronDown 
                  className={`w-5 h-5 text-orange-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && !loadingBreeds && (
                <div className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-orange-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
                  <ul role="listbox" aria-label="Cat breeds">
                    {filteredBreeds.length === 0 ? (
                      <li className="px-6 py-4 text-amber-600 text-center font-medium">
                        <span className="block text-2xl mb-2">😿</span>
                        No kitties found from this origin
                      </li>
                    ) : (
                      filteredBreeds.map((breed) => (
                        <li
                          key={breed.id}
                          role="option"
                          aria-selected={selectedBreed === breed.id}
                          className="px-6 py-4 hover:bg-orange-50 cursor-pointer transition-colors duration-200 border-b border-orange-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                          onClick={() => handleBreedSelect(breed.id)}
                        >
                          <div className="font-semibold text-amber-900 flex items-center gap-2">
                            <span>😺</span> {breed.name}
                          </div>
                          {breed.origin && (
                            <div className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                              <span>📍</span> {breed.origin}
                            </div>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
           {/* Favorites Button */}
           <div className="text-center mt-8">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-6 h-6 ${showFavorites ? 'fill-white' : ''}`} />
                <span>{showFavorites ? 'Back to Gallery' : `View Favorites (${favorites.length})`}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Selected Breed Info */}
        {selectedBreedInfo && !showFavorites && (
          <div className="max-w-5xl mx-auto mb-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-orange-200 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl float-animation">😻</div>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4 font-fredoka flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500 wiggle-hover" />
              {selectedBreedInfo.name}
            </h2>
            {selectedBreedInfo.description && (
              <p className="text-amber-800 mb-6 leading-relaxed text-lg font-medium">{selectedBreedInfo.description}</p>
            )}
            <div className="flex flex-wrap gap-6 text-base">
              {selectedBreedInfo.origin && (
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-700 text-lg">🌍 Origin:</span>
                  <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">
                    {selectedBreedInfo.origin}
                  </span>
                </div>
              )}
              {selectedBreedInfo.temperament && (
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-700 text-lg">💝 Personality:</span>
                  <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full font-semibold">
                    {selectedBreedInfo.temperament}
                  </span>
                </div>
              )}
            </div>
            <div className="whisker-divider mt-6"></div>
          </div>
        )}

        {/* Error Message */}
        {error && !showFavorites && (
          <div className="max-w-3xl mx-auto mb-12 bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="text-3xl">😿</div>
            <div>
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mb-2" />
              <p className="text-red-800 font-medium text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Spinner for Images */}
        {loadingImages && !showFavorites && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-6 float-animation">🐱</div>
            <Loader2 className="w-16 h-16 animate-spin text-orange-500 mb-6" />
            <p className="text-amber-700 text-xl font-semibold">Gathering adorable photos...</p>
            <p className="text-amber-600 text-lg mt-2">Our kitties are getting ready for their photoshoot! 📸✨</p>
          </div>
        )}

        {/* Images Grid */}
        {!loadingImages && images.length > 0 && !showFavorites && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {images.map((image, index) => {
              const isFavorite = favorites.some(fav => fav.id === image.id);
              return (
                <div 
                  key={image.id} 
                  className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 bg-white cursor-pointer border-4 border-orange-100 hover:border-orange-300"
                >
                  <div className="aspect-square relative bg-gradient-to-br from-orange-50 to-amber-50" onClick={() => openModal(image)}>
                    <Image
                      src={image.url}
                      alt={`${selectedBreedInfo?.name || 'Cat'} #${index + 1} - Beautiful ${selectedBreedInfo?.name || 'cat'} photo`}
                      className="transition-transform duration-700 group-hover:scale-110"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                      <button 
                        onClick={() => toggleFavorite(image)}
                        className="bg-white/95 rounded-full p-2 shadow-lg"
                      >
                        <Heart className={`w-6 h-6 transition-colors duration-300 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                      </button>
                    </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Favorites Grid */}
        {showFavorites && (
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-8 text-center font-fredoka">
              Your Favorite Felines 💖
            </h2>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {favorites.map((image, index) => (
                  <div 
                    key={image.id} 
                    className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 bg-white cursor-pointer border-4 border-orange-100 hover:border-orange-300"
                  >
                    <div className="aspect-square relative bg-gradient-to-br from-orange-50 to-amber-50" onClick={() => openModal(image)}>
                      <Image
                        src={image.url}
                        alt={`Favorite cat #${index + 1}`}
                        className="transition-transform duration-700 group-hover:scale-110"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                        <button 
                          onClick={() => toggleFavorite(image)}
                          className="bg-white/95 rounded-full p-2 shadow-lg"
                        >
                          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">😿</div>
                <p className="text-2xl text-amber-700 mb-4 font-semibold">You have no favorites yet!</p>
                <p className="text-amber-600 text-lg">Click the heart on any photo to save your favorite cats. 🐾</p>
              </div>
            )}
          </div>
        )}

        {/* No Images Message */}
        {!loadingImages && selectedBreed && images.length === 0 && !error && !showFavorites &&(
          <div className="text-center py-20">
            <div className="text-8xl mb-6">😿</div>
            <p className="text-2xl text-amber-700 mb-4 font-semibold">This kitty is camera shy!</p>
            <p className="text-amber-600 text-lg">Try selecting a different breed to see adorable photos. 🐾</p>
          </div>
        )}

        {/* Initial State */}
        {!selectedBreed && !loadingBreeds && !showFavorites && (
          <div className="text-center py-24">
            <div className="text-9xl mb-8 float-animation">🐱</div>
            <h3 className="text-3xl font-bold text-amber-800 mb-6 font-fredoka">Ready for some cat magic? ✨</h3>
            <p className="text-amber-700 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Choose an origin or pick a breed from the dropdown to discover the most adorable feline friends! 
              Each photo is clickable for a closer look at these precious kitties. 
              <span className="inline-block heart-pulse">💕</span>
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <div className="text-3xl wiggle-hover">🐾</div>
              <div className="text-3xl wiggle-hover" style={{ animationDelay: '0.2s' }}>❤️</div>
              <div className="text-3xl wiggle-hover" style={{ animationDelay: '0.4s' }}>🐾</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-16 right-0 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 rounded-full p-3 paw-hover"
              aria-label="Close modal"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="absolute -top-16 left-0 text-white text-lg font-semibold bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="mr-2">😻</span>
              Isn&apos;t this kitty adorable?
            </div>
            <Image
              src={modalImage.url}
              alt={`Full size ${selectedBreedInfo?.name || 'cat'} photo`}
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border-4 border-white/20"
              onClick={(e) => e.stopPropagation()}
              width={modalImage.width}
              height={modalImage.height}
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}