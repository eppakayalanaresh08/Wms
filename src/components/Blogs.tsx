import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Blog {
  id: number;
  title: string;
  description: string;
  image: string;
  content: string;
  category: string;
  tags?: string;
  meta_title?: string;
  meta_description?: string;
  date: string;
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    content: '',
    category: '',
    tags: '',
    meta_title: '',
    meta_description: ''
  });

  const username = localStorage.getItem('username');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    if (!username || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://backend.gamanrehabcenter.com/website/user/${username}/blog/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setBlogs(response.data);
    } catch (error) {
      setError('Failed to fetch blogs');
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      image: null,
      content: '',
      category: '',
      tags: '',
      meta_title: '',
      meta_description: ''
    });
    setImagePreview(null);
    setCurrentBlog(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setFormData({
      title: blog.title,
      description: blog.description,
      image: null,
      content: blog.content,
      category: blog.category,
      tags: blog.tags || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || ''
    });
    setImagePreview(blog.image);
    setCurrentBlog(blog);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setBlogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !token) return;

    setIsLoading(true);
    setError(null);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('content', formData.content);
    submitData.append('category', formData.category);

    if (formData.image) {
      submitData.append('image', formData.image);
    }

    if (formData.tags) submitData.append('tags', formData.tags);
    if (formData.meta_title) submitData.append('meta_title', formData.meta_title);
    if (formData.meta_description) submitData.append('meta_description', formData.meta_description);

    try {
      if (currentBlog) {
        await axios.put(
          `https://backend.gamanrehabcenter.com/website/user/${username}/blog/${currentBlog.id}/`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Blog updated successfully');
      } else {
        await axios.post(
          `https://backend.gamanrehabcenter.com/website/user/${username}/blog/`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Blog created successfully');
      }
      
      await fetchBlogs();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(currentBlog ? 'Failed to update blog' : 'Failed to create blog');
      console.error('Error saving blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!username || !token || !blogToDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(
        `https://backend.gamanrehabcenter.com/website/user/${username}/blog/${blogToDelete}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Blog deleted successfully');
      await fetchBlogs();
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    } catch (error) {
      toast.error('Failed to delete blog');
      console.error('Error deleting blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!username || !token) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to manage blogs</p>
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
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <button 
          onClick={openAddModal}
          className="btn-neon flex items-center px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          <Plus size={18} className="mr-2" />
          Add Blog
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {/* Blog List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left">Image</th>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {blogs.map(blog => (
                <tr key={blog.id}>
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{blog.title}</td>
                  <td className="px-6 py-4 text-gray-400 truncate max-w-xs">
                    {blog.description}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{blog.category}</td>
                  <td className="px-6 py-4 text-gray-400">{blog.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => openEditModal(blog)}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(blog.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#121212] py-2 z-10">
              <h3 className="text-xl font-bold">
                {currentBlog ? 'Edit Blog' : 'Add New Blog'}
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
              {/* Required Fields */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter blog description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                ></textarea>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                  Image {!currentBlog && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  required={!currentBlog}
                  className="w-full px-4 py-3 rounded-lg"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Preview:</p>
                    <div className="w-full h-40 rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={6}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter blog content"
                  value={formData.content}
                  onChange={handleInputChange}
                  disabled={isLoading}
                ></textarea>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter blog category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              {/* Optional Fields */}
              <div className="border-t border-gray-800 pt-6">
                <h4 className="text-lg font-medium mb-4">Optional Fields</h4>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
                      Tags
                    </label>
                    <input
                      id="tags"
                      name="tags"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg"
                      placeholder="Enter tags (e.g., #journalism, #writer)"
                      value={formData.tags}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="meta_title" className="block text-sm font-medium text-gray-300 mb-1">
                      Meta Title
                    </label>
                    <input
                      id="meta_title"
                      name="meta_title"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg"
                      placeholder="Enter meta title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="meta_description" className="block text-sm font-medium text-gray-300 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      id="meta_description"
                      name="meta_description"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg"
                      placeholder="Enter meta description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    ></textarea>
                  </div>
                </div>
              </div>
              
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
                      {currentBlog ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    currentBlog ? 'Update Blog' : 'Create Blog'
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
              <h3 className="text-xl font-medium mb-2">Delete Blog</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this blog? This action cannot be undone.
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

export default Blogs;