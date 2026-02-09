import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MessageSquare, Users, ChevronRight, Building, MapPin } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    // Sample data for demonstration
    const recentJobs = [
        { id: 1, company: 'Google', role: 'Senior Software Engineer', location: 'Bangalore', postedBy: 'Raj Kumar', posted: '2 days ago' },
        { id: 2, company: 'Microsoft', role: 'Product Manager', location: 'Hyderabad', postedBy: 'Anita Desai', posted: '4 days ago' },
        { id: 3, company: 'Amazon', role: 'Data Scientist', location: 'Mumbai', postedBy: 'Vikram Singh', posted: '1 week ago' },
    ];

    const featuredAlumni = [
        { id: 1, name: 'Raj Kumar', company: 'Google', role: 'Senior Engineer', avatar: '👨💻', online: true },
        { id: 2, name: 'Anita Desai', company: 'Microsoft', role: 'Product Manager', avatar: '👩💼', online: false },
    ];

    return (
        <div className="min-h-screen bg-gray-50 body-font">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Header */}
                <div className="mb-8 animate-fade-in">
                    <h2 className="section-header">
                        Welcome back, {user.name}! 👋
                    </h2>
                    <p className="section-subheader">Here's what's happening in your network</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="stats-card gradient-blue animate-slide-up stagger-1">
                        <div className="flex items-center justify-between mb-4">
                            <Briefcase size={28} />
                            <span className="text-blue-100 text-sm font-medium">This Week</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">12</div>
                        <div className="text-blue-100">New Job Postings</div>
                    </div>

                    <div className="stats-card gradient-purple animate-slide-up stagger-2">
                        <div className="flex items-center justify-between mb-4">
                            <MessageSquare size={28} />
                            <span className="text-purple-100 text-sm font-medium">Active</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">8</div>
                        <div className="text-purple-100">Conversations</div>
                    </div>

                    <div className="stats-card gradient-green animate-slide-up stagger-3">
                        <div className="flex items-center justify-between mb-4">
                            <Users size={28} />
                            <span className="text-green-100 text-sm font-medium">Connected</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">156</div>
                        <div className="text-green-100">Alumni Network</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Jobs */}
                        <div className="card card-hover p-6 animate-slide-up stagger-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 heading-font">
                                    Recent Opportunities
                                </h3>
                                <Link
                                    to="/jobs"
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                                >
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {recentJobs.map((job) => (
                                    <div key={job.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">{job.role}</h4>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Building size={14} />
                                                        {job.company}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {job.location}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {job.posted}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Posted by {job.postedBy}</span>
                                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                Apply →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alumni Spotlight */}
                        <div className="card card-hover p-6 animate-slide-up stagger-5">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 heading-font">
                                Alumni Spotlight
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {featuredAlumni.map((person) => (
                                    <div key={person.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                                                    {person.avatar}
                                                </div>
                                                {person.online && (
                                                    <div className="absolute -bottom-1 -right-1 status-online"></div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{person.name}</h4>
                                                <p className="text-sm text-gray-600">{person.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">{person.company}</span>
                                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                Connect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Notifications */}
                        <div className="card p-6 animate-slide-up stagger-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 heading-font">
                                Notifications
                            </h3>

                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500">
                                            <MessageSquare size={16} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 mb-1">New chat request from Priya Sharma</p>
                                            <span className="text-xs text-gray-500">5m ago</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500">
                                            <Briefcase size={16} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 mb-1">New job posted: Senior Developer at Google</p>
                                            <span className="text-xs text-gray-500">1h ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
