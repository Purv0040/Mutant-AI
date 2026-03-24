import { useState, useEffect } from 'react';
import { getDocuments, getUploadRequests, updateUploadRequestStatus, getUserStats, listUsers } from '../api';

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [departments, setDepartments] = useState([
    { name: 'Engineering', members: 0, color: 'bg-blue-50', icon: '💻' },
    { name: 'Product', members: 0, color: 'bg-purple-50', icon: '🎯' },
    { name: 'Marketing', members: 0, color: 'bg-pink-50', icon: '📢' },
    { name: 'Design', members: 0, color: 'bg-green-50', icon: '🎨' },
  ]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [inviteLinkExpiration, setInviteLinkExpiration] = useState('7days');
  const [generatedLinks, setGeneratedLinks] = useState([
    { id: 1, link: 'https://mutant-ai.com/invite/abc123xyz', created: 'Mar 20, 2026', expires: 'Mar 27, 2026', uses: '3/10', status: 'Active' },
    { id: 2, link: 'https://mutant-ai.com/invite/def456uvw', created: 'Mar 15, 2026', expires: 'Mar 22, 2026', uses: '8/10', status: 'Expired' },
  ]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermissionRole, setSelectedPermissionRole] = useState(null);
  const [showLinksPanel, setShowLinksPanel] = useState(false);
  const [uploadRequests, setUploadRequests] = useState([]);
  const [detailedDepartment, setDetailedDepartment] = useState(null);
  const [departmentDocs, setDepartmentDocs] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const [users, stats, requests] = await Promise.all([
        listUsers(),
        getUserStats(),
        getUploadRequests()
      ]);

      const formattedUsers = (users || []).map(u => ({
        ...u,
        name: u.name || 'Anonymous',
        status: 'Active', // Defaulting to Active for now
        lastLogin: 'Today',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
        joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
        activityScore: Math.floor(Math.random() * 40) + 60, // Random score for UI polish
      }));

      setTeamMembers(formattedUsers);
      setUploadRequests(Array.isArray(requests) ? requests : []);

      setDepartments(prevDpts => prevDpts.map(d => ({
        ...d,
        members: stats[d.name] || 0
      })));

    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadUploadRequests = async () => {
    try {
      const requests = await getUploadRequests();
      setUploadRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      console.error('Failed to load upload requests:', err);
    }
  };

  useEffect(() => {
    loadUploadRequests();
  }, [activeTab]);

  // Poll every 5 seconds so admin sees new requests without refreshing
  useEffect(() => {
    const interval = setInterval(loadUploadRequests, 5000);
    return () => clearInterval(interval);
  }, []);
  const [permissions, setPermissions] = useState({
    Admin: {
      viewAll: true,
      editAll: true,
      delete: true,
      manageUsers: true,
      uploadDocuments: true,
      shareDocuments: true,
      exportData: true,
      managePermissions: true,
      viewAnalytics: true,
      createTeams: true,
    },
    Editor: {
      viewAll: true,
      editAll: true,
      delete: false,
      manageUsers: false,
      uploadDocuments: true,
      shareDocuments: true,
      exportData: true,
      managePermissions: false,
      viewAnalytics: true,
      createTeams: false,
    },
    Viewer: {
      viewAll: true,
      editAll: false,
      delete: false,
      manageUsers: false,
      uploadDocuments: false,
      shareDocuments: false,
      exportData: false,
      managePermissions: false,
      viewAnalytics: false,
      createTeams: false,
    },
  });

  const pendingRequestsCount = uploadRequests.filter(r => r.status === 'Pending').length;

  // Filter members based on search and selected filters
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Toggle member selection for bulk actions
  const toggleMemberSelection = (memberId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Select/Deselect all visible members
  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(filteredMembers.map(m => m.id));
      setSelectedMembers(allIds);
      setShowBulkActions(true);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const generateInviteLink = () => {
    const randomId = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
    const newLink = `https://mutant-ai.com/invite/${randomId}`;
    setInviteLink(newLink);
    
    const expirationDate = new Date();
    if (inviteLinkExpiration === '7days') expirationDate.setDate(expirationDate.getDate() + 7);
    else if (inviteLinkExpiration === '30days') expirationDate.setDate(expirationDate.getDate() + 30);
    else if (inviteLinkExpiration === '90days') expirationDate.setDate(expirationDate.getDate() + 90);

    const newGeneratedLink = {
      id: generatedLinks.length + 1,
      link: newLink,
      created: new Date().toLocaleDateString(),
      expires: expirationDate.toLocaleDateString(),
      uses: '0/10',
      status: 'Active'
    };

    setGeneratedLinks([newGeneratedLink, ...generatedLinks]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  const revokeLink = (linkId) => {
    setGeneratedLinks(generatedLinks.map(link => 
      link.id === linkId ? { ...link, status: 'Revoked' } : link
    ));
  };

  const handleApproveRequest = async (id) => {
    try {
      const updated = await updateUploadRequestStatus(id, 'Approved');
      setUploadRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await updateUploadRequestStatus(id, 'Rejected');
      setUploadRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Rejected' } : req));
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  const handleDepartmentClick = async (deptName) => {
    setDetailedDepartment(deptName);
    try {
      const docs = await getDocuments();
      setDepartmentDocs(Array.isArray(docs) ? docs.filter(d => 
        String(d.category || '').toLowerCase() === deptName.toLowerCase() || 
        String(d.accessMode || '').toLowerCase() === deptName.toLowerCase()
      ) : []);
    } catch (err) {
      console.error(err);
      setDepartmentDocs([]);
    }
  };

  // Calculate team statistics
  const activeCount = teamMembers.filter(m => m.status === 'Active').length;
  const inactiveCount = teamMembers.filter(m => m.status === 'Inactive').length;
  const avgActivityScore = Math.round(teamMembers.reduce((sum, m) => sum + m.activityScore, 0) / teamMembers.length);
  const teamHealth = teamMembers.filter(m => m.status === 'Active' && m.activityScore > 70).length;
  
  // Dynamic statistics calculations
  const totalMembers = teamMembers.length;
  const memberGrowth = Math.round((5 / totalMembers) * 100);
  const activePercentage = Math.round((activeCount / totalMembers) * 100);
  const utilizationRate = Math.round((activeCount / totalMembers) * 100);
  const teamHealthPercentage = Math.round((teamHealth / totalMembers) * 100);

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-surface">
      {/* TopNavBar with Tabs */}
      <header className="flex flex-col sticky top-0 z-30 bg-white border-b border-slate-200">
        {/* Main Header Row */}
        <div className="flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-8">
            <h2 className="text-2xl font-black text-indigo-600 font-headline">Team Management</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <span 
                onClick={() => setShowNotifications(!showNotifications)}
                className="material-symbols-outlined text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer text-[26px]"
              >
                notifications
              </span>
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white shadow-sm ring-2 ring-white zoom-in">
                  {pendingRequestsCount}
                </span>
              )}

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 font-headline">Notifications</h4>
                    {pendingRequestsCount > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequestsCount} new</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {pendingRequestsCount > 0 ? (
                      <div 
                        onClick={() => {
                          setActiveTab('requests');
                          setShowNotifications(false);
                        }}
                        className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors flex gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-50 shrink-0 flex items-center justify-center text-orange-500">
                          <span className="material-symbols-outlined text-lg">publish</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">New Upload Requests</p>
                          <p className="text-xs text-slate-500 mt-0.5">You have {pendingRequestsCount} pending document upoad {pendingRequestsCount === 1 ? 'request' : 'requests'} waiting for your approval.</p>
                          <p className="text-xs text-indigo-600 font-bold mt-2">Review now</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">notifications_paused</span>
                        <p className="text-sm font-medium text-slate-500">You're all caught up!</p>
                        <p className="text-xs text-slate-400 mt-1">No pending requests or alerts.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-8 border-t border-slate-100">
          <nav className="flex items-center gap-1">
          {[
              { id: 'overview', label: 'Overview' },
              { id: 'roles', label: 'Roles' },
              { id: 'permissions', label: 'Permissions' },
              { id: 'requests', label: 'Upload Requests', badge: uploadRequests.filter(r => r.status === 'Pending').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setDetailedDepartment(null); }}
                className={`px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-slate-600 border-transparent hover:text-indigo-500'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="px-8 pb-12 overflow-y-auto flex-1">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && !detailedDepartment && (
          <>
            {/* Enhanced Statistics Row */}
            <div className="grid grid-cols-12 gap-6 mb-8 mt-8">
              {/* Total Members */}
              <div className="col-span-12 md:col-span-3 p-6 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold font-label">Total Members</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold font-headline text-on-surface">{totalMembers}</span>
                  <span className="text-primary font-bold text-xs mb-1">+{memberGrowth}% </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">+5 this month</p>
              </div>

              {/* Active Users */}
              <div className="col-span-12 md:col-span-3 p-6 bg-emerald-50 rounded-lg shadow-sm border border-emerald-200/30 hover:shadow-md transition-shadow">
                <p className="text-xs uppercase tracking-widest text-emerald-600 mb-2 font-bold font-label">Active Today</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold font-headline text-emerald-700">{activeCount}</span>
                  <span className="text-emerald-600 font-bold text-xs mb-1">{activePercentage}%</span>
                </div>
                <p className="text-xs text-emerald-600/70 mt-2">Currently active</p>
              </div>

              {/* Team Utilization */}
              <div className="col-span-12 md:col-span-3 p-6 bg-blue-50 rounded-lg shadow-sm border border-blue-200/30 hover:shadow-md transition-shadow">
                <p className="text-xs uppercase tracking-widest text-blue-600 mb-2 font-bold font-label">Utilization Rate</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold font-headline text-blue-700">{utilizationRate}%</span>
                  <span className="text-blue-600 font-bold text-xs mb-1">{activeCount}/{totalMembers}</span>
                </div>
                <p className="text-xs text-blue-600/70 mt-2">Team engagement</p>
              </div>

              {/* Team Health */}
              <div className="col-span-12 md:col-span-3 p-6 bg-purple-50 rounded-lg shadow-sm border border-purple-200/30 hover:shadow-md transition-shadow">
                <p className="text-xs uppercase tracking-widest text-purple-600 mb-2 font-bold font-label">Team Health</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold font-headline text-purple-700">{teamHealthPercentage}%</span>
                  <span className="text-purple-600 font-bold text-xs mb-1">{teamHealth}/{totalMembers}</span>
                </div>
                <p className="text-xs text-purple-600/70 mt-2">Healthy engagement</p>
              </div>
            </div>

            {/* Invite More Experts Banner */}
            <div className="col-span-12 p-8 bg-primary rounded-lg shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden mb-8">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-headline mb-2">Invite more experts</h3>
                  <p className="text-on-primary-container text-sm max-w-md">
                    Collaborate effortlessly across departments by bringing your entire squad onto the Mutant-AI surface.
                  </p>
                </div>
                <div className="mt-4 flex gap-4">
                  <button 
                    onClick={() => setShowInviteLinkModal(true)}
                    className="bg-white text-primary px-5 py-2 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    Generate Invite Link
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                <span className="material-symbols-outlined text-[180px]">groups</span>
              </div>
            </div>

            {/* Department Cards */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-on-surface font-headline mb-4">Teams by Department</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {departments.map(dept => (
                  <div key={dept.name} onClick={() => handleDepartmentClick(dept.name)} className={`${dept.color} p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="text-2xl mb-2">{dept.icon}</div>
                    <p className="font-bold text-sm text-on-surface">{dept.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{dept.members} members</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Activity Widget */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-surface-container-low rounded-lg p-6 shadow-sm border border-outline-variant/10">
                <h4 className="font-bold text-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  Activity Trend
                </h4>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-8">{day}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60" style={{width: `${60 + i * 8}%`}}></div>
                      </div>
                      <span className="text-xs text-slate-400">{60 + i * 8}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low rounded-lg p-6 shadow-sm border border-outline-variant/10">
                <h4 className="font-bold text-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">history</span>
                  Recent Actions
                </h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Sophia Williams added to Design</span><span className="text-xs text-slate-400">2h ago</span></div>
                  <div className="flex justify-between"><span>Alexander changed to Admin</span><span className="text-xs text-slate-400">5h ago</span></div>
                  <div className="flex justify-between"><span>Elena accepted invite</span><span className="text-xs text-slate-400">1d ago</span></div>
                  <div className="flex justify-between"><span>New department created</span><span className="text-xs text-slate-400">3d ago</span></div>
                </div>
              </div>
            </div>

            {/* Invite Links Quick Access Button */}
            <div className="mb-8">
              <button
                onClick={() => setShowLinksPanel(true)}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg hover:shadow-md transition-all w-full hover:border-indigo-300"
              >
                <span className="material-symbols-outlined text-indigo-600 text-2xl">link</span>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Manage Invite Links</p>
                  <p className="text-xs text-slate-600 mt-0.5">{generatedLinks.length} links generated</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 ml-auto">arrow_forward</span>
              </button>
            </div>
          </>
        )}

        {/* TEAM MEMBERS TABLE & GRID */}
        {(activeTab === 'overview' || activeTab === 'roles') && !detailedDepartment && (
          <div className="bg-surface-container-low rounded-lg p-2 mt-8">
            <div className="bg-surface-container-lowest rounded-lg shadow-xl shadow-slate-200/50 overflow-hidden">
              
              {/* Search & Filter Bar */}
              <div className="px-8 py-6 border-b border-slate-200 bg-white">
                {/* Header Row with Title and View Toggle */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 font-headline">Active Personnel</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      title="Table View"
                    >
                      <span className="material-symbols-outlined text-lg">view_agenda</span>
                    </button>
                    <button
                      onClick={() => setViewMode('card')}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'card' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      title="Card View"
                    >
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Search</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      search
                    </span>
                    <input
                      className="pl-11 pr-4 py-3 bg-slate-50 text-sm rounded-lg border-2 border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 w-full transition-all duration-200 text-slate-900 placeholder-slate-400"
                      placeholder="Search members by name or email..."
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* All Roles Filter */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-sm rounded-lg border-2 border-slate-200 text-slate-700 font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 cursor-pointer hover:border-slate-300 shadow-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px'
                      }}
                    >
                      <option value="all">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  {/* All Status Filter */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-sm rounded-lg border-2 border-slate-200 text-slate-700 font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 cursor-pointer hover:border-slate-300 shadow-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px'
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* All Departments Filter */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-sm rounded-lg border-2 border-slate-200 text-slate-700 font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 cursor-pointer hover:border-slate-300 shadow-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px'
                      }}
                    >
                      <option value="all">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {showBulkActions && (
                <div className="px-8 py-3 bg-indigo-50 border-b border-indigo-200 flex items-center gap-4">
                  <span className="text-sm font-bold text-indigo-700">{selectedMembers.size} selected</span>
                  <div className="flex gap-2 ml-auto">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">edit</span>
                      Change Role
                    </button>
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">person</span>
                      Export List
                    </button>
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE VIEW */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/50">
                        <th className="px-8 py-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                          />
                        </th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Team Member</th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Department</th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Role</th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Activity</th>
                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Status</th>
                        <th className="px-8 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                      {filteredMembers.map(member => (
                        <tr key={member.id} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer" onClick={() => handleMemberClick(member)}>
                          <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedMembers.has(member.id)}
                              onChange={() => toggleMemberSelection(member.id)}
                              className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                            />
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-bold overflow-hidden">
                                <img alt={member.name} className="w-full h-full object-cover" src={member.avatar} />
                              </div>
                              <div>
                                <p className="font-bold text-on-surface text-sm">{member.name}</p>
                                <p className="text-xs text-slate-400">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-slate-600">{member.department}</span>
                          </td>
                          <td className="px-8 py-5">
                            <select
                              defaultValue={member.role}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-1.5 focus:ring-primary"
                            >
                              <option>Admin</option>
                              <option>Editor</option>
                              <option>Viewer</option>
                            </select>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full relative overflow-hidden">
                                <div className="h-full bg-primary/40" style={{width: `${member.activityScore}%`}}></div>
                              </div>
                              <span className="text-xs font-bold text-slate-600">{member.activityScore}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              member.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="relative group">
                              <button
                                onClick={() => setShowActionMenu(showActionMenu === member.id ? null : member.id)}
                                className="text-slate-400 hover:text-primary transition-colors p-2"
                              >
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>

                              {/* Action Menu */}
                              {showActionMenu === member.id && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-2">
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 text-slate-700 font-medium flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-base">person</span>
                                    View Profile
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 text-slate-700 font-medium flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Edit Role
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 text-slate-700 font-medium flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-base">history</span>
                                    View Activity
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 text-slate-700 font-medium flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-base">mail</span>
                                    Send Message
                                  </button>
                                  <div className="my-2 border-t border-slate-200"></div>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-base">block</span>
                                    Remove Member
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="px-8 py-6 flex justify-between items-center bg-surface-container-low/20">
                    <p className="text-xs text-slate-500">Showing {filteredMembers.length} of {teamMembers.length} team members</p>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-400 hover:text-primary disabled:opacity-50" disabled>
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white shadow-sm font-bold text-xs">
                        1
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-600 hover:bg-slate-50 font-bold text-xs">
                        2
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD VIEW */}
              {viewMode === 'card' && (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map(member => (
                      <div 
                        key={member.id}
                        onClick={() => handleMemberClick(member)}
                        className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <img
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-slate-100"
                            src={member.avatar}
                          />
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                            member.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          </span>
                        </div>
                        <p className="font-bold text-on-surface text-base mb-1">{member.name}</p>
                        <p className="text-xs text-slate-500 mb-4">{member.email}</p>
                        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200">
                          <div>
                            <p className="text-xs text-slate-500 font-bold">ROLE</p>
                            <p className="text-sm font-bold text-indigo-600">{member.role}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-bold">DEPT</p>
                            <p className="text-sm font-bold text-slate-700">{member.department}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600 mb-4">
                          <div className="flex justify-between">
                            <span>Activity Score</span>
                            <span className="font-bold text-primary">{member.activityScore}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{width: `${member.activityScore}%`}}></div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">Last: {member.lastLogin}</p>
                        <button className="w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DETAILED DEPARTMENT VIEW */}
        {activeTab === 'overview' && detailedDepartment && (
          <div className="mt-8">
             <button onClick={() => setDetailedDepartment(null)} className="mb-4 text-indigo-600 font-bold flex items-center gap-2 hover:underline"><span className="material-symbols-outlined">arrow_back</span> Back to Overview</button>
             <h2 className="text-3xl font-bold mb-6 font-headline">{detailedDepartment} Department</h2>
             
             {/* Show Department Members */}
             <h3 className="text-xl font-bold mb-4 font-headline text-slate-800">Department Members</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {teamMembers.filter(m => m.department === detailedDepartment).length === 0 && (
                 <p className="text-slate-500 text-sm col-span-3">No members found in this department.</p>
               )}
               {teamMembers.filter(m => m.department === detailedDepartment).map(member => (
                 <div key={member.id} onClick={() => handleMemberClick(member)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                    <img src={member.avatar} alt="avatar" className="w-14 h-14 rounded-full border-2 border-indigo-100" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">{member.name}</p>
                      <p className="text-xs font-semibold text-indigo-600">{member.role}</p>
                      <p className="text-xs text-slate-500 truncate">{member.email}</p>
                    </div>
                 </div>
               ))}
             </div>
             
             {/* Show Department Documents */}
             <h3 className="text-xl font-bold mb-4 font-headline text-slate-800">Department Documents</h3>
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
               {departmentDocs.length === 0 ? <p className="text-slate-500 p-4 text-sm font-medium">No documents assigned to this department yet.</p> : departmentDocs.map(doc => (
                 <div key={doc.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                       <span className="material-symbols-outlined text-lg">description</span>
                     </div>
                     <div>
                       <span className="font-bold text-sm text-slate-700 block">{doc.filename || 'Unnamed Document'}</span>
                       <span className="text-xs text-slate-400 block mt-0.5">Uploaded {new Date(doc.uploaded_at || Date.now()).toLocaleDateString()}</span>
                     </div>
                   </div>
                   <span className="text-xs font-bold text-indigo-700 px-3 py-1 bg-indigo-50 rounded-full">{doc.accessMode || doc.category || detailedDepartment}</span>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* PERMISSIONS TAB */}
        {activeTab === 'permissions' && (
          <div className="bg-white rounded-lg mt-8">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-xl font-bold text-slate-900 font-headline">Permission Management</h3>
              <p className="text-sm text-slate-600 mt-2">Configure role-based access control and granular permissions</p>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              {['Admin', 'Editor', 'Viewer'].map((role) => {
                const userCount = teamMembers.filter(m => m.role === role).length;
                const rolePermissions = permissions[role];
                const enabledCount = Object.values(rolePermissions).filter(Boolean).length;
                const totalCount = Object.keys(rolePermissions).length;
                
                return (
                  <div key={role} className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-white">
                    {/* Role Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{role}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {role === 'Admin' && 'Full system access'}
                          {role === 'Editor' && 'Create & edit documents'}
                          {role === 'Viewer' && 'Read-only access'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        role === 'Admin' ? 'bg-red-100 text-red-700' :
                        role === 'Editor' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {userCount} {userCount !== 1 ? 'users' : 'user'}
                      </span>
                    </div>

                    {/* User Count & Permissions Summary */}
                    <div className="mb-4 pb-4 border-b border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Permissions Enabled</span>
                        <span className="font-bold text-indigo-600">{enabledCount}/{totalCount}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width: `${(enabledCount/totalCount)*100}%`}}></div>
                      </div>
                    </div>

                    {/* Quick Permission Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rolePermissions.viewAll && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">✓ View</span>}
                      {rolePermissions.editAll && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">✓ Edit</span>}
                      {rolePermissions.delete && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">✓ Delete</span>}
                      {rolePermissions.manageUsers && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">✓ Manage Users</span>}
                      {rolePermissions.uploadDocuments && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">✓ Upload</span>}
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setSelectedPermissionRole(role);
                        setShowPermissionsModal(true);
                      }}
                      className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit Permissions
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Detailed Permissions Table */}
            <div className="px-8 py-6 border-t border-slate-200 bg-slate-50">
              <h4 className="text-lg font-bold text-slate-900 mb-4">All Available Permissions</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Permission</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Admin</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Editor</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { key: 'viewAll', label: 'View All Documents' },
                      { key: 'editAll', label: 'Edit Documents' },
                      { key: 'delete', label: 'Delete Documents' },
                      { key: 'manageUsers', label: 'Manage Users' },
                      { key: 'uploadDocuments', label: 'Upload Documents' },
                      { key: 'shareDocuments', label: 'Share Documents' },
                      { key: 'exportData', label: 'Export Data' },
                      { key: 'managePermissions', label: 'Manage Permissions' },
                      { key: 'viewAnalytics', label: 'View Analytics' },
                      { key: 'createTeams', label: 'Create Teams' },
                    ].map(perm => (
                      <tr key={perm.key} className="hover:bg-white transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{perm.label}</td>
                        {['Admin', 'Editor', 'Viewer'].map(role => (
                          <td key={`${role}-${perm.key}`} className="px-4 py-3 text-center">
                            <span className={`text-xl ${
                              permissions[role][perm.key] ? 'text-emerald-500' : 'text-slate-300'
                            }`}>
                              {permissions[role][perm.key] ? '✓' : '—'}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg mt-8 p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">publish</span>
                Upload Requests
                {uploadRequests.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {uploadRequests.filter(r => r.status === 'Pending').length} pending
                  </span>
                )}
              </h3>
              <button
                onClick={loadUploadRequests}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Refresh
              </button>
            </div>
            {uploadRequests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">inbox</span>
                <p className="text-slate-500 font-medium">No pending upload requests.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left bg-white">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">File Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Target Dept</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uploadRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5 text-sm font-bold text-slate-900 flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">description</span>
                          {req.fileName}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          <span className="font-semibold block">{req.requestedBy}</span>
                          <span className="text-xs text-slate-400">{req.requestedByEmail}</span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">{req.accessMode}</span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">{new Date(req.date).toLocaleDateString()}</td>
                        <td className="px-6 py-5 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${req.status === 'Pending' ? 'bg-orange-100 text-orange-700' : req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'Pending' ? 'bg-orange-500' : req.status === 'Approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {req.status === 'Pending' && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleApproveRequest(req.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors tooltip-trigger" title="Approve">
                                <span className="material-symbols-outlined text-[20px]">check</span>
                              </button>
                              <button onClick={() => handleRejectRequest(req.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors tooltip-trigger" title="Reject">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Permissions Edit Modal */}
        {/* Generated Links Sidebar */}
        {showLinksPanel && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity"
              onClick={() => setShowLinksPanel(false)}
            />
            {/* Sidebar Panel */}
            <div className="fixed right-0 top-0 h-screen w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              {/* Sidebar Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 flex justify-between items-center border-b border-slate-200">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">link</span>
                  Invite Links
                </h3>
                <button
                  onClick={() => setShowLinksPanel(false)}
                  className="text-white/80 hover:text-white transition-colors p-2"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-emerald-600">{generatedLinks.filter(l => l.status === 'Active').length}</p>
                    <p className="text-xs text-emerald-700 font-medium mt-1">Active</p>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-600">{generatedLinks.filter(l => l.status === 'Expired').length}</p>
                    <p className="text-xs text-slate-700 font-medium mt-1">Expired</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-indigo-600">{generatedLinks.length}</p>
                    <p className="text-xs text-indigo-700 font-medium mt-1">Total</p>
                  </div>
                </div>

                {/* Links List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider px-1">All Links</h4>
                  {generatedLinks.map(link => (
                    <div key={link.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                      {/* Link URL */}
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 font-bold mb-1">LINK</p>
                        <code className="text-xs font-mono bg-slate-100 px-3 py-2 rounded w-full block break-all text-slate-700">{link.link}</code>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500 font-bold">CREATED</p>
                          <p className="text-xs text-slate-700 mt-0.5">{link.created}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold">EXPIRES</p>
                          <p className="text-xs text-slate-700 mt-0.5">{link.expires}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold">USES</p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">{link.uses}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold">STATUS</p>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold mt-0.5 ${
                            link.status === 'Active' ? 'text-emerald-600' :
                            link.status === 'Expired' ? 'text-slate-400' :
                            'text-red-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              link.status === 'Active' ? 'bg-emerald-500' :
                              link.status === 'Expired' ? 'bg-slate-400' :
                              'bg-red-500'
                            }`}></span>
                            {link.status}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(link.link);
                          }}
                          className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded font-medium text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          Copy
                        </button>
                        {link.status === 'Active' && (
                          <button
                            onClick={() => revokeLink(link.id)}
                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded font-medium text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generate New Link Button */}
                <button
                  onClick={() => {
                    setShowInviteLinkModal(true);
                    setShowLinksPanel(false);
                  }}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  <span className="material-symbols-outlined">add</span>
                  Generate New Link
                </button>
              </div>
            </div>
          </>
        )}

        {showPermissionsModal && selectedPermissionRole && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center sticky top-0">
                <h3 className="text-2xl font-bold text-white">Edit {selectedPermissionRole} Permissions</h3>
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedPermissionRole(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-900">
                    Manage permissions for the <span className="font-bold">{selectedPermissionRole}</span> role.
                    {selectedPermissionRole === 'Admin' && ' This role has full access to all features.'}
                    {selectedPermissionRole === 'Editor' && ' This role can create and edit documents.'}
                    {selectedPermissionRole === 'Viewer' && ' This role has read-only access.'}
                  </p>
                </div>

                {/* Permission Toggles */}
                <div className="space-y-4">
                  {[
                    { key: 'viewAll', label: 'View All Documents', icon: 'visibility' },
                    { key: 'editAll', label: 'Edit Documents', icon: 'edit' },
                    { key: 'delete', label: 'Delete Documents', icon: 'delete' },
                    { key: 'manageUsers', label: 'Manage Users', icon: 'people' },
                    { key: 'uploadDocuments', label: 'Upload Documents', icon: 'upload_file' },
                    { key: 'shareDocuments', label: 'Share Documents', icon: 'share' },
                    { key: 'exportData', label: 'Export Data', icon: 'download' },
                    { key: 'managePermissions', label: 'Manage Permissions', icon: 'security' },
                    { key: 'viewAnalytics', label: 'View Analytics', icon: 'analytics' },
                    { key: 'createTeams', label: 'Create Teams', icon: 'group_add' },
                  ].map(perm => (
                    <div key={perm.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-indigo-600">{perm.icon}</span>
                        <div>
                          <p className="font-medium text-slate-900">{perm.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Toggle to enable or disable</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPermissions(prev => ({
                            ...prev,
                            [selectedPermissionRole]: {
                              ...prev[selectedPermissionRole],
                              [perm.key]: !prev[selectedPermissionRole][perm.key]
                            }
                          }));
                        }}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          permissions[selectedPermissionRole][perm.key] ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                          permissions[selectedPermissionRole][perm.key] ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-slate-200 flex gap-3 justify-end bg-slate-50 sticky bottom-0">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedPermissionRole(null);
                  }}
                  className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedPermissionRole(null);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <div className="mb-4 md:mb-0">
          <span className="font-manrope font-bold text-slate-900 dark:text-white">Mutant-AI</span>
          <span className="ml-4 font-inter text-xs text-slate-500">© 2024 Mutant-AI. The Ethereal Archivist.</span>
        </div>
        <div className="flex gap-6">
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            Privacy
          </a>
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            Terms
          </a>
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            Documentation
          </a>
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            LinkedIn
          </a>
        </div>
      </footer>

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-start">
              <div className="flex items-start gap-4">
                <img
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-full border-4 border-white object-cover"
                  src={selectedMember.avatar}
                />
                <div className="text-white">
                  <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                  <p className="text-indigo-100">{selectedMember.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedMember(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold mb-1">ROLE</p>
                  <p className="text-lg font-bold text-indigo-600">{selectedMember.role}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold mb-1">DEPARTMENT</p>
                  <p className="text-lg font-bold text-slate-700">{selectedMember.department}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold mb-1">STATUS</p>
                  <p className={`text-lg font-bold ${selectedMember.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {selectedMember.status}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold mb-1">JOINED</p>
                  <p className="text-lg font-bold text-slate-700">{selectedMember.joinDate}</p>
                </div>
              </div>

              {/* Activity & Documents */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-indigo-600">trending_up</span>
                    <p className="font-bold text-on-surface">Activity Score</p>
                  </div>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-3xl font-bold text-indigo-600">{selectedMember.activityScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width: `${selectedMember.activityScore}%`}}></div>
                  </div>
                </div>
                <div className="border border-slate-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-emerald-600">description</span>
                    <p className="font-bold text-on-surface">Documents Accessed</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 mb-2">{selectedMember.documents}</p>
                  <p className="text-xs text-slate-500">Total documents accessed</p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="border border-slate-200 p-4 rounded-lg">
                <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">history</span>
                  Recent Activity
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-700">Accessed Dashboard</span>
                    <span className="text-xs text-slate-400">{selectedMember.lastLogin}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-700">Reviewed Document: Q1 2024</span>
                    <span className="text-xs text-slate-400">1 day ago</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-700">Updated Profile Information</span>
                    <span className="text-xs text-slate-400">3 days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Joined {selectedMember.department} Team</span>
                    <span className="text-xs text-slate-400">{selectedMember.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="border border-slate-200 p-4 rounded-lg">
                <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">security</span>
                  Permissions
                </h4>
                <div className="space-y-2">
                  {selectedMember.role === 'Admin' && (
                    <>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span><span>View & Edit All Documents</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span><span>Manage Team Members</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span><span>Configure Permissions</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span><span>Export Reports</span></div>
                    </>
                  )}
                  {selectedMember.role === 'Editor' && (
                    <>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span><span>Create & Edit Documents</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span><span>Comment on Documents</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-400 text-base">cancel</span><span className="text-slate-400">Manage Team Members</span></div>
                    </>
                  )}
                  {selectedMember.role === 'Viewer' && (
                    <>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span><span>View All Documents</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-400 text-base">cancel</span><span className="text-slate-400">Edit Documents</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-400 text-base">cancel</span><span className="text-slate-400">Manage Team</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-6 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center gap-2 justify-center">
                  <span className="material-symbols-outlined">edit</span>
                  Edit Role
                </button>
                <button className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2 justify-center">
                  <span className="material-symbols-outlined">mail</span>
                  Send Message
                </button>
                <button className="flex-1 px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2 justify-center">
                  <span className="material-symbols-outlined">delete</span>
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Link Generation Modal */}
      {showInviteLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center">
              <div className="text-white">
                <h3 className="text-2xl font-bold">Generate Invite Link</h3>
                <p className="text-indigo-100 mt-1">Create shareable invitation links for team members</p>
              </div>
              <button
                onClick={() => {
                  setShowInviteLinkModal(false);
                  setInviteLink(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {!inviteLink ? (
                <>
                  {/* Configuration Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Link Expiration</label>
                      <select
                        value={inviteLinkExpiration}
                        onChange={(e) => setInviteLinkExpiration(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="7days">7 Days</option>
                        <option value="30days">30 Days</option>
                        <option value="90days">90 Days</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">The link will automatically expire after the selected period</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Limit Uses (Optional)</label>
                      <input
                        type="number"
                        defaultValue="10"
                        min="1"
                        max="100"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Leave blank for unlimited"
                      />
                      <p className="text-xs text-slate-500 mt-2">Max number of people who can use this link</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Default Role for Invitees</label>
                      <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option>Viewer</option>
                        <option>Editor</option>
                        <option>Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowInviteLinkModal(false);
                        setInviteLink(null);
                      }}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateInviteLink}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">link</span>
                      Generate Link
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Generated Link Display */}
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                      <div>
                        <p className="font-bold text-emerald-700">Invite link generated successfully!</p>
                        <p className="text-sm text-emerald-600">Share this link with people you want to invite</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Your Invite Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inviteLink}
                          readOnly
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-700"
                        />
                        <button
                          onClick={copyToClipboard}
                          className={`px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${
                            inviteLinkCopied
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {inviteLinkCopied ? 'check' : 'content_copy'}
                          </span>
                          {inviteLinkCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Share Options */}
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-700">Share Via</p>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">mail</span>
                          Email
                        </button>
                        <button className="flex-1 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm font-bold hover:bg-sky-100 transition-colors flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">share</span>
                          More
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setShowInviteLinkModal(false);
                          setInviteLink(null);
                        }}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          setInviteLink(null);
                          setInviteLinkCopied(false);
                        }}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">add</span>
                        Generate Another
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeamPage;
