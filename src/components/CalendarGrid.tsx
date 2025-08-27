import { Post } from "./PostModal";

interface CalendarGridProps {
  currentDate: Date;
  posts: Post[];
  onDateClick: (date: string) => void;
  onPostClick: (post: Post) => void;
}

export function CalendarGrid({
  currentDate,
  posts,
  onDateClick,
  onPostClick
}: CalendarGridProps) {
  const today = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    days.push(day);
  }

  const getDateString = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const getPostsForDate = (day: number) => {
    const dateString = getDateString(day);
    return posts.filter(post => post.date === dateString);
  };

  const isToday = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'process':
        return 'bg-status-process';
      case 'scheduled':
        return 'bg-status-scheduled';
      case 'posted':
        return 'bg-status-posted';
      default:
        return 'bg-muted';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 bg-background">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(day => (
          <div
            key={day}
            className="p-4 text-center text-sm font-medium text-calendar-header bg-muted"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 h-full">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              border-r border-b border-border min-h-32 p-2 cursor-pointer
              transition-colors hover:bg-calendar-hover
              ${day ? 'bg-card' : 'bg-muted/30'}
              ${day && isToday(day) ? 'bg-calendar-today/10 border-calendar-today' : ''}
            `}
            onClick={() => day && onDateClick(getDateString(day))}
          >
            {day && (
              <>
                <div className={`
                  text-sm font-medium mb-2
                  ${isToday(day) ? 'text-calendar-today font-bold' : 'text-foreground'}
                `}>
                  {day}
                </div>
                
                <div className="space-y-1">
                  {getPostsForDate(day).map((post) => (
                    <div
                      key={post.id}
                      className={`
                        text-xs p-1 rounded cursor-pointer
                        transition-opacity hover:opacity-80
                        text-white font-medium
                        ${getStatusColor(post.status)}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPostClick(post);
                      }}
                      title={post.content}
                    >
                      {post.content.length > 20 
                        ? `${post.content.substring(0, 20)}...` 
                        : post.content
                      }
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}