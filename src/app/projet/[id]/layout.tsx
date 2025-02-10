export default function ProjectLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {children}
      </div>
    )
  }
  
  