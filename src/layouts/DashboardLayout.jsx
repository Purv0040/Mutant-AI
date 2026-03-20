import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

const DashboardLayout = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-body">
      <DashboardSidebar />
      <div className="flex-1 relative">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
