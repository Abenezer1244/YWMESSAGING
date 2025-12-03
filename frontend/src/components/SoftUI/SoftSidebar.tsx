import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  Users,
  MessageSquare,
  History,
  FileText,
  Clock,
  BarChart3,
  CreditCard,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useBranchStore } from '../../stores/branchStore';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  conditional?: boolean;
  subItems?: NavItem[];
}

export function SoftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, church } = useAuthStore();
  const { currentBranchId } = useBranchStore();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      label: 'Branches',
      icon: <GitBranch className="w-5 h-5" />,
      path: '/branches',
    },
    {
      label: 'Groups',
      icon: <Users className="w-5 h-5" />,
      path: `/branches/${currentBranchId}/groups`,
      conditional: true,
    },
    {
      label: 'Members',
      icon: <Users className="w-5 h-5" />,
      path: '/members',
      conditional: true,
    },
    {
      label: 'Messaging',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '#',
      subItems: [
        {
          label: 'Send Message',
          icon: <MessageSquare className="w-4 h-4" />,
          path: '/send-message',
        },
        {
          label: 'History',
          icon: <History className="w-4 h-4" />,
          path: '/message-history',
        },
        {
          label: 'Templates',
          icon: <FileText className="w-4 h-4" />,
          path: '/templates',
        },
        {
          label: 'Recurring',
          icon: <Clock className="w-4 h-4" />,
          path: '/recurring-messages',
        },
      ],
    },
    {
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/analytics',
    },
    {
      label: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/billing',
    },
    {
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path.split('?')[0]);
  };

  const filteredItems = navigationItems.filter(
    (item) => !item.conditional || (item.conditional && currentBranchId)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -288 }}
        animate={{ x: isOpen ? 0 : -288 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen w-72 bg-card/80 backdrop-blur-xl border-r border-border/40 z-40 flex flex-col overflow-hidden md:translate-x-0 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Koinonia</h1>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                {church?.name}
              </p>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 hover:bg-muted/50 rounded-lg"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2 custom-scrollbar">
          {filteredItems.map((item, index) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isItemActive = isActive(item.path);
            const isExpanded = expandedItem === item.label;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {hasSubItems ? (
                  <>
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                      onClick={() => setExpandedItem(isExpanded ? null : item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        isItemActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-primary border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </motion.button>

                    {/* Submenu */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-9 space-y-1 mb-2">
                            {item.subItems?.map((subItem) => (
                              <motion.button
                                key={subItem.label}
                                whileHover={{ x: 4 }}
                                onClick={() => {
                                  navigate(subItem.path);
                                  setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                                  isActive(subItem.path)
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                }`}
                              >
                                {subItem.icon}
                                <span>{subItem.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isItemActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-primary border-l-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    {item.icon}
                    <span className="font-semibold">{item.label}</span>
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-border/40 p-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-semibold border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Main Content Spacer */}
      <div className="hidden md:block w-72" />
    </>
  );
}
