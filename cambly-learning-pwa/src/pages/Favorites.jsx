import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Calendar, Trash2, Eye } from 'lucide-react';
import { favoritesStorage, transcriptStorage } from '../utils/storage';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const allFavorites = favoritesStorage.getAll();
    setFavorites(allFavorites);
  };

  const handleRemoveFavorite = (cardId) => {
    setCardToDelete(cardId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      favoritesStorage.remove(cardToDelete);
      loadFavorites();
    }
    setShowDeleteModal(false);
    setCardToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCardToDelete(null);
  };

  const handleRemoveAllFavorites = () => {
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = () => {
    favoritesStorage.clearAll();
    loadFavorites();
    setShowDeleteAllModal(false);
  };

  const cancelDeleteAll = () => {
    setShowDeleteAllModal(false);
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesType = filterType === 'all' || favorite.cardType === filterType;
    const matchesSearch = searchTerm === '' || 
      favorite.cardData.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.cardData.original?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.cardData.question_en?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getCardPreview = (favorite) => {
    switch (favorite.cardType) {
      case 'grammar':
        return favorite.cardData.original || 'Grammar Card';
      case 'vocabulary':
        return favorite.cardData.word || 'Vocabulary Card';
      case 'quiz':
        return favorite.cardData.question_en || 'Quiz Card';
      default:
        return 'Card';
    }
  };

  const getCardTypeColor = (type) => {
    switch (type) {
      case 'grammar':
        return 'bg-blue-100 text-blue-800';
      case 'vocabulary':
        return 'bg-green-100 text-green-800';
      case 'quiz':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCardTypeLabel = (type) => {
    switch (type) {
      case 'grammar':
        return 'Grammar';
      case 'vocabulary':
        return 'Vocabulary';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Card';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorites</h1>
              <p className="text-gray-600">
                {favorites.length} favorite cards
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('grammar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'grammar'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grammar
              </button>
              <button
                onClick={() => setFilterType('vocabulary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'vocabulary'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Vocabulary
              </button>
              <button
                onClick={() => setFilterType('quiz')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'quiz'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {favorites.length === 0 ? 'No favorite cards yet' : 'No search results found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {favorites.length === 0 
                ? 'Add cards to favorites to view them here.'
                : 'Try different search terms.'
              }
            </p>
            {favorites.length === 0 && (
              <Link
                to="/"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <BookOpen size={18} />
                <span>Browse Cards</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCardTypeColor(favorite.cardType)}`}>
                      {getCardTypeLabel(favorite.cardType)}
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar size={14} />
                      <span className="text-xs">
                        {new Date(favorite.addedAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.cardId)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {getCardPreview(favorite)}
                  </h3>
                  {favorite.cardType === 'vocabulary' && favorite.cardData.definition_en && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {favorite.cardData.definition_en}
                    </p>
                  )}
                  {favorite.cardType === 'grammar' && favorite.cardData.correction && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {favorite.cardData.correction}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link
                    to={`/transcript/${favorite.transcriptId}`}
                    state={{ cardId: favorite.cardId, cardType: favorite.cardType }}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    <Eye size={16} />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete All Button - Bottom of page */}
        {favorites.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
            <button
              onClick={handleRemoveAllFavorites}
              className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors font-medium flex items-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Delete All Favorites</span>
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Remove from favorites?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete all favorites?</h3>
                  <p className="text-sm text-gray-600">This will remove all {favorites.length} favorite cards. This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={cancelDeleteAll}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
