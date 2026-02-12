import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        year: '',
        company: '',
        currentRole: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 body-font">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 heading-font">
                        Join AlumniConnect
                    </h2>
                    <p className="text-gray-600">Create your account and start networking</p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {s}
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600">
                                        {s === 1 ? 'Role' : s === 2 ? 'Details' : 'Verify'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 transition-all ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-8">
                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Select your role</h3>

                            <div
                                onClick={() => setFormData({ ...formData, role: 'student' })}
                                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'student' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                                            👨🎓
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Current Student</h4>
                                            <p className="text-sm text-gray-600">Currently enrolled in the college</p>
                                        </div>
                                    </div>
                                    {formData.role === 'student' && <CheckCircle className="text-blue-600" size={24} />}
                                </div>
                            </div>

                            <div
                                onClick={() => setFormData({ ...formData, role: 'alumni' })}
                                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'alumni' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                                            👔
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Alumni</h4>
                                            <p className="text-sm text-gray-600">Graduated from the college</p>
                                        </div>
                                    </div>
                                    {formData.role === 'alumni' && <CheckCircle className="text-blue-600" size={24} />}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="btn-primary w-full mt-6"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personal Information */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>

                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200 animate-slide-down">
                                    <p className="text-red-600 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">College Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="student@college.edu"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Create a strong password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Mechanical">Mechanical</option>
                                    </select>
                                </div>

                                {formData.role === 'student' ? (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className="input-field"
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="input-field"
                                                placeholder="Google"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
                                            <input
                                                type="text"
                                                name="currentRole"
                                                value={formData.currentRole}
                                                onChange={handleChange}
                                                className="input-field"
                                                placeholder="Senior Engineer"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="btn-secondary flex-1"
                                    >
                                        Back
                                    </button>
                                    <button type="submit" className="btn-primary flex-1">
                                        Continue
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Admin Approval */}
                    {step === 3 && (
                        <div className="space-y-6 text-center animate-scale-in">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="text-yellow-600" size={40} />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900">Registration Successful!</h3>
                            <p className="text-gray-600">
                                Your account has been created and is pending admin approval.<br />
                                You will be able to log in once an administrator verifies your account.
                            </p>

                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary w-full"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center mt-6">
                    <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm">
                        Already have an account? <span className="font-semibold text-blue-600">Sign in</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
