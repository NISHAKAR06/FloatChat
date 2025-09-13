import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Database, AlertTriangle, RefreshCcw, Filter, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';

const AdminDatasetMonitor = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="container mx-auto p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ocean-dark dark:text-white">
          Dataset Monitor
        </h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary-hover">
            <Upload className="h-4 w-4" />
            Upload NetCDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Files
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,543</div>
            <p className="text-xs text-muted-foreground">
              +12 files in the last 24h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Validation Issues
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">7</div>
            <p className="text-xs text-muted-foreground">
              3 critical, 4 warnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Queue
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              ~2 minutes remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Dataset Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="files" className="space-y-4">
            <TabsList>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
            </TabsList>
            <TabsContent value="files" className="space-y-4">
              <div className="rounded-md border">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Example rows - replace with actual data */}
                      <TableRow>
                        <TableCell>float_12345.nc</TableCell>
                        <TableCell>2.3 MB</TableCell>
                        <TableCell>2025-09-12</TableCell>
                        <TableCell>
                          <Badge variant="success">Valid</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>float_12346.nc</TableCell>
                        <TableCell>1.8 MB</TableCell>
                        <TableCell>2025-09-12</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Error</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent value="validation">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Validation Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>Overall Progress</div>
                        <div>89%</div>
                      </div>
                      <Progress value={89} />
                    </div>
                  </CardContent>
                </Card>
                {/* Add validation details here */}
              </div>
            </TabsContent>
            <TabsContent value="queue">
              {/* Add queue management UI here */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminDatasetMonitor;