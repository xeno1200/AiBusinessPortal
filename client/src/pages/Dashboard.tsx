import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { 
  User, 
  Settings, 
  Phone, 
  BarChart3, 
  Calendar, 
  Bell, 
  LogOut,
  MessageSquare,
  TrendingUp,
  Clock,
  DollarSign,
  Users
} from "lucide-react";

interface DashboardStats {
  totalCalls: number;
  activeAgents: number;
  monthlyUsage: number;
  conversionRate: number;
}

interface RecentActivity {
  id: number;
  type: 'call' | 'message' | 'agent_created';
  description: string;
  timestamp: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get user data
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: () => apiRequest("/api/auth/me", { method: "GET" }),
    retry: false
  });

  // Mock dashboard stats - replace with real API call
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // For now, return mock data
      return {
        totalCalls: 1247,
        activeAgents: 3,
        monthlyUsage: 85,
        conversionRate: 24.5
      };
    },
    enabled: !!userData?.authenticated
  });

  // Mock recent activity - replace with real API call
  const { data: recentActivity } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async (): Promise<RecentActivity[]> => {
      // For now, return mock data
      return [
        {
          id: 1,
          type: 'call',
          description: 'Incoming call handled by Sales Agent',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 2,
          type: 'agent_created',
          description: 'New AI agent "Customer Support" created',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 3,
          type: 'message',
          description: 'Customer inquiry processed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        }
      ];
    },
    enabled: !!userData?.authenticated
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive"
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Redirect to login if not authenticated, but only after loading is complete
  useEffect(() => {
    // Only redirect if we have completed loading and confirmed user is not authenticated
    if (!userLoading && (userError || (userData && userData.authenticated === false))) {
      console.log("Redirecting to login:", { userError, userData, userLoading });
      setLocation("/login");
    }
  }, [userData, userError, userLoading, setLocation]);

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If we have an error or confirmed non-authentication, return null (redirect will happen via useEffect)
  if (userError || (userData && userData.authenticated === false)) {
    return null;
  }

  // If we don't have user data yet, keep loading
  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const user = userData.user;
  const userInitials = user.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : user.username.substring(0, 2).toUpperCase();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - AI Business Portal</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.fullName || user.username}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Welcome Section */}
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.fullName?.split(' ')[0] || user.username}!
              </h2>
              <p className="text-gray-600">
                Manage your AI agents and monitor your business communications
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCalls.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeAgents || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Running 24/7
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.monthlyUsage || '0'}%</div>
                  <p className="text-xs text-muted-foreground">
                    Of plan limit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.conversionRate || '0'}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.5% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Get started with common tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Create New AI Agent
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Call Logs
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics Dashboard
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest updates from your agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity?.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {activity.type === 'call' && (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Phone className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                            {activity.type === 'message' && (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                            {activity.type === 'agent_created' && (
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;