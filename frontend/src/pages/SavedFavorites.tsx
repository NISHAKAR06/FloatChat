import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Bookmark, Search, Filter, MapPin, BarChart3, Calendar, Trash2, Edit2 } from 'lucide-react';

interface FavoriteItem {
  id: string;
  name: string;
  type: 'query' | 'visualization' | 'float' | 'region';
  description: string;
  dateAdded: string;
  lastAccessed: string;
  tags: string[];
  data?: any;
}

const SavedFavorites = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const favorites: FavoriteItem[] = [
    {
      id: '1',
      name: 'Pacific Temperature Analysis',
      type: 'query',
      description: 'Temperature profiles for North Pacific ARGO floats, depth 0-2000m',
      dateAdded: '2024-01-15',
      lastAccessed: '2024-01-20',
      tags: ['temperature', 'pacific', 'profiles'],
      data: { region: 'North Pacific', parameter: 'temperature', depth: '0-2000m' }
    },
    {
      id: '2',
      name: 'Salinity vs Depth Chart',
      type: 'visualization',
      description: 'Interactive line chart showing salinity distribution by depth',
      dateAdded: '2024-01-14',
      lastAccessed: '2024-01-19',
      tags: ['salinity', 'depth', 'chart'],
      data: { chartType: 'line', xAxis: 'depth', yAxis: 'salinity' }
    },
    {
      id: '3',
      name: 'ARGO Float #4902345',
      type: 'float',
      description: 'High-resolution float in North Atlantic with BGC sensors',
      dateAdded: '2024-01-13',
      lastAccessed: '2024-01-18',
      tags: ['atlantic', 'bgc', 'sensors'],
      data: { floatId: '4902345', location: 'North Atlantic', sensors: ['CTD', 'BGC'] }
    },
    {
      id: '4',
      name: 'Mediterranean Sea Region',
      type: 'region',
      description: 'Complete Mediterranean basin with 45 active floats',
      dateAdded: '2024-01-12',
      lastAccessed: '2024-01-17',
      tags: ['mediterranean', 'region', 'active'],
      data: { bounds: [[30, -10], [45, 40]], floatCount: 45 }
    },
    {
      id: '5',
      name: 'Oxygen Depletion Study',
      type: 'query',
      description: 'Dissolved oxygen levels below 200m depth in tropical regions',
      dateAdded: '2024-01-11',
      lastAccessed: '2024-01-16',
      tags: ['oxygen', 'tropical', 'deep'],
      data: { parameter: 'oxygen', depth: '>200m', region: 'tropical' }
    },
    {
      id: '6',
      name: 'Float Trajectory Map',
      type: 'visualization',
      description: 'Geographic visualization of float movements over 6 months',
      dateAdded: '2024-01-10',
      lastAccessed: '2024-01-15',
      tags: ['trajectory', 'map', 'movement'],
      data: { chartType: 'map', timeRange: '6months', layer: 'trajectories' }
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'query': return Search;
      case 'visualization': return BarChart3;
      case 'float': return MapPin;
      case 'region': return MapPin;
      default: return Bookmark;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'query': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'visualization': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'float': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'region': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'oldest':
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      case 'recent':
      default:
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary">
            Saved Favorites
          </h1>
          <p className="text-muted-foreground mt-1">
            Your bookmarked queries, visualizations, floats, and regions
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {favorites.length} saved items
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="query">Queries</SelectItem>
                <SelectItem value="visualization">Charts</SelectItem>
                <SelectItem value="float">Floats</SelectItem>
                <SelectItem value="region">Regions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFavorites.map((item) => {
          const Icon = getTypeIcon(item.type);
          return (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Added: {new Date(item.dateAdded).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Last accessed: {new Date(item.lastAccessed).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full" size="sm">
                    Open {item.type === 'query' ? 'Query' : item.type === 'visualization' ? 'Chart' : 'Item'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFavorites.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No favorites found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start adding items to your favorites to see them here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedFavorites;
