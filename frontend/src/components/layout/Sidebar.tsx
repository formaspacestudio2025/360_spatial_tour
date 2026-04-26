interface SidebarProps {
  children: React.ReactNode;
}

function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-80 bg-gray-900 border-r border-gray-800 h-full overflow-y-auto">
      {children}
    </aside>
  );
}

export default Sidebar;
