import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Image, Video, Star } from 'lucide-react';
import axios from 'axios';

interface Testimonial {
  id: number;
  person_name: string;
  issue: string;
  description: string;
  video_url: string | null;
  image: string | null;
  rating: number;
  date?: string;
}

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    person_name: '',
    issue: '',
    description: '',
    mediaType: 'photo',
    image: null as File | null,
    video_url: '',
    rating: 5
  });

  const username = localStorage.getItem('username');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const transformYouTubeUrl = (url: string): string => {
    try {
      // Handle already embedded URLs
      if (url.includes('embed')) return url;

      // Extract video ID from various YouTube URL formats
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  };

  const fetchTestimonials = async () => {
    if (!username || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://backend.gamanrehabcenter.com/website/user/${username}/testimonial/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTestimonials(response.data);
    } catch (error) {
      setError('Failed to fetch testimonials');
      console.error('Error fetching testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      person_name: '',
      issue: '',
      description: '',
      mediaType: 'photo',
      image: null,
      video_url: '',
      rating: 5
    });
    setCurrentTestimonial(null);
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setFormData({
      person_name: testimonial.person_name,
      issue: testimonial.issue,
      description: testimonial.description,
      mediaType: testimonial.video_url ? 'video' : 'photo',
      image: null,
      video_url: testimonial.video_url || '',
      rating: testimonial.rating
    });
    setCurrentTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setTestimonialToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'video_url') {
      setFormData({ ...formData, video_url: transformYouTubeUrl(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !token) return;

    setIsLoading(true);
    setError(null);

    const submitData = new FormData();
    submitData.append('person_name', formData.person_name);
    submitData.append('issue', formData.issue);
    submitData.append('description', formData.description);
    submitData.append('rating', formData.rating.toString());

    if (formData.mediaType === 'video') {
      submitData.append('video_url', formData.video_url);
      submitData.append('image', '');
    } else if (formData.image) {
      submitData.append('image', formData.image);
      submitData.append('video_url', '');
    }

    try {
      if (currentTestimonial) {
        await axios.put(
          `https://backend.gamanrehabcenter.com/website/user/${username}/testimonial/${currentTestimonial.id}/`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await axios.post(
          `https://backend.gamanrehabcenter.com/website/user/${username}/testimonial/`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      await fetchTestimonials();
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to save testimonial');
      console.error('Error saving testimonial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!username || !token || !testimonialToDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(
        `https://backend.gamanrehabcenter.com/website/user/${username}/testimonial/${testimonialToDelete}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchTestimonials();
      setIsDeleteModalOpen(false);
      setTestimonialToDelete(null);
    } catch (error) {
      setError('Failed to delete testimonial');
      console.error('Error deleting testimonial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!username || !token) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to manage testimonials</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-neon px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Testimonials Management</h2>
        <button 
          onClick={openAddModal}
          className="btn-neon flex items-center px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          <Plus size={18} className="mr-2" />
          Add Testimonial
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {isLoading && !isModalOpen && !isDeleteModalOpen && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className="glass-card p-6 rounded-lg testimonial-card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{testimonial.person_name}</h3>
                <p className="text-gray-400 text-sm">{testimonial.issue}</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      className={index < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}
                    />
                  ))}
                </div>
                {testimonial.date && (
                  <p className="text-neon-green text-xs mt-1 font-medium">
                    {new Date(testimonial.date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => openEditModal(testimonial)}
                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => openDeleteModal(testimonial.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300">{testimonial.description}</p>
            </div>
            
            <div className="mt-4">
              {testimonial.video_url ? (
                <div className="w-full rounded-lg overflow-hidden bg-gray-800 aspect-video">
                  <iframe 
                    src={testimonial.video_url} 
                    title={testimonial.person_name}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : testimonial.image && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.person_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="mt-2 flex items-center">
                {testimonial.video_url ? (
                  <>
                    <Video size={16} className="text-neon-green mr-2" />
                    <span className="text-sm text-gray-400">Video</span>
                  </>
                ) : (
                  <>
                    <Image size={16} className="text-neon-green mr-2" />
                    <span className="text-sm text-gray-400">Photo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#121212] py-2 z-10">
              <h3 className="text-xl font-bold">
                {currentTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
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
                <label htmlFor="person_name" className="block text-sm font-medium text-gray-300 mb-1">
                  Person Name
                </label>
                <input
                  id="person_name"
                  name="person_name"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter person name"
                  value={formData.person_name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-gray-300 mb-1">
                  Issue
                </label>
                <input
                  id="issue"
                  name="issue"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter the issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter testimonial description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                ></textarea>
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    id="rating"
                    name="rating"
                    min="1"
                    max="5"
                    step="0.5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                  <span className="text-neon-green">{formData.rating}</span>
                </div>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={20}
                      className={index < formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="mediaType" className="block text-sm font-medium text-gray-300 mb-1">
                  Media Type
                </label>
                <select
                  id="mediaType"
                  name="mediaType"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
                  value={formData.mediaType}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="photo" className="bg-gray-800 text-white">Photo</option>
                  <option value="video" className="bg-gray-800 text-white">Video</option>
                </select>
              </div>
              
              {formData.mediaType === 'photo' ? (
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                    Upload Photo
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 rounded-lg"
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
              ) : (
                <div>
                  <label htmlFor="video_url" className="block text-sm font-medium text-gray-300 mb-1">
                    Video URL
                  </label>
                  <input
                    id="video_url"
                    name="video_url"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg"
                    placeholder="Enter YouTube video URL"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {formData.video_url && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400 mb-1">Preview:</p>
                      <div className="w-full rounded-lg overflow-hidden bg-gray-800 aspect-video">
                        <iframe 
                          src={formData.video_url} 
                          title="Video preview"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-[#121212] py-4">
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
                      {currentTestimonial ? 'Updating...' : 'Saving...'}
                    </div>
                  ) : (
                    currentTestimonial ? 'Update' : 'Save'
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
              <h3 className="text-xl font-medium mb-2">Delete Testimonial</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this testimonial? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
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

export default Testimonials;