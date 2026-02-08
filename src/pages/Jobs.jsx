import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Jobs = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', company: '', role: '', skills: '', location: '', applyLink: '', deadline: ''
    });

    const fetchJobs = async () => {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/jobs', config);
        setJobs(data);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
        };
        const skillsArray = formData.skills.split(',').map(s => s.trim());
        await axios.post('http://localhost:5000/api/jobs', { ...formData, skills: skillsArray }, config);
        setShowModal(false);
        fetchJobs();
        setFormData({ title: '', company: '', role: '', skills: '', location: '', applyLink: '', deadline: '' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Job Board</h1>
                {(user.role === 'alumni' || user.role === 'admin') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Post Job
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <div key={job._id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                        <div className="mt-2">
                            <span className="text-sm font-semibold text-gray-500">Location:</span> {job.location}
                        </div>
                        <div className="mt-1">
                            <span className="text-sm font-semibold text-gray-500">Expires:</span> {new Date(job.deadline).toLocaleDateString()}
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                            {job.role}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>
                        <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-4 text-center bg-gray-100 hover:bg-gray-200 text-blue-700 py-2 rounded"
                        >
                            Apply Now
                        </a>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">Post a Job</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Title" required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <input type="text" placeholder="Company" required className="w-full border p-2 rounded" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                            <input type="text" placeholder="Location" required className="w-full border p-2 rounded" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            <textarea placeholder="Role Description" required className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                            <input type="text" placeholder="Skills (comma separated)" required className="w-full border p-2 rounded" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Application Deadline</label>
                                <input type="date" required className="w-full border p-2 rounded" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                            </div>

                            <input type="text" placeholder="Apply Link" required className="w-full border p-2 rounded" value={formData.applyLink} onChange={e => setFormData({ ...formData, applyLink: e.target.value })} />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
