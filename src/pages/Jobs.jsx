import { useState, useEffect, useContext } from 'react';
import { Plus, Building, MapPin, Briefcase, User, ChevronRight } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Jobs = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        role: '',
        skills: '',
        deadline: '',
        applyLink: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('http://localhost:5000/api/jobs', config);
        setJobs(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const payload = { ...formData, skills: formData.skills.split(',').map(s => s.trim()) };
        await axios.post('http://localhost:5000/api/jobs', payload, config);
        setShowModal(false);
        fetchJobs();
    };

    return (
        <div className="min-h-screen bg-gray-50 body-font">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h2 className="section-header">Job Opportunities</h2>
                        <p className="section-subheader">Exclusive opportunities from our alumni network</p>
                    </div>

                    {(user.role === 'alumni' || user.role === 'admin') && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Post a Job
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="card p-6 mb-6 animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                            <select className="input-field">
                                <option>All Companies</option>
                                <option>Google</option>
                                <option>Microsoft</option>
                                <option>Amazon</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <select className="input-field">
                                <option>All Locations</option>
                                <option>Bangalore</option>
                                <option>Hyderabad</option>
                                <option>Mumbai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                            <select className="input-field">
                                <option>All Roles</option>
                                <option>Software Engineer</option>
                                <option>Product Manager</option>
                                <option>Data Scientist</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                            <select className="input-field">
                                <option>All Types</option>
                                <option>Full-time</option>
                                <option>Internship</option>
                                <option>Contract</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="grid grid-cols-1 gap-4">
                    {jobs.map((job, index) => (
                        <div key={job._id} className={`card card-hover p-6 animate-slide-up stagger-${Math.min(index + 1, 3)}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Building className="text-blue-600" size={28} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                                                    <p className="text-gray-600 font-medium">{job.company}</p>
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    {new Date(job.deadline).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Briefcase size={14} />
                                                    Full-time
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User size={14} />
                                                    Posted by Alumni
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.role}</p>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {job.skills.slice(0, 4).map((skill, idx) => (
                                                    <span key={idx} className="badge badge-blue">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills.length > 4 && (
                                                    <span className="badge bg-gray-100 text-gray-600">
                                                        +{job.skills.length - 4} more
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={job.applyLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-primary inline-flex items-center gap-2"
                                                >
                                                    Apply Now
                                                    <ChevronRight size={16} />
                                                </a>
                                                <button className="btn-secondary">
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {jobs.length === 0 && (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">💼</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 heading-font">No Jobs Yet</h3>
                        <p className="text-gray-600">Check back soon for new opportunities!</p>
                    </div>
                )}

                {/* Post Job Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="card p-8 w-full max-w-2xl animate-scale-in">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 heading-font">Post a Job</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Job Title"
                                        required
                                        className="input-field"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Company"
                                        required
                                        className="input-field"
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    required
                                    className="input-field"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                                <textarea
                                    placeholder="Role Description"
                                    required
                                    rows="3"
                                    className="input-field"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Skills (comma separated)"
                                    required
                                    className="input-field"
                                    value={formData.skills}
                                    onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                />
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2 font-semibold">Application Deadline</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="url"
                                    placeholder="Application Link"
                                    required
                                    className="input-field"
                                    value={formData.applyLink}
                                    onChange={e => setFormData({ ...formData, applyLink: e.target.value })}
                                />
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Post Job
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
