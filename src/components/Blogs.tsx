import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: 1,
      title: 'Understanding Preventive Healthcare',
      description: 'Preventive healthcare is the most effective way to stay healthy and avoid serious medical conditions...',
      image: 'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      date: '2025-03-15'
    },
    {
      id: 2,
      title: 'The Importance of Mental Health',
      description: 'Mental health is just as important as physical health. Learn about the signs of mental health issues and how to address them...',
      image: 'https://images.pexels.com/photos/3760607/pexels-photo-3760607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      date: '2025-03-10'
    },
    {
      id: 3,
      title: 'Nutrition Tips for a Healthy Lifestyle',
      description: 'Proper nutrition is the foundation of good health. Discover the best foods to eat for optimal health and wellness...',
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      date: '2025-03-05'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });

  const openAddModal = () => {
    setFormData({ title: '', description: '', image: '' });
    setCurrentBlog(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setFormData({
      title: blog.title,
      description: blog.description,
      image: blog.image
    });
    setCurrentBlog(blog);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setBlogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentBlog) {
      // Edit existing blog
      setBlogs(blogs.map(blog => 
        blog.id === currentBlog.id 
          ? { ...blog, ...formData } 
          : blog
      ));
    } else {
      // Add new blog
      const newBlog: Blog = {
        id: blogs.length ? Math.max(...blogs.map(b => b.id)) + 1 : 1,
        title: formData.title,
        description: formData.description,
        image: formData.image,
        date: new Date().toISOString().split('T')[0]
      };
      setBlogs([...blogs, newBlog]);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (blogToDelete !== null) {
      setBlogs(blogs.filter(blog => blog.id !== blogToDelete));
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <button 
          onClick={openAddModal}
          className="btn-neon flex items-center px-4 py-2 rounded-lg"
        >
          <Plus size={18} className="mr-2" />
          Add Blog
        </button>
      </div>

      {/* Blog List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left">Image</th>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Description</th>
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
          <div className="modal-content glass-card w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {currentBlog ? 'Edit Blog' : 'Add New Blog'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Title
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
                  placeholder="Enter blog description"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  id="image"
                  name="image"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Enter image URL"
                  value={formData.image}
                  onChange={handleInputChange}
                />
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Preview:</p>
                    <div className="w-full h-40 rounded-lg overflow-hidden">
                      <img 
                        src={formData.image} 
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-neon px-4 py-2 rounded-lg"
                >
                  {currentBlog ? 'Update' : 'Save'}
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
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
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