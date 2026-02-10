import { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentData } from '@/hooks/useAdmin';

interface StudentDataTableProps {
  students: StudentData[];
  loading?: boolean;
}

type SortField = 'full_name' | 'department' | 'level' | 'cgpa' | 'totalCredits';
type SortDirection = 'asc' | 'desc';

const getClassification = (cgpa: number): string => {
  if (cgpa >= 4.5) return 'First Class';
  if (cgpa >= 3.5) return 'Second Class Upper';
  if (cgpa >= 2.4) return 'Second Class Lower';
  if (cgpa >= 1.5) return 'Third Class';
  if (cgpa >= 1.0) return 'Pass';
  return 'Fail';
};

const getClassificationColor = (classification: string): string => {
  switch (classification) {
    case 'First Class':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'Second Class Upper':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Second Class Lower':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'Third Class':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'Pass':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const StudentDataTable = ({ students, loading }: StudentDataTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('full_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get unique values for filters
  const levels = useMemo(() => {
    const uniqueLevels = [...new Set(students.map(s => s.level).filter(Boolean))];
    return uniqueLevels.sort((a, b) => {
      const order = ['100L', '200L', '300L', '400L', '500L', '600L'];
      return order.indexOf(a!) - order.indexOf(b!);
    });
  }, [students]);

  const departments = useMemo(() => {
    const uniqueDepts = [...new Set(students.map(s => s.department).filter(Boolean))];
    return uniqueDepts.sort();
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = students.filter(student => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        student.full_name?.toLowerCase().includes(searchLower) ||
        student.department?.toLowerCase().includes(searchLower) ||
        student.faculty?.toLowerCase().includes(searchLower);

      // Level filter
      const matchesLevel = levelFilter === 'all' || student.level === levelFilter;

      // Department filter
      const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;

      // Gender filter
      const matchesGender = genderFilter === 'all' || student.gender === genderFilter;

      // Classification filter
      const classification = getClassification(student.cgpa);
      const matchesClassification = classificationFilter === 'all' || classification === classificationFilter;

      return matchesSearch && matchesLevel && matchesDepartment && matchesGender && matchesClassification;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'full_name':
          comparison = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        case 'department':
          comparison = (a.department || '').localeCompare(b.department || '');
          break;
        case 'level':
          const levelOrder = ['100L', '200L', '300L', '400L', '500L', '600L'];
          comparison = levelOrder.indexOf(a.level || '') - levelOrder.indexOf(b.level || '');
          break;
        case 'cgpa':
          comparison = a.cgpa - b.cgpa;
          break;
        case 'totalCredits':
          comparison = a.totalCredits - b.totalCredits;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, searchQuery, levelFilter, departmentFilter, genderFilter, classificationFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-3 w-3" /> 
      : <ChevronDown className="ml-1 h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Student Directory
        </CardTitle>
        <CardDescription>
          Search and filter through {students.length} registered students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level!}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="First Class">First Class</SelectItem>
                <SelectItem value="Second Class Upper">Second Class Upper</SelectItem>
                <SelectItem value="Second Class Lower">Second Class Lower</SelectItem>
                <SelectItem value="Third Class">Third Class</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Showing {filteredStudents.length} of {students.length} students
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center">
                      Name
                      <SortIcon field="full_name" />
                    </div>
                  </TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center">
                      Department
                      <SortIcon field="department" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center">
                      Level
                      <SortIcon field="level" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors text-right"
                    onClick={() => handleSort('cgpa')}
                  >
                    <div className="flex items-center justify-end">
                      CGPA
                      <SortIcon field="cgpa" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors text-right"
                    onClick={() => handleSort('totalCredits')}
                  >
                    <div className="flex items-center justify-end">
                      Credits
                      <SortIcon field="totalCredits" />
                    </div>
                  </TableHead>
                  <TableHead>Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="animate-pulse text-muted-foreground">Loading students...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No students found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const classification = getClassification(student.cgpa);
                    return (
                      <TableRow key={student.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {student.full_name || 'N/A'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {student.gender || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {student.department || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {student.level || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {student.cgpa.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {student.totalCredits}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getClassificationColor(classification)}>
                            {classification}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
