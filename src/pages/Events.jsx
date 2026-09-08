import { useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    MapPin,
    Building,
    Plus,
    Search,
    Users,
    CheckCircle2,
    X,
    ExternalLink,
    Sparkles,
    GraduationCap,
    Award,
    Trash2,
    AlertCircle,
    RotateCcw,
    Tag,
    Monitor,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Upload
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const COLLEGE_EVENT_TYPES = [
    'Seminar',
    'Guest Lecture',
    'Workshop',
    'Symposium',
    'Technical Event',
    'Alumni Interaction',
    'Club Event',
    'Other'
];

const ALUMNI_EVENT_TYPES = [
    'Hackathon',
    'Coding Competition',
    'Case Competition',
    'Innovation Challenge',
    'Hiring Challenge',
    'Industry Competition',
    'Workshop',
    'Other'
];

const Events = () => {
    const { user } = useContext(AuthContext);

    // State
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter Controls State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'college', 'alumni'
    const [selectedType, setSelectedType] = useState('All');
    const [selectedMode, setSelectedMode] = useState('All'); // 'All', 'Online', 'Offline', 'Hybrid'
    const [selectedStatus, setSelectedStatus] = useState('upcoming'); // 'upcoming', 'past', 'all', 'today', 'this_week'
    const [selectedDate, setSelectedDate] = useState(null); // Specific Date object or null

    // Calendar Popover State
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEventDetails, setSelectedEventDetails] = useState(null);

    // Form State for Event Creation
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: user.role === 'alumni' ? ALUMNI_EVENT_TYPES[0] : COLLEGE_EVENT_TYPES[0],
        companyName: user.company || '',
        eventDate: '',
        startTime: '',
        endTime: '',
        location: '',
        mode: 'Offline',
        eligibility: 'Open to All Students & Alumni',
        maxParticipants: '',
        registrationDeadline: '',
        registrationLink: '',
        image: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchEvents();
    }, [selectedCategory, selectedType, selectedMode, selectedStatus, selectedDate]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const params = new URLSearchParams();

            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (selectedType !== 'All') params.append('eventType', selectedType);
            if (selectedMode !== 'All') params.append('mode', selectedMode);
            
            if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                params.append('date', `${year}-${month}-${day}`);
            } else if (selectedStatus !== 'all') {
                params.append('status', selectedStatus);
            }

            const res = await api.get(`/api/events?${params.toString()}`, config);
            setEvents(res.data);
        } catch (error) {
            console.error("Error fetching events", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Generation Helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday=0
    };

    const handlePrevMonth = () => {
        setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1));
    };

    const handleSelectDay = (dayNumber) => {
        const picked = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), dayNumber);
        setSelectedDate(picked);
        setSelectedStatus('custom');
        setIsCalendarOpen(false);
    };

    const handleClearDate = () => {
        setSelectedDate(null);
        setSelectedStatus('upcoming');
        setIsCalendarOpen(false);
    };

    const handleSelectShortcut = (type) => {
        setSelectedDate(null);
        setSelectedStatus(type);
        setIsCalendarOpen(false);
    };

    // Reset all filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedType('All');
        setSelectedMode('All');
        setSelectedStatus('upcoming');
        setSelectedDate(null);
        setIsCalendarOpen(false);
    };

    // Client-side search filtering
    const filteredEvents = events.filter((ev) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            ev.title.toLowerCase().includes(q) ||
            ev.description.toLowerCase().includes(q) ||
            (ev.companyName && ev.companyName.toLowerCase().includes(q)) ||
            ev.location.toLowerCase().includes(q) ||
            ev.eventType.toLowerCase().includes(q)
        );
    });

    // Handle Form Submit
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.title || !formData.description || !formData.eventDate || !formData.registrationDeadline || !formData.location) {
            setFormError('Please fill in all required fields marked with *');
            return;
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.post('/api/events', formData, config);
            setEvents([res.data, ...events]);
            setIsCreateModalOpen(false);
            // Reset Form
            setFormData({
                title: '',
                description: '',
                eventType: user.role === 'alumni' ? ALUMNI_EVENT_TYPES[0] : COLLEGE_EVENT_TYPES[0],
                companyName: user.company || '',
                eventDate: '',
                startTime: '',
                endTime: '',
                location: '',
                mode: 'Offline',
                eligibility: 'Open to All Students & Alumni',
                maxParticipants: '',
                registrationDeadline: '',
                registrationLink: '',
                image: '',
            });
        } catch (error) {
            setFormError(error.response?.data?.message || 'Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Event Registration / Unregistration Toggle
    const handleRegisterToggle = async (eventId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.put(`/api/events/${eventId}/register`, {}, config);

            // Update in events list
            setEvents(events.map(ev => ev._id === eventId ? res.data : ev));

            // Update in modal if open
            if (selectedEventDetails && selectedEventDetails._id === eventId) {
                setSelectedEventDetails(res.data);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    // Handle Delete Event
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/events/${eventId}`, config);
            setEvents(events.filter(ev => ev._id !== eventId));
            if (selectedEventDetails?._id === eventId) {
                setSelectedEventDetails(null);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Delete failed');
        }
    };

    const getAvailableTypesForRole = () => {
        if (user.role === 'student') return COLLEGE_EVENT_TYPES;
        if (user.role === 'alumni') return ALUMNI_EVENT_TYPES;
        return [...COLLEGE_EVENT_TYPES, ...ALUMNI_EVENT_TYPES.filter(t => !COLLEGE_EVENT_TYPES.includes(t))];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 body-font">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* 1. Hero Section - Matching Home Page Architecture */}
                <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-blue-100 border border-white/20">
                            <Sparkles size={14} className="text-yellow-300" /> Academic & Industry Network
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold heading-font tracking-tight text-white">
                            Campus & Industry Events Hub
                        </h2>
                        <p className="text-blue-100 text-sm sm:text-base mt-2 leading-relaxed">
                            Connect through student-led academic seminars and alumni-hosted company hackathons & competitions.
                        </p>
                    </div>

                    <div className="relative z-10 flex-shrink-0">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2"
                        >
                            <Plus size={18} /> Post New Event
                        </button>
                    </div>
                </div>

                {/* 2. Event Category Tabs */}
                <div className="mb-6">
                    <div className="inline-flex flex-wrap p-1.5 bg-gray-200/70 rounded-2xl gap-1.5 border border-gray-200 max-w-full">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                selectedCategory === 'all'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200/80 font-bold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                            }`}
                        >
                            <Calendar size={16} /> All Events
                        </button>

                        <button
                            onClick={() => setSelectedCategory('college')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                selectedCategory === 'college'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200/80 font-bold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                            }`}
                        >
                            <GraduationCap size={16} /> 🎓 College Events
                        </button>

                        <button
                            onClick={() => setSelectedCategory('alumni')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                selectedCategory === 'alumni'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200/80 font-bold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                            }`}
                        >
                            <Award size={16} /> 💼 Alumni Events
                        </button>
                    </div>
                </div>

                {/* 3. Event Filter Bar — Pure CSS Specifications */}
                <div className="event-filters-bar">
                    <div className="event-filters-grid">
                        
                        {/* 1. Search Box (48% width — dominant primary control) */}
                        <div className="search-control-container">
                            <Search size={20} className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none z-10" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search events by title, company, or venue..."
                                className="search-control-input"
                            />
                        </div>

                        {/* 2. Type Dropdown */}
                        <div className="filter-control-wrapper">
                            <Tag size={20} className={`absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none z-10 ${selectedType !== 'All' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} strokeWidth={1.8} />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className={`filter-control-select ${selectedType !== 'All' ? 'active-filter' : ''}`}
                            >
                                <option value="All">Type: All</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Coding Competition">Coding Competition</option>
                                <option value="Seminar">Seminar</option>
                                <option value="Guest Lecture">Guest Lecture</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Symposium">Symposium</option>
                                <option value="Technical Event">Technical Event</option>
                                <option value="Hiring Challenge">Hiring Challenge</option>
                                <option value="Innovation Challenge">Innovation Challenge</option>
                            </select>
                            <ChevronDown size={18} className={`absolute right-[18px] top-1/2 -translate-y-1/2 pointer-events-none z-10 ${selectedType !== 'All' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                        </div>

                        {/* 3. Mode Dropdown */}
                        <div className="filter-control-wrapper">
                            <Monitor size={20} className={`absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none z-10 ${selectedMode !== 'All' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} strokeWidth={1.8} />
                            <select
                                value={selectedMode}
                                onChange={(e) => setSelectedMode(e.target.value)}
                                className={`filter-control-select ${selectedMode !== 'All' ? 'active-filter' : ''}`}
                            >
                                <option value="All">Mode: All</option>
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                            <ChevronDown size={18} className={`absolute right-[18px] top-1/2 -translate-y-1/2 pointer-events-none z-10 ${selectedMode !== 'All' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                        </div>

                        {/* 4. Interactive Calendar Date Picker Popover */}
                        <div className="filter-control-wrapper relative">
                            <button
                                type="button"
                                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                className={`h-[56px] w-full pl-[48px] pr-[18px] bg-[#F8FAFC] border rounded-[14px] text-[16px] text-left transition-all box-border flex items-center justify-between cursor-pointer hover:bg-slate-100/70 ${
                                    selectedDate || selectedStatus !== 'upcoming' 
                                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-semibold' 
                                        : 'border-[#E2E8F0] text-[#0F172A] font-normal'
                                }`}
                            >
                                <Calendar size={20} className={`absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none ${selectedDate || selectedStatus !== 'upcoming' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} strokeWidth={1.8} />
                                <span className="truncate">
                                    {selectedDate
                                        ? selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : selectedStatus === 'today'
                                            ? 'Today'
                                            : selectedStatus === 'this_week'
                                                ? 'This Week'
                                                : selectedStatus === 'past'
                                                    ? 'Past Events'
                                                    : selectedStatus === 'all'
                                                        ? 'All Dates'
                                                        : 'Select date'}
                                </span>
                            </button>

                            {/* Calendar Popover Modal */}
                            {isCalendarOpen && (
                                <div className="absolute top-[64px] right-0 z-50 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xl w-80 animate-fade-in">
                                    
                                    {/* Month Navigation Header */}
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <button
                                            type="button"
                                            onClick={handlePrevMonth}
                                            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="font-bold text-sm text-[#0F172A]">
                                            {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleNextMonth}
                                            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    {/* Weekdays Row */}
                                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#64748B] mb-2">
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                        <span>Fri</span>
                                        <span>Sat</span>
                                        <span>Sun</span>
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                        {/* Blank padding cells */}
                                        {Array.from({ length: getFirstDayOfMonth(calendarViewDate.getFullYear(), calendarViewDate.getMonth()) }).map((_, idx) => (
                                            <div key={`blank-${idx}`} className="h-8"></div>
                                        ))}

                                        {/* Day Cells */}
                                        {Array.from({ length: getDaysInMonth(calendarViewDate.getFullYear(), calendarViewDate.getMonth()) }).map((_, idx) => {
                                            const dayNum = idx + 1;
                                            const cellDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), dayNum);
                                            
                                            const today = new Date();
                                            const isToday = cellDate.toDateString() === today.toDateString();
                                            const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();

                                            return (
                                                <button
                                                    key={dayNum}
                                                    type="button"
                                                    onClick={() => handleSelectDay(dayNum)}
                                                    className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center font-medium transition-all text-xs ${
                                                        isSelected
                                                            ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                                                            : isToday
                                                                ? 'border border-[#2563EB] text-[#2563EB] font-bold bg-blue-50/50'
                                                                : 'text-[#0F172A] hover:bg-blue-50 hover:text-[#2563EB]'
                                                    }`}
                                                >
                                                    {dayNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Shortcuts & Clear Footer */}
                                    <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectShortcut('today')}
                                                className="px-2 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-md text-[11px] font-medium transition-colors"
                                            >
                                                Today
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectShortcut('this_week')}
                                                className="px-2 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-md text-[11px] font-medium transition-colors"
                                            >
                                                This Week
                                            </button>
                                        </div>

                                        {(selectedDate || selectedStatus !== 'upcoming') && (
                                            <button
                                                type="button"
                                                onClick={handleClearDate}
                                                className="text-[11px] text-red-600 font-semibold hover:underline"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* 4. Events Cards Grid & Clean Empty State */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((ev) => {
                            const isRegistered = ev.registeredUsers?.some(id => (id._id || id).toString() === user._id.toString());
                            const isCreator = (ev.user?._id || ev.user).toString() === user._id.toString();
                            const isPast = new Date(ev.eventDate) < new Date();

                            return (
                                <div key={ev._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-6 flex flex-col justify-between">
                                    
                                    {/* Card Header & Badge */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                ev.creatorRole === 'alumni' 
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
                                                {ev.eventType}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                                {formatDate(ev.eventDate)}
                                            </span>
                                        </div>

                                        {/* Title & Company */}
                                        <div>
                                            <h3 
                                                onClick={() => setSelectedEventDetails(ev)}
                                                className="text-lg font-bold text-gray-900 heading-font hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                                            >
                                                {ev.title}
                                            </h3>
                                            {ev.companyName ? (
                                                <p className="text-xs font-semibold text-blue-600 mt-1 flex items-center gap-1">
                                                    <Building size={14} className="text-blue-500" /> {ev.companyName}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Organized by {ev.user?.name || 'Campus Member'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Details Hierarchy */}
                                        <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Calendar size={14} className="text-blue-600 flex-shrink-0" />
                                                <span>{formatDate(ev.eventDate)} {ev.startTime ? `• ${ev.startTime}` : ''}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{ev.mode} • {ev.location}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Users size={14} className="text-gray-400 flex-shrink-0" />
                                                <span>{ev.eligibility || 'Open to Students & Alumni'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                        <button
                                            onClick={() => setSelectedEventDetails(ev)}
                                            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                        >
                                            View Event
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {(isCreator || user.role === 'admin') && (
                                                <button
                                                    onClick={() => handleDeleteEvent(ev._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleRegisterToggle(ev._id)}
                                                disabled={isPast && !isRegistered}
                                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                                                    isRegistered 
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300' 
                                                        : isPast 
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                                }`}
                                            >
                                                {isRegistered ? (
                                                    <>
                                                        <CheckCircle2 size={14} /> Registered
                                                    </>
                                                ) : isPast ? (
                                                    'Ended'
                                                ) : (
                                                    'Register'
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Redesigned Compact Empty State */
                    <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm max-w-lg mx-auto space-y-4 my-8">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 heading-font">No upcoming events</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                There are no events matching your current filter selection. Try adjusting or clearing your filters.
                            </p>
                        </div>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                        >
                            <RotateCcw size={14} /> Clear Filters
                        </button>
                    </div>
                )}

            </div>

            {/* -------------------- CREATE EVENT MODAL -------------------- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto my-8">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                                {user.role === 'alumni' ? '💼 Alumni Opportunity' : user.role === 'student' ? '🎓 College Event' : 'Admin Event'}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 heading-font mt-2">
                                Post New Event
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {user.role === 'alumni'
                                    ? 'Host hackathons, competitions, or hiring challenges for college students.'
                                    : 'Organize seminars, workshops, or symposiums for students & alumni.'}
                            </p>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                                <AlertCircle size={16} /> {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Company Hackathon 2026 or Guest Lecture on Cloud AI"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                            </div>

                            {/* Category & Mode */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Event Category *</label>
                                    <select
                                        value={formData.eventType}
                                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    >
                                        {getAvailableTypesForRole().map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mode *</label>
                                    <select
                                        value={formData.mode}
                                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    >
                                        <option value="Offline">Offline / In-Person</option>
                                        <option value="Online">Online Virtual</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Company & Eligibility */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Organizer / Company</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="e.g. Microsoft / CS Department"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Eligibility Criteria</label>
                                    <input
                                        type="text"
                                        value={formData.eligibility}
                                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                                        placeholder="e.g. Open to All Students"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Dates & Times */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Event Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.eventDate}
                                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="text"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        placeholder="e.g. 10:00 AM"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Deadline *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.registrationDeadline}
                                        onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Location & External URL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Venue / Link *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Auditorium or Zoom Link"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">External Registration URL</label>
                                    <input
                                        type="url"
                                        value={formData.registrationLink}
                                        onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                                        placeholder="https://example.com"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Event schedule, guidelines, prizes..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                                >
                                    {isSubmitting ? 'Publishing...' : 'Publish Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------------------- EVENT DETAILS VIEW MODAL -------------------- */}
            {selectedEventDetails && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl relative overflow-hidden my-8 border border-gray-200">
                        
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative">
                            <button
                                onClick={() => setSelectedEventDetails(null)}
                                className="absolute right-4 top-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider text-white border border-white/20">
                                {selectedEventDetails.eventType}
                            </span>
                            <h2 className="text-2xl font-bold heading-font mt-3 leading-tight">{selectedEventDetails.title}</h2>
                            {selectedEventDetails.companyName && (
                                <p className="text-xs text-blue-100 font-semibold mt-1 flex items-center gap-1">
                                    <Building size={14} /> {selectedEventDetails.companyName}
                                </p>
                            )}
                        </div>

                        {/* Details Body */}
                        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                            
                            {/* Key Specs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                                <div>
                                    <span className="text-gray-500 block">Date</span>
                                    <span className="font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                                        <Calendar size={13} className="text-blue-600" />
                                        {formatDate(selectedEventDetails.eventDate)}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-500 block">Time</span>
                                    <span className="font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                                        <Clock size={13} className="text-blue-600" />
                                        {selectedEventDetails.startTime || 'TBA'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-500 block">Location</span>
                                    <span className="font-bold text-gray-900 mt-0.5 flex items-center gap-1 truncate">
                                        <MapPin size={13} className="text-blue-600" />
                                        {selectedEventDetails.mode}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Description</h4>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                    {selectedEventDetails.description}
                                </p>
                            </div>

                            {/* Eligibility */}
                            <div className="text-xs p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                                <span className="text-gray-600">Eligibility</span>
                                <span className="font-bold text-blue-700">{selectedEventDetails.eligibility || 'Open to All'}</span>
                            </div>

                            {/* Attendees */}
                            {selectedEventDetails.registeredUsers && selectedEventDetails.registeredUsers.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                                        Registered Participants ({selectedEventDetails.registeredUsers.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                        {selectedEventDetails.registeredUsers.map((u) => (
                                            <span key={u._id} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                                                {u.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
                            {selectedEventDetails.registrationLink ? (
                                <a
                                    href={selectedEventDetails.registrationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    External Link <ExternalLink size={14} />
                                </a>
                            ) : <div></div>}

                            {(() => {
                                const isReg = selectedEventDetails.registeredUsers?.some(id => (id._id || id).toString() === user._id.toString());
                                return (
                                    <button
                                        onClick={() => handleRegisterToggle(selectedEventDetails._id)}
                                        className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isReg
                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                        }`}
                                    >
                                        {isReg ? '✓ Registered' : 'Register / Join Event'}
                                    </button>
                                );
                            })()}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Events;
