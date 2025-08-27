import { Post } from "./PostModal";

interface CalendarGridProps {
  currentDate: Date;
  posts: Post[];
  onSelectDate: (date: string) => void;
  onSelectPost: (post: Post) => void;
  selectedOrgId: string;
}

export function CalendarGrid({
  currentDate,
  posts,
  onSelectDate,
  onSelectPost,
  selectedOrgId
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
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    days.push(date);
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getPostsForDate = (date: Date) => {
    const dateString = formatDateString(date);
    return posts.filter(post => post.date === dateString);
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getStatusColor = (status: 'process' | 'scheduled' | 'posted') => {
    switch (status) {
      case 'process':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'posted':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-4 text-center font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-32 border-r border-b" />;
          }

          const dayPosts = getPostsForDate(date);
          const dateString = formatDateString(date);

          return (
            <div
              key={index}
              className={`h-32 border-r border-b p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                isToday(date) ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectDate(dateString)}
            >
              <div className={`text-sm font-medium ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
              
              <div className="mt-1 space-y-1 overflow-y-auto max-h-20">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`text-xs px-2 py-1 rounded border cursor-pointer truncate ${getStatusColor(
                      post.status
                    )}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPost(post);
                    }}
                    title={post.content}
                  >
                    {post.content.substring(0, 20)}
                    {post.content.length > 20 ? '...' : ''}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}