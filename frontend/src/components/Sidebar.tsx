import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  Users,
  MessageSquare,
  MessageCircle,
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
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useBranchStore } from '../stores/branchStore';
import { getConversations } from '../api/conversations';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  conditional?: boolean;
  subItems?: NavItem[];
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, church } = useAuthStore();
  const { currentBranchId } = useBranchStore();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Fetch unread conversation count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await getConversations({ limit: 1000 });
        const totalUnread = result.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch (error) {
        // Failed to fetch unread count - non-critical
      }
    };

    fetchUnreadCount();
  }, []);

  const navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      label: 'Conversations',
      icon: <MessageCircle className="w-5 h-5" />,
      path: '/conversations',
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
    },
    {
      label: 'Branches',
      icon: <GitBranch className="w-5 h-5" />,
      path: '/branches',
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
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-primary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen w-72 bg-card border-r border-border z-40 flex flex-col overflow-hidden md:translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <img src="/logo.svg" alt="Koinonia" className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Koinonia</h1>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{church?.name}</p>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 hover:bg-muted rounded focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
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
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                        isItemActive
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
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
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                                  isActive(subItem.path)
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                      isItemActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
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
          className="border-t border-border p-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
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
