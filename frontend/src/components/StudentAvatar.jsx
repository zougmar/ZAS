/**
 * Shows a student's photo or a fallback avatar with their initial.
 * @param {{ user?: { name?: string }; photo?: string }} student - Student object with user.name and optional photo
 * @param {string} className - Additional CSS classes for the wrapper
 * @param {number} size - Size in pixels (default 40)
 */
const StudentAvatar = ({ student, className = '', size = 40 }) => {
  const name = student?.user?.name || '';
  const photo = student?.photo || '';
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700 font-semibold ${className}`}
      style={{ width: size, height: size }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontSize: size * 0.45 }}>{initial}</span>
      )}
    </div>
  );
};

export default StudentAvatar;
