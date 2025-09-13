import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { UserCircle2, ShieldCheck } from 'lucide-react';

const RoleSelector = ({ selectedRole, onRoleSelect, className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <RadioGroup
          defaultValue={selectedRole}
          onValueChange={onRoleSelect}
          className="grid grid-cols-2 gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Label
              htmlFor="user"
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer
                ${selectedRole === 'user' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'}`}
            >
              <UserCircle2 
                className={`h-12 w-12 mb-4 ${
                  selectedRole === 'user' ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <RadioGroupItem 
                value="user" 
                id="user" 
                className="sr-only"
              />
              <span className="text-lg font-semibold mb-2">User</span>
              <span className="text-sm text-center text-muted-foreground">
                Access data exploration and analysis tools
              </span>
            </Label>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Label
              htmlFor="admin"
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer
                ${selectedRole === 'admin' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'}`}
            >
              <ShieldCheck 
                className={`h-12 w-12 mb-4 ${
                  selectedRole === 'admin' ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <RadioGroupItem 
                value="admin" 
                id="admin" 
                className="sr-only"
              />
              <span className="text-lg font-semibold mb-2">Admin</span>
              <span className="text-sm text-center text-muted-foreground">
                Manage system settings and user access
              </span>
            </Label>
          </motion.div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default RoleSelector;