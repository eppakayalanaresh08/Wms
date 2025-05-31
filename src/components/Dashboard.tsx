import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, TrendingUp, Clock, FileText, Image, MessageSquareQuote } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface Counts {
  blogs: number;
  gallery: number;
  testimonials: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [counts, setCounts] = useState<Counts>({ blogs: 0, gallery: 0, testimonials: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const username = localStorage.getItem('username');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    if (!username || !token) {
      toast.error('Authentication required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const endpoints = [
        { url: `https://backend.gamanrehabcenter.com/website/user/${username}/blogs/`, type: 'blogs' },
        { url: `https://backend.gamanrehabcenter.com/website/user/${username}/stories/`, type: 'gallery' },
        { url: `https://backend.gamanrehabcenter.com/website/user/${username}/testimonial/`, type: 'testimonials' }
      ];

      const results = await Promise.all(
        endpoints.map(async ({ url, type }) => {
          try {
            const response = await axios.get(url);
            return { type, count: response.data.length };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 404) {
                // 404 is an expected state indicating no data
                return { type, count: 0 };
              }
              console.error(`Error fetching ${type}:`, error.message);
            }
            return { type, count: 0 };
          }
        })
      );

      const newCounts = results.reduce((acc, { type, count }) => ({
        ...acc,
        [type]: count
      }), { blogs: 0, gallery: 0, testimonials: 0 } as Counts);

      setCounts(newCounts);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error in fetchCounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Content Management Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate('blogs')}
          className="stat-card p-6 rounded-lg transition-all hover:transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Blogs</p>
              <h4 className="text-2xl font-bold mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-800 animate-pulse rounded"></div>
                ) : counts.blogs}
              </h4>
            </div>
            <div className="p-3 rounded-full bg-gray-800">
              <FileText size={24} className="text-neon-green" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('gallery')}
          className="stat-card p-6 rounded-lg transition-all hover:transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Gallery Images</p>
              <h4 className="text-2xl font-bold mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-800 animate-pulse rounded"></div>
                ) : counts.gallery}
              </h4>
            </div>
            <div className="p-3 rounded-full bg-gray-800">
              <Image size={24} className="text-neon-green" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('testimonials')}
          className="stat-card p-6 rounded-lg transition-all hover:transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Testimonials</p>
              <h4 className="text-2xl font-bold mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-800 animate-pulse rounded"></div>
                ) : counts.testimonials}
              </h4>
            </div>
            <div className="p-3 rounded-full bg-gray-800">
              <MessageSquareQuote size={24} className="text-neon-green" />
            </div>
          </div>
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Patient Statistics</h3>
            <select className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          {/* Chart Placeholder */}
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={48} className="text-neon-green mx-auto mb-2" />
              <p className="text-gray-400">Patient Growth Chart</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Department Performance</h3>
            <select className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          {/* Chart Placeholder */}
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Activity size={48} className="text-neon-green mx-auto mb-2" />
              <p className="text-gray-400">Department Performance Chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem 
            icon={<Users size={16} className="text-blue-400" />}
            title="New patient registered"
            description="John Doe has registered as a new patient"
            time="2 hours ago"
          />
          <ActivityItem 
            icon={<Calendar size={16} className="text-purple-400" />}
            title="Appointment scheduled"
            description="Dr. Smith has a new appointment with Jane Doe"
            time="3 hours ago"
          />
          <ActivityItem 
            icon={<DollarSign size={16} className="text-green-400" />}
            title="Payment received"
            description="Payment of $350 received from patient #1234"
            time="5 hours ago"
          />
          <ActivityItem 
            icon={<Activity size={16} className="text-red-400" />}
            title="Emergency operation"
            description="Emergency operation performed by Dr. Johnson"
            time="Yesterday"
          />
        </div>
        <button className="mt-4 text-neon-green hover:underline text-sm font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, description, time }) => {
  return (
    <div className="flex items-start p-3 rounded-lg hover:bg-gray-800 transition-colors">
      <div className="p-2 rounded-full bg-gray-800 mr-4">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <div className="text-gray-500 text-xs flex items-center">
        <Clock size={12} className="mr-1" />
        {time}
      </div>
    </div>
  );
};

export default Dashboard;