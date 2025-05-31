import React, { useState, useEffect } from 'react';
import { Upload, X, Trash2, Check, Plus } from 'lucide-react';
import axios from 'axios';

interface GalleryImage {
  id: number;
  name?: string;
  image: string;
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    image: null as File | null
  });

  const username = localStorage.getItem('username');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchGalleryImages();
  }, [username, token]);

  const fetchGalleryImages = async () => {
    if (!username || !token) {
      setError('Please log in to view gallery images');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://backend.gamanrehabcenter.com/website/user/${username}/stories/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setImages(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setError('No gallery images found');
        } else if (error.response?.status === 401) {
          setError('Session expired. Please log in again');
          // Optionally redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          window.location.href = '/';
        } else {
          setError('Failed to fetch gallery images. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !token || !formData.image) return;

    setIsLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('image', formData.image);
    if (formData.name) {
      formDataToSend.append('name', formData.name);
    }

    try {
      if (isEditMode && currentImage) {
        await axios.put(
          `https://backend.gamanrehabcenter.com/website/user/${username}/stories/${currentImage.id}/`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await axios.post(
          `https://backend.gamanrehabcenter.com/website/user/${username}/stories/`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      await fetchGalleryImages();
      setIsModalOpen(false);
      setFormData({ name: '', image: null });
      setIsEditMode(false);
      setCurrentImage(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          window.location.href = '/';
        } else {
          setError('Failed to save image. Please try again.');
        }
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Failed to save image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!username || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      for (const id of selectedImages) {
        await axios.delete(
          `https://backend.gamanrehabcenter.com/website/user/${username}/stories/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      await fetchGalleryImages();
      setSelectedImages([]);
      setIsDeleteModalOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          window.location.href = '/';
        } else {
          setError('Failed to delete images. Please try again.');
        }
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Failed to delete images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (image: GalleryImage) => {
    setCurrentImage(image);
    setFormData({ name: image.name || '', image: null });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  if (!username || !token) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view gallery images</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-neon px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        <div className="flex space-x-4">
          {selectedImages.length > 0 && (
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors flex items-center"
              disabled={isLoading}
            >
              <Trash2 size={18} className="mr-2" />
              Delete Selected ({selectedImages.length})
            </button>
          )}
          <button 
            onClick={() => {
              setIsEditMode(false);
              setCurrentImage(null);
              setFormData({ name: '', image: null });
              setIsModalOpen(true);
            }}
            className="btn-neon flex items-center px-4 py-2 rounded-lg"
            disabled={isLoading}
          >
            <Plus size={18} className="mr-2" />
            Add Image
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map(image => (
          <div 
            key={image.id} 
            className={`gallery-item rounded-lg overflow-hidden relative ${
              selectedImages.includes(image.id) ? 'ring-2 ring-neon-green' : ''
            }`}
          >
            <img 
              src={image.image} 
              alt={image.name || 'Gallery image'} 
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="font-medium text-white">{image.name || 'Untitled'}</h3>
            </div>
            <button 
              onClick={() => {
                if (selectedImages.includes(image.id)) {
                  setSelectedImages(selectedImages.filter(id => id !== image.id));
                } else {
                  setSelectedImages([...selectedImages, image.id]);
                }
              }}
              className={`absolute top-3 right-3 p-2 rounded-full ${
                selectedImages.includes(image.id) 
                  ? 'bg-neon-green text-black' 
                  : 'bg-black/50 text-white hover:bg-black/70'
              } transition-colors`}
              disabled={isLoading}
            >
              {selectedImages.includes(image.id) ? (
                <Check size={18} />
              ) : (
                <Plus size={18} />
              )}
            </button>
            <div className="gallery-overlay">
              <button 
                onClick={() => openEditModal(image)}
                className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors mr-2"
                disabled={isLoading}
              >
                <Upload size={18} />
              </button>
              <button 
                onClick={() => {
                  setSelectedImages([image.id]);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                disabled={isLoading}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {isEditMode ? 'Edit Image' : 'Add New Image'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Image Name (Optional)
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter image name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                  Upload Image
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  required={!isEditMode}
                  className="w-full px-4 py-3 rounded-lg"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Preview:</p>
                    <div className="w-full h-40 rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-neon px-4 py-2 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Uploading...'}
                    </div>
                  ) : (
                    isEditMode ? 'Update' : 'Upload'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-400/20 text-red-400 mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-medium mb-2">Delete {selectedImages.length > 1 ? 'Images' : 'Image'}</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete {selectedImages.length > 1 ? `these ${selectedImages.length} images` : 'this image'}? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedImages([]);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;