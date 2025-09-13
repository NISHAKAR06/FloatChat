import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  ChevronDown, 
  Download, 
  Filter, 
  MoreVertical, 
  SortAsc, 
  SortDesc 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const DataTable = ({ 
  data, 
  columns, 
  title, 
  onSort, 
  onFilter, 
  onExport,
  className 
}) => {
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: 'asc'
  });
  const [filters, setFilters] = React.useState({});

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleFilter = (column, value) => {
    const newFilters = {
      ...filters,
      [column]: value
    };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleExport = (format) => {
    onExport?.(format);
  };

  return (
    <Card className={className}>
      <CardHeader className="bg-ocean-dark text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map(column => (
                  <div key={column.key} className="px-2 py-1.5">
                    <Input
                      placeholder={`Filter ${column.label}...`}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilter(column.key, e.target.value)}
                      className="h-8"
                    />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('netcdf')}>
                  Export as NetCDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-b-lg border border-t-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead 
                    key={column.key}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortConfig.key === column.key && (
                        sortConfig.direction === 'asc' ? 
                          <SortAsc className="h-4 w-4" /> : 
                          <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map(column => (
                    <TableCell key={column.key}>
                      {column.format ? 
                        column.format(row[column.key]) : 
                        row[column.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;