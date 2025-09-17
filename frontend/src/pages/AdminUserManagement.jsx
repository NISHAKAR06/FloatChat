import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Users, 
  Search, 
  Shield, 
  Lock, 
  Unlock,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { users } from '../mock/data';

const AdminUserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' 
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  // Filter users based on search query
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');
  const normalizedQuery = normalize(searchQuery);

  const filteredUsers = users.filter(
    (user) =>
      normalize(user.name).includes(normalizedQuery) ||
      normalize(user.email).includes(normalizedQuery) ||
      normalize(user.institution).includes(normalizedQuery)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              User Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage user accounts and permissions</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-700 hover:to-blue-800 hover:shadow-md dark:from-cyan-600/90 dark:to-blue-700/90 dark:hover:from-cyan-700/90 dark:hover:to-blue-800/90 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95 hover:shadow-lg transition-all duration-300 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/95 dark:bg-slate-900/95 border-slate-200/60 hover:border-cyan-300 focus:border-cyan-400 dark:border-slate-600/60 dark:hover:border-cyan-600 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
                <div className="text-slate-600 dark:text-slate-400">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Admins</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white transition-colors">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                No results found.
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{user.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{user.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">{user.institution}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{user.datasetsAccessed} datasets</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 transition-all hover:shadow-sm"
                      >
                        {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 transition-all hover:shadow-sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminUserManagement;
