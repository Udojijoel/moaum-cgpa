import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Semester, Course, LEVELS, generateSessions, getGradeColorClass, GRADING_SCALE } from '@/lib/grading';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SemesterCardProps {
  semester: Semester;
  onAddCourse: (semesterId: string, code: string, title: string, creditUnits: number, score: number) => void;
  onUpdateCourse: (semesterId: string, courseId: string, updates: Partial<Course>) => void;
  onDeleteCourse: (semesterId: string, courseId: string) => void;
  onDeleteSemester: (semesterId: string) => void;
}

export const SemesterCard = ({
  semester,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onDeleteSemester,
}: SemesterCardProps) => {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    creditUnits: '',
    score: '',
  });
  const [editingCourse, setEditingCourse] = useState<Partial<Course>>({});

  const handleAddCourse = () => {
    const creditUnits = parseInt(newCourse.creditUnits);
    const score = parseInt(newCourse.score);

    if (!newCourse.code || !newCourse.title || isNaN(creditUnits) || isNaN(score)) {
      toast.error('Please fill all fields correctly');
      return;
    }

    if (score < 0 || score > 100) {
      toast.error('Score must be between 0 and 100');
      return;
    }

    if (creditUnits < 1 || creditUnits > 6) {
      toast.error('Credit units must be between 1 and 6');
      return;
    }

    onAddCourse(semester.id, newCourse.code.toUpperCase(), newCourse.title, creditUnits, score);
    setNewCourse({ code: '', title: '', creditUnits: '', score: '' });
    setIsAddingCourse(false);
    toast.success('Course added');
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setEditingCourse({
      code: course.code,
      title: course.title,
      creditUnits: course.creditUnits,
      score: course.score,
    });
  };

  const handleSaveEdit = (courseId: string) => {
    const score = editingCourse.score ?? 0;
    const creditUnits = editingCourse.creditUnits ?? 0;

    if (score < 0 || score > 100) {
      toast.error('Score must be between 0 and 100');
      return;
    }

    onUpdateCourse(semester.id, courseId, editingCourse);
    setEditingCourseId(null);
    setEditingCourse({});
    toast.success('Course updated');
  };

  const handleDeleteCourse = (courseId: string) => {
    onDeleteCourse(semester.id, courseId);
    toast.success('Course deleted');
  };

  return (
    <div className="bg-card rounded-md border shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="gold-border">
          <h3 className="font-semibold text-foreground font-serif">{semester.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {semester.level} Level • {semester.session}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p className="text-xs text-muted-foreground">GPA</p>
            <p className="text-xl font-bold text-accent font-serif">{semester.gpa.toFixed(2)}</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Semester?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {semester.name} and all its courses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteSemester(semester.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-muted/50 rounded-md">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">TCR</p>
          <p className="font-semibold text-sm">{semester.tcr}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">TCE</p>
          <p className="font-semibold text-sm text-success">{semester.tce}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">TWGP</p>
          <p className="font-semibold text-sm">{semester.twgp}</p>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-2 mb-4">
        {semester.courses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No courses added</p>
          </div>
        ) : (
          semester.courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-2.5 bg-background rounded-md border"
            >
              {editingCourseId === course.id ? (
                <div className="flex-1 grid grid-cols-4 gap-2 mr-2">
                  <Input
                    value={editingCourse.code || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value.toUpperCase() })}
                    placeholder="Code"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={editingCourse.title || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    placeholder="Title"
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    value={editingCourse.creditUnits || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, creditUnits: parseInt(e.target.value) || 0 })}
                    placeholder="CU"
                    className="h-8 text-xs"
                    min={1}
                    max={6}
                  />
                  <Input
                    type="number"
                    value={editingCourse.score || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, score: parseInt(e.target.value) || 0 })}
                    placeholder="Score"
                    className="h-8 text-xs"
                    min={0}
                    max={100}
                  />
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{course.code}</span>
                    <span className={cn('grade-badge', getGradeColorClass(course.grade))}>
                      {course.grade}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{course.title}</p>
                </div>
              )}

              <div className="flex items-center gap-2 ml-2">
                {editingCourseId !== course.id && (
                  <>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{course.creditUnits} CU</p>
                      <p className="text-xs font-medium">{course.score}%</p>
                    </div>
                    <div className="text-right min-w-[36px]">
                      <p className="text-[10px] text-muted-foreground">WGP</p>
                      <p className="text-xs font-medium">{course.weightedGradePoint}</p>
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  {editingCourseId === course.id ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveEdit(course.id)}
                        className="h-7 w-7 text-success hover:bg-success/10"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingCourseId(null);
                          setEditingCourse({});
                        }}
                        className="h-7 w-7 text-muted-foreground hover:bg-muted"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditCourse(course)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {course.code} from this semester.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCourse(course.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Course Form */}
      {isAddingCourse ? (
        <div className="p-3 bg-muted/30 rounded-md border border-dashed">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Code</Label>
              <Input
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                placeholder="GST 111"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Title</Label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Use of English"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Credit Units</Label>
              <Input
                type="number"
                value={newCourse.creditUnits}
                onChange={(e) => setNewCourse({ ...newCourse, creditUnits: e.target.value })}
                placeholder="1-6"
                min={1}
                max={6}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Score (%)</Label>
              <Input
                type="number"
                value={newCourse.score}
                onChange={(e) => setNewCourse({ ...newCourse, score: e.target.value })}
                placeholder="0-100"
                min={0}
                max={100}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCourse} size="sm" className="h-7 text-xs">
              <Check className="w-3 h-3 mr-1" /> Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setIsAddingCourse(false);
                setNewCourse({ code: '', title: '', creditUnits: '', score: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed h-8 text-xs"
          onClick={() => setIsAddingCourse(true)}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Course
        </Button>
      )}
    </div>
  );
};

interface AddSemesterDialogProps {
  onAddSemester: (name: string, level: string, session: string) => void;
}

export const AddSemesterDialog = ({ onAddSemester }: AddSemesterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [session, setSession] = useState('');

  const sessions = generateSessions();

  const handleSubmit = () => {
    if (!name || !level || !session) {
      toast.error('Please fill all fields');
      return;
    }
    onAddSemester(name, level, session);
    setName('');
    setLevel('');
    setSession('');
    setOpen(false);
    toast.success('Semester added');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Semester
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Semester</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Semester</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First Semester">First Semester</SelectItem>
                <SelectItem value="Second Semester">Second Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l} Level
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Session</Label>
            <Select value={session} onValueChange={setSession}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Add Semester
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};