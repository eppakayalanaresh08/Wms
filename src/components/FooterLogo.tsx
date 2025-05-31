import React, { useState, useEffect } from 'react';
import { Upload, X, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Logo {
  id: number;
  image: string;
}

const FooterLogo: React.FC = () => {
  const [logo, setLogo] = useState<Logo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const username = localStorage.getItem('username');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    if (!username || !token) return;

    try {
      const response = await axios.get(
        `https://backend.gamanrehabcenter.com/website/user/${username}/logo/?logo_type=footer`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setLogo(response.data[0]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        setError('Failed to fetch logo');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !token || !selectedFile) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      if (logo) {
        await axios.put(
          `https://backend.gamanrehabcenter.com/website/user/${username}/logo/?logo_type=footer`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await axios.post(
          `https://backend.gamanrehabcenter.com/website/user/${username}/logo/?logo_type=footer`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      await fetchLogo();
      setIsModalOpen(false);
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      setError('Failed to upload logo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!username || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(
        `https://backend.gamanrehabcenter.com/website/user/${username}/logo/?logo_type=footer`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setLogo(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      setError('Failed to delete logo');
    } finally {
      setIsLoading(false);
    }
  };

  if (!username || !token) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to manage the footer logo</p>
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
        <h2 className="text-2xl font-bold">Footer Logo Management</h2>
        {!logo && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-neon flex items-center px-4 py-2 rounded-lg"
            disabled={isLoading}
          >
            <Upload size={18} className="mr-2" />
            Upload Logo
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {/* Logo Display */}
      <div className="glass-card p-6 rounded-lg">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">Current Footer Logo</h3>
          <p className="text-gray-400 text-sm">This logo will be displayed in the footer of your website</p>
        </div>
        
        {logo ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md h-48 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center mb-6">
              <img 
                src={logo.image} 
                alt="Footer Logo" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-outline-neon flex items-center px-4 py-2 rounded-lg"
                disabled={isLoading}
              >
                <Edit size={18} className="mr-2" />
                Change Logo
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors flex items-center"
                disabled={isLoading}
              >
                <Trash2 size={18} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Upload size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 mb-6">No logo uploaded yet</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-neon px-4 py-2 rounded-lg"
              disabled={isLoading}
            >
              Upload Logo
            </button>
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {logo ? 'Change Logo' : 'Upload New Logo'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">
                  Upload Logo
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {preview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Preview:</p>
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-neon px-4 py-2 rounded-lg"
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      {logo ? 'Updating...' : 'Uploading...'}
                    </div>
                  ) : (
                    logo ? 'Update' : 'Upload'
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
              <h3 className="text-xl font-medium mb-2">Delete Logo</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this logo? This action cannot be undone.
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

export default FooterLogo;